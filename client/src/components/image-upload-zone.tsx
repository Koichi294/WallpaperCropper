import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface UploadedImage {
  url: string;
  width: number;
  height: number;
  originalName: string;
  size: number;
}

interface ImageUploadZoneProps {
  onImageUpload: (image: UploadedImage) => void;
}

export default function ImageUploadZone({ onImageUpload }: ImageUploadZoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File): Promise<UploadedImage> => {
      const formData = new FormData();
      formData.append("image", file);
      
      const response = await apiRequest("POST", "/api/upload-image", formData);
      return response.json();
    },
    onSuccess: (data) => {
      onImageUpload(data);
      toast({
        title: "アップロード完了",
        description: "画像が正常にアップロードされました。",
      });
    },
    onError: (error) => {
      toast({
        title: "アップロードエラー",
        description: error.message || "画像のアップロードに失敗しました。",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setIsUploading(true);
      uploadMutation.mutate(file);
    }
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const hasErrors = fileRejections.length > 0;

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-slate-50"
            : hasErrors
            ? "border-red-300 bg-red-50"
            : "border-slate-300 hover:border-primary hover:bg-slate-50"
        }`}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="space-y-3">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-slate-600">アップロード中...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <CloudUpload className="w-8 h-8 text-slate-400 mx-auto" />
            <div>
              <p className="text-sm text-slate-600 mb-2">
                {isDragActive ? "ここにドロップしてください" : "画像をドラッグ＆ドロップ"}
              </p>
              <p className="text-xs text-slate-500 mb-3">または</p>
              <button 
                type="button"
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                ファイルを選択
              </button>
            </div>
            <p className="text-xs text-slate-500">JPG, PNG, WebP対応 (最大10MB)</p>
          </div>
        )}
      </div>

      {/* Error Messages */}
      {hasErrors && (
        <div className="space-y-2">
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name} className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span>
                {errors[0]?.code === "file-too-large" 
                  ? "ファイルサイズが大きすぎます (最大10MB)"
                  : errors[0]?.code === "file-invalid-type"
                  ? "サポートされていないファイル形式です"
                  : errors[0]?.message
                }
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
