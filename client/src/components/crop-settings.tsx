import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Star } from "lucide-react";
import { AspectRatio, PRESET_ASPECT_RATIOS, CropFrame } from "@shared/schema";

interface Monitor {
  id: string;
  name: string;
  inches: number;
  color: string;
}

interface CropSettingsProps {
  selectedAspectRatio: AspectRatio;
  customAspectRatio: { width: number; height: number };
  isCustomRatio: boolean;
  monitors: Monitor[];
  cropFrames: CropFrame[];
  onAspectRatioChange: (ratio: AspectRatio) => void;
  onCustomAspectRatioChange: (ratio: { width: number; height: number }) => void;
  onMonitorAdd: () => void;
  onMonitorUpdate: (id: string, updates: Partial<Monitor>) => void;
  onCropFrameUpdate: (frameId: string, updates: Partial<CropFrame>) => void;
  onBaseFrameChange: (frameId: string) => void;
}

export default function CropSettings({
  selectedAspectRatio,
  customAspectRatio,
  isCustomRatio,
  monitors,
  cropFrames,
  onAspectRatioChange,
  onCustomAspectRatioChange,
  onMonitorAdd,
  onMonitorUpdate,
  onCropFrameUpdate,
  onBaseFrameChange
}: CropSettingsProps) {
  
  const handlePresetRatioClick = (ratio: AspectRatio) => {
    onAspectRatioChange(ratio);
  };

  const handleCustomRatioClick = () => {
    const customRatio: AspectRatio = {
      width: customAspectRatio.width,
      height: customAspectRatio.height,
      label: "custom"
    };
    onAspectRatioChange(customRatio);
  };

  const handleCustomRatioChange = (field: 'width' | 'height', value: string) => {
    const numValue = parseInt(value) || 1;
    const newRatio = { ...customAspectRatio, [field]: numValue };
    onCustomAspectRatioChange(newRatio);
    
    if (isCustomRatio) {
      onAspectRatioChange({
        width: newRatio.width,
        height: newRatio.height,
        label: "custom"
      });
    }
  };

  const isRatioSelected = (ratio: AspectRatio) => {
    if (ratio.label === "custom") {
      return isCustomRatio;
    }
    return selectedAspectRatio.label === ratio.label;
  };

  const handleFrameAspectRatioChange = (frameId: string, ratio: AspectRatio) => {
    onCropFrameUpdate(frameId, { aspectRatio: ratio });
  };

  const handleFrameCustomRatioChange = (frameId: string, field: 'width' | 'height', value: string) => {
    const frame = cropFrames.find(f => f.id === frameId);
    if (!frame) return;
    
    const numValue = parseInt(value) || 1;
    const newRatio = { ...frame.aspectRatio, [field]: numValue };
    
    onCropFrameUpdate(frameId, { 
      aspectRatio: {
        ...newRatio,
        label: "custom"
      }
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">切り抜き設定</h2>
      
      {/* Global Aspect Ratio Settings */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">全体の画素比率</label>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {PRESET_ASPECT_RATIOS.map((ratio) => (
            <Button
              key={ratio.label}
              variant={isRatioSelected(ratio) ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetRatioClick(ratio)}
              className="text-sm"
            >
              {ratio.label}
            </Button>
          ))}
          <Button
            variant={isCustomRatio ? "default" : "outline"}
            size="sm"
            onClick={handleCustomRatioClick}
            className="text-sm"
          >
            カスタム
          </Button>
        </div>
        
        {/* Custom Ratio Inputs */}
        <div className="grid grid-cols-3 gap-2 items-center">
          <Input
            type="number"
            placeholder="幅"
            value={customAspectRatio.width}
            onChange={(e) => handleCustomRatioChange('width', e.target.value)}
            min="1"
            className="text-sm"
          />
          <span className="text-center text-slate-500">:</span>
          <Input
            type="number"
            placeholder="高さ"
            value={customAspectRatio.height}
            onChange={(e) => handleCustomRatioChange('height', e.target.value)}
            min="1"
            className="text-sm"
          />
        </div>
      </div>

      {/* Individual Frame Settings */}
      {cropFrames.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">フレーム別設定</label>
          <div className="space-y-4">
            {cropFrames.map((frame) => (
              <Card key={frame.id} className="p-4">
                <CardHeader className="p-0 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: frame.color }}
                      />
                      <CardTitle className="text-sm font-medium">{frame.name}</CardTitle>
                      {frame.isBaseFrame && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    <Button
                      variant={frame.isBaseFrame ? "default" : "outline"}
                      size="sm"
                      onClick={() => onBaseFrameChange(frame.id)}
                      className="text-xs h-6"
                    >
                      基準
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                  {/* Frame Aspect Ratio */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2">画素比率</label>
                    <div className="grid grid-cols-3 gap-1 mb-2">
                      {PRESET_ASPECT_RATIOS.slice(0, 3).map((ratio) => (
                        <Button
                          key={ratio.label}
                          variant={frame.aspectRatio.label === ratio.label ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleFrameAspectRatioChange(frame.id, ratio)}
                          className="text-xs h-7"
                        >
                          {ratio.label}
                        </Button>
                      ))}
                    </div>
                    {frame.aspectRatio.label === "custom" && (
                      <div className="grid grid-cols-3 gap-1 items-center">
                        <Input
                          type="number"
                          value={frame.aspectRatio.width}
                          onChange={(e) => handleFrameCustomRatioChange(frame.id, 'width', e.target.value)}
                          min="1"
                          className="text-xs h-7"
                        />
                        <span className="text-center text-slate-500 text-xs">:</span>
                        <Input
                          type="number"
                          value={frame.aspectRatio.height}
                          onChange={(e) => handleFrameCustomRatioChange(frame.id, 'height', e.target.value)}
                          min="1"
                          className="text-xs h-7"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Monitor inches */}
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-600">インチサイズ</label>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={frame.monitorInches}
                        onChange={(e) => onCropFrameUpdate(frame.id, { monitorInches: parseInt(e.target.value) || 24 })}
                        min="10"
                        max="100"
                        className="w-14 text-xs h-7"
                      />
                      <span className="text-xs text-slate-500">″</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add Monitor Button */}
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={onMonitorAdd}
          className="w-full border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" />
          モニターを追加
        </Button>
      </div>
    </div>
  );
}
