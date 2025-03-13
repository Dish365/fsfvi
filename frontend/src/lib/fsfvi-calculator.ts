/**
 * FSFVI Calculator Utility Functions
 * Implements the core equations for calculating the Food System Food Value Index
 */

import { ValueChainComponent, FSFVIData } from "@/data/ghana-cocoa-data";

/**
 * Eq(1): δᵢ = |xᵢ-x̄ᵢ|/xᵢ
 * Calculates the performance gap (delta) for a component
 */
export function calculatePerformanceGap(component: ValueChainComponent): number {
  const observed = component.observedPerformance;
  const benchmark = component.benchmarkPerformance;
  
  // Prevent division by zero
  if (observed === 0) return 1;
  
  // Calculate absolute performance gap ratio
  return Math.abs(observed - benchmark) / observed;
}

/**
 * Eq(2): νᵢ(fᵢ) = δᵢ·1/(1+αᵢfᵢ)
 * Calculates the vulnerability score for a component
 */
export function calculateComponentVulnerability(
  component: ValueChainComponent, 
  allocation: number = component.currentAllocation
): number {
  const delta = calculatePerformanceGap(component);
  const sensitivity = component.sensitivityParameter;
  
  // Calculate component vulnerability with current or provided allocation
  return delta * (1 / (1 + (sensitivity * allocation)));
}

/**
 * Eq(3): FSFVI = Σωᵢ·νᵢ(fᵢ)
 * Calculates the overall system vulnerability index
 */
export function calculateSystemVulnerability(
  data: FSFVIData,
  allocations?: Record<string, number>
): number {
  return data.components.reduce((sum, component) => {
    const allocation = allocations ? 
      (allocations[component.id] || component.currentAllocation) : 
      component.currentAllocation;
    
    const vulnerability = calculateComponentVulnerability(component, allocation);
    return sum + (component.weight * vulnerability);
  }, 0);
}

/**
 * Calculate all metrics for the value chain
 */
export function calculateAllMetrics(
  data: FSFVIData,
  allocations?: Record<string, number>
): {
  componentMetrics: {
    id: string;
    name: string;
    performanceGap: number;
    vulnerability: number;
    weightedVulnerability: number;
    allocation: number;
  }[];
  systemVulnerability: number;
} {
  const componentMetrics = data.components.map(component => {
    const allocation = allocations ? 
      (allocations[component.id] || component.currentAllocation) : 
      component.currentAllocation;
    
    const performanceGap = calculatePerformanceGap(component);
    const vulnerability = calculateComponentVulnerability(component, allocation);
    const weightedVulnerability = component.weight * vulnerability;
    
    return {
      id: component.id,
      name: component.name,
      performanceGap,
      vulnerability,
      weightedVulnerability,
      allocation
    };
  });
  
  const systemVulnerability = calculateSystemVulnerability(data, allocations);
  
  return {
    componentMetrics,
    systemVulnerability
  };
} 