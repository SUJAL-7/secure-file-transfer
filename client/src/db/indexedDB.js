import { openDB } from 'idb';
import { DB_NAME, DB_VERSION, KEYSTORE_NAME, SETTINGS_STORE } from '../utils/constants.js';

let dbInstance = null;

/**
 * Initialize IndexedDB
 */
export const initDB = async () => {
  if (dbInstance) return dbInstance;
  
  try {
    dbInstance = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // Create keystore object store
        if (!db.objectStoreNames.contains(KEYSTORE_NAME)) {
          const keyStore = db.createObjectStore(KEYSTORE_NAME, {
            keyPath: 'id',
          });
          keyStore.createIndex('userId', 'userId', { unique: true });
          keyStore.createIndex('createdAt', 'createdAt');
        }
        
        // Create settings object store
        if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
          db.createObjectStore(SETTINGS_STORE, {
            keyPath: 'key',
          });
        }
      },
      blocked() {
        console.warn('Database upgrade blocked');
      },
      blocking() {
        console.warn('Database blocking');
      },
    });
    
    console.log('✅ IndexedDB initialized');
    return dbInstance;
  } catch (error) {
    console.error('❌ Failed to initialize IndexedDB:', error);
    throw error;
  }
};

/**
 * Get database instance
 */
export const getDB = async () => {
  if (!dbInstance) {
    return await initDB();
  }
  return dbInstance;
};

/**
 * Clear all data
 */
export const clearAllData = async () => {
  const db = await getDB();
  const tx = db.transaction([KEYSTORE_NAME, SETTINGS_STORE], 'readwrite');
  
  await Promise.all([
    tx.objectStore(KEYSTORE_NAME).clear(),
    tx.objectStore(SETTINGS_STORE).clear(),
  ]);
  
  await tx.done;
  console.log('✅ All IndexedDB data cleared');
};

/**
 * Close database connection
 */
export const closeDB = () => {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    console.log('✅ IndexedDB connection closed');
  }
};