export interface CV {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  atsScore?: number;
  content?: string;
}

export interface JobAnalysis {
  id: string;
  cvId: string;
  jobDescription: string;
  matchScore: number;
  analyzedAt: string;
}
