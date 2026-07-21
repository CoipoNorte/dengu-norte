// ==========================================
// IndexedDB Service - Dengu Norte ATS Optimizer
// All data persists locally in the browser
// ==========================================

import { openDB, type IDBPDatabase } from 'idb';
import type { CVDocument, ATSAnalysis, JobComparison, OptimizedCV } from '../types';

const DB_NAME = 'dengu-norte-ats';
const DB_VERSION = 1;

// Store names
const STORES = {
  CVS: 'cvs',
  ANALYSES: 'analyses',
  COMPARISONS: 'comparisons',
  OPTIMIZED: 'optimized',
} as const;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // CVs store
        if (!db.objectStoreNames.contains(STORES.CVS)) {
          db.createObjectStore(STORES.CVS, { keyPath: 'id' });
        }
        // Analyses store
        if (!db.objectStoreNames.contains(STORES.ANALYSES)) {
          const store = db.createObjectStore(STORES.ANALYSES, { keyPath: 'id' });
          store.createIndex('byCvId', 'cvId');
        }
        // Comparisons store
        if (!db.objectStoreNames.contains(STORES.COMPARISONS)) {
          const store = db.createObjectStore(STORES.COMPARISONS, { keyPath: 'id' });
          store.createIndex('byCvId', 'cvId');
        }
        // Optimized CVs store
        if (!db.objectStoreNames.contains(STORES.OPTIMIZED)) {
          const store = db.createObjectStore(STORES.OPTIMIZED, { keyPath: 'id' });
          store.createIndex('byCvId', 'originalCvId');
        }
      },
    });
  }
  return dbPromise;
}

// ========== CV Operations ==========

export async function saveCVDocument(cv: CVDocument): Promise<void> {
  const db = await getDB();
  await db.put(STORES.CVS, cv);
}

export async function getAllCVs(): Promise<CVDocument[]> {
  const db = await getDB();
  return db.getAll(STORES.CVS);
}

export async function getCVById(id: string): Promise<CVDocument | undefined> {
  const db = await getDB();
  return db.get(STORES.CVS, id);
}

export async function deleteCVDocument(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORES.CVS, id);
  // Also clean up related analyses, comparisons, optimized
  const analyses = await db.getAllFromIndex(STORES.ANALYSES, 'byCvId', id);
  for (const a of analyses) await db.delete(STORES.ANALYSES, a.id);
  const comparisons = await db.getAllFromIndex(STORES.COMPARISONS, 'byCvId', id);
  for (const c of comparisons) await db.delete(STORES.COMPARISONS, c.id);
  const optimized = await db.getAllFromIndex(STORES.OPTIMIZED, 'byCvId', id);
  for (const o of optimized) await db.delete(STORES.OPTIMIZED, o.id);
}

// ========== Analysis Operations ==========

export async function saveAnalysis(analysis: ATSAnalysis): Promise<void> {
  const db = await getDB();
  await db.put(STORES.ANALYSES, analysis);
}

export async function getAnalysesByCv(cvId: string): Promise<ATSAnalysis[]> {
  const db = await getDB();
  return db.getAllFromIndex(STORES.ANALYSES, 'byCvId', cvId);
}

export async function getAllAnalyses(): Promise<ATSAnalysis[]> {
  const db = await getDB();
  return db.getAll(STORES.ANALYSES);
}

// ========== Comparison Operations ==========

export async function saveComparison(comparison: JobComparison): Promise<void> {
  const db = await getDB();
  await db.put(STORES.COMPARISONS, comparison);
}

export async function getComparisonsByCv(cvId: string): Promise<JobComparison[]> {
  const db = await getDB();
  return db.getAllFromIndex(STORES.COMPARISONS, 'byCvId', cvId);
}

export async function getAllComparisons(): Promise<JobComparison[]> {
  const db = await getDB();
  return db.getAll(STORES.COMPARISONS);
}

// ========== Optimized CV Operations ==========

export async function saveOptimizedCV(optimized: OptimizedCV): Promise<void> {
  const db = await getDB();
  await db.put(STORES.OPTIMIZED, optimized);
}

export async function getOptimizedByCv(cvId: string): Promise<OptimizedCV[]> {
  const db = await getDB();
  return db.getAllFromIndex(STORES.OPTIMIZED, 'byCvId', cvId);
}

export async function getAllOptimized(): Promise<OptimizedCV[]> {
  const db = await getDB();
  return db.getAll(STORES.OPTIMIZED);
}
