import React, { useState, useRef } from 'react';
import { FileCheck, Camera, Upload, X, AlertTriangle, Plus, Calendar, Clock, FileText } from 'lucide-react';
import type { Organization } from '@/types/organization';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface ActionItem {
  id: string;
  description: string;
  completed: boolean;
}

interface BoardOfHealthProps {
  organization: Organization;
  onChange: (updates: Partial<Organization>) => void;
}

export const BoardOfHealth: React.FC<BoardOfHealthProps> = ({
  organization,
  onChange
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([
    { id: '1', description: 'Update temperature logs', completed: false },
    { id: '2', description: 'Clean and sanitize prep area', completed: true }
  ]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Create file path: org_id/certificates/timestamp_filename
      const timestamp = Date.now();
      const filePath = `${organization.id}/certificates/${timestamp}_${file.name}`;

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('health-inspections')
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('health-inspections')
        .getPublicUrl(filePath);

      // Update organization settings
      onChange({
        settings: {
          ...organization.settings,
          health_certificate_image: publicUrl,
          health_certificate_file_path: filePath
        }
      });

      toast.success('Certificate uploaded successfully');
    } catch (error) {
      console.error('Error uploading certificate:', error);
      toast.error('Failed to upload certificate');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const startCapture = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCapturing(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Failed to access camera');
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
        const imageData = canvas.toDataURL('image/jpeg');
        
        // Update organization settings with captured image
        onChange({
          settings: {
            ...organization.settings,
            health_certificate_image: imageData
          }
        });

        stopCapture();
        toast.success('Photo captured successfully');
      }
    }
  };

  const handleActionItemChange = (id: string, completed: boolean) => {
    setActionItems(prev => prev.map(item => 
      item.id === id ? { ...item, completed } : item
    ));
  };

  return (
    <div className="space-y-6">
      {/* Diagnostic Text */}
      <div className="text-xs text-gray-500 font-mono">
        src/features/admin/components/settings/OrganizationSettings/BoardOfHealth.tsx
      </div>

      {/* Current Certificate Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-rose-400" />
            </div>
            <CardTitle>Board of Health Credentials</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column - Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Current Credentials</h3>
                <p className="text-gray-400">
                  Your Board of Health certification must be prominently displayed in your establishment. Upload or take a photo of your current certification for our records.
                </p>
              </div>

              <div className="bg-yellow-500/10 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <div>
                    <p className="text-yellow-400 font-medium">Important Notice</p>
                    <ul className="text-sm text-gray-300 mt-2 space-y-1">
                      <li>• Current and not expired</li>
                      <li>• Clearly visible and legible</li>
                      <li>• Shows your establishment name and address</li>
                      <li>• Displays any applicable ratings or scores</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Certificate Image */}
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-xl p-6 flex flex-col items-center justify-center min-h-[300px]">
                {isCapturing ? (
                  <div className="relative w-full">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full rounded-lg"
                    />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                      <button
                        onClick={takePhoto}
                        className="btn-primary"
                      >
                        <Camera className="w-5 h-5 mr-2" />
                        Capture
                      </button>
                      <button
                        onClick={stopCapture}
                        className="btn-ghost"
                      >
                        <X className="w-5 h-5 mr-2" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : organization.settings?.health_certificate_image ? (
                  <div className="relative">
                    <img
                      src={organization.settings.health_certificate_image}
                      alt="Health Certificate"
                      className="max-w-full rounded-lg"
                    />
                    <button
                      onClick={() => onChange({
                        settings: {
                          ...organization.settings,
                          health_certificate_image: null,
                          health_certificate_file_path: null
                        }
                      })}
                      className="absolute top-2 right-2 p-1 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <FileCheck className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">
                      No certificate image uploaded
                    </p>
                    <div className="flex gap-4 justify-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-ghost"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Upload File
                      </button>
                      <button
                        onClick={startCapture}
                        className="btn-ghost"
                      >
                        <Camera className="w-5 h-5 mr-2" />
                        Take Photo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inspection History Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-rose-400" />
              </div>
              <CardTitle>Inspection History</CardTitle>
            </div>
            <button className="btn-primary">
              <Plus className="w-5 h-5 mr-2" />
              Add Inspection
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Example Inspection Entry */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-white font-medium">March 15, 2024</span>
                    <span className="text-sm text-gray-400">10:30 AM - 12:45 PM</span>
                  </div>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                    Passed
                  </span>
                </div>
                <button className="btn-ghost">
                  <FileText className="w-5 h-5 mr-2" />
                  View Report
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-medium mb-2">Inspector Details</h4>
                  <p className="text-sm text-gray-400">John Smith</p>
                  <p className="text-sm text-gray-400">Regional Health Department</p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Action Items</h4>
                  <div className="space-y-2">
                    {actionItems.map(item => (
                      <div key={item.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={(e) => handleActionItemChange(item.id, e.target.checked)}
                          className="form-checkbox rounded bg-gray-700 border-gray-600 text-rose-500"
                        />
                        <span className={`text-sm ${item.completed ? 'text-gray-400 line-through' : 'text-gray-300'}`}>
                          {item.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};