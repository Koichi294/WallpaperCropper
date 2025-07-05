import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AspectRatio, PRESET_ASPECT_RATIOS } from "@shared/schema";

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
  onAspectRatioChange: (ratio: AspectRatio) => void;
  onCustomAspectRatioChange: (ratio: { width: number; height: number }) => void;
  onMonitorAdd: () => void;
  onMonitorUpdate: (id: string, updates: Partial<Monitor>) => void;
}

export default function CropSettings({
  selectedAspectRatio,
  customAspectRatio,
  isCustomRatio,
  monitors,
  onAspectRatioChange,
  onCustomAspectRatioChange,
  onMonitorAdd,
  onMonitorUpdate
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

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">切り抜き設定</h2>
      
      {/* Aspect Ratio Settings */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">画素比率</label>
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

      {/* Screen Inch Settings */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">画面インチ設定</label>
        <div className="space-y-3">
          {monitors.map((monitor) => (
            <div key={monitor.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 border-2 rounded-sm"
                  style={{ borderColor: monitor.color }}
                ></div>
                <span className="text-sm font-medium text-slate-700">{monitor.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={monitor.inches}
                  onChange={(e) => onMonitorUpdate(monitor.id, { inches: parseInt(e.target.value) || 24 })}
                  min="10"
                  max="100"
                  className="w-16 text-sm"
                />
                <span className="text-xs text-slate-500">インチ</span>
              </div>
            </div>
          ))}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onMonitorAdd}
          className="w-full mt-3 border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" />
          モニターを追加
        </Button>
      </div>
    </div>
  );
}
