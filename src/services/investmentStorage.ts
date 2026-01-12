/**
 * Investment Position Storage Service
 * Handles CRUD operations for investment positions using localStorage
 */

import type { InvestmentPosition } from '../types/investment';

const STORAGE_KEY = 'valura_investment_positions';
const STORAGE_VERSION = '1.0';

/**
 * Storage wrapper with versioning
 */
interface StorageData {
  version: string;
  positions: InvestmentPosition[];
}

/**
 * Load all positions from localStorage
 */
function loadFromStorage(): InvestmentPosition[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const data: StorageData = JSON.parse(stored);
    
    // Version check (for future migrations)
    if (data.version !== STORAGE_VERSION) {
      console.warn('Storage version mismatch, migrating data...');
      // Add migration logic here if needed
    }

    return data.positions || [];
  } catch (error) {
    console.error('Error loading investment positions from storage:', error);
    return [];
  }
}

/**
 * Save all positions to localStorage
 */
function saveToStorage(positions: InvestmentPosition[]): void {
  try {
    const data: StorageData = {
      version: STORAGE_VERSION,
      positions,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving investment positions to storage:', error);
    throw new Error('Failed to save positions. Storage may be full.');
  }
}

/**
 * Save a new investment position or update existing one
 */
export function saveInvestmentPosition(position: InvestmentPosition): void {
  const positions = loadFromStorage();
  const existingIndex = positions.findIndex(p => p.id === position.id);

  if (existingIndex >= 0) {
    // Update existing position
    positions[existingIndex] = {
      ...position,
      updatedAt: new Date().toISOString().split('T')[0],
    };
  } else {
    // Add new position
    positions.push(position);
  }

  saveToStorage(positions);
}

/**
 * Load a single investment position by ID
 */
export function loadInvestmentPosition(id: string): InvestmentPosition | null {
  const positions = loadFromStorage();
  return positions.find(p => p.id === id) || null;
}

/**
 * Load all investment positions
 */
export function loadAllInvestmentPositions(): InvestmentPosition[] {
  return loadFromStorage();
}

/**
 * Delete an investment position by ID
 */
export function deleteInvestmentPosition(id: string): void {
  const positions = loadFromStorage();
  const filtered = positions.filter(p => p.id !== id);
  saveToStorage(filtered);
}

/**
 * Update coupon payment status
 */
export function updateCouponPayment(
  positionId: string,
  couponIndex: number,
  paid: boolean
): void {
  const position = loadInvestmentPosition(positionId);
  if (!position) {
    throw new Error(`Position ${positionId} not found`);
  }

  if (couponIndex < 0 || couponIndex >= position.couponHistory.length) {
    throw new Error(`Invalid coupon index ${couponIndex}`);
  }

  position.couponHistory[couponIndex].paid = paid;
  saveInvestmentPosition(position);
}

/**
 * Update manual barrier breach flag
 */
export function updateBarrierBreachStatus(
  positionId: string,
  breached: boolean
): void {
  const position = loadInvestmentPosition(positionId);
  if (!position) {
    throw new Error(`Position ${positionId} not found`);
  }

  position.manualBarrierBreach = breached;
  saveInvestmentPosition(position);
}

/**
 * Update position name
 */
export function updatePositionName(
  positionId: string,
  name: string
): void {
  const position = loadInvestmentPosition(positionId);
  if (!position) {
    throw new Error(`Position ${positionId} not found`);
  }

  position.name = name;
  saveInvestmentPosition(position);
}

/**
 * Export all positions as JSON (for backup)
 */
export function exportPositions(): string {
  const positions = loadFromStorage();
  return JSON.stringify({
    version: STORAGE_VERSION,
    exportDate: new Date().toISOString(),
    positions,
  }, null, 2);
}

/**
 * Import positions from JSON (with validation)
 */
export function importPositions(jsonData: string): void {
  try {
    const data = JSON.parse(jsonData);
    
    if (!data.positions || !Array.isArray(data.positions)) {
      throw new Error('Invalid import data format');
    }

    // Validate each position has required fields
    for (const position of data.positions) {
      if (!position.id || !position.productTerms || !position.inceptionDate) {
        throw new Error('Invalid position data in import');
      }
    }

    // Merge with existing positions (avoid duplicates)
    const existingPositions = loadFromStorage();
    const existingIds = new Set(existingPositions.map(p => p.id));
    
    const newPositions = data.positions.filter(
      (p: InvestmentPosition) => !existingIds.has(p.id)
    );

    saveToStorage([...existingPositions, ...newPositions]);
  } catch (error) {
    console.error('Error importing positions:', error);
    throw new Error('Failed to import positions. Invalid data format.');
  }
}

/**
 * Clear all positions (use with caution!)
 */
export function clearAllPositions(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get storage statistics
 */
export function getStorageStats(): {
  totalPositions: number;
  storageUsed: number; // bytes
  storageLimit: number; // bytes (approximate)
} {
  const positions = loadFromStorage();
  const stored = localStorage.getItem(STORAGE_KEY);
  const storageUsed = stored ? new Blob([stored]).size : 0;
  
  return {
    totalPositions: positions.length,
    storageUsed,
    storageLimit: 5 * 1024 * 1024, // ~5MB typical localStorage limit
  };
}
