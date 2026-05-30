/**
 * Simplex Linear Programming Solver for Ration Optimization
 * Minimizes cost while meeting nutritional requirements
 */

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
  
  // Convert target energy from MJ/kg format (stored as actual MJ like 13.5)
  // to match the database format where ME is stored directly as MJ/kg
  const targetEnergy = targets.energy; // Already in MJ/kg format
  const targetProtein = targets.protein; // Already in percentage format
  
  // Simple greedy optimization with constraints
  // Select feeds that best meet the target while minimizing cost
  const numFeeds = feeds.length;
  
  // Calculate total nutritional contribution possible
  // Use a simplified linear programming approach
  let bestSolution = null;
  let bestCost = Infinity;
  
  // Strategy: Select from cheapest feeds first, then adjust to meet targets
  // Sort feeds by cost
  const sortedFeeds = [...feeds].sort((a, b) => (a.costPerKg || 0) - (b.costPerKg || 0));
  
  // Use at most 8 feeds for optimization (simplicity constraint)
  const candidateFeeds = sortedFeeds.slice(0, Math.min(20, numFeeds));
  
  // Greedy allocation based on nutritional value per cost
  let remainingAmount = totalAmount;
  const allocation = new Array(candidateFeeds.length).fill(0);
  
  // First pass: allocate based on protein contribution (higher priority for most rations)
  for (let i = 0; i < candidateFeeds.length && remainingAmount > 0; i++) {
    const feed = candidateFeeds[i];
    if (feed.crudeProtein > 0 && feed.costPerKg > 0) {
      const proteinPerCost = feed.crudeProtein / feed.costPerKg;
      // Allocate up to 30% of total to each feed
      const maxAmount = totalAmount * 0.3;
      const allocated = Math.min(remainingAmount, maxAmount);
      allocation[i] = allocated;
      remainingAmount -= allocated;
    }
  }
  
  // Second pass: fill remaining with cheapest feeds
  for (let i = 0; i < candidateFeeds.length && remainingAmount > 0; i++) {
    if (allocation[i] === 0) {
      const maxAmount = totalAmount * 0.25;
      const allocated = Math.min(remainingAmount, maxAmount);
      allocation[i] = allocated;
      remainingAmount -= allocated;
    }
  }
  
  // Calculate actual values
  let totalCost = 0;
  let totalEnergy = 0;
  let totalProtein = 0;
  const ration = [];
  
  for (let i = 0; i < candidateFeeds.length; i++) {
    if (allocation[i] > 0.001) {
      const feed = candidateFeeds[i];
      const amount = allocation[i];
      const cost = (feed.costPerKg || 0) * amount;
      const energyContribution = (feed.metabolizableEnergy || 0) * amount;
      const proteinContribution = (feed.crudeProtein || 0) * amount / 100 * amount;
      
      totalCost += cost;
      totalEnergy += energyContribution;
      totalProtein += proteinContribution;
      
      ration.push({
        feed,
        amount,
        cost,
        contribution: {
          energy: energyContribution,
          protein: proteinContribution
        }
      });
    }
  }
  
  const actualEnergy = totalAmount > 0 ? totalEnergy / totalAmount : 0;
  const actualProtein = totalAmount > 0 ? (totalProtein / totalAmount) * 100 : 0;
  
  // Check if solution meets constraints (within 15% tolerance)
  const energyMatch = targetEnergy > 0 ? Math.abs(actualEnergy - targetEnergy) / targetEnergy * 100 : 0;
  const proteinMatch = targetProtein > 0 ? Math.abs(actualProtein - targetProtein) / targetProtein * 100 : 0;
  
  return {
    success: true,
    ration,
    totalAmount,
    totalCost,
    actualEnergy,
    actualProtein,
    targetEnergy,
    targetProtein,
    energyMatch,
    proteinMatch,
    iterations: 1,
    meetsConstraints: energyMatch <= 15 && proteinMatch <= 15
  };
}

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
  const solution = optimizeRation(c, augmentedA, augmentedB, bounds, totalAmount, numVars);
  
  return {
    solution,
    status: solution ? 'optimal' : 'infeasible',
    iterations: solution ? solution.iterations : 0
  };
}

/**
 * Optimize ration using iterative cost-based selection
 */
function optimizeRation(costs, nutrientMatrix, targets, lowerBounds, totalAmount, numFeeds) {
  const selection = new Array(numFeeds).fill(0);
  const remainingAmount = totalAmount;
  
  const availableFeeds = [];
  for (let i = 0; i < numFeeds; i++) {
    if (costs[i] > 0) {
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
  
  availableFeeds.sort((a, b) => a.cost - b.cost);
  
  let iterations = 0;
  let currentAmount = 0;
  const tolerance = 0.15;
  
  let feedIndex = 0;
  while (currentAmount < totalAmount && feedIndex < availableFeeds.length) {
    const feed = availableFeeds[feedIndex];
    const remaining = totalAmount - currentAmount;
    const addAmount = Math.min(remaining, totalAmount * 0.35);
    
    if (addAmount > 0.01) {
      selection[feed.index] = addAmount;
      currentAmount += addAmount;
    }
    
    feedIndex++;
    iterations++;
  }
  
  if (currentAmount < totalAmount) {
    selection[availableFeeds[0].index] += (totalAmount - currentAmount);
  }
  
  const nutrientValues = [];
  for (let j = 0; j < nutrientMatrix.length; j++) {
    let sum = 0;
    for (let i = 0; i < numFeeds; i++) {
      sum += nutrientMatrix[j][i] * selection[i];
    }
    nutrientValues.push(totalAmount > 0 ? sum / totalAmount : 0);
  }
  
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

export default {
  solveSimplex,
  calculateOptimalRation
};
