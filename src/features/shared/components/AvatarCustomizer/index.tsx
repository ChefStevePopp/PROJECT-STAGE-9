import React, { useState, useRef } from 'react';
import { Sparkles, Shuffle, Check, Upload, Camera, X } from 'lucide-react';
import { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface AvatarCustomizerProps {
  currentAvatar: string;
  onSelect: (avatarUrl: string) => void;
}

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({ currentAvatar, onSelect }) => {
  const [selectedStyle, setSelectedStyle] = useState('avataaars');
  const [seed, setSeed] = useState(Math.random().toString(36).substring(7));
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0,
    aspect: 1
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const styles = [
    { id: 'avataaars', name: 'Human', options: '&mouth=smile&eyes=happy' },
    { id: 'bottts', name: 'Robot', options: '&textureChance=50&mouthChance=100' },
    { id: 'initials', name: 'Initials', options: '&bold=true' },
    { id: 'micah', name: 'Artistic', options: '' },
    { id: 'personas', name: 'Portrait', options: '' },
    { id: 'notionists', name: 'Minimalist', options: '' },
    { id: 'thumbs', name: 'Thumbs', options: '&rotate=0' },
    { id: 'shapes', name: 'Geometric', options: '&colors[]=primary' }
  ];

  const generateAvatar = (style: string) => {
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}${styles.find(s => s.id === style)?.options || ''}`;
  };

  const randomizeSeed = () => {
    setSeed(Math.random().toString(36).substring(7));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCapture = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCapturing(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCapture = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        setUploadedImage(canvas.toDataURL('image/jpeg'));
        setIsCropping(true);
        stopCapture();
      }
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    onSelect(croppedImage);
    setUploadedImage(null);
    setIsCropping(false);
  };

  if (isCropping && uploadedImage) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-white">Crop Image</h3>
          <button
            onClick={() => {
              setUploadedImage(null);
              setIsCropping(false);
            }}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="relative">
          <img 
            src={uploadedImage} 
            alt="Crop preview" 
            className="max-w-full rounded-lg"
            style={{ maxHeight: '400px' }}
          />
          <div className="absolute inset-0">
            <div 
              className="absolute"
              style={{
                top: `${crop.y}%`,
                left: `${crop.x}%`,
                width: `${crop.width}%`,
                height: `${crop.height}%`,
                border: '2px solid white',
                borderRadius: '50%',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
              }}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              setUploadedImage(null);
              setIsCropping(false);
            }}
            className="btn-ghost"
          >
            Cancel
          </button>
          <button
            onClick={() => handleCropComplete(uploadedImage)}
            className="btn-primary"
          >
            <Check className="w-4 h-4 mr-2" />
            Apply
          </button>
        </div>
      </div>
    );
  }

  if (isCapturing) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-white">Take Photo</h3>
          <button
            onClick={stopCapture}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="relative rounded-xl overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-xl"
          />
          <button
            onClick={takePhoto}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 btn-primary px-6"
          >
            <Camera className="w-5 h-5 mr-2" />
            Capture
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {styles.map((style) => (
          <button
            key={style.id}
            onClick={() => setSelectedStyle(style.id)}
            className={`relative group p-2 rounded-xl transition-all hover:scale-105 hover:bg-gray-800/50 ${
              selectedStyle === style.id ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-gray-900 bg-gray-800/50' : ''
            }`}
          >
            <img
              src={generateAvatar(style.id)}
              alt={style.name}
              className="w-16 h-16 mx-auto rounded-lg bg-gray-800"
            />
            <span className="block text-center mt-2 text-xs font-medium text-gray-400 group-hover:text-white">
              {style.name}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="relative group">
          <img
            src={generateAvatar(selectedStyle)}
            alt="Current avatar"
            className="w-32 h-32 rounded-xl bg-gray-800"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
        </div>

        <div className="flex gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-ghost px-4 py-2 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
          <button
            onClick={startCapture}
            className="btn-ghost px-4 py-2 flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            Camera
          </button>
          <button
            onClick={randomizeSeed}
            className="btn-ghost px-4 py-2 flex items-center gap-2"
          >
            <Shuffle className="w-4 h-4" />
            Randomize
          </button>
          <button
            onClick={() => onSelect(generateAvatar(selectedStyle))}
            className="btn-primary px-4 py-2 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Select
          </button>
        </div>
      </div>
    </div>
  );
};