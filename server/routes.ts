import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { insertCropProjectSchema } from "@shared/schema";
import { z } from "zod";

// Extend Express Request type to include file property
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowedTypes.includes(file.mimetype));
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload image endpoint
  app.post("/api/upload-image", upload.single("image"), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Get image metadata
      const metadata = await sharp(req.file.path).metadata();
      
      if (!metadata.width || !metadata.height) {
        return res.status(400).json({ message: "Invalid image file" });
      }

      // Move file to public directory with a unique name
      const fileName = `${Date.now()}-${req.file.originalname}`;
      
      // Use different paths for development and production
      const isProduction = process.env.NODE_ENV === "production";
      const publicPath = isProduction 
        ? path.join(process.cwd(), "dist/public/uploads", fileName)
        : path.join(process.cwd(), "public/uploads", fileName);
      const publicDir = path.dirname(publicPath);
      
      // Ensure uploads directory exists
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      await fs.promises.copyFile(req.file.path, publicPath);
      await fs.promises.unlink(req.file.path); // Clean up temp file

      res.json({
        url: `/uploads/${fileName}`,
        width: metadata.width,
        height: metadata.height,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Crop image endpoint
  app.post("/api/crop-image", async (req, res) => {
    try {
      const { imageUrl, cropFrame } = req.body;
      
      if (!imageUrl || !cropFrame) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      // Convert URL to file path
      const isProduction = process.env.NODE_ENV === "production";
      const imagePath = isProduction 
        ? path.join(process.cwd(), "dist/public", imageUrl)
        : path.join(process.cwd(), "public", imageUrl);
      
      if (!fs.existsSync(imagePath)) {
        return res.status(404).json({ message: "Image file not found" });
      }

      // Perform the crop using Sharp
      const croppedBuffer = await sharp(imagePath)
        .extract({
          left: Math.round(cropFrame.x),
          top: Math.round(cropFrame.y),
          width: Math.round(cropFrame.width),
          height: Math.round(cropFrame.height)
        })
        .png()
        .toBuffer();

      // Generate filename for cropped image
      const croppedFileName = `cropped-${Date.now()}-${cropFrame.name}.png`;
      const croppedPath = isProduction 
        ? path.join(process.cwd(), "dist/public/uploads", croppedFileName)
        : path.join(process.cwd(), "public/uploads", croppedFileName);
      
      await fs.promises.writeFile(croppedPath, croppedBuffer);

      res.json({
        url: `/uploads/${croppedFileName}`,
        name: cropFrame.name
      });
    } catch (error) {
      console.error("Crop error:", error);
      res.status(500).json({ message: "Failed to crop image" });
    }
  });

  // Crop multiple areas endpoint
  app.post("/api/crop-multiple", async (req, res) => {
    try {
      const { imageUrl, cropFrames } = req.body;
      
      if (!imageUrl || !Array.isArray(cropFrames)) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      const isProduction = process.env.NODE_ENV === "production";
      const imagePath = isProduction 
        ? path.join(process.cwd(), "dist/public", imageUrl)
        : path.join(process.cwd(), "public", imageUrl);
      
      if (!fs.existsSync(imagePath)) {
        return res.status(404).json({ message: "Image file not found" });
      }

      const results = [];

      for (const cropFrame of cropFrames) {
        const croppedBuffer = await sharp(imagePath)
          .extract({
            left: Math.round(cropFrame.x),
            top: Math.round(cropFrame.y),
            width: Math.round(cropFrame.width),
            height: Math.round(cropFrame.height)
          })
          .png()
          .toBuffer();

        const croppedFileName = `cropped-${Date.now()}-${cropFrame.name.replace(/\s+/g, '-')}.png`;
        const croppedPath = isProduction 
          ? path.join(process.cwd(), "dist/public/uploads", croppedFileName)
          : path.join(process.cwd(), "public/uploads", croppedFileName);
        
        await fs.promises.writeFile(croppedPath, croppedBuffer);

        results.push({
          url: `/uploads/${croppedFileName}`,
          name: cropFrame.name,
          originalFrame: cropFrame
        });
      }

      res.json({ crops: results });
    } catch (error) {
      console.error("Multiple crop error:", error);
      res.status(500).json({ message: "Failed to crop images" });
    }
  });

  // Save project endpoint
  app.post("/api/projects", async (req, res) => {
    try {
      const validatedData = insertCropProjectSchema.parse(req.body);
      const project = await storage.createCropProject(validatedData);
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      console.error("Project creation error:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // Get project endpoint
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getCropProject(id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Project retrieval error:", error);
      res.status(500).json({ message: "Failed to retrieve project" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
