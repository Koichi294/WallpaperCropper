export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function constrainRectToImage(rect: Rect, imageWidth: number, imageHeight: number): Rect {
  const constrainedRect = { ...rect };
  
  // Ensure minimum size
  constrainedRect.width = Math.max(50, constrainedRect.width);
  constrainedRect.height = Math.max(50, constrainedRect.height);
  
  // Ensure rect doesn't exceed image boundaries
  constrainedRect.x = Math.max(0, Math.min(constrainedRect.x, imageWidth - constrainedRect.width));
  constrainedRect.y = Math.max(0, Math.min(constrainedRect.y, imageHeight - constrainedRect.height));
  
  // Adjust size if rect extends beyond boundaries
  constrainedRect.width = Math.min(constrainedRect.width, imageWidth - constrainedRect.x);
  constrainedRect.height = Math.min(constrainedRect.height, imageHeight - constrainedRect.y);
  
  return constrainedRect;
}

export function maintainAspectRatio(
  rect: Rect, 
  aspectRatio: number, 
  anchor: 'width' | 'height' = 'width'
): Rect {
  const result = { ...rect };
  
  if (anchor === 'width') {
    result.height = result.width / aspectRatio;
  } else {
    result.width = result.height * aspectRatio;
  }
  
  return result;
}

export function scaleRect(rect: Rect, scale: number): Rect {
  return {
    x: rect.x * scale,
    y: rect.y * scale,
    width: rect.width * scale,
    height: rect.height * scale
  };
}

export function unscaleRect(rect: Rect, scale: number): Rect {
  return {
    x: rect.x / scale,
    y: rect.y / scale,
    width: rect.width / scale,
    height: rect.height / scale
  };
}

export function pointInRect(point: Point, rect: Rect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

export function calculateOptimalZoom(
  imageWidth: number,
  imageHeight: number,
  containerWidth: number,
  containerHeight: number,
  padding: number = 40
): number {
  const availableWidth = containerWidth - padding;
  const availableHeight = containerHeight - padding;
  
  const scaleX = availableWidth / imageWidth;
  const scaleY = availableHeight / imageHeight;
  
  return Math.min(scaleX, scaleY, 1) * 100; // Convert to percentage, max 100%
}

export function downloadImage(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
