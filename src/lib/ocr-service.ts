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

      // Process each page
      const results: OCRResult[] = [];
      for (const image of images) {
        const pageResults = await this.processImage(image);
        results.push(...pageResults);
      }

      return results;
    } catch (error) {
      console.error("PDF OCR error:", error);
      throw new Error("Failed to process PDF");
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
      const { data } = await worker.recognize(image);

      // Convert Tesseract results to our format
      return data.words.map((word) => ({
        text: word.text,
        confidence: word.confidence,
        boundingBox: word.bbox,
      }));
    } catch (error) {
      console.error("Image OCR error:", error);
      throw new Error("Failed to process image");
    }
  },

  async pdfToImages(file: File): Promise<HTMLCanvasElement[]> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const images: HTMLCanvasElement[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const context = canvas.getContext("2d");
      if (!context) continue;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      images.push(canvas);
    }

    return images;
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

    // Join all text for pattern matching
    const fullText = results.map((r) => r.text).join(" ");

    // Extract invoice number (common patterns)
    const invoiceMatch = fullText.match(/inv[oice]*(\s|#|:)*([\w-]+)/i);
    if (invoiceMatch) {
      data.invoiceNumber = invoiceMatch[2];
    }

    // Extract date (common patterns)
    const dateMatch = fullText.match(
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|(\w+ \d{1,2},? \d{4})/,
    );
    if (dateMatch) {
      data.date = dateMatch[0];
    }

    // Extract total (look for patterns like "Total: $123.45")
    const totalMatch = fullText.match(/total\s*:?\s*\$?(\d+\.?\d*)/i);
    if (totalMatch) {
      data.total = parseFloat(totalMatch[1]);
    }

    // Extract line items (basic pattern matching)
    const lines = fullText.split("\n");
    for (const line of lines) {
      // Look for patterns that match item lines
      // This is a simple example - adjust based on your invoice formats
      const itemMatch = line.match(
        /(\w+)\s+([\w\s]+)\s+(\d+)\s+\$?(\d+\.?\d*)/,
      );

      if (itemMatch) {
        data.items.push({
          itemCode: itemMatch[1],
          description: itemMatch[2].trim(),
          quantity: parseInt(itemMatch[3]),
          unitPrice: parseFloat(itemMatch[4]),
          total: parseInt(itemMatch[3]) * parseFloat(itemMatch[4]),
        });
      }
    }

    return data;
  },
};
