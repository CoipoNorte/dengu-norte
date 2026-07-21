// ==========================================
// Dengu Norte - ATS Optimizer Types
// ==========================================

export interface CVDocument {
  id: string;
  name: string;
  fileName: string;
  rawText: string;
  uploadedAt: number;
  lastAnalyzedAt?: number;
  atsScore?: number;
  sections: CVSections;
  keywords: string[];
  fileSize: number;
}

export interface CVSections {
  contactInfo: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
  certifications: string;
  languages: string;
  other: string;
}

export interface ATSAnalysis {
  id: string;
  cvId: string;
  overallScore: number;
  breakdown: ATSBreakdown;
  issues: ATSIssue[];
  recommendations: string[];
  analyzedAt: number;
}

export interface ATSBreakdown {
  formatting: number;
  keywords: number;
  structure: number;
  readability: number;
  completeness: number;
}

export interface ATSIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  suggestion: string;
}

export interface JobComparison {
  id: string;
  cvId: string;
  jobTitle: string;
  jobDescription: string;
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  recommendations: string[];
  comparedAt: number;
}

export interface OptimizedCV {
  id: string;
  originalCvId: string;
  optimizedText: string;
  improvements: string[];
  newScore: number;
  createdAt: number;
}

export interface DashboardStats {
  totalCVs: number;
  averageAtsScore: number;
  highestScore: number;
  lowestScore: number;
  totalAnalyses: number;
  totalComparisons: number;
  scoreHistory: ScoreEntry[];
}

export interface ScoreEntry {
  date: number;
  score: number;
  cvName: string;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  description: string;
  keywords: string[];
  matchScore?: number;
}

export type Page =
  | 'dashboard'
  | 'upload'
  | 'analysis'
  | 'compare'
  | 'generator'
  | 'editor'
  | 'search'
  | 'community';
