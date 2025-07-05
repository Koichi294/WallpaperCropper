import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ProcessingOptions {
  quality?: number;
  format?: 'png' | 'jpg' | 'webp';
  resize?: {
    width: number;
    height: number;
  };
}

interface ProcessedImage {
  url: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

export function useImageProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);

  const processMutation = useMutation({
    mutationFn: async ({ 
      imageUrl, 
      options 
    }: { 
      imageUrl: string; 
      options: ProcessingOptions; 
    }): Promise<ProcessedImage> => {
      const response = await apiRequest("POST", "/api/process-image", {
        imageUrl,
        options
      });
      return response.json();
    },
    onMutate: () => {
      setIsProcessing(true);
    },
    onSettled: () => {
      setIsProcessing(false);
    }
  });

  const processImage = useCallback(
    (imageUrl: string, options: ProcessingOptions = {}) => {
      return processMutation.mutateAsync({ imageUrl, options });
    },
    [processMutation]
  );

  return {
    processImage,
    isProcessing: isProcessing || processMutation.isPending,
    error: processMutation.error
  };
}
