import React, { useCallback, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Camera, AlertTriangle, Info, Upload, X } from "lucide-react";

interface Props {
  onUpload: (file: File) => void;
}

export const PhotoUploader: React.FC<Props> = ({ onUpload }) => {
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          // 10MB limit
          setError("File size too large. Maximum size is 10MB.");
          return;
        }
        setError(null);
        onUpload(file);
      }
    },
    [onUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: false,
  });

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCapturing(true);
    } catch (err) {
      setError("Failed to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], `invoice-${Date.now()}.jpg`, {
                type: "image/jpeg",
              });
              onUpload(file);
              stopCamera();
            }
          },
          "image/jpeg",
          0.9,
        );
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-emerald-500/10 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-300">
          <p className="font-medium text-emerald-400 mb-1">Photo Guidelines</p>
          <ul className="list-disc list-inside space-y-1 text-gray-400">
            <li>Ensure good lighting and clear focus</li>
            <li>Capture the entire invoice in frame</li>
            <li>Avoid glare and shadows</li>
            <li>Hold camera steady and parallel to invoice</li>
          </ul>
        </div>
      </div>

      {isCapturing ? (
        <div className="relative rounded-lg overflow-hidden bg-gray-800">
          <video ref={videoRef} autoPlay playsInline className="w-full" />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <button onClick={capturePhoto} className="btn-primary">
              <Camera className="w-5 h-5 mr-2" />
              Capture
            </button>
            <button onClick={stopCamera} className="btn-ghost">
              <X className="w-5 h-5 mr-2" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors cursor-pointer ${isDragActive ? "border-emerald-500 bg-emerald-500/10" : "border-gray-700 hover:border-emerald-500/50"} ${error ? "border-rose-500" : ""}`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-white mb-2">Upload Photo</p>
            <p className="text-sm text-gray-400">or click to select</p>
          </div>

          <button
            onClick={startCamera}
            className="border-2 border-dashed border-gray-700 rounded-lg p-8 flex flex-col items-center justify-center transition-colors hover:border-emerald-500/50"
          >
            <Camera className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-white mb-2">Take Photo</p>
            <p className="text-sm text-gray-400">using camera</p>
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 rounded-lg p-4">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};
