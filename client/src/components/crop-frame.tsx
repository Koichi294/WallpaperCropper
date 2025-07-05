import React, { useState, useRef, useCallback } from "react";
import { CropFrame as CropFrameType } from "@shared/schema";

interface CropFrameProps {
  frame: CropFrameType;
  zoom: number;
  imageWidth: number;
  imageHeight: number;
  onUpdate: (updates: Partial<CropFrameType>) => void;
}

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 'e' | 's' | 'w';

export default function CropFrame({
  frame,
  zoom,
  imageWidth,
  imageHeight,
  onUpdate
}: CropFrameProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<ResizeHandle | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [frameStart, setFrameStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const frameRef = useRef<HTMLDivElement>(null);

  const scale = zoom / 100;
  const scaledFrame = {
    x: frame.x * scale,
    y: frame.y * scale,
    width: frame.width * scale,
    height: frame.height * scale
  };

  const handleMouseDown = useCallback((e: React.MouseEvent, handle?: ResizeHandle) => {
    e.preventDefault();
    e.stopPropagation();
    
    const clientX = e.clientX;
    const clientY = e.clientY;
    
    setDragStart({ x: clientX, y: clientY });
    setFrameStart({
      x: frame.x,
      y: frame.y,
      width: frame.width,
      height: frame.height
    });

    if (handle) {
      setIsResizing(handle);
    } else {
      setIsDragging(true);
    }
  }, [frame]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging && !isResizing) return;

    const deltaX = (e.clientX - dragStart.x) / scale;
    const deltaY = (e.clientY - dragStart.y) / scale;

    if (isDragging) {
      // Dragging the frame
      const newX = Math.max(0, Math.min(frameStart.x + deltaX, imageWidth - frame.width));
      const newY = Math.max(0, Math.min(frameStart.y + deltaY, imageHeight - frame.height));
      
      onUpdate({ x: newX, y: newY });
    } else if (isResizing) {
      // Resizing the frame
      let newX = frameStart.x;
      let newY = frameStart.y;
      let newWidth = frameStart.width;
      let newHeight = frameStart.height;

      const aspectRatio = frame.aspectRatio.width / frame.aspectRatio.height;

      switch (isResizing) {
        case 'se':
          newWidth = Math.max(50, frameStart.width + deltaX);
          newHeight = newWidth / aspectRatio;
          break;
        case 'sw':
          newWidth = Math.max(50, frameStart.width - deltaX);
          newHeight = newWidth / aspectRatio;
          newX = frameStart.x + (frameStart.width - newWidth);
          break;
        case 'ne':
          newWidth = Math.max(50, frameStart.width + deltaX);
          newHeight = newWidth / aspectRatio;
          newY = frameStart.y + (frameStart.height - newHeight);
          break;
        case 'nw':
          newWidth = Math.max(50, frameStart.width - deltaX);
          newHeight = newWidth / aspectRatio;
          newX = frameStart.x + (frameStart.width - newWidth);
          newY = frameStart.y + (frameStart.height - newHeight);
          break;
        case 'e':
          newWidth = Math.max(50, frameStart.width + deltaX);
          newHeight = newWidth / aspectRatio;
          newY = frameStart.y + (frameStart.height - newHeight) / 2;
          break;
        case 'w':
          newWidth = Math.max(50, frameStart.width - deltaX);
          newHeight = newWidth / aspectRatio;
          newX = frameStart.x + (frameStart.width - newWidth);
          newY = frameStart.y + (frameStart.height - newHeight) / 2;
          break;
        case 's':
          newHeight = Math.max(50 / aspectRatio, frameStart.height + deltaY);
          newWidth = newHeight * aspectRatio;
          newX = frameStart.x + (frameStart.width - newWidth) / 2;
          break;
        case 'n':
          newHeight = Math.max(50 / aspectRatio, frameStart.height - deltaY);
          newWidth = newHeight * aspectRatio;
          newX = frameStart.x + (frameStart.width - newWidth) / 2;
          newY = frameStart.y + (frameStart.height - newHeight);
          break;
      }

      // Constrain to image boundaries
      newX = Math.max(0, Math.min(newX, imageWidth - newWidth));
      newY = Math.max(0, Math.min(newY, imageHeight - newHeight));
      newWidth = Math.min(newWidth, imageWidth - newX);
      newHeight = Math.min(newHeight, imageHeight - newY);

      onUpdate({ x: newX, y: newY, width: newWidth, height: newHeight });
    }
  }, [isDragging, isResizing, dragStart, frameStart, scale, frame.width, frame.height, frame.aspectRatio, imageWidth, imageHeight, onUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(null);
  }, []);

  // Add global mouse event listeners
  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const getResizeCursor = (handle: ResizeHandle): string => {
    const cursors = {
      'nw': 'nw-resize',
      'ne': 'ne-resize',
      'sw': 'sw-resize',
      'se': 'se-resize',
      'n': 'n-resize',
      'e': 'e-resize',
      's': 's-resize',
      'w': 'w-resize'
    };
    return cursors[handle];
  };

  return (
    <div
      ref={frameRef}
      className="absolute border-2 bg-opacity-10 cursor-move select-none"
      style={{
        left: `${scaledFrame.x}px`,
        top: `${scaledFrame.y}px`,
        width: `${scaledFrame.width}px`,
        height: `${scaledFrame.height}px`,
        borderColor: frame.color,
        backgroundColor: `${frame.color}20`
      }}
      onMouseDown={(e) => handleMouseDown(e)}
    >
      {/* Resize Handles */}
      {(['nw', 'ne', 'sw', 'se', 'n', 'e', 's', 'w'] as ResizeHandle[]).map((handle) => {
        const isCorner = ['nw', 'ne', 'sw', 'se'].includes(handle);
        const positions = {
          'nw': { top: -4, left: -4 },
          'ne': { top: -4, right: -4 },
          'sw': { bottom: -4, left: -4 },
          'se': { bottom: -4, right: -4 },
          'n': { top: -4, left: '50%', transform: 'translateX(-50%)' },
          'e': { right: -4, top: '50%', transform: 'translateY(-50%)' },
          's': { bottom: -4, left: '50%', transform: 'translateX(-50%)' },
          'w': { left: -4, top: '50%', transform: 'translateY(-50%)' }
        };

        return (
          <div
            key={handle}
            className={`absolute bg-white border-2 ${
              isCorner ? 'w-3 h-3 rounded-full' : 'w-2 h-2'
            }`}
            style={{
              ...positions[handle],
              borderColor: frame.color,
              cursor: getResizeCursor(handle)
            }}
            onMouseDown={(e) => handleMouseDown(e, handle)}
          />
        );
      })}
      
      {/* Label */}
      <div 
        className="absolute -top-6 left-0 px-2 py-1 rounded text-xs font-medium text-white"
        style={{ backgroundColor: frame.color }}
      >
        {frame.name} ({frame.monitorInches}")
      </div>
    </div>
  );
}
