/**
 * FSFVI UI Adapter
 * 
 * This adapter connects the improved FSFVI algorithms to the UI components
 * by providing conversion functions between data formats.
 */

import { 
  FSFVIConfig,
  calculateEfficiencyMetrics,
  assignComponentWeights,
  estimateSensitivityParameters,
  calculateFSFVI
} from "./fsfvi-algorithms";

/**
 * FSFVIData structure directly from the Kenya data format
 */
export interface KenyaFSFVIData {
  subsectors: Record<string, {
    name: string;
    indicators: Array<{
      projectName: string;
      matchScore: number;
      expenditures: number;
      value: number | null;
      benchmark: number | null;
      performanceGap: number;
    }>;
    totalExpenditures: number;
    averagePerformanceGap: number;
    weight?: number;
    sensitivityParameter?: number;
  }>;
}

/**
 * Creates config options for the FSFVI algorithm
 */
export function createConfigOptions(contextualFactors?: {
  climateEmergency: boolean;
  foodCrisis: boolean;
  nutritionCrisis: boolean;
  marketDevelopment: boolean;
}): FSFVIConfig {
  // Define per-subsector caps based on analysis of Kenya data
  // Higher caps for subsectors with known higher performance gaps
  const perSubsectorCaps: Record<string, number> = {
    "Food security": 8.0, // Contains indicators with gaps up to 7.15
    "Nutritional status": 7.0, // Contains indicators with gaps up to 6.6
    "Food availability": 6.5, // Contains indicators with gaps up to 5.95
    "Environmental impacts": 6.0, // Contains indicators with gaps up to 5.73
    // Default for others will be the general cap value
  };

  return {
    contextualFactors: contextualFactors || {
      climateEmergency: false,
      foodCrisis: false,
      nutritionCrisis: false,
      marketDevelopment: false
    },
    gapCalculation: {
      useWeightedAverage: true,
      trimOutliers: true,
      capMaxGap: 8.0, // Increased from 5.0 to 8.0 as general cap
      usePercentileCapping: true, // Enable percentile-based capping
      percentileThreshold: 95, // Cap at the 95th percentile
      perSubsectorCaps // Apply subsector-specific caps
    }
  };
}

/**
 * Runs the FSFVI computation with the given data and allocations
 */
export function runFSFVIComputation(
  kenyaData: KenyaFSFVIData,
  customAllocations?: Record<string, number>,
  config?: FSFVIConfig
): {
  fsfviValue: number;
  componentMetrics: {
    id: string;
    name: string;
    performanceGap: number;
    vulnerability: number;
    weightedVulnerability: number;
    allocation: number;
    weight: number;
  }[];
} {
  // Create a working copy of the data with the proper structure
  const workingData = { 
    subsectors: {} as Record<string, any>,
    totalBudget: Object.values(kenyaData.subsectors).reduce(
      (sum, subsector) => sum + subsector.totalExpenditures, 0)
  };
  
  // Add id property to each subsector
  Object.entries(kenyaData.subsectors).forEach(([id, subsector]) => {
    workingData.subsectors[id] = {
      ...subsector,
      id // Add id property required by FSFVIComponent
    };
  });
  
  // Apply sensitivity parameters
  const subsectorsWithSensitivity = estimateSensitivityParameters(workingData.subsectors);
  
  // Apply weights based on contextual factors
  const subsectorsWithWeights = assignComponentWeights(subsectorsWithSensitivity, {
    contextualFactors: config?.contextualFactors
  });
  
  // Apply custom allocations if provided
  if (customAllocations) {
    Object.keys(customAllocations).forEach(id => {
      if (subsectorsWithWeights[id]) {
        subsectorsWithWeights[id].totalExpenditures = customAllocations[id];
      }
    });
  }
  
  // Calculate vulnerabilities for each subsector
  Object.keys(subsectorsWithWeights).forEach(id => {
    const subsector = subsectorsWithWeights[id];
    const performanceGap = subsector.averagePerformanceGap;
    const allocation = subsector.totalExpenditures;
    const sensitivityParam = subsector.sensitivityParameter || 0.4;
    
    // Calculate vulnerability using the proper formula from the algorithms
    const allocationEffect = 1 / (1 + sensitivityParam * allocation);
    const vulnerability = performanceGap * allocationEffect;
    
    subsectorsWithWeights[id].vulnerability = vulnerability;
  });
  
  // Calculate total FSFVI
  const fsfviValue = calculateFSFVI({ subsectors: subsectorsWithWeights, totalBudget: workingData.totalBudget });
  
  // Prepare component metrics for the UI
  const componentMetrics = Object.entries(subsectorsWithWeights).map(([id, subsector]) => {
    const weight = subsector.weight || 0;
    const vulnerability = subsector.vulnerability || 0;
    const weightedVulnerability = weight * vulnerability;
    
    return {
      id,
      name: subsector.name,
      performanceGap: subsector.averagePerformanceGap,
      vulnerability,
      weightedVulnerability,
      allocation: subsector.totalExpenditures,
      weight
    };
  });
  
  return {
    fsfviValue,
    componentMetrics
  };
}

/**
 * Runs the FSFVI optimization with the given data
 */
export function runFSFVIOptimization(
  kenyaData: KenyaFSFVIData,
  config?: FSFVIConfig
): {
  originalVulnerability: number;
  optimizedVulnerability: number;
  efficiencyMetrics: ReturnType<typeof calculateEfficiencyMetrics>;
  optimizedAllocations: Record<string, number>;
  originalAllocations: Record<string, number>;
  diagnostics: {
    sectorContributions: Record<string, {
      percentage: number;
      allocation: number;
      allocationChange: number;
      allocationPercentChange: number;
    }>;
  };
} {
  // Get original allocations and vulnerability
  const originalAllocations: Record<string, number> = {};
  Object.entries(kenyaData.subsectors).forEach(([id, subsector]) => {
    originalAllocations[id] = subsector.totalExpenditures;
  });
  
  const originalComputation = runFSFVIComputation(kenyaData, undefined, config);
  const originalVulnerability = originalComputation.fsfviValue;
  
  // Calculate total budget
  const totalBudget = Object.values(originalAllocations).reduce((sum, allocation) => sum + allocation, 0);
  
  // Apply weights based on contextual factors
  const subsectorWeights = applyContextualFactorWeights(kenyaData, config?.contextualFactors);
  
  // Use gradient descent to optimize allocations
  const optimizedAllocations = gradientDescentOptimization(
    kenyaData,
    originalAllocations,
    totalBudget,
    subsectorWeights,
    50  // Number of iterations
  );
  
  // Calculate optimized vulnerability
  const optimizedComputation = runFSFVIComputation(kenyaData, optimizedAllocations, config);
  const optimizedVulnerability = optimizedComputation.fsfviValue;
  
  // Calculate efficiency metrics
  const efficiencyMetrics = calculateEfficiencyMetrics(originalVulnerability, optimizedVulnerability);
  
  // Create diagnostics
  const diagnostics = {
    sectorContributions: {} as Record<string, {
      percentage: number;
      allocation: number;
      allocationChange: number;
      allocationPercentChange: number;
    }>
  };
  
  Object.keys(optimizedAllocations).forEach(id => {
    const originalAllocation = originalAllocations[id];
    const optimizedAllocation = optimizedAllocations[id];
    const allocationChange = optimizedAllocation - originalAllocation;
    const allocationPercentChange = (allocationChange / originalAllocation) * 100;
    
    diagnostics.sectorContributions[id] = {
      percentage: (totalBudget > 0) ? (optimizedAllocation / totalBudget) * 100 : 0,
      allocation: optimizedAllocation,
      allocationChange,
      allocationPercentChange
    };
  });
  
  return {
    originalVulnerability,
    optimizedVulnerability,
    efficiencyMetrics,
    optimizedAllocations,
    originalAllocations,
    diagnostics
  };
}

/**
 * Apply contextual factor weights to the subsectors
 */
function applyContextualFactorWeights(
  data: KenyaFSFVIData, 
  contextualFactors?: FSFVIConfig['contextualFactors']
): Record<string, number> {
  if (!contextualFactors) {
    return Object.fromEntries(
      Object.keys(data.subsectors).map(id => [id, 1 / Object.keys(data.subsectors).length])
    );
  }
  
  const weights: Record<string, number> = {};
  let totalWeight = 0;
  
  // Apply weight adjustments based on contextual factors
  Object.entries(data.subsectors).forEach(([id, subsector]) => {
    let weight = 1;
    
    // Adjust weights based on subsector and contextual factors
    if (contextualFactors.climateEmergency && 
        (subsector.name.toLowerCase().includes('environment') || 
         subsector.name.toLowerCase().includes('climate'))) {
      weight *= 1.5; // +50% weight
    }
    
    if (contextualFactors.foodCrisis && 
        (subsector.name.toLowerCase().includes('food') || 
         subsector.name.toLowerCase().includes('safety'))) {
      weight *= 1.8; // +80% weight
    }
    
    if (contextualFactors.nutritionCrisis && 
        subsector.name.toLowerCase().includes('nutrition')) {
      weight *= 1.7; // +70% weight
    }
    
    if (contextualFactors.marketDevelopment && 
        (subsector.name.toLowerCase().includes('market') || 
         subsector.name.toLowerCase().includes('retail') ||
         subsector.name.toLowerCase().includes('economic'))) {
      weight *= 1.4; // +40% weight
    }
    
    weights[id] = weight;
    totalWeight += weight;
  });
  
  // Normalize weights to sum to 1
  if (totalWeight > 0) {
    Object.keys(weights).forEach(id => {
      weights[id] /= totalWeight;
    });
  }
  
  return weights;
}

/**
 * Gradient descent optimization of resource allocation
 */
function gradientDescentOptimization(
  data: KenyaFSFVIData,
  initialAllocations: Record<string, number>,
  totalBudget: number,
  weights: Record<string, number>,
  iterations: number
): Record<string, number> {
  // Initialize with current allocations
  const allocations: Record<string, number> = { ...initialAllocations };
  const learningRate = totalBudget * 0.01; // Adaptive learning rate
  
  // Calculate impact scores based on performance gaps and weights
  const impactScores: Record<string, number> = {};
  let totalImpactScore = 0;
  
  Object.entries(data.subsectors).forEach(([id, subsector]) => {
    // Higher impact score for subsectors with higher performance gap and higher weight
    const impactScore = subsector.averagePerformanceGap * (weights[id] || 1);
    impactScores[id] = impactScore;
    totalImpactScore += impactScore;
  });
  
  // Run gradient descent iterations
  for (let i = 0; i < iterations; i++) {
    // Calculate current total allocation
    const currentTotal = Object.values(allocations).reduce((sum, value) => sum + value, 0);
    
    // Calculate how much to adjust each allocation based on impact scores
    const adjustments: Record<string, number> = {};
    Object.keys(allocations).forEach(id => {
      // Higher adjustments for subsectors with higher impact scores
      adjustments[id] = (impactScores[id] / totalImpactScore) * learningRate;
    });
    
    // Apply adjustments while respecting constraints
    const subsectorIds = Object.keys(allocations);
    
    // First, apply positive adjustments to high-impact subsectors
    subsectorIds
      .sort((a, b) => impactScores[b] - impactScores[a])
      .slice(0, Math.ceil(subsectorIds.length / 2))
      .forEach(id => {
        allocations[id] += adjustments[id];
      });
    
    // Then, reduce allocations from low-impact subsectors to maintain budget
    if (currentTotal > totalBudget) {
      const excess = currentTotal - totalBudget;
      subsectorIds
        .sort((a, b) => impactScores[a] - impactScores[b])
        .forEach(id => {
          const maxReduction = Math.min(
            allocations[id] * 0.8, // Don't reduce by more than 80%
            excess / subsectorIds.length
          );
          allocations[id] = Math.max(0.1, allocations[id] - maxReduction); // Ensure minimum allocation
        });
    }
    
    // Normalize to total budget
    const updatedTotal = Object.values(allocations).reduce((sum, value) => sum + value, 0);
    const normalizationFactor = totalBudget / updatedTotal;
    
    Object.keys(allocations).forEach(id => {
      allocations[id] *= normalizationFactor;
      // Round to 2 decimal places
      allocations[id] = Math.round(allocations[id] * 100) / 100;
    });
  }
  
  return allocations;
} 