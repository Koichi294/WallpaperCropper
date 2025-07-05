import { useState } from "react";
import { Download, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CropFrame } from "@shared/schema";

interface UploadedImage {
  url: string;
  width: number;
  height: number;
  originalName: string;
  size: number;
}

interface ExportPanelProps {
  uploadedImage: UploadedImage | null;
  cropFrames: CropFrame[];
}

interface CropResult {
  url: string;
  name: string;
}

export default function ExportPanel({
  uploadedImage,
  cropFrames
}: ExportPanelProps) {
  const [outputFormat, setOutputFormat] = useState("png");
  const { toast } = useToast();

  const cropMultipleMutation = useMutation({
    mutationFn: async (): Promise<{ crops: CropResult[] }> => {
      if (!uploadedImage) throw new Error("No image uploaded");
      
      const response = await apiRequest("POST", "/api/crop-multiple", {
        imageUrl: uploadedImage.url,
        cropFrames: cropFrames
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Create and download a zip file or trigger individual downloads
      data.crops.forEach((crop, index) => {
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = crop.url;
          link.download = `${crop.name}.${outputFormat}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, index * 500); // Stagger downloads
      });
      
      toast({
        title: "ダウンロード開始",
        description: `${data.crops.length}個のファイルのダウンロードを開始しました。`,
      });
    },
    onError: (error) => {
      toast({
        title: "エクスポートエラー",
        description: error.message || "画像の切り抜きに失敗しました。",
        variant: "destructive",
      });
    }
  });

  const cropSingleMutation = useMutation({
    mutationFn: async (cropFrame: CropFrame): Promise<CropResult> => {
      if (!uploadedImage) throw new Error("No image uploaded");
      
      const response = await apiRequest("POST", "/api/crop-image", {
        imageUrl: uploadedImage.url,
        cropFrame: cropFrame
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      const link = document.createElement('a');
      link.href = data.url;
      link.download = `${data.name}.${outputFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "ダウンロード完了",
        description: `${variables.name}の切り抜きをダウンロードしました。`,
      });
    },
    onError: (error) => {
      toast({
        title: "エクスポートエラー",
        description: error.message || "画像の切り抜きに失敗しました。",
        variant: "destructive",
      });
    }
  });

  const handleDownloadAll = () => {
    if (!uploadedImage || cropFrames.length === 0) {
      toast({
        title: "エラー",
        description: "画像がアップロードされていないか、切り抜き範囲が設定されていません。",
        variant: "destructive",
      });
      return;
    }
    
    cropMultipleMutation.mutate();
  };

  const handleDownloadSingle = (cropFrame: CropFrame) => {
    if (!uploadedImage) {
      toast({
        title: "エラー",
        description: "画像がアップロードされていません。",
        variant: "destructive",
      });
      return;
    }
    
    cropSingleMutation.mutate(cropFrame);
  };

  const isDisabled = !uploadedImage || cropFrames.length === 0;
  const isLoading = cropMultipleMutation.isPending || cropSingleMutation.isPending;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">エクスポート</h2>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">切り抜き範囲:</span>
          <span className="font-medium text-slate-900">{cropFrames.length}個</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">出力形式:</span>
          <Select value={outputFormat} onValueChange={setOutputFormat}>
            <SelectTrigger className="w-20 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="png">PNG</SelectItem>
              <SelectItem value="jpg">JPG</SelectItem>
              <SelectItem value="webp">WebP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Button
          onClick={handleDownloadAll}
          disabled={isDisabled || isLoading}
          className="w-full bg-accent hover:bg-accent/90"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              処理中...
            </div>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              一括ダウンロード
            </>
          )}
        </Button>

        {/* Individual Download Buttons */}
        {cropFrames.length > 0 && (
          <div className="space-y-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              disabled={true}
            >
              個別ダウンロード
            </Button>
            {cropFrames.map((frame) => (
              <Button
                key={frame.id}
                variant="ghost"
                size="sm"
                onClick={() => handleDownloadSingle(frame)}
                disabled={isDisabled || isLoading}
                className="w-full justify-start text-xs"
              >
                <FileDown className="w-3 h-3 mr-2" />
                {frame.name}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
