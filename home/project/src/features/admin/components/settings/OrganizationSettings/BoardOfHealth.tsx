import React, { useState, useRef } from 'react';
import { FileCheck, Camera, Upload, X, AlertTriangle, Plus, Calendar, Clock } from 'lucide-react';
import type { Organization } from '@/types/organization';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import toast from 'react-hot-toast';

interface InspectionVisit {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  inspectorName: string;
  notes: string;
  documents: {
    id: string;
    type: 'image' | 'pdf';
    url: string;
    name: string;
  }[];
  actionItems: {
    id: string;
    description: string;
    deadline: string;
    completed: boolean;
    severity: 'critical' | 'major' | 'minor';
  }[];
}

interface BoardOfHealthProps {
  organization: Organization;
  onChange: (updates: Partial<Organization>) => void;
}

export const BoardOfHealth: React.FC<BoardOfHealthProps> = ({
  organization,
  onChange
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [activeVisit, setActiveVisit] = useState<InspectionVisit | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateSettings = (key: string, value: any) => {
    onChange({
      settings: {
        ...organization.settings,
        [key]: value
      }
    });
  };

  const inspectionVisits = organization.settings?.inspection_visits || [];

  const addInspectionVisit = () => {
    const newVisit: InspectionVisit = {
      id: `visit-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      inspectorName: '',
      notes: '',
      documents: [],
      actionItems: []
    };

    updateSettings('inspection_visits', [...inspectionVisits, newVisit]);
    setActiveVisit(newVisit);
  };

  const updateVisit = (visitId: string, updates: Partial<InspectionVisit>) => {
    const updatedVisits = inspectionVisits.map(visit =>
      visit.id === visitId ? { ...visit, ...updates } : visit
    );
    updateSettings('inspection_visits', updatedVisits);
  };

  const addActionItem = (visitId: string) => {
    const visit = inspectionVisits.find(v => v.id === visitId);
    if (!visit) return;

    const newActionItem = {
      id: `action-${Date.now()}`,
      description: '',
      deadline: '',
      completed: false,
      severity: 'minor' as const
    };

    updateVisit(visitId, {
      actionItems: [...visit.actionItems, newActionItem]
    });

    // Create notification for new action item
    const notification = {
      id: `notif-${Date.now()}`,
      type: 'health-inspection',
      title: 'New Health Inspection Action Item',
      message: `A new action item has been added from the health inspection on ${visit.date}`,
      deadline: newActionItem.deadline,
      severity: newActionItem.severity,
      created: new Date().toISOString()
    };

    // Add to notifications
    const currentNotifications = organization.settings?.notifications || [];
    updateSettings('notifications', [...currentNotifications, notification]);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, visitId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // In a real app, upload to storage and get URL
      const fakeUrl = URL.createObjectURL(file);
      
      const visit = inspectionVisits.find(v => v.id === visitId);
      if (!visit) return;

      const newDocument = {
        id: `doc-${Date.now()}`,
        type: file.type.includes('pdf') ? 'pdf' : 'image',
        url: fakeUrl,
        name: file.name
      };

      updateVisit(visitId, {
        documents: [...visit.documents, newDocument]
      });

      toast.success('Document uploaded successfully');
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
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

  const takePhoto = (visitId: string) => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        
        const visit = inspectionVisits.find(v => v.id === visitId);
        if (!visit) return;

        const newDocument = {
          id: `doc-${Date.now()}`,
          type: 'image' as const,
          url: imageData,
          name: `Inspection Photo ${new Date().toLocaleString()}`
        };

        updateVisit(visitId, {
          documents: [...visit.documents, newDocument]
        });

        stopCapture();
        toast.success('Photo captured successfully');
      }
    }
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
            <CardTitle>Current Health Certificate</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column - Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Certificate Details</h3>
                <p className="text-gray-400">
                  Your Board of Health certification must be prominently displayed in your establishment.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Certificate Number (if applicable)
                </label>
                <input
                  type="text"
                  value={organization.settings?.health_certificate_number || ''}
                  onChange={(e) => updateSettings('health_certificate_number', e.target.value)}
                  className="input w-full"
                  placeholder="Enter certificate number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Expiration Date
                </label>
                <input
                  type="date"
                  value={organization.settings?.health_certificate_expiry || ''}
                  onChange={(e) => updateSettings('health_certificate_expiry', e.target.value)}
                  className="input w-full"
                />
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
                        onClick={() => activeVisit && takePhoto(activeVisit.id)}
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
                      onClick={() => updateSettings('health_certificate_image', null)}
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
                        onChange={(e) => activeVisit && handleFileUpload(e, activeVisit.id)}
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

      {/* Inspection Visits Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-rose-400" />
              </div>
              <CardTitle>Inspection Visits</CardTitle>
            </div>
            <button
              onClick={addInspectionVisit}
              className="btn-primary"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Visit
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {inspectionVisits.map((visit) => (
              <div
                key={visit.id}
                className="bg-gray-800/50 rounded-lg p-6 space-y-6"
              >
                {/* Visit Details */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={visit.date}
                      onChange={(e) => updateVisit(visit.id, { date: e.target.value })}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Inspector Name
                    </label>
                    <input
                      type="text"
                      value={visit.inspectorName}
                      onChange={(e) => updateVisit(visit.id, { inspectorName: e.target.value })}
                      className="input w-full"
                      placeholder="Enter inspector's name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={visit.startTime}
                      onChange={(e) => updateVisit(visit.id, { startTime: e.target.value })}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={visit.endTime}
                      onChange={(e) => updateVisit(visit.id, { endTime: e.target.value })}
                      className="input w-full"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={visit.notes}
                    onChange={(e) => updateVisit(visit.id, { notes: e.target.value })}
                    className="input w-full h-24"
                    placeholder="Enter any notes from the inspection..."
                  />
                </div>

                {/* Documents */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-medium">Documents</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-ghost text-sm"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </button>
                      <button
                        onClick={startCapture}
                        className="btn-ghost text-sm"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Photo
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {visit.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="relative group bg-gray-800 rounded-lg overflow-hidden"
                      >
                        {doc.type === 'image' ? (
                          <img
                            src={doc.url}
                            alt={doc.name}
                            className="w-full h-32 object-cover"
                          />
                        ) : (
                          <div className="w-full h-32 flex items-center justify-center">
                            <FileCheck className="w-8 h-8 text-gray-600" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => {
                              const updatedDocs = visit.documents.filter(d => d.id !== doc.id);
                              updateVisit(visit.id, { documents: updatedDocs });
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Items */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-medium">Action Items</h4>
                    <button
                      onClick={() => addActionItem(visit.id)}
                      className="btn-ghost text-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </button>
                  </div>
                  <div className="space-y-4">
                    {visit.actionItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-800 rounded-lg p-4 space-y-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => {
                                const updatedItems = visit.actionItems.map(i =>
                                  i.id === item.id
                                    ? { ...i, description: e.target.value }
                                    : i
                                );
                                updateVisit(visit.id, { actionItems: updatedItems });
                              }}
                              className="input w-full"
                              placeholder="Describe the required action..."
                            />
                          </div>
                          <select
                            value={item.severity}
                            onChange={(e) => {
                              const updatedItems = visit.actionItems.map(i =>
                                i.id === item.id
                                  ? { ...i, severity: e.target.value as 'critical' | 'major' | 'minor' }
                                  : i
                              );
                              updateVisit(visit.id, { actionItems: updatedItems });
                            }}
                            className="input w-32"
                          >
                            <option value="minor">Minor</option>
                            <option value="major">Major</option>
                            <option value="critical">Critical</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                              Deadline
                            </label>
                            <input
                              type="date"
                              value={item.deadline}
                              onChange={(e) => {
                                const updatedItems = visit.actionItems.map(i =>
                                  i.id === item.id
                                    ? { ...i, deadline: e.target.value }
                                    : i
                                );
                                updateVisit(visit.id, { actionItems: updatedItems });
                              }}
                              className="input"
                            />
                          </div>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={item.completed}
                                onChange={(e) => {
                                  const updatedItems = visit.actionItems.map(i =>
                                    i.id === item.id
                                      ? { ...i, completed: e.target.checked }
                                      : i
                                  );
                                  updateVisit(visit.id, { actionItems: updatedItems });
                                }}
                                className="form-checkbox rounded bg-gray-700 border-gray-600 text-rose-500"
                              />
                              <span className="text-sm text-gray-400">Completed</span>
                            </label>
                            <button
                              onClick={() => {
                                const updatedItems = visit.actionItems.filter(i => i.id !== item.id);
                                updateVisit(visit.id, { actionItems: updatedItems });
                              }}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};