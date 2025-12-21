/**
 * Basket Logic Utilities
 * Common functions for multi-underlying products (worst-of, best-of, etc.)
 */

/**
 * Calculate normalized levels for each underlying
 * @param spots Current spot prices
 * @param initials Initial fixing prices
 * @returns Array of normalized levels (S_i / S0_i)
 */
export function calcLevels(spots: number[], initials: number[]): number[] {
  if (spots.length !== initials.length) {
    throw new Error('Spots and initials arrays must have same length');
  }
  
  return spots.map((spot, i) => {
    if (initials[i] === 0) {
      throw new Error(`Initial fixing cannot be zero for underlying ${i}`);
    }
    return spot / initials[i];
  });
}

/**
 * Find worst-of level and index
 * @param levels Normalized levels array
 * @returns Worst level and its index
 */
export function worstOf(levels: number[]): { worstLevel: number; worstIndex: number } {
  if (levels.length === 0) {
    throw new Error('Levels array cannot be empty');
  }
  
  let worstLevel = levels[0];
  let worstIndex = 0;
  
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] < worstLevel) {
      worstLevel = levels[i];
      worstIndex = i;
    }
  }
  
  return { worstLevel, worstIndex };
}

/**
 * Find best-of level and index
 * @param levels Normalized levels array
 * @returns Best level and its index
 */
export function bestOf(levels: number[]): { bestLevel: number; bestIndex: number } {
  if (levels.length === 0) {
    throw new Error('Levels array cannot be empty');
  }
  
  let bestLevel = levels[0];
  let bestIndex = 0;
  
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] > bestLevel) {
      bestLevel = levels[i];
      bestIndex = i;
    }
  }
  
  return { bestLevel, bestIndex };
}

/**
 * Calculate average level (simple arithmetic mean).
 * @param levels Normalized levels array
 */
export function averageOf(levels: number[]): number {
  if (levels.length === 0) {
    throw new Error('Levels array cannot be empty');
  }
  const sum = levels.reduce((acc, v) => acc + v, 0);
  return sum / levels.length;
}

/**
 * Normalize a single level (for backward compatibility)
 * @param currentPrice Current price
 * @param initialFixing Initial fixing price
 * @returns Normalized level
 */
export function normalizeLevel(currentPrice: number, initialFixing: number): number {
  if (initialFixing === 0) {
    throw new Error('Initial fixing cannot be zero');
  }
  return currentPrice / initialFixing;
}
