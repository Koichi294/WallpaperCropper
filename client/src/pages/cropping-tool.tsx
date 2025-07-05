import React, { useState, useCallback, useEffect } from "react";
import { Crop, Settings, HelpCircle } from "lucide-react";
import ImageUploadZone from "@/components/image-upload-zone";
import CropSettings from "@/components/crop-settings";
import CanvasArea from "@/components/canvas-area";
import ExportPanel from "@/components/export-panel";
import { CropFrame, AspectRatio, PRESET_ASPECT_RATIOS } from "@shared/schema";

interface UploadedImage {
  url: string;
  width: number;
  height: number;
  originalName: string;
  size: number;
}

export default function CroppingTool() {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [cropFrames, setCropFrames] = useState<CropFrame[]>([]);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>(PRESET_ASPECT_RATIOS[0]);
  const [customAspectRatio, setCustomAspectRatio] = useState({ width: 16, height: 9 });
  const [isCustomRatio, setIsCustomRatio] = useState(false);
  const [monitors, setMonitors] = useState([
    { id: "1", name: "モニター 1", inches: 27, color: "#2563EB" },
    { id: "2", name: "モニター 2", inches: 24, color: "#059669" }
  ]);

  const handleImageUpload = useCallback((image: UploadedImage) => {
    setUploadedImage(image);
    // Initialize default crop frames when image is uploaded
    const defaultFrames: CropFrame[] = monitors.map((monitor, index) => ({
      id: `frame-${monitor.id}`,
      name: monitor.name,
      x: 50 + (index * 200),
      y: 50 + (index * 100),
      width: 300,
      height: Math.round(300 / (selectedAspectRatio.width / selectedAspectRatio.height)),
      aspectRatio: selectedAspectRatio,
      monitorInches: monitor.inches,
      color: monitor.color,
      isBaseFrame: index === 0 // 最初のフレームを基準にする
    }));
    setCropFrames(defaultFrames);
  }, [monitors, selectedAspectRatio]);

  const handleCropFrameUpdate = useCallback((frameId: string, updates: Partial<CropFrame>) => {
    setCropFrames(prev => 
      prev.map(frame => 
        frame.id === frameId ? { ...frame, ...updates } : frame
      )
    );
  }, []);

  const handleAspectRatioChange = useCallback((ratio: AspectRatio) => {
    setSelectedAspectRatio(ratio);
    setIsCustomRatio(ratio.label === "custom");
    
    // Update all crop frames to use new aspect ratio
    setCropFrames(prev => 
      prev.map(frame => ({
        ...frame,
        aspectRatio: ratio,
        height: Math.round(frame.width / (ratio.width / ratio.height))
      }))
    );
  }, []);

  const handleMonitorAdd = useCallback(() => {
    const newMonitor = {
      id: String(monitors.length + 1),
      name: `モニター ${monitors.length + 1}`,
      inches: 24,
      color: `hsl(${(monitors.length * 60) % 360}, 70%, 50%)`
    };
    setMonitors(prev => [...prev, newMonitor]);
  }, [monitors.length]);

  const handleMonitorUpdate = useCallback((id: string, updates: Partial<typeof monitors[0]>) => {
    setMonitors(prev => 
      prev.map(monitor => 
        monitor.id === id ? { ...monitor, ...updates } : monitor
      )
    );
    
    // Update corresponding crop frame
    setCropFrames(prev => 
      prev.map(frame => {
        if (frame.name === monitors.find(m => m.id === id)?.name) {
          return { ...frame, monitorInches: updates.inches || frame.monitorInches };
        }
        return frame;
      })
    );
  }, [monitors]);

  const handleBaseFrameChange = useCallback((frameId: string) => {
    setCropFrames(prev => 
      prev.map(frame => ({
        ...frame,
        isBaseFrame: frame.id === frameId
      }))
    );
  }, []);

  // インチサイズに基づいてフレームサイズを自動調整
  const adjustFrameSizesByInches = useCallback(() => {
    const baseFrame = cropFrames.find(frame => frame.isBaseFrame);
    if (!baseFrame) return;

    setCropFrames(prev => 
      prev.map(frame => {
        if (frame.id === baseFrame.id) return frame;
        
        // 基準フレームに対するインチ比を計算
        const scaleRatio = frame.monitorInches / baseFrame.monitorInches;
        const aspectRatio = frame.aspectRatio.width / frame.aspectRatio.height;
        
        // 基準フレームのサイズをスケール
        const newWidth = baseFrame.width * scaleRatio;
        const newHeight = newWidth / aspectRatio;
        
        return {
          ...frame,
          width: newWidth,
          height: newHeight
        };
      })
    );
  }, [cropFrames]);

  // フレームのインチサイズが変更されたときに自動調整
  useEffect(() => {
    if (cropFrames.length > 0) {
      adjustFrameSizesByInches();
    }
  }, [cropFrames.map(f => f.monitorInches).join(','), cropFrames.find(f => f.isBaseFrame)?.id]);

  return (
    <div className="h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Crop className="text-white w-4 h-4" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">マルチモニター壁紙クロッピングツール</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-secondary hover:text-slate-700 transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            <button className="text-secondary hover:text-slate-700 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
          {/* Image Upload Section */}
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">画像アップロード</h2>
            <ImageUploadZone onImageUpload={handleImageUpload} />
          </div>

          {/* Crop Settings Section */}
          <div className="p-6 border-b border-slate-200 flex-1 overflow-y-auto">
            <CropSettings
              selectedAspectRatio={selectedAspectRatio}
              customAspectRatio={customAspectRatio}
              isCustomRatio={isCustomRatio}
              monitors={monitors}
              cropFrames={cropFrames}
              onAspectRatioChange={handleAspectRatioChange}
              onCustomAspectRatioChange={setCustomAspectRatio}
              onMonitorAdd={handleMonitorAdd}
              onMonitorUpdate={handleMonitorUpdate}
              onCropFrameUpdate={handleCropFrameUpdate}
              onBaseFrameChange={handleBaseFrameChange}
            />
          </div>

          {/* Export Section */}
          <div className="p-6 mt-auto">
            <ExportPanel
              uploadedImage={uploadedImage}
              cropFrames={cropFrames}
            />
          </div>
        </aside>

        {/* Main Canvas */}
        <main className="flex-1 bg-slate-100 relative overflow-hidden">
          <CanvasArea
            uploadedImage={uploadedImage}
            cropFrames={cropFrames}
            onCropFrameUpdate={handleCropFrameUpdate}
          />
        </main>
      </div>

      {/* Mobile Overlay */}
      <div className="lg:hidden fixed inset-0 bg-white z-40 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Crop className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">デスクトップでご利用ください</h2>
          <p className="text-slate-600">このツールは画面の大きなデバイスでの使用に最適化されています。</p>
        </div>
      </div>
    </div>
  );
}
