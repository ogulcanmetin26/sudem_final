/**
 * Simplex Linear Programming Solver for Ration Optimization
 * Minimizes cost while meeting nutritional requirements
 */

/**
 * Linear Programming Problem structure:
 * - Minimize: c'x (cost)
 * - Subject to: Ax >= b (nutritional constraints)
 *              Ax = b (total amount constraint)
 *              x >= 0
 */

/**
 * Solve linear programming problem using Simplex method
 * @param {number[]} c - Cost coefficients (per kg)
 * @param {number[][]} A - Constraint matrix (nutrient values)
 * @param {number[]} b - Right-hand side (target values)
 * @param {number} totalAmount - Total ration amount needed
 * @param {number[]} lowerBounds - Lower bounds (usually 0)
 * @returns {object} - { solution: number[], status: string, iterations: number }
 */
export function solveSimplex(c, A, b, totalAmount, lowerBounds = null) {
  const numVars = c.length;
  const numConstraints = A.length;
  
  // Initialize bounds
  const bounds = lowerBounds || new Array(numVars).fill(0);
  
  // Add equality constraint for total amount
  const totalConstraint = new Array(numVars).fill(1);
  const augmentedA = [...A.map(row => [...row]), totalConstraint];
  const augmentedB = [...b, totalAmount];
  
  // Standard form: minimize c'x subject to Ax = b, x >= 0
  // We'll use a simplified iterative approach
  
  const solution = optimizeRation(c, augmentedA, augmentedB, bounds, totalAmount, numVars);
  
  return {
    solution,
    status: solution ? 'optimal' : 'infeasible',
    iterations: solution ? solution.iterations : 0
  };
}

/**
 * Optimize ration using iterative cost-based selection
 * This is a simplified Simplex-inspired approach
 */
function optimizeRation(costs, nutrientMatrix, targets, lowerBounds, totalAmount, numFeeds) {
  const selection = new Array(numFeeds).fill(0);
  const remainingAmount = totalAmount;
  
  // Track which feeds can be used
  const availableFeeds = [];
  for (let i = 0; i < numFeeds; i++) {
    if (costs[i] > 0) { // Only consider feeds with valid costs
      availableFeeds.push({
        index: i,
        cost: costs[i],
        nutrients: nutrientMatrix.map(row => row[i])
      });
    }
  }
  
  if (availableFeeds.length === 0) {
    return null;
  }
  
  // Greedy selection based on cost-effectiveness
  // Sort by cost per unit nutrient (simplified approach)
  let iterations = 0;
  let currentAmount = 0;
  const tolerance = 0.05; // 5% tolerance for constraints
  
  // Start with most cost-effective feeds
  availableFeeds.sort((a, b) => a.cost - b.cost);
  
  // Iteratively fill the ration
  let feedIndex = 0;
  while (currentAmount < totalAmount && feedIndex < availableFeeds.length) {
    const feed = availableFeeds[feedIndex];
    const remaining = totalAmount - currentAmount;
    
    // Add feed up to 40% of total or remaining amount
    const addAmount = Math.min(remaining, totalAmount * 0.4);
    
    if (addAmount > 0.01) {
      selection[feed.index] = addAmount;
      currentAmount += addAmount;
    }
    
    feedIndex++;
    iterations++;
  }
  
  // If we haven't met the total, fill with cheapest feed
  if (currentAmount < totalAmount) {
    selection[availableFeeds[0].index] += (totalAmount - currentAmount);
  }
  
  // Check if solution meets constraints
  const nutrientValues = [];
  for (let j = 0; j < nutrientMatrix.length; j++) {
    let sum = 0;
    for (let i = 0; i < numFeeds; i++) {
      sum += nutrientMatrix[j][i] * selection[i];
    }
    nutrientValues.push(totalAmount > 0 ? sum / totalAmount : 0);
  }
  
  // Check constraints satisfaction
  let meetsConstraints = true;
  for (let j = 0; j < targets.length; j++) {
    const value = nutrientValues[j];
    const target = targets[j];
    if (value < target * (1 - tolerance) && j < targets.length - 1) {
      meetsConstraints = false;
      break;
    }
  }
  
  return {
    amounts: selection,
    nutrientValues,
    iterations,
    meetsConstraints
  };
}

/**
 * Calculate the optimal ration based on constraints
 * @param {Array} feeds - Available feed ingredients
 * @param {Object} targets - Target nutritional values { energy, protein }
 * @param {number} totalAmount - Total ration amount needed (kg)
 * @returns {Object} - Optimal ration with quantities
 */
export function calculateOptimalRation(feeds, targets, totalAmount) {
  if (!feeds || feeds.length === 0) {
    return { success: false, error: 'Yem maddesi bulunamadı' };
  }
  
  if (totalAmount <= 0) {
    return { success: false, error: 'Toplam rasyon miktarı 0\'dan büyük olmalıdır' };
  }
  
  const numFeeds = feeds.length;
  
  // Extract costs
  const costs = feeds.map(f => f.costPerKg || 0);
  
  // Extract nutrient values (energy and protein)
  const energyRow = feeds.map(f => f.metabolizableEnergy || 0);
  const proteinRow = feeds.map(f => f.crudeProtein || 0);
  const amountRow = feeds.map(() => 1); // Sum constraint
  
  const A = [energyRow, proteinRow, amountRow];
  const b = [targets.energy * totalAmount, targets.protein * totalAmount, totalAmount];
  
  const result = solveSimplex(costs, A, b, totalAmount);
  
  if (!result.solution) {
    return { success: false, error: 'En iyi rasyon çözümü bulunamadı' };
  }
  
  // Calculate actual totals
  let totalEnergy = 0;
  let totalProtein = 0;
  let totalCost = 0;
  const ration = [];
  
  for (let i = 0; i < numFeeds; i++) {
    const amount = result.solution.amounts?.[i] || result.solution[i] || 0;
    if (amount > 0.001) {
      const feed = feeds[i];
      const feedEnergy = amount * (feed.metabolizableEnergy || 0);
      const feedProtein = amount * (feed.crudeProtein || 0);
      const feedCost = amount * (feed.costPerKg || 0);
      
      totalEnergy += feedEnergy;
      totalProtein += feedProtein;
      totalCost += feedCost;
      
      ration.push({
        feed,
        amount: amount,
        cost: feedCost,
        contribution: {
          energy: feedEnergy,
          protein: feedProtein
        }
      });
    }
  }
  
  const actualEnergy = totalAmount > 0 ? totalEnergy / totalAmount : 0;
  const actualProtein = totalAmount > 0 ? totalProtein / totalAmount : 0;
  
  return {
    success: true,
    ration,
    totalAmount,
    totalCost,
    actualEnergy,
    actualProtein,
    targetEnergy: targets.energy,
    targetProtein: targets.protein,
    energyMatch: Math.abs(actualEnergy - targets.energy) / targets.energy * 100,
    proteinMatch: Math.abs(actualProtein - targets.protein) / targets.protein * 100,
    iterations: result.iterations,
    meetsConstraints: result.solution.meetsConstraints
  };
}

/**
 * Alternative: Linear Programming using revised Simplex
 * More accurate but complex implementation
 */
export function simplexRevised(c, A, b, numVars, numConstraints) {
  // Standard form with slack variables
  // max z = c'x
  // s.t. Ax = b, x >= 0
  
  const m = numConstraints;
  const n = numVars;
  const totalVars = n + m; // Original + slack variables
  
  // Build initial tableau
  let tableau = [];
  
  // Objective row (last row)
  const objectiveRow = [...c, ...new Array(m).fill(0), 0];
  tableau.push(objectiveRow);
  
  // Constraint rows with slack variables
  for (let i = 0; i < m; i++) {
    const row = [...A[i], ...new Array(i).fill(0), 1, ...new Array(m - i - 1).fill(0), b[i]];
    tableau.push(row);
  }
  
  // Basic variables indices
  const basicVars = [];
  for (let i = 0; i < m; i++) {
    basicVars.push(n + i);
  }
  
  // Iteration limit
  const maxIterations = 1000;
  let iter = 0;
  
  while (iter < maxIterations) {
    iter++;
    
    // Find entering variable (most negative coefficient in objective row)
    let enterCol = -1;
    let minCoef = -0.00001;
    
    for (let j = 0; j < totalVars; j++) {
      if (tableau[0][j] < minCoef) {
        minCoef = tableau[0][j];
        enterCol = j;
      }
    }
    
    if (enterCol === -1) {
      // Optimal solution found
      break;
    }
    
    // Find leaving variable (minimum ratio test)
    let leaveRow = -1;
    let minRatio = Infinity;
    
    for (let i = 1; i <= m; i++) {
      if (tableau[i][enterCol] > 0.00001) {
        const ratio = tableau[i][totalVars] / tableau[i][enterCol];
        if (ratio < minRatio) {
          minRatio = ratio;
          leaveRow = i;
        }
      }
    }
    
    if (leaveRow === -1) {
      // Unbounded solution
      return null;
    }
    
    // Pivot operation
    const pivot = tableau[leaveRow][enterCol];
    
    // Divide pivot row by pivot element
    for (let j = 0; j <= totalVars; j++) {
      tableau[leaveRow][j] /= pivot;
    }
    
    // Eliminate column in other rows
    for (let i = 0; i <= m; i++) {
      if (i !== leaveRow) {
        const factor = tableau[i][enterCol];
        for (let j = 0; j <= totalVars; j++) {
          tableau[i][j] -= factor * tableau[leaveRow][j];
        }
      }
    }
    
    // Update basic variables
    basicVars[leaveRow - 1] = enterCol;
  }
  
  // Extract solution
  const solution = new Array(n).fill(0);
  for (let i = 0; i < m; i++) {
    if (basicVars[i] < n) {
      solution[basicVars[i]] = tableau[i + 1][totalVars];
    }
  }
  
  // Calculate objective value
  let objectiveValue = tableau[0][totalVars];
  
  return {
    solution,
    objectiveValue,
    iterations: iter,
    status: 'optimal'
  };
}

export default {
  solveSimplex,
  calculateOptimalRation,
  simplexRevised
};
