/**
 * Simplex Linear Programming Solver using Big-M Method
 * Minimizes feed cost while meeting nutritional requirements
 */

/**
 * Solve LP with Big-M method
 * Minimize: Σ ci * xi (total cost)
 * Subject to:
 *   Σ xi * MEi / totalAmount >= targetEnergy (energy constraint)
 *   Σ xi * CPi / totalAmount >= targetProtein (protein constraint)
 *   Σ xi = totalAmount (total amount equality)
 *   0 <= xi <= totalAmount * 0.5 (bounds)
 */
export function calculateOptimalRation(feeds, targets, totalAmount) {
  if (!feeds || feeds.length === 0) {
    return { success: false, error: 'Yem maddesi bulunamadı', feasible: false };
  }
  
  if (totalAmount <= 0) {
    return { success: false, error: 'Toplam rasyon miktarı 0\'dan büyük olmalıdır', feasible: false };
  }

  const n = feeds.length;
  const M = 1000000; // Big-M penalty value
  
  // Extract costs, energy, and protein
  const costs = feeds.map(f => f.costPerKg || 0);
  const energies = feeds.map(f => f.metabolizableEnergy || 0);
  const proteins = feeds.map(f => f.crudeProtein || 0);
  
  // Normalize constraints: multiply by totalAmount to get linear form
  // Energy: Σ xi * MEi >= targetEnergy * totalAmount
  // Protein: Σ xi * CPi >= targetProtein * totalAmount
  
  const targetEnergy = targets.energy;
  const targetProtein = targets.protein;
  const energyRHS = targetEnergy * totalAmount;
  const proteinRHS = targetProtein * totalAmount;
  const amountRHS = totalAmount;
  
  // Build LP tableau for Big-M method
  // Variables: x1, x2, ..., xn (feeds)
  //           s1 (surplus for energy >=)
  //           a1 (artificial for energy >=)
  //           s2 (surplus for protein >=)
  //           a2 (artificial for protein >=)
  //           a3 (artificial for total amount =)
  
  // Total variables: n + 6 (n feeds + 2 surpluses + 3 artificials)
  const numVars = n;
  const numConstraints = 3; // energy, protein, amount
  const totalCols = numVars + 6; // n feeds + surplus1 + artificial1 + surplus2 + artificial2 + artificial3 + RHS
  
  // Tableau: [objective row] followed by constraint rows
  // Each constraint row: [coeffs for x1..xn] [surplus coeff] [artificial coeff] [RHS]
  
  // Initialize tableau with zeros
  const tableau = [];
  
  // Row 0: Objective function (minimize c'x + M*(a1 + a2 + a3))
  const objRow = [...costs, 0, M, 0, M, M, 0];
  tableau.push(objRow);
  
  // Constraint 1: Energy >= targetEnergy * totalAmount
  // Σ xi * MEi - s1 + a1 = energyRHS
  const energyRow = [...energies, -1, 1, 0, 0, 0, energyRHS];
  tableau.push(energyRow);
  
  // Constraint 2: Protein >= targetProtein * totalAmount
  // Σ xi * CPi - s2 + a2 = proteinRHS
  const proteinRow = [...proteins, 0, 0, -1, 1, 0, proteinRHS];
  tableau.push(proteinRow);
  
  // Constraint 3: Total amount = totalAmount
  // Σ xi = totalAmount
  const amountRow = [...Array(n).fill(1), 0, 0, 0, 0, 1, amountRHS];
  tableau.push(amountRow);
  
  // Basic variables: a1 (row 1), a2 (row 2), a3 (row 3)
  const basicVars = [n + 2, n + 4, n + 5]; // indices of artificial variables
  
  // Phase 1: Minimize artificial variables to find feasible solution
  // Set up Phase 1 objective: minimize a1 + a2 + a3
  
  // Make objective row reflect Phase 1
  const phase1Obj = [...Array(totalCols).fill(0)];
  for (let i = 0; i < 3; i++) {
    phase1Obj[basicVars[i]] = 1;
  }
  
  // Eliminate basic variables from objective row
  for (let i = 1; i <= 3; i++) {
    const coef = phase1Obj[basicVars[i - 1]];
    if (coef !== 0) {
      for (let j = 0; j < totalCols; j++) {
        tableau[0][j] -= coef * tableau[i][j];
      }
    }
  }
  
  // Simplex iterations
  const maxIterations = 1000;
  let iterations = 0;
  
  while (iterations < maxIterations) {
    iterations++;
    
    // Find entering variable (most negative coefficient in objective)
    let enterCol = -1;
    let minCoef = -0.000001;
    
    // Only consider non-basic variables for entering
    for (let j = 0; j < totalCols - 1; j++) {
      if (!basicVars.includes(j) && tableau[0][j] < minCoef) {
        minCoef = tableau[0][j];
        enterCol = j;
      }
    }
    
    if (enterCol === -1) {
      // Optimal found for current phase
      break;
    }
    
    // Minimum ratio test to find leaving variable
    let leaveRow = -1;
    let minRatio = Infinity;
    
    for (let i = 1; i <= 3; i++) {
      const coeff = tableau[i][enterCol];
      if (coeff > 0.000001) {
        const ratio = tableau[i][totalCols - 1] / coeff;
        if (ratio < minRatio) {
          minRatio = ratio;
          leaveRow = i;
        }
      }
    }
    
    if (leaveRow === -1) {
      // Unbounded - shouldn't happen with our constraints
      break;
    }
    
    // Pivot
    pivot(tableau, leaveRow, enterCol, totalCols);
    basicVars[leaveRow - 1] = enterCol;
  }
  
  // Check if Phase 1 solution has artificial variables at positive value
  let artificialValue = 0;
  for (let i = 0; i < 3; i++) {
    // Check if any artificial variable is still basic with positive value
    for (let j = 0; j < n + 6; j++) {
      if (basicVars[i] === j && j >= n + 1 && j <= n + 5) {
        // This is an artificial variable
        if (tableau[i + 1][totalCols - 1] > 0.0001) {
          artificialValue += tableau[i + 1][totalCols - 1];
        }
      }
    }
  }
  
  // Phase 1 complete - check feasibility
  if (artificialValue > 0.001) {
    // Infeasible - use greedy fallback
    return greedyFallback(feeds, costs, energies, proteins, targetEnergy, targetProtein, totalAmount);
  }
  
  // Phase 2: Optimize original objective
  // Set up Phase 2 objective: minimize Σ ci * xi
  const phase2Obj = [...costs, 0, 0, 0, 0, 0, 0];
  
  // Make objective row reflect Phase 2 (only original variables)
  for (let j = 0; j < totalCols; j++) {
    tableau[0][j] = phase2Obj[j];
  }
  
  // Eliminate basic variables from objective row
  for (let i = 1; i <= 3; i++) {
    const coef = tableau[0][basicVars[i - 1]];
    if (coef !== 0) {
      for (let j = 0; j < totalCols; j++) {
        tableau[0][j] -= coef * tableau[i][j];
      }
    }
  }
  
  // Phase 2 iterations
  while (iterations < maxIterations) {
    iterations++;
    
    // Find entering variable
    let enterCol = -1;
    let minCoef = -0.000001;
    
    for (let j = 0; j < totalCols - 1; j++) {
      if (!basicVars.includes(j) && tableau[0][j] < minCoef) {
        minCoef = tableau[0][j];
        enterCol = j;
      }
    }
    
    if (enterCol === -1) {
      break;
    }
    
    // Minimum ratio test
    let leaveRow = -1;
    let minRatio = Infinity;
    
    for (let i = 1; i <= 3; i++) {
      const coeff = tableau[i][enterCol];
      if (coeff > 0.000001) {
        const ratio = tableau[i][totalCols - 1] / coeff;
        if (ratio < minRatio) {
          minRatio = ratio;
          leaveRow = i;
        }
      }
    }
    
    if (leaveRow === -1) {
      break;
    }
    
    pivot(tableau, leaveRow, enterCol, totalCols);
    basicVars[leaveRow - 1] = enterCol;
  }
  
  // Extract solution
  const solution = new Array(n).fill(0);
  for (let i = 1; i <= 3; i++) {
    if (basicVars[i - 1] < n) {
      solution[basicVars[i - 1]] = tableau[i][totalCols - 1];
    }
  }
  
  // Apply bounds: 0 <= xi <= totalAmount * 0.5
  const maxPerFeed = totalAmount * 0.5;
  for (let i = 0; i < n; i++) {
    if (solution[i] > maxPerFeed) {
      solution[i] = maxPerFeed;
    }
    if (solution[i] < 0) {
      solution[i] = 0;
    }
  }
  
  // Normalize to exact totalAmount
  const sum = solution.reduce((a, b) => a + b, 0);
  if (sum > 0.001) {
    const scale = totalAmount / sum;
    for (let i = 0; i < n; i++) {
      solution[i] *= scale;
    }
  }
  
  // Calculate results
  let totalCost = 0;
  let totalEnergy = 0;
  let totalProtein = 0;
  let feedCount = 0;
  
  const ration = [];
  for (let i = 0; i < n; i++) {
    if (solution[i] > 0.001) {
      const amount = solution[i];
      const cost = amount * costs[i];
      const energyContrib = amount * energies[i];
      const proteinContrib = amount * proteins[i];
      
      totalCost += cost;
      totalEnergy += energyContrib;
      totalProtein += proteinContrib;
      feedCount++;
      
      ration.push({
        feed: feeds[i],
        amount,
        cost,
        contribution: {
          energy: energyContrib,
          protein: proteinContrib
        }
      });
    }
  }
  
  // Calculate actual values (weighted average, NOT multiplied by amount again)
  const actualEnergy = totalAmount > 0 ? totalEnergy / totalAmount : 0;
  const actualProtein = totalAmount > 0 ? totalProtein / totalAmount : 0;
  
  // Calculate match percentages (deviation from target)
  const energyMatch = targetEnergy > 0 ? Math.abs(actualEnergy - targetEnergy) / targetEnergy * 100 : 0;
  const proteinMatch = targetProtein > 0 ? Math.abs(actualProtein - targetProtein) / targetProtein * 100 : 0;
  
  return {
    success: true,
    feasible: true,
    ration,
    totalAmount,
    totalCost,
    actualEnergy,
    actualProtein,
    targetEnergy,
    targetProtein,
    energyMatch,
    proteinMatch,
    meetsConstraints: energyMatch <= 15 && proteinMatch <= 15,
    iterations
  };
}

/**
 * Pivot operation on tableau
 */
function pivot(tableau, row, col, numCols) {
  const pivotVal = tableau[row][col];
  
  // Divide pivot row by pivot element
  for (let j = 0; j < numCols; j++) {
    tableau[row][j] /= pivotVal;
  }
  
  // Eliminate column in other rows
  for (let i = 0; i < tableau.length; i++) {
    if (i !== row) {
      const factor = tableau[i][col];
      if (Math.abs(factor) > 0.000001) {
        for (let j = 0; j < numCols; j++) {
          tableau[i][j] -= factor * tableau[row][j];
        }
      }
    }
  }
}

/**
 * Greedy fallback when LP is infeasible
 * Select feeds based on (ME + CP) / cost ratio, max 40% per feed
 */
function greedyFallback(feeds, costs, energies, proteins, targetEnergy, targetProtein, totalAmount) {
  const n = feeds.length;
  
  // Calculate value-to-cost ratio for each feed
  const ratios = feeds.map((feed, i) => ({
    index: i,
    ratio: (energies[i] + proteins[i]) / Math.max(costs[i], 0.01),
    cost: costs[i],
    energy: energies[i],
    protein: proteins[i],
    name: feed.name
  }));
  
  // Sort by ratio (descending)
  ratios.sort((a, b) => b.ratio - a.ratio);
  
  // Greedy allocation with max 40% per feed
  const allocation = new Array(n).fill(0);
  let remaining = totalAmount;
  let feedCount = 0;
  
  for (const item of ratios) {
    if (remaining <= 0.001) break;
    
    const maxAmount = totalAmount * 0.4;
    const allocated = Math.min(remaining, maxAmount);
    
    if (allocated > 0.001) {
      allocation[item.index] = allocated;
      remaining -= allocated;
      feedCount++;
    }
  }
  
  // If still have remaining, add to first feed
  if (remaining > 0.001 && feedCount > 0) {
    const firstIdx = ratios.find(r => allocation[r.index] > 0)?.index || 0;
    allocation[firstIdx] += remaining;
  } else if (feedCount === 0 && remaining > 0.001) {
    // Add to cheapest feed
    const cheapest = ratios.reduce((min, r) => r.cost < min.cost ? r : min, ratios[0]);
    allocation[cheapest.index] = totalAmount;
    feedCount = 1;
  }
  
  // Build result
  let totalCost = 0;
  let totalEnergy = 0;
  let totalProtein = 0;
  const ration = [];
  
  for (let i = 0; i < n; i++) {
    if (allocation[i] > 0.001) {
      const amount = allocation[i];
      const cost = amount * costs[i];
      
      totalCost += cost;
      totalEnergy += amount * energies[i];
      totalProtein += amount * proteins[i];
      
      ration.push({
        feed: feeds[i],
        amount,
        cost,
        contribution: {
          energy: amount * energies[i],
          protein: amount * proteins[i]
        }
      });
    }
  }
  
  const actualEnergy = totalAmount > 0 ? totalEnergy / totalAmount : 0;
  const actualProtein = totalAmount > 0 ? totalProtein / totalAmount : 0;
  
  const energyMatch = targetEnergy > 0 ? Math.abs(actualEnergy - targetEnergy) / targetEnergy * 100 : 0;
  const proteinMatch = targetProtein > 0 ? Math.abs(actualProtein - targetProtein) / targetProtein * 100 : 0;
  
  return {
    success: true,
    feasible: false, // Mark as not optimal (used fallback)
    ration,
    totalAmount,
    totalCost,
    actualEnergy,
    actualProtein,
    targetEnergy,
    targetProtein,
    energyMatch,
    proteinMatch,
    meetsConstraints: energyMatch <= 25 && proteinMatch <= 25,
    iterations: 0,
    fallback: true
  };
}

export default { calculateOptimalRation };