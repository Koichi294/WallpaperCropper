import { cropProjects, type CropProject, type InsertCropProject } from "@shared/schema";

export interface IStorage {
  createCropProject(project: InsertCropProject): Promise<CropProject>;
  getCropProject(id: number): Promise<CropProject | undefined>;
  updateCropProject(id: number, project: Partial<InsertCropProject>): Promise<CropProject | undefined>;
  deleteCropProject(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private projects: Map<number, CropProject>;
  private currentId: number;

  constructor() {
    this.projects = new Map();
    this.currentId = 1;
  }

  async createCropProject(insertProject: InsertCropProject): Promise<CropProject> {
    const id = this.currentId++;
    const project: CropProject = { ...insertProject, id };
    this.projects.set(id, project);
    return project;
  }

  async getCropProject(id: number): Promise<CropProject | undefined> {
    return this.projects.get(id);
  }

  async updateCropProject(id: number, updateData: Partial<InsertCropProject>): Promise<CropProject | undefined> {
    const existing = this.projects.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateData };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteCropProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }
}

export const storage = new MemStorage();
