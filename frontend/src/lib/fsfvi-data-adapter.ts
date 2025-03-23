import { FSFVIData, FSFVIComponent, Indicator } from './fsfvi-algorithms';
import { FSFVISubsector } from './csv-processor';

/**
 * Adapter to convert the CSV-processed data to the format required by FSFVI algorithms
 * This maps the structure from our JSON to the FSFVI calculation engine
 * 
 * @param jsonData The JSON data created from the CSV processing
 * @returns Data formatted for FSFVI calculations
 */
export function adaptJsonToFSFVIFormat(jsonData: any): FSFVIData {
  const fsfviData: FSFVIData = {
    subsectors: {},
    totalBudget: jsonData.totalBudget || 0
  };

  // Map each subsector to a component
  Object.keys(jsonData.subsectors).forEach(key => {
    const subsector = jsonData.subsectors[key] as FSFVISubsector;
    
    // Map indicators
    const indicators: Indicator[] = subsector.indicators.map(indicator => ({
      projectName: indicator.projectName,
      matchScore: indicator.matchScore,
      expenditures: indicator.expenditures,
      value: indicator.value,
      benchmark: indicator.benchmark,
      performanceGap: indicator.performanceGap || 0
    }));
    
    // Create the FSFVI component
    const component: FSFVIComponent = {
      id: key,
      name: subsector.name,
      indicators,
      totalExpenditures: subsector.totalExpenditures,
      averagePerformanceGap: subsector.averagePerformanceGap || 0
    };
    
    fsfviData.subsectors[key] = component;
  });
  
  return fsfviData;
}

/**
 * Loads the Kenya FSFVI optimized data and adapts it for analysis
 * 
 * @returns Promise that resolves to FSFVI-compatible data
 */
export async function loadKenyaFSFVIData(): Promise<FSFVIData> {
  try {
    // Dynamic import to load the JSON data
    const jsonData = await import('../data/kenya_fsfvi_optimized.json');
    return adaptJsonToFSFVIFormat(jsonData);
  } catch (error) {
    console.error('Error loading Kenya FSFVI data:', error);
    // Return empty data structure if loading fails
    return { subsectors: {}, totalBudget: 0 };
  }
}

/**
 * Compute key metrics from FSFVI data for use in dashboards
 * 
 * @param data FSFVI data
 * @returns Computed metrics for dashboard
 */
export function computeDashboardMetrics(data: FSFVIData) {
  // Import required functions from algorithms
  const { computeFSFVI, optimizeResourceAllocation, calculateEfficiencyMetrics } = require('./fsfvi-algorithms');
  
  // Calculate FSFVI
  const { fsfviValue, processedData } = computeFSFVI(data);
  
  // Get highest vulnerability components (top 3)
  const sortedComponents = Object.entries(processedData.subsectors)
    .map(([id, component]) => ({
      id,
      name: (component as FSFVIComponent).name,
      vulnerability: (component as FSFVIComponent).vulnerability || 0,
      performanceGap: (component as FSFVIComponent).averagePerformanceGap,
      allocation: (component as FSFVIComponent).totalExpenditures,
      weight: (component as FSFVIComponent).weight || 0 
    }))
    .sort((a, b) => b.vulnerability - a.vulnerability)
    .slice(0, 3);
  
  // Optimize allocations
  const optimization = optimizeResourceAllocation(data);
  
  // Calculate efficiency metrics
  const efficiencyMetrics = calculateEfficiencyMetrics(
    optimization.originalFSFVI,
    optimization.optimizedFSFVI
  );
  
  return {
    systemVulnerability: fsfviValue,
    topVulnerableComponents: sortedComponents,
    allocations: {
      current: optimization.originalAllocations,
      optimized: optimization.optimizedAllocations
    },
    efficiency: efficiencyMetrics
  };
}

/**
 * One-step function to load Kenya data and compute all metrics
 * 
 * @returns Promise resolving to computed dashboard metrics
 */
export async function getKenyaFSFVIDashboardMetrics() {
  const data = await loadKenyaFSFVIData();
  return computeDashboardMetrics(data);
} 