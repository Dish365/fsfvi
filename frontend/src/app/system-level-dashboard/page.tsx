"use client";

import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { VulnerabilityMetricCard } from "@/components/vulnerability-metric-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import kenyaData from "@/data/kenya_fsfvi_optimized.json";
import { 
  runFSFVIComputation, 
  runFSFVIOptimization, 
  createConfigOptions,
  KenyaFSFVIData 
} from "@/lib/fsfvi-ui-adapter";
import { InfoIcon, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

// Type assertion for the Kenya data
const typedKenyaData = kenyaData as KenyaFSFVIData;

export default function AdvancedOptimizationPage() {
  // State for allocations and results
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [currentVulnerability, setCurrentVulnerability] = useState(0);
  const [optimizedVulnerability, setOptimizedVulnerability] = useState(0);
  const [optimizedAllocations, setOptimizedAllocations] = useState<Record<string, number>>({});
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalAllocated, setTotalAllocated] = useState(0);
  const [componentMetrics, setComponentMetrics] = useState<any[]>([]);
  const [diagnostics, setDiagnostics] = useState<any>({});
  const [efficiencyMetrics, setEfficiencyMetrics] = useState<any>({});
  
  // State for contextual factors
  const [contextualFactors, setContextualFactors] = useState({
    climateEmergency: false,
    foodCrisis: false,
    nutritionCrisis: false,
    marketDevelopment: false
  });
  
  // State for showing contextual factors explanation
  const [showFactorsExplanation, setShowFactorsExplanation] = useState(false);
  
  // Calculate total budget from Kenya data
  useEffect(() => {
    let totalBudgetAmount = 0;
    // Sum up expenditures across all subsectors
    Object.keys(typedKenyaData.subsectors).forEach(subsectorId => {
      totalBudgetAmount += typedKenyaData.subsectors[subsectorId].totalExpenditures;
    });
    setTotalBudget(totalBudgetAmount);
  }, []);
  
  // Initialize allocations and calculate initial vulnerability
  useEffect(() => {
    if (totalBudget === 0) return;
    
    const initialAllocations: Record<string, number> = {};
    let total = 0;
    
    // Get initial allocations from Kenya data
    Object.keys(typedKenyaData.subsectors).forEach(subsectorId => {
      const subsector = typedKenyaData.subsectors[subsectorId];
      initialAllocations[subsectorId] = subsector.totalExpenditures;
      total += subsector.totalExpenditures;
    });
    
    setAllocations(initialAllocations);
    setTotalAllocated(total);
    
    // Calculate initial vulnerability 
    const result = runFSFVIComputation(
      typedKenyaData, 
      undefined, 
      createConfigOptions(contextualFactors)
    );
    
    setCurrentVulnerability(result.fsfviValue);
    setOptimizedVulnerability(result.fsfviValue);
    setComponentMetrics(result.componentMetrics);
  }, [totalBudget]);
  
  // Recalculate when contextual factors change
  useEffect(() => {
    if (Object.keys(allocations).length === 0) return;
    
    const config = createConfigOptions(contextualFactors);
    const result = runFSFVIComputation(typedKenyaData, allocations, config);
    setOptimizedVulnerability(result.fsfviValue);
    setComponentMetrics(result.componentMetrics);
  }, [contextualFactors, allocations]);
  
  // Handle allocation change for a specific component
  const handleAllocationChange = (subsectorId: string, newValue: number[]) => {
    const value = newValue[0];
    const newAllocations = { ...allocations, [subsectorId]: value };
    
    // Calculate new total
    let newTotal = 0;
    Object.values(newAllocations).forEach(allocation => {
      newTotal += allocation;
    });
    
    // Update state
    setAllocations(newAllocations);
    setTotalAllocated(newTotal);
    
    // Recalculate vulnerability
    const config = createConfigOptions(contextualFactors);
    const result = runFSFVIComputation(typedKenyaData, newAllocations, config);
    setOptimizedVulnerability(result.fsfviValue);
    setComponentMetrics(result.componentMetrics);
  };
  
  // Reset to initial allocations
  const handleReset = () => {
    const initialAllocations: Record<string, number> = {};
    let total = 0;
    
    Object.keys(typedKenyaData.subsectors).forEach(subsectorId => {
      const subsector = typedKenyaData.subsectors[subsectorId];
      initialAllocations[subsectorId] = subsector.totalExpenditures;
      total += subsector.totalExpenditures;
    });
    
    setAllocations(initialAllocations);
    setTotalAllocated(total);
    
    // Reset to initial vulnerability
    const config = createConfigOptions(contextualFactors);
    const result = runFSFVIComputation(typedKenyaData, initialAllocations, config);
    setOptimizedVulnerability(result.fsfviValue);
    setComponentMetrics(result.componentMetrics);
  };
  
  // Run advanced optimization
  const handleOptimize = () => {
    const config = createConfigOptions(contextualFactors);
    const result = runFSFVIOptimization(typedKenyaData, config);
    
    setOptimizedAllocations(result.optimizedAllocations);
    setAllocations(result.optimizedAllocations);
    setOptimizedVulnerability(result.optimizedVulnerability);
    setEfficiencyMetrics(result.efficiencyMetrics);
    setDiagnostics(result.diagnostics);
    
    // Update total allocated
    let newTotal = 0;
    Object.values(result.optimizedAllocations).forEach(allocation => {
      newTotal += allocation;
    });
    setTotalAllocated(newTotal);
    
    // Update component metrics
    const metricsResult = runFSFVIComputation(
      typedKenyaData, 
      result.optimizedAllocations, 
      config
    );
    setComponentMetrics(metricsResult.componentMetrics);
  };
  
  // Toggle contextual factor
  const toggleContextualFactor = (factor: keyof typeof contextualFactors) => {
    setContextualFactors(prev => ({
      ...prev,
      [factor]: !prev[factor]
    }));
  };
  
  // Check if over budget
  const isOverBudget = totalAllocated > totalBudget;
  
  // Calculate vulnerability improvement
  const vulnerabilityImprovement = currentVulnerability - optimizedVulnerability;
  const improvementPercentage = currentVulnerability === 0 ? 0 : (vulnerabilityImprovement / currentVulnerability) * 100;
  
  // Prepare chart data
  const chartData = componentMetrics.map(component => ({
    name: component.name.length > 15 ? component.name.substring(0, 15) + '...' : component.name,
    vulnerability: Math.round(component.vulnerability * 100),
    allocation: component.allocation,
    gap: Math.round(component.performanceGap * 100)
  }));
  
  // Prepare comparison data for original vs optimized
  const comparisonData = Object.keys(typedKenyaData.subsectors).map(subsectorId => {
    const originalAllocation = typedKenyaData.subsectors[subsectorId].totalExpenditures;
    const optimizedAllocation = optimizedAllocations[subsectorId] || originalAllocation;
    
    return {
      name: typedKenyaData.subsectors[subsectorId].name.length > 12 
        ? typedKenyaData.subsectors[subsectorId].name.substring(0, 12) + '...' 
        : typedKenyaData.subsectors[subsectorId].name,
      original: originalAllocation,
      optimized: optimizedAllocation,
      change: optimizedAllocation - originalAllocation
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kenya FSFVI Optimization</h1>
        <p className="mt-2 text-slate-600">
          Optimize resource allocation for Kenya's food system using advanced algorithms with contextual factors
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
      
      {/* Contextual Factors */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Contextual Factors</CardTitle>
              <div 
                className="cursor-pointer"
                onClick={() => setShowFactorsExplanation(!showFactorsExplanation)}
              >
                {showFactorsExplanation ? 
                  <ChevronUp className="h-5 w-5 text-slate-400" /> : 
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                }
              </div>
            </div>
          </div>
          <CardDescription>
            Adjust weights based on current policy priorities and contextual factors
          </CardDescription>
          
          {showFactorsExplanation && (
            <div className="mt-4 p-4 bg-slate-50 rounded-md text-sm">
              <h4 className="font-semibold mb-3">About Contextual Factors</h4>
              
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium">Climate Emergency (+50% to environmental factors)</h5>
                  <p className="text-slate-600">When selected, this increases the weights of environmental subsectors by 50%</p>
                  <p className="text-slate-600"><strong>Affects:</strong> "Environment and climate change", "Environmental impacts", "Resilience"</p>
                  <p className="text-slate-600"><strong>Use case:</strong> When climate issues are becoming critical and require more immediate attention</p>
                </div>
                
                <div>
                  <h5 className="font-medium">Nutrition Crisis (+70% to nutrition factors)</h5>
                  <p className="text-slate-600">When selected, this increases the weights of nutrition-related subsectors by 70%</p>
                  <p className="text-slate-600"><strong>Affects:</strong> "Nutritional status", "Food security"</p>
                  <p className="text-slate-600"><strong>Use case:</strong> During malnutrition outbreaks or when addressing specific nutrition deficiencies</p>
                </div>
                
                <div>
                  <h5 className="font-medium">Food Crisis (+80% to food availability factors)</h5>
                  <p className="text-slate-600">When selected, this increases the weights of food availability subsectors by 80%</p>
                  <p className="text-slate-600"><strong>Affects:</strong> "Food availability", "Food security", "Storage and distribution"</p>
                  <p className="text-slate-600"><strong>Use case:</strong> During famines, droughts, or other acute food shortage situations</p>
                </div>
                
                <div>
                  <h5 className="font-medium">Market Development (+40% to market factors)</h5>
                  <p className="text-slate-600">When selected, this increases the weights of market-related subsectors by 40%</p>
                  <p className="text-slate-600"><strong>Affects:</strong> "Retail and marketing", "Processing and packaging", "Storage and distribution"</p>
                  <p className="text-slate-600"><strong>Use case:</strong> When focusing on economic development and improving value chains</p>
                </div>
                
                <div className="pt-2 border-t border-slate-200">
                  <p className="text-slate-600">These contextual factors apply multipliers to the base weights of relevant subsectors. After applying these adjustments, the weights are then re-normalized to ensure they still sum to 100%.</p>
                  <p className="text-slate-600 mt-2">When you select these options, you can see how the optimization recommendations change to address these specific scenarios, helping guide resource allocation decisions during different types of challenges in the food system.</p>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="climate" 
                checked={contextualFactors.climateEmergency}
                onCheckedChange={() => toggleContextualFactor('climateEmergency')}
              />
              <label htmlFor="climate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Climate Emergency (+50% to environmental factors)
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="food" 
                checked={contextualFactors.foodCrisis}
                onCheckedChange={() => toggleContextualFactor('foodCrisis')}
              />
              <label htmlFor="food" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Food Crisis (+80% to food availability factors)
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="nutrition" 
                checked={contextualFactors.nutritionCrisis}
                onCheckedChange={() => toggleContextualFactor('nutritionCrisis')}
              />
              <label htmlFor="nutrition" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Nutrition Crisis (+70% to nutrition factors)
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="market" 
                checked={contextualFactors.marketDevelopment}
                onCheckedChange={() => toggleContextualFactor('marketDevelopment')}
              />
              <label htmlFor="market" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Market Development (+40% to market factors)
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs for different views */}
      <Tabs defaultValue="manual">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="manual">Manual Allocation</TabsTrigger>
          <TabsTrigger value="visualization">Visualization</TabsTrigger>
          <TabsTrigger value="comparison">Optimization Comparison</TabsTrigger>
        </TabsList>
        
        {/* Manual Allocation Tab */}
        <TabsContent value="manual">
          <Card className={isOverBudget ? "border-red-500" : ""}>
            <CardHeader>
              <CardTitle>Budget Allocation</CardTitle>
              <CardDescription>
                Total Budget: ${totalBudget.toFixed(2)}M | Allocated: ${totalAllocated.toFixed(2)}M
                {isOverBudget && (
                  <span className="ml-2 text-red-500 font-medium">
                    (Over budget by ${(totalAllocated - totalBudget).toFixed(2)}M)
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                {Object.keys(typedKenyaData.subsectors).map(subsectorId => (
                  <div key={subsectorId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{typedKenyaData.subsectors[subsectorId].name}</span>
                        <span className="ml-2 text-xs text-slate-500">
                          (Current: ${typedKenyaData.subsectors[subsectorId].totalExpenditures.toFixed(2)}M)
                        </span>
                      </div>
                      <span className="font-semibold">
                        ${allocations[subsectorId]?.toFixed(2) || "0.00"}M
                      </span>
                    </div>
                    <Slider
                      defaultValue={[typedKenyaData.subsectors[subsectorId].totalExpenditures]}
                      max={totalBudget * 0.5} // Max 50% of total budget
                      step={0.1}
                      value={[allocations[subsectorId] || typedKenyaData.subsectors[subsectorId].totalExpenditures]}
                      onValueChange={(value) => handleAllocationChange(subsectorId, value)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-4">
              <Button variant="outline" onClick={handleReset}>
                Reset to Initial
              </Button>
              <Button 
                onClick={handleOptimize}
                variant="default"
              >
                Run Advanced Optimization
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Visualization Tab */}
        <TabsContent value="visualization">
          <Card>
            <CardHeader>
              <CardTitle>Component Visualization</CardTitle>
              <CardDescription>
                Visual breakdown of vulnerability and budget allocation by component
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <RechartsTooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="vulnerability" name="Vulnerability (%)" fill="#8884d8" />
                    <Bar yAxisId="left" dataKey="gap" name="Performance Gap (%)" fill="#ff7300" />
                    <Bar yAxisId="right" dataKey="allocation" name="Allocation ($M)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Comparison Tab */}
        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Comparison</CardTitle>
              <CardDescription>
                Compare original and optimized allocations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={comparisonData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="original" name="Original Allocation ($M)" fill="#8884d8" />
                    <Bar dataKey="optimized" name="Optimized Allocation ($M)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {efficiencyMetrics.absoluteGap && (
                <div className="mt-6 p-4 bg-slate-50 rounded-md">
                  <h3 className="text-lg font-semibold mb-2">Efficiency Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="block text-sm text-slate-500 flex items-center">
                        Absolute Gap
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 ml-1 text-slate-400" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>The absolute difference between original and optimized vulnerability scores. Higher values indicate greater improvement in system vulnerability.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </span>
                      <span className="text-lg font-medium">
                        {(efficiencyMetrics.absoluteGap * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div>
                      <span className="block text-sm text-slate-500 flex items-center">
                        Gap Ratio
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 ml-1 text-slate-400" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>The improvement achieved relative to the remaining vulnerability. Higher values (&gt;100%) indicate the improvement is larger than the remaining vulnerability.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </span>
                      <span className="text-lg font-medium">
                        {(efficiencyMetrics.gapRatio * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div>
                      <span className="block text-sm text-slate-500 flex items-center">
                        Efficiency Index
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 ml-1 text-slate-400" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Ratio of optimized to original vulnerability. Lower values indicate greater efficiency improvement (e.g., 20% means vulnerability reduced to 20% of original).</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </span>
                      <span className="text-lg font-medium">
                        {(efficiencyMetrics.efficiencyIndex * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Dynamic Report Explanation */}
                  <div className="mt-4 p-3 border border-slate-200 rounded-md bg-white">
                    <h4 className="font-medium text-sm mb-2 text-slate-700">What This Means</h4>
                    <div className="text-sm text-slate-600">
                      {efficiencyMetrics.absoluteGap > 0.1 ? (
                        <p className="mb-1">
                          <span className="font-medium">Significant improvement:</span> The optimization has reduced system vulnerability by{" "}
                          <span className="font-medium text-emerald-600">{(efficiencyMetrics.absoluteGap * 100).toFixed(1)}%</span> in absolute terms.
                        </p>
                      ) : (
                        <p className="mb-1">
                          <span className="font-medium">Moderate improvement:</span> The optimization has reduced system vulnerability by{" "}
                          <span className="font-medium text-amber-600">{(efficiencyMetrics.absoluteGap * 100).toFixed(1)}%</span> in absolute terms.
                        </p>
                      )}
                      
                      {efficiencyMetrics.gapRatio > 4 ? (
                        <p className="mb-1">
                          <span className="font-medium">Dramatic efficiency gain:</span> The improvement is{" "}
                          <span className="font-medium text-emerald-600">{(efficiencyMetrics.gapRatio * 100).toFixed(1)}%</span> of the remaining vulnerability, 
                          indicating the optimization has captured most available improvements.
                        </p>
                      ) : efficiencyMetrics.gapRatio > 1 ? (
                        <p className="mb-1">
                          <span className="font-medium">Strong efficiency gain:</span> The improvement is greater than the remaining vulnerability, 
                          showing effective reallocation of resources.
                        </p>
                      ) : (
                        <p className="mb-1">
                          <span className="font-medium">Moderate efficiency gain:</span> The optimization has improved resource allocation, but further opportunities may exist.
                        </p>
                      )}
                      
                      {efficiencyMetrics.efficiencyIndex < 0.2 ? (
                        <p>
                          <span className="font-medium">Transformative impact:</span> Vulnerability has been reduced to only{" "}
                          <span className="font-medium text-emerald-600">{(efficiencyMetrics.efficiencyIndex * 100).toFixed(1)}%</span> of the original, 
                          demonstrating the importance of optimal resource allocation over simply increasing funding.
                        </p>
                      ) : efficiencyMetrics.efficiencyIndex < 0.5 ? (
                        <p>
                          <span className="font-medium">Substantial impact:</span> Vulnerability has been reduced by more than half, 
                          showing significant potential for improvement through optimal allocation.
                        </p>
                      ) : (
                        <p>
                          <span className="font-medium">Positive impact:</span> The optimization has improved outcomes, but structural challenges may limit further gains.
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-3 text-sm text-slate-700">
                      <p>
                        <span className="font-medium">Policy implication:</span>{" "}
                        {efficiencyMetrics.absoluteGap > 0.1 && efficiencyMetrics.efficiencyIndex < 0.3 ? (
                          <span>Current allocation is far from optimal. Strategic reallocation of existing resources could dramatically improve food system outcomes.</span>
                        ) : efficiencyMetrics.gapRatio > 1 ? (
                          <span>Resource reallocation offers better returns than simply increasing funding. Focus on high-impact components.</span>
                        ) : (
                          <span>Consider both reallocation and targeted funding increases to address system vulnerabilities.</span>
                        )}
                      </p>
                    </div>

                    {/* Enhanced Policy Guidance */}
                    <div className="mt-4 pt-3 border-t border-slate-200">
                      <h4 className="font-medium text-sm mb-2 text-slate-700">Policy Guidance</h4>
                      
                      {/* Baseline assessment - based on starting vulnerability */}
                      <div className="mb-2">
                        <p className="text-sm text-slate-600">
                          {currentVulnerability < 0.1 ? (
                            <span>Starting from a <span className="text-emerald-600 font-medium">strong baseline</span> with relatively low system vulnerability, the optimization identifies further refinements to resource allocation.</span>
                          ) : currentVulnerability < 0.2 ? (
                            <span>Starting from a <span className="text-amber-600 font-medium">moderate baseline</span> vulnerability, the optimization identifies opportunities to enhance system resilience.</span>
                          ) : (
                            <span>Starting from a <span className="text-rose-600 font-medium">challenging baseline</span> with elevated vulnerability, the optimization provides a pathway toward significant system improvement.</span>
                          )}
                        </p>
                      </div>
                      
                      {/* Specific resource allocation recommendation */}
                      <div className="mb-2">
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Recommended approach: </span>
                          {efficiencyMetrics.absoluteGap > 0.15 ? (
                            <span>Significant opportunities exist for system improvement through reallocation. Consider a <span className="font-medium">major strategic realignment</span> of resources.</span>
                          ) : efficiencyMetrics.absoluteGap > 0.08 ? (
                            <span>Meaningful improvements are possible through targeted reallocation. A <span className="font-medium">moderate rebalancing</span> of resources is recommended.</span>
                          ) : efficiencyMetrics.absoluteGap > 0.03 ? (
                            <span>Some improvements are possible through select reallocation. <span className="font-medium">Limited adjustments</span> to highest-impact sectors are suggested.</span>
                          ) : (
                            <span>Current allocation is already well-optimized. <span className="font-medium">Fine-tuning</span> rather than major restructuring is recommended.</span>
                          )}
                        </p>
                      </div>
                      
                      {/* Context-aware guidance based on selected factors */}
                      {(contextualFactors.climateEmergency || 
                        contextualFactors.foodCrisis || 
                        contextualFactors.nutritionCrisis || 
                        contextualFactors.marketDevelopment) && (
                        <div className="mb-2">
                          <p className="text-sm text-slate-600">
                            <span className="font-medium">Priority alignment: </span>
                            Based on selected contextual factors, focus on {" "}
                            {contextualFactors.climateEmergency && <span className="text-emerald-600 font-medium">environmental resilience</span>}
                            {contextualFactors.climateEmergency && contextualFactors.foodCrisis && ", "}
                            {contextualFactors.foodCrisis && <span className="text-amber-600 font-medium">food availability</span>}
                            {(contextualFactors.climateEmergency || contextualFactors.foodCrisis) && contextualFactors.nutritionCrisis && ", "}
                            {contextualFactors.nutritionCrisis && <span className="text-rose-600 font-medium">nutrition outcomes</span>}
                            {(contextualFactors.climateEmergency || contextualFactors.foodCrisis || contextualFactors.nutritionCrisis) && contextualFactors.marketDevelopment && ", and "}
                            {!((contextualFactors.climateEmergency || contextualFactors.foodCrisis || contextualFactors.nutritionCrisis) && contextualFactors.marketDevelopment) && contextualFactors.marketDevelopment && " "}
                            {contextualFactors.marketDevelopment && <span className="text-indigo-600 font-medium">market systems</span>}
                            {". The optimization results reflect these priorities."}
                          </p>
                        </div>
                      )}

                      {/* Funding implications */}
                      <div>
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Resource implications: </span>
                          {efficiencyMetrics.efficiencyIndex < 0.3 ? (
                            <span>Efficiency gains can largely be achieved through <span className="font-medium">reallocation of existing resources</span>, without significant additional funding requirements.</span>
                          ) : efficiencyMetrics.efficiencyIndex < 0.6 ? (
                            <span>While reallocation offers substantial benefits, <span className="font-medium">selective additional investments</span> in high-impact areas could enhance outcomes further.</span>
                          ) : (
                            <span>Resource reallocation alone may be insufficient. <span className="font-medium">Strategic funding increases</span> should be considered alongside reallocation efforts.</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subsector Metrics</CardTitle>
          <CardDescription>
            Detailed breakdown of performance metrics for each subsector
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Subsector</th>
                  <th className="text-right p-2">Performance Gap</th>
                  <th className="text-right p-2">Vulnerability</th>
                  <th className="text-right p-2">Weight</th>
                  <th className="text-right p-2">Contribution</th>
                  <th className="text-right p-2">Allocation ($M)</th>
                </tr>
              </thead>
              <tbody>
                {componentMetrics.map(component => (
                  <tr key={component.id} className="border-b hover:bg-slate-50">
                    <td className="p-2">{component.name}</td>
                    <td className="text-right p-2">{(component.performanceGap * 100).toFixed(1)}%</td>
                    <td className="text-right p-2">{(component.vulnerability * 100).toFixed(1)}%</td>
                    <td className="text-right p-2">
                      {component.weight ? (component.weight * 100).toFixed(1) + '%' : 'N/A'}
                    </td>
                    <td className="text-right p-2">{(component.weightedVulnerability * 100).toFixed(1)}%</td>
                    <td className="text-right p-2">{component.allocation.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* High Gap Indicators Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>High Performance Gap Indicators</CardTitle>
          <CardDescription>
            Indicators with performance gaps exceeding 5.0 (500%) that require special attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(typedKenyaData.subsectors).map(([subsectorId, subsector]) => {
              // Filter indicators with high gaps
              const highGapIndicators = subsector.indicators.filter(
                indicator => indicator.performanceGap > 5.0
              );
              
              if (highGapIndicators.length === 0) return null;
              
              return (
                <div key={subsectorId} className="mb-4">
                  <h3 className="text-md font-semibold mb-2">{subsector.name}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b bg-slate-50">
                          <th className="text-left p-2">Project</th>
                          <th className="text-right p-2">Current Value</th>
                          <th className="text-right p-2">Benchmark</th>
                          <th className="text-right p-2">Gap</th>
                          <th className="text-right p-2">Match Score</th>
                          <th className="text-right p-2">Expenditure ($M)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {highGapIndicators.map((indicator, idx) => (
                          <tr key={idx} className="border-b hover:bg-red-50">
                            <td className="p-2">{indicator.projectName}</td>
                            <td className="text-right p-2">{indicator.value !== null ? indicator.value.toFixed(2) : 'N/A'}</td>
                            <td className="text-right p-2">{indicator.benchmark !== null ? indicator.benchmark.toFixed(2) : 'N/A'}</td>
                            <td className="text-right p-2 font-medium text-red-600">
                              {(indicator.performanceGap * 100).toFixed(1)}%
                            </td>
                            <td className="text-right p-2">{indicator.matchScore}%</td>
                            <td className="text-right p-2">{indicator.expenditures.toFixed(3)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-2 text-sm text-slate-500">
                    <p>These indicators show significant gaps between current performance and benchmarks, 
                    potentially indicating areas for priority interventions or data issues to investigate.</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 p-4 bg-slate-50 rounded-md">
            <h3 className="font-semibold mb-2">About High Performance Gaps</h3>
            <p className="text-sm mb-2">
              Performance gaps above 5.0 (500%) represent extreme differences between current performance
              and benchmarks. These may indicate:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 text-slate-600">
              <li>Areas requiring urgent intervention and resource allocation</li>
              <li>Potentially inappropriate benchmark values that need recalibration</li>
              <li>Measurement or data quality issues that should be investigated</li>
              <li>Structural challenges that may be difficult to address with funding alone</li>
            </ul>
            <p className="text-sm mt-2">
              The system now uses a dynamic capping approach that increases the default cap to 8.0 and 
              uses subsector-specific caps and percentile-based thresholds to better handle these outliers.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 