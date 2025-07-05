import { pgTable, text, serial, integer, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const cropProjects = pgTable("crop_projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  originalImageUrl: text("original_image_url").notNull(),
  imageWidth: integer("image_width").notNull(),
  imageHeight: integer("image_height").notNull(),
  cropFrames: jsonb("crop_frames").notNull().$type<CropFrame[]>(),
});

export const insertCropProjectSchema = createInsertSchema(cropProjects).omit({
  id: true,
});

export type InsertCropProject = z.infer<typeof insertCropProjectSchema>;
export type CropProject = typeof cropProjects.$inferSelect;

// Types for crop frames and monitor configurations
export interface CropFrame {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio: AspectRatio;
  monitorInches: number;
  color: string;
  isBaseFrame?: boolean; // 基準となる枠を指定
}

export interface AspectRatio {
  width: number;
  height: number;
  label: string;
}

export const PRESET_ASPECT_RATIOS: AspectRatio[] = [
  { width: 16, height: 9, label: "16:9" },
  { width: 21, height: 9, label: "21:9" },
  { width: 4, height: 3, label: "4:3" },
  { width: 1, height: 1, label: "1:1" },
];
