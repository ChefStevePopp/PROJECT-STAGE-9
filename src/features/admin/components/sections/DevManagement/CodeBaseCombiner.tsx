import React, { useState, useRef } from 'react';
import { FileText, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import JSZip from 'jszip';

interface FileData {
  path: string;
  content: string;
}

export const CodeBaseCombiner: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [outputFile, setOutputFile] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (message: string) => {
    setDebugLog((prev) => [...prev, message]);
    console.log(message);
  };

  const handleZipUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.error('No file selected!');
      return;
    }

    toast.loading('Processing ZIP file...');
    setIsLoading(true);

    try {
      const zip = new JSZip();
      const zipContents = await zip.loadAsync(file);

      const tree: string[] = [];
      const fileContents: string[] = [];

      const traverseZip = async (folder: JSZip, depth = 0) => {
        const indentation = '  '.repeat(depth);

        for (const [path, entry] of Object.entries(folder.files)) {
          if (entry.dir) {
            // Add folder to the tree
            tree.push(`${indentation}📁 ${path}`);
          } else {
            // Add file to the tree and read its contents
            tree.push(`${indentation}📄 ${path}`);
            const content = await entry.async('text');
            fileContents.push(`// ${path}\n${content}`);
          }
        }
      };

      // Traverse the ZIP structure
      await traverseZip(zipContents);

      // Create the file tree and combined content
      const treeDiagram = tree.join('\n');
      const combinedFiles = fileContents.join('\n\n');
      const combinedOutput = `# File Tree Diagram\n\n${treeDiagram}\n\n# File Contents\n\n${combinedFiles}`;

      // Create a Blob for the output file
      const blob = new Blob([combinedOutput], { type: 'text/plain' });
      setOutputFile(blob);

      addLog('ZIP file processed successfully.');
      toast.dismiss();
      toast.success('ZIP file processed successfully!');
    } catch (error) {
      console.error('Error processing ZIP file:', error);
      toast.dismiss();
      toast.error('Failed to process the ZIP file.');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadOutputFile = () => {
    if (!outputFile) {
      toast.error('No output file to download!');
      return;
    }

    const url = URL.createObjectURL(outputFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project-codebase.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Codebase TXT file downloaded!');
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white mb-2">Code Base Export</h2>
        <p className="text-gray-400 text-sm">Upload a ZIP file to export its codebase as a single text file.</p>
      </div>

      <div className="space-y-4">
        {/* ZIP Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center disabled:opacity-50"
        >
          <Upload className="mr-2 h-4 w-4" />
          {isLoading ? 'Processing...' : 'Import ZIP File'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          onChange={handleZipUpload}
          className="hidden"
        />

        {/* Download Button */}
        <button
          onClick={downloadOutputFile}
          disabled={!outputFile}
          className={`w-full ${
            outputFile ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'
          } text-white font-bold py-2 px-4 rounded flex items-center justify-center disabled:opacity-50`}
        >
          <FileText className="mr-2 h-4 w-4" />
          Download Codebase TXT File
        </button>

        {/* Debug Log Display */}
        {debugLog.length > 0 && (
          <div className="mt-4 p-4 bg-gray-900 rounded-lg max-h-96 overflow-y-auto text-left">
            <pre className="text-xs text-gray-300 whitespace-pre-wrap">
              {debugLog.map((log, i) => (
                <div key={i} className="py-1">{log}</div>
              ))}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeBaseCombiner;
