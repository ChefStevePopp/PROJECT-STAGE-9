import { createWorker } from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface OCRResult {
  text: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ExtractedInvoiceData {
  items: Array<{
    itemCode?: string;
    description?: string;
    quantity?: number;
    unitPrice?: number;
    total?: number;
  }>;
  total: number;
  date: string | null;
  invoiceNumber: string | null;
  vendorInfo?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

class OCRWorkerPool {
  private worker: any = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    this.worker = await createWorker("eng");
    this.initialized = true;
  }

  async getWorker() {
    await this.initialize();
    return this.worker;
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.initialized = false;
    }
  }
}

const workerPool = new OCRWorkerPool();

export const ocrService = {
  async processPDF(file: File): Promise<OCRResult[]> {
    try {
      // Convert PDF to images
      const images = await this.pdfToImages(file);

      if (!images || images.length === 0) {
        console.warn("No images extracted from PDF");
        return [];
      }

      // Process each page
      const results: OCRResult[] = [];
      for (const image of images) {
        try {
          const pageResults = await this.processImage(image);
          results.push(...pageResults);
        } catch (pageError) {
          console.error("Error processing PDF page:", pageError);
          // Continue with next page instead of failing completely
        }
      }

      return results;
    } catch (error) {
      console.error("PDF OCR error:", error);
      // Return empty array instead of throwing
      return [];
    }
  },

  async processImage(file: File | HTMLCanvasElement): Promise<OCRResult[]> {
    const worker = await workerPool.getWorker();

    try {
      let image: string | HTMLCanvasElement = file;

      // If file is a File object, convert to base64
      if (file instanceof File) {
        image = await this.fileToBase64(file);
      }

      // Process with Tesseract
      const result = await worker.recognize(image);

      // Check if data and words exist before mapping
      if (
        !result ||
        !result.data ||
        !result.data.words ||
        !Array.isArray(result.data.words)
      ) {
        console.warn("No valid OCR data found in the image");
        return [];
      }

      // Convert Tesseract results to our format
      return result.data.words.map((word) => ({
        text: word.text || "",
        confidence: word.confidence || 0,
        boundingBox: word.bbox,
      }));
    } catch (error) {
      console.error("Image OCR error:", error);
      // Return empty array instead of throwing
      return [];
    }
  },

  async pdfToImages(file: File): Promise<HTMLCanvasElement[]> {
    console.log(`Converting PDF to images: ${file.name}`);
    try {
      const arrayBuffer = await file.arrayBuffer();
      console.log(
        `PDF loaded into ArrayBuffer, size: ${Math.round(arrayBuffer.byteLength / 1024)} KB`,
      );

      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      console.log(`PDF document loaded. Total pages: ${pdf.numPages}`);

      const images: HTMLCanvasElement[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`Rendering page ${i}/${pdf.numPages}`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        console.log(
          `Canvas created for page ${i}: ${canvas.width}x${canvas.height}`,
        );

        const context = canvas.getContext("2d");
        if (!context) {
          console.error(`Failed to get 2D context for page ${i}`);
          continue;
        }

        console.log(`Rendering page ${i} to canvas...`);
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;
        console.log(`Page ${i} rendered successfully`);

        images.push(canvas);
      }

      console.log(
        `PDF conversion complete. Generated ${images.length} canvas images`,
      );
      return images;
    } catch (error) {
      console.error("Error converting PDF to images:", error);
      return [];
    }
  },

  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  extractInvoiceData(results: OCRResult[]): ExtractedInvoiceData {
    const data: ExtractedInvoiceData = {
      items: [],
      total: 0,
      date: null,
      invoiceNumber: null,
      vendorInfo: {},
    };

    // Handle empty results
    if (!results || !Array.isArray(results) || results.length === 0) {
      console.warn("No OCR results to extract invoice data from");
      return data;
    }

    // Join all text for pattern matching
    const fullText = results.map((r) => r.text || "").join(" ");

    // Extract invoice number (common patterns)
    const invoiceMatch = fullText.match(/inv[oice]*(\s|#|:)*([\w-]+)/i);
    if (invoiceMatch && invoiceMatch[2]) {
      data.invoiceNumber = invoiceMatch[2];
    }

    // Extract date (common patterns)
    const dateMatch = fullText.match(
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|(\w+ \d{1,2},? \d{4})/,
    );
    if (dateMatch && dateMatch[0]) {
      data.date = dateMatch[0];
    }

    // Extract total (look for patterns like "Total: $123.45")
    const totalMatch = fullText.match(/total\s*:?\s*\$?(\d+\.?\d*)/i);
    if (totalMatch && totalMatch[1]) {
      data.total = parseFloat(totalMatch[1]) || 0;
    }

    // Extract line items (basic pattern matching)
    const lines = fullText.split("\n");
    for (const line of lines) {
      // Look for patterns that match item lines
      // This is a simple example - adjust based on your invoice formats
      const itemMatch = line.match(
        /(\w+)\s+([\w\s]+)\s+(\d+)\s+\$?(\d+\.?\d*)/,
      );

      if (itemMatch && itemMatch.length >= 5) {
        try {
          const quantity = parseInt(itemMatch[3]) || 0;
          const unitPrice = parseFloat(itemMatch[4]) || 0;

          data.items.push({
            itemCode: itemMatch[1],
            description: itemMatch[2].trim(),
            quantity: quantity,
            unitPrice: unitPrice,
            total: quantity * unitPrice,
          });
        } catch (error) {
          console.warn("Error parsing line item:", error);
        }
      }
    }

    // If no items were found, try a more lenient pattern
    if (data.items.length === 0) {
      // Look for any lines with numbers that might be prices
      for (const line of lines) {
        const simpleMatch = line.match(/([A-Za-z0-9-]+).*?\$?(\d+\.?\d*)/i);
        if (simpleMatch && simpleMatch.length >= 3) {
          try {
            data.items.push({
              itemCode: simpleMatch[1].trim(),
              description:
                line.replace(simpleMatch[0], "").trim() ||
                `Item ${data.items.length + 1}`,
              quantity: 1,
              unitPrice: parseFloat(simpleMatch[2]) || 0,
              total: parseFloat(simpleMatch[2]) || 0,
            });
          } catch (error) {
            console.warn("Error parsing simple line item:", error);
          }
        }
      }
    }

    return data;
  },
};
