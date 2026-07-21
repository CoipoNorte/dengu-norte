const DB_NAME = 'dengu-norte-db';
const DB_VERSION = 1;
const CV_STORE = 'cvs';
const ANALYSIS_STORE = 'analyses';

let db: IDBDatabase | null = null;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Store de CVs
      if (!database.objectStoreNames.contains(CV_STORE)) {
        const cvStore = database.createObjectStore(CV_STORE, { keyPath: 'id' });
        cvStore.createIndex('uploadedAt', 'uploadedAt', { unique: false });
      }

      // Store de análisis
      if (!database.objectStoreNames.contains(ANALYSIS_STORE)) {
        const analysisStore = database.createObjectStore(ANALYSIS_STORE, { keyPath: 'id' });
        analysisStore.createIndex('cvId', 'cvId', { unique: false });
      }
    };
  });
};

export const saveCV = async (cv: any): Promise<string> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([CV_STORE], 'readwrite');
    const store = transaction.objectStore(CV_STORE);
    const request = store.put(cv);

    request.onsuccess = () => resolve(cv.id);
    request.onerror = () => reject(request.error);
  });
};

export const getAllCVs = async (): Promise<any[]> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([CV_STORE], 'readonly');
    const store = transaction.objectStore(CV_STORE);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteCV = async (id: string): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([CV_STORE], 'readwrite');
    const store = transaction.objectStore(CV_STORE);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const saveAnalysis = async (analysis: any): Promise<string> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([ANALYSIS_STORE], 'readwrite');
    const store = transaction.objectStore(ANALYSIS_STORE);
    const request = store.put(analysis);

    request.onsuccess = () => resolve(analysis.id);
    request.onerror = () => reject(request.error);
  });
};

export const getAnalysesByCV = async (cvId: string): Promise<any[]> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([ANALYSIS_STORE], 'readonly');
    const store = transaction.objectStore(ANALYSIS_STORE);
    const index = store.index('cvId');
    const request = index.getAll(cvId);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const clearAllData = async (): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([CV_STORE, ANALYSIS_STORE], 'readwrite');
    
    const cvStore = transaction.objectStore(CV_STORE);
    const analysisStore = transaction.objectStore(ANALYSIS_STORE);

    cvStore.clear();
    analysisStore.clear();

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};
