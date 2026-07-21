// ==========================================
// Database Hook - Manages all IndexedDB operations
// ==========================================

import { useState, useEffect, useCallback, useRef } from 'react';
import type { CVDocument, ATSAnalysis, JobComparison, DashboardStats } from '../types';
import * as db from '../services/indexedDB';
import { analyzeATS, compareWithJob, generateOptimizedCV, parseRawText, extractKeywords } from '../services/atsEngine';

export function useDatabase() {
  const [cvs, setCvs] = useState<CVDocument[]>([]);
  const [analyses, setAnalyses] = useState<ATSAnalysis[]>([]);
  const [comparisons, setComparisons] = useState<JobComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const isMounted = useRef(true);

  // Load all data on mount - only sets loading on initial load
  const refresh = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    }
    
    try {
      const [allCvs, allAnalyses, allComparisons] = await Promise.all([
        db.getAllCVs(),
        db.getAllAnalyses(),
        db.getAllComparisons(),
      ]);
      
      if (isMounted.current) {
        setCvs(allCvs.sort((a, b) => b.uploadedAt - a.uploadedAt));
        setAnalyses(allAnalyses);
        setComparisons(allComparisons);
      }
    } catch (err) {
      console.error('Error loading database:', err);
    }
    
    if (isInitial && isMounted.current) {
      setLoading(false);
      setInitialLoadDone(true);
    }
  }, []);

  // Initial load only
  useEffect(() => {
    isMounted.current = true;
    refresh(true);
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Upload a new CV from text
  const uploadCV = useCallback(async (fileName: string, rawText: string, fileSize: number): Promise<CVDocument> => {
    const sections = parseRawText(rawText);
    const keywords = extractKeywords(rawText);

    const cv: CVDocument = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      name: fileName.replace(/\.[^.]+$/, ''),
      fileName,
      rawText,
      uploadedAt: Date.now(),
      sections,
      keywords: keywords.slice(0, 50),
      fileSize,
    };

    // Auto-analyze
    const analysis = analyzeATS(cv);
    cv.atsScore = analysis.overallScore;
    cv.lastAnalyzedAt = Date.now();

    await db.saveCVDocument(cv);
    await db.saveAnalysis(analysis);
    
    // Refresh without loading state
    await refresh(false);

    return cv;
  }, [refresh]);

  // Delete a CV
  const deleteCV = useCallback(async (id: string) => {
    await db.deleteCVDocument(id);
    await refresh(false);
  }, [refresh]);

  // Run ATS analysis on a CV - returns analysis without triggering loading
  const runAnalysis = useCallback(async (cvId: string): Promise<ATSAnalysis | null> => {
    const cv = await db.getCVById(cvId);
    if (!cv) return null;

    const analysis = analyzeATS(cv);
    cv.atsScore = analysis.overallScore;
    cv.lastAnalyzedAt = Date.now();

    await db.saveCVDocument(cv);
    await db.saveAnalysis(analysis);
    
    // Update local state directly without full refresh
    setCvs(prev => prev.map(c => c.id === cvId ? { ...c, atsScore: analysis.overallScore, lastAnalyzedAt: Date.now() } : c));
    setAnalyses(prev => [...prev, analysis]);

    return analysis;
  }, []);

  // Compare CV with job
  const runComparison = useCallback(async (cvId: string, jobTitle: string, jobDescription: string): Promise<JobComparison | null> => {
    const cv = await db.getCVById(cvId);
    if (!cv) return null;

    const comparison = compareWithJob(cv, jobTitle, jobDescription);
    await db.saveComparison(comparison);
    
    // Update local state directly
    setComparisons(prev => [...prev, comparison]);

    return comparison;
  }, []);

  // Generate optimized CV
  const optimizeCV = useCallback(async (cvId: string) => {
    const cv = await db.getCVById(cvId);
    if (!cv) return null;

    const analysis = analyzeATS(cv);
    const optimized = generateOptimizedCV(cv, analysis);
    await db.saveOptimizedCV(optimized);

    return optimized;
  }, []);

  // Get dashboard stats
  const getStats = useCallback((): DashboardStats => {
    const scores = cvs.filter(c => c.atsScore != null).map(c => c.atsScore!);

    return {
      totalCVs: cvs.length,
      averageAtsScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      highestScore: scores.length > 0 ? Math.max(...scores) : 0,
      lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
      totalAnalyses: analyses.length,
      totalComparisons: comparisons.length,
      scoreHistory: cvs
        .filter(c => c.atsScore != null)
        .map(c => ({
          date: c.lastAnalyzedAt || c.uploadedAt,
          score: c.atsScore!,
          cvName: c.name,
        }))
        .sort((a, b) => a.date - b.date),
    };
  }, [cvs, analyses, comparisons]);

  return {
    cvs,
    analyses,
    comparisons,
    loading,
    initialLoadDone,
    refresh,
    uploadCV,
    deleteCV,
    runAnalysis,
    runComparison,
    optimizeCV,
    getStats,
  };
}
