import { useState, useRef, useCallback, useEffect } from "react";
import { ZoomIn, ZoomOut, Maximize, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import CropFrame from "@/components/crop-frame";
import { CropFrame as CropFrameType } from "@shared/schema";

interface UploadedImage {
  url: string;
  width: number;
  height: number;
  originalName: string;
  size: number;
}

interface CanvasAreaProps {
  uploadedImage: UploadedImage | null;
  cropFrames: CropFrameType[];
  onCropFrameUpdate: (frameId: string, updates: Partial<CropFrameType>) => void;
}

export default function CanvasArea({
  uploadedImage,
  cropFrames,
  onCropFrameUpdate
}: CanvasAreaProps) {
  const [zoom, setZoom] = useState(100);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 25, 500));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 25, 25));
  }, []);

  const handleFitToScreen = useCallback(() => {
    if (!uploadedImage || !canvasRef.current) return;
    
    const container = canvasRef.current;
    const containerWidth = container.clientWidth - 40; // padding
    const containerHeight = container.clientHeight - 40;
    
    const scaleX = containerWidth / uploadedImage.width;
    const scaleY = containerHeight / uploadedImage.height;
    const scale = Math.min(scaleX, scaleY);
    
    setZoom(Math.round(scale * 100));
  }, [uploadedImage]);

  const handleActualSize = useCallback(() => {
    setZoom(100);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / (zoom / 100));
    const y = Math.round((e.clientY - rect.top) / (zoom / 100));
    
    setMousePosition({ x, y });
  }, [zoom]);

  // Auto-fit image when first loaded
  useEffect(() => {
    if (uploadedImage) {
      setTimeout(handleFitToScreen, 100);
    }
  }, [uploadedImage, handleFitToScreen]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Canvas Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">ズーム:</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 25}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium text-slate-900 min-w-12 text-center">
                {zoom}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 500}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFitToScreen}
              disabled={!uploadedImage}
            >
              <Maximize className="w-4 h-4 mr-2" />
              画面に合わせる
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleActualSize}
              disabled={!uploadedImage}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              実際のサイズ
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        ref={canvasRef}
        className="flex-1 p-6 flex items-center justify-center overflow-auto"
        onMouseMove={handleMouseMove}
      >
        {!uploadedImage ? (
          // Empty State
          <div className="text-center">
            <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">画像をアップロードしてください</h3>
            <p className="text-sm text-slate-600">左側のアップロード エリアから画像を選択して開始</p>
          </div>
        ) : (
          // Image Canvas
          <div className="relative inline-block">
            <img
              ref={imageRef}
              src={uploadedImage.url}
              alt="Uploaded"
              className="max-w-none rounded-lg shadow-lg"
              style={{
                width: `${uploadedImage.width * (zoom / 100)}px`,
                height: `${uploadedImage.height * (zoom / 100)}px`
              }}
              draggable={false}
            />
            
            {/* Crop Frames */}
            {cropFrames.map((frame) => (
              <CropFrame
                key={frame.id}
                frame={frame}
                zoom={zoom}
                imageWidth={uploadedImage.width}
                imageHeight={uploadedImage.height}
                onUpdate={(updates) => onCropFrameUpdate(frame.id, updates)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Canvas Footer Info */}
      {uploadedImage && (
        <div className="bg-white/95 backdrop-blur-sm border-t border-slate-200 px-6 py-3 flex-shrink-0">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center gap-6">
              <span>
                画像: <span className="font-medium">{uploadedImage.width}×{uploadedImage.height}px</span>
              </span>
              <span>
                ファイル: <span className="font-medium">{uploadedImage.originalName} ({formatFileSize(uploadedImage.size)})</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>
                座標: <span className="font-medium">X: {mousePosition.x}, Y: {mousePosition.y}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
