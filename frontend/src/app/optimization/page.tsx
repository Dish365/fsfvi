"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { VulnerabilityMetricCard } from "@/components/vulnerability-metric-card";
import { ValueChainComponentTable } from "@/components/value-chain-component-table";
import { Button } from "@/components/ui/button";
import ghanaCocoaData from "@/data/ghana-cocoa-data";
import { calculateSystemVulnerability } from "@/lib/fsfvi-calculator";

export default function OptimizationPage() {
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [currentVulnerability, setCurrentVulnerability] = useState(0);
  const [optimizedVulnerability, setOptimizedVulnerability] = useState(0);
  const [totalBudget] = useState(ghanaCocoaData.totalBudget);
  const [totalAllocated, setTotalAllocated] = useState(0);
  
  // Initialize allocations with current values
  useEffect(() => {
    const initialAllocations: Record<string, number> = {};
    let total = 0;
    
    ghanaCocoaData.components.forEach(component => {
      initialAllocations[component.id] = component.currentAllocation;
      total += component.currentAllocation;
    });
    
    setAllocations(initialAllocations);
    setTotalAllocated(total);
    
    // Calculate initial vulnerabilities
    const initial = calculateSystemVulnerability(ghanaCocoaData);
    setCurrentVulnerability(initial);
    setOptimizedVulnerability(initial);
  }, []);
  
  // Handle allocation change for a specific component
  const handleAllocationChange = (componentId: string, newValue: number[]) => {
    const value = newValue[0];
    const newAllocations = { ...allocations, [componentId]: value };
    
    // Calculate new total
    let newTotal = 0;
    Object.values(newAllocations).forEach(allocation => {
      newTotal += allocation;
    });
    
    // Update state
    setAllocations(newAllocations);
    setTotalAllocated(newTotal);
    
    // Recalculate vulnerability
    const newVulnerability = calculateSystemVulnerability(ghanaCocoaData, newAllocations);
    setOptimizedVulnerability(newVulnerability);
  };
  
  // Reset to initial allocations
  const handleReset = () => {
    const initialAllocations: Record<string, number> = {};
    let total = 0;
    
    ghanaCocoaData.components.forEach(component => {
      initialAllocations[component.id] = component.currentAllocation;
      total += component.currentAllocation;
    });
    
    setAllocations(initialAllocations);
    setTotalAllocated(total);
    setOptimizedVulnerability(currentVulnerability);
  };
  
  // Simple heuristic optimization (not mathematically optimal, just for demo)
  const handleSimpleOptimize = () => {
    // This is a simplified optimization that allocates more to high performance gap components
    const newAllocations: Record<string, number> = {};
    let remainingBudget = totalBudget;
    
    // Sort components by performance gap
    const sortedComponents = [...ghanaCocoaData.components]
      .sort((a, b) => {
        const gapA = Math.abs(a.observedPerformance - a.benchmarkPerformance) / a.observedPerformance;
        const gapB = Math.abs(b.observedPerformance - b.benchmarkPerformance) / b.observedPerformance;
        return gapB - gapA;
      });
    
    // Allocate budget proportionally to performance gap and weight
    sortedComponents.forEach(component => {
      const gap = Math.abs(component.observedPerformance - component.benchmarkPerformance) / component.observedPerformance;
      const weight = component.weight;
      
      // Higher gaps and weights get more budget (this is a simplified approach)
      const allocationFactor = gap * weight;
      const allocation = Math.min(
        remainingBudget * allocationFactor * 2, // Multiply by 2 to amplify differences
        remainingBudget * 0.4 // Cap at 40% of remaining budget
      );
      
      newAllocations[component.id] = Math.round(allocation * 10) / 10; // Round to 1 decimal
      remainingBudget -= newAllocations[component.id];
    });
    
    // If there's still budget left, allocate it to the highest gap component
    if (remainingBudget > 0) {
      newAllocations[sortedComponents[0].id] += Math.round(remainingBudget * 10) / 10;
    }
    
    // Update state
    setAllocations(newAllocations);
    setTotalAllocated(totalBudget);
    
    // Recalculate vulnerability
    const newVulnerability = calculateSystemVulnerability(ghanaCocoaData, newAllocations);
    setOptimizedVulnerability(newVulnerability);
  };
  
  // Check if over budget
  const isOverBudget = totalAllocated > totalBudget;
  
  // Calculate vulnerability improvement
  const vulnerabilityImprovement = currentVulnerability - optimizedVulnerability;
  const improvementPercentage = (vulnerabilityImprovement / currentVulnerability) * 100;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resource Optimization</h1>
          <p className="mt-2 text-slate-600">
            Optimize resource allocation to minimize system vulnerability
          </p>
        </div>
        
        {/* Metrics Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <VulnerabilityMetricCard
            title="Current Vulnerability"
            value={currentVulnerability}
            description="Before optimization"
            colorScheme="warning"
          />
          
          <VulnerabilityMetricCard
            title="Optimized Vulnerability"
            value={optimizedVulnerability}
            description="After optimization"
            colorScheme={optimizedVulnerability < currentVulnerability ? "success" : "danger"}
          />
          
          <VulnerabilityMetricCard
            title="Improvement"
            value={Math.abs(improvementPercentage) / 100}
            description={`${improvementPercentage > 0 ? "+" : ""}${improvementPercentage.toFixed(1)}% change`}
            colorScheme={improvementPercentage > 0 ? "success" : "danger"}
          />
        </div>
        
        {/* Budget Control */}
        <Card className={isOverBudget ? "border-red-500" : ""}>
          <CardHeader>
            <CardTitle>Budget Allocation</CardTitle>
            <CardDescription>
              Total Budget: ${totalBudget}M | Allocated: ${totalAllocated.toFixed(1)}M
              {isOverBudget && (
                <span className="ml-2 text-red-500 font-medium">
                  (Over budget by ${(totalAllocated - totalBudget).toFixed(1)}M)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              {ghanaCocoaData.components.map(component => (
                <div key={component.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{component.name}</span>
                      <span className="ml-2 text-xs text-slate-500">
                        (Current: ${component.currentAllocation}M)
                      </span>
                    </div>
                    <span className="font-semibold">
                      ${allocations[component.id]?.toFixed(1) || "0.0"}M
                    </span>
                  </div>
                  <Slider
                    defaultValue={[component.currentAllocation]}
                    max={totalBudget * 0.5} // Max 50% of total budget
                    step={0.1}
                    value={[allocations[component.id] || component.currentAllocation]}
                    onValueChange={(value) => handleAllocationChange(component.id, value)}
                  />
                </div>
              ))}
              
              <div className="flex justify-end gap-4 mt-4">
                <Button variant="outline" onClick={handleReset}>
                  Reset to Initial
                </Button>
                <Button 
                  onClick={handleSimpleOptimize}
                  variant="default"
                >
                  Simple Optimization
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>Optimization Results</CardTitle>
            <CardDescription>
              Comparison of performance before and after resource allocation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ValueChainComponentTable 
              components={ghanaCocoaData.components}
              customAllocations={allocations}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 