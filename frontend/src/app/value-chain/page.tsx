"use client";

import React from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { VulnerabilityMetricCard } from "@/components/vulnerability-metric-card";
import { ValueChainComponentTable } from "@/components/value-chain-component-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VulnerabilityChart } from "@/components/data-visualization/vulnerability-chart";
import { AllocationPieChart } from "@/components/data-visualization/allocation-pie-chart";
import { GhanaCocoaMap, ghanaCocoaRegions } from "@/components/data-visualization/ghana-cocoa-map";
import ghanaCocoaData from "@/data/ghana-cocoa-data";
import { calculateAllMetrics } from "@/lib/fsfvi-calculator";

// Mock performance data for benchmarking
const benchmarkData = [
  { 
    name: "Ghana",
    color: "#3b82f6",
    performance: [
      { component: "Production", value: 65.0 },
      { component: "Processing", value: 45.0 },
      { component: "Market Access", value: 55.0 },
      { component: "Infrastructure", value: 40.0 },
      { component: "Technical Capacity", value: 50.0 },
      { component: "Financial Services", value: 35.0 },
      { component: "Policy Environment", value: 60.0 },
    ],
  },
  { 
    name: "Côte d'Ivoire",
    color: "#f97316",
    performance: [
      { component: "Production", value: 72.0 },
      { component: "Processing", value: 48.0 },
      { component: "Market Access", value: 62.0 },
      { component: "Infrastructure", value: 42.0 },
      { component: "Technical Capacity", value: 45.0 },
      { component: "Financial Services", value: 40.0 },
      { component: "Policy Environment", value: 52.0 },
    ],
  },
  { 
    name: "Nigeria",
    color: "#22c55e",
    performance: [
      { component: "Production", value: 58.0 },
      { component: "Processing", value: 35.0 },
      { component: "Market Access", value: 48.0 },
      { component: "Infrastructure", value: 32.0 },
      { component: "Technical Capacity", value: 40.0 },
      { component: "Financial Services", value: 30.0 },
      { component: "Policy Environment", value: 45.0 },
    ],
  },
  { 
    name: "Benchmark Target",
    color: "#8b5cf6",
    performance: [
      { component: "Production", value: 85.0 },
      { component: "Processing", value: 75.0 },
      { component: "Market Access", value: 80.0 },
      { component: "Infrastructure", value: 70.0 },
      { component: "Technical Capacity", value: 80.0 },
      { component: "Financial Services", value: 65.0 },
      { component: "Policy Environment", value: 75.0 },
    ],
  },
];

// Convert benchmark data to format needed for charts
const getChartDataForComponent = (componentName: string) => {
  return benchmarkData.map(country => ({
    name: country.name,
    value: country.performance.find(c => c.component === componentName)?.value || 0,
    color: country.color,
  }));
};

export default function ValueChainDashboard() {
  // Calculate metrics
  const metrics = calculateAllMetrics(ghanaCocoaData);
  
  // Sort components by category for grouping
  const componentsByCategory = ghanaCocoaData.components.reduce((acc, component) => {
    const category = component.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(component);
    return acc;
  }, {} as Record<string, typeof ghanaCocoaData.components>);
  
  // Helper for formatting
  const formatPercentage = (value: number) => {
    return (value * 100).toFixed(1) + "%";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Value Chain Dashboard</h1>
          <p className="mt-2 text-slate-600">
            Performance metrics and benchmarking for Ghana's cocoa value chain
          </p>
        </div>
        
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="benchmarking">Benchmarking</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="geography">Geographic Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Performance Summary */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <VulnerabilityMetricCard
                title="System Vulnerability"
                value={metrics.systemVulnerability}
                description="FSFVI score (lower is better)"
                colorScheme="warning"
              />
              
              <VulnerabilityMetricCard
                title="Performance Gap"
                value={0.235} // Weighted average of all component gaps
                description="Average difference from benchmark"
                colorScheme="info"
              />
              
              <VulnerabilityMetricCard
                title="Resource Efficiency"
                value={0.68} // Mock value
                description="Allocation effectiveness metric"
                colorScheme="success"
              />
              
              <VulnerabilityMetricCard
                title="Regional Ranking"
                value={0.7}
                description="2nd among West African producers"
                colorScheme="info"
                showProgress={false}
              />
            </div>
            
            {/* Top Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Value Chain Performance by Component</CardTitle>
                <CardDescription>Current performance vs. vulnerability and resource allocation</CardDescription>
              </CardHeader>
              <CardContent>
                <VulnerabilityChart
                  data={metrics.componentMetrics}
                  title="Component Performance Analysis"
                  height={400}
                />
              </CardContent>
            </Card>
            
            {/* Resource Allocation */}
            <AllocationPieChart
              data={ghanaCocoaData.components.map(component => ({
                id: component.id,
                name: component.name,
                category: component.category,
                allocation: component.currentAllocation
              }))}
              title="Resource Allocation across Value Chain Components"
              height={350}
            />
            
            {/* Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Value Chain Component Performance</CardTitle>
                <CardDescription>Detailed performance metrics for all components</CardDescription>
              </CardHeader>
              <CardContent>
                <ValueChainComponentTable 
                  components={ghanaCocoaData.components}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="benchmarking" className="space-y-6 mt-6">
            {/* Benchmarking Introduction */}
            <Card>
              <CardHeader>
                <CardTitle>Benchmarking Analysis</CardTitle>
                <CardDescription>
                  Comparing Ghana's cocoa value chain performance against regional peers and targets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-blue-50 rounded-md">
                  <p className="text-sm text-slate-700">
                    This benchmarking analysis compares Ghana's cocoa value chain performance against
                    regional competitors (Côte d'Ivoire and Nigeria) and established benchmark targets.
                    The analysis helps identify areas where Ghana is performing well and areas that require
                    additional resources or policy interventions.
                  </p>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {["Production", "Processing", "Market Access", "Infrastructure"].map(component => {
                    const data = getChartDataForComponent(component);
                    const ghanaValue = data.find(d => d.name === "Ghana")?.value || 0;
                    const targetValue = data.find(d => d.name === "Benchmark Target")?.value || 0;
                    const performanceGap = (targetValue - ghanaValue) / targetValue;
                    
                    return (
                      <Card key={component} className="overflow-hidden">
                        <div className="h-2 w-full bg-blue-500" />
                        <CardContent className="p-4">
                          <h3 className="font-medium">{component}</h3>
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-slate-500">Ghana:</span>
                              <span className="font-medium">{ghanaValue}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-200 rounded-full">
                              <div 
                                className="h-2 bg-blue-500 rounded-full" 
                                style={{ width: `${ghanaValue}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-slate-500">Côte d'Ivoire:</span>
                              <span className="font-medium">
                                {data.find(d => d.name === "Côte d'Ivoire")?.value || 0}%
                              </span>
                            </div>
                            <div className="h-2 w-full bg-slate-200 rounded-full">
                              <div 
                                className="h-2 bg-orange-500 rounded-full" 
                                style={{ width: `${data.find(d => d.name === "Côte d'Ivoire")?.value || 0}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-slate-500">Nigeria:</span>
                              <span className="font-medium">
                                {data.find(d => d.name === "Nigeria")?.value || 0}%
                              </span>
                            </div>
                            <div className="h-2 w-full bg-slate-200 rounded-full">
                              <div 
                                className="h-2 bg-green-500 rounded-full" 
                                style={{ width: `${data.find(d => d.name === "Nigeria")?.value || 0}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-slate-500">Target:</span>
                              <span className="font-medium">
                                {targetValue}%
                              </span>
                            </div>
                            <div className="h-2 w-full bg-slate-200 rounded-full">
                              <div 
                                className="h-2 bg-purple-500 rounded-full" 
                                style={{ width: `${targetValue}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="mt-4 p-2 bg-slate-50 rounded">
                            <div className="text-sm text-slate-500">Performance Gap:</div>
                            <div className="text-lg font-semibold text-slate-700">
                              {(performanceGap * 100).toFixed(1)}% below target
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            {/* Strengths and Weaknesses */}
            <Card>
              <CardHeader>
                <CardTitle>Competitive Analysis</CardTitle>
                <CardDescription>Strengths and weaknesses relative to competitors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-lg text-emerald-700 mb-3">Strengths</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-emerald-50 rounded-md">
                        <h4 className="font-medium">Quality Premium</h4>
                        <p className="text-sm text-slate-600 mt-1">
                          Ghana's cocoa commands a premium price on international markets due to its
                          superior quality and flavor profile, outperforming regional competitors.
                        </p>
                      </div>
                      
                      <div className="p-3 bg-emerald-50 rounded-md">
                        <h4 className="font-medium">Policy Environment</h4>
                        <p className="text-sm text-slate-600 mt-1">
                          More stable and supportive policy framework for cocoa compared to Nigeria,
                          ensuring better price guarantees for farmers.
                        </p>
                      </div>
                      
                      <div className="p-3 bg-emerald-50 rounded-md">
                        <h4 className="font-medium">Technical Capacity</h4>
                        <p className="text-sm text-slate-600 mt-1">
                          Higher technical capacity in farming practices compared to Nigeria, resulting
                          in better yields and quality.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg text-red-700 mb-3">Weaknesses</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-red-50 rounded-md">
                        <h4 className="font-medium">Processing Capacity</h4>
                        <p className="text-sm text-slate-600 mt-1">
                          Lower domestic processing capacity compared to Côte d'Ivoire, resulting in missed
                          value addition opportunities.
                        </p>
                      </div>
                      
                      <div className="p-3 bg-red-50 rounded-md">
                        <h4 className="font-medium">Infrastructure</h4>
                        <p className="text-sm text-slate-600 mt-1">
                          Rural road networks and storage facilities lag behind targets, increasing transportation
                          costs and post-harvest losses.
                        </p>
                      </div>
                      
                      <div className="p-3 bg-red-50 rounded-md">
                        <h4 className="font-medium">Financial Services</h4>
                        <p className="text-sm text-slate-600 mt-1">
                          Limited access to credit and insurance for smallholder farmers compared to benchmark
                          targets, constraining investment in farm improvements.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="components" className="space-y-6 mt-6">
            {/* Components by Category */}
            {Object.entries(componentsByCategory).map(([category, components]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle>{category}</CardTitle>
                  <CardDescription>
                    Performance analysis of {category.toLowerCase()} components
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <ValueChainComponentTable components={components} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {components.map(component => {
                        const componentMetric = metrics.componentMetrics.find(
                          m => m.id === component.id
                        );
                        
                        if (!componentMetric) return null;
                        
                        return (
                          <Card key={component.id} className="overflow-hidden">
                            <div className="h-2 w-full bg-blue-500" />
                            <CardContent className="p-4">
                              <h3 className="font-medium">{component.name}</h3>
                              <p className="text-sm text-slate-500 mt-1">{component.description}</p>
                              
                              <div className="mt-4 space-y-3">
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-slate-500">Current Performance:</span>
                                    <span className="text-xs font-medium">{component.observedPerformance}%</span>
                                  </div>
                                  <div className="h-2 w-full bg-slate-200 rounded-full">
                                    <div 
                                      className="h-2 bg-blue-500 rounded-full" 
                                      style={{ width: `${component.observedPerformance}%` }}
                                    />
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-slate-500">Benchmark Target:</span>
                                    <span className="text-xs font-medium">{component.benchmarkPerformance}%</span>
                                  </div>
                                  <div className="h-2 w-full bg-slate-200 rounded-full">
                                    <div 
                                      className="h-2 bg-purple-500 rounded-full" 
                                      style={{ width: `${component.benchmarkPerformance}%` }}
                                    />
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-slate-500">Performance Gap:</span>
                                    <span className="text-xs font-medium">
                                      {formatPercentage(componentMetric.performanceGap)}
                                    </span>
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-slate-500">Vulnerability Score:</span>
                                    <span className="text-xs font-medium">
                                      {formatPercentage(componentMetric.vulnerability)}
                                    </span>
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-slate-500">Current Allocation:</span>
                                    <span className="text-xs font-medium">${component.currentAllocation}M</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="geography" className="space-y-6 mt-6">
            {/* Geographic Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>
                  Regional distribution of cocoa production and vulnerability in Ghana
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GhanaCocoaMap 
                  title="Ghana Cocoa Production Regions"
                  description="Circle size represents production volume, color indicates vulnerability level"
                  height={500}
                />
              </CardContent>
            </Card>
            
            {/* Regional Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Regional Performance Analysis</CardTitle>
                <CardDescription>
                  Comparison of cocoa value chain performance across different regions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border p-2 text-left">Region</th>
                      <th className="border p-2 text-center">Production (%)</th>
                      <th className="border p-2 text-center">Infrastructure Score</th>
                      <th className="border p-2 text-center">Technical Capacity</th>
                      <th className="border p-2 text-center">Vulnerability Score</th>
                      <th className="border p-2 text-center">Priority Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ghanaCocoaRegions.map(region => (
                      <tr key={region.id}>
                        <td className="border p-2 font-medium">{region.name}</td>
                        <td className="border p-2 text-center">{region.production}%</td>
                        <td className="border p-2 text-center">
                          {/* Mock infrastructure scores */}
                          {region.id === "western" ? "65%" : 
                           region.id === "eastern" ? "58%" :
                           region.id === "ashanti" ? "70%" :
                           region.id === "central" ? "62%" : "55%"}
                        </td>
                        <td className="border p-2 text-center">
                          {/* Mock technical capacity scores */}
                          {region.id === "western" ? "72%" : 
                           region.id === "eastern" ? "65%" :
                           region.id === "ashanti" ? "68%" :
                           region.id === "central" ? "60%" : "55%"}
                        </td>
                        <td className="border p-2 text-center">
                          {(region.vulnerabilityScore * 100).toFixed(1)}%
                        </td>
                        <td className="border p-2 text-center">
                          {region.vulnerabilityScore > 0.3 ? 
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">High</span> :
                            region.vulnerabilityScore > 0.25 ? 
                            <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">Medium</span> :
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Low</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
            
            {/* Regional Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Regional Insights</CardTitle>
                <CardDescription>Key observations and recommendations by region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-md">
                    <h3 className="font-medium text-blue-800">Western Region</h3>
                    <p className="text-sm text-slate-700 mt-1">
                      As the primary production region (60% of Ghana's cocoa), the Western Region requires
                      targeted investments in infrastructure and climate resilience. The region's high
                      production makes it strategically important for the entire value chain.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-red-50 rounded-md">
                    <h3 className="font-medium text-red-800">Eastern Region</h3>
                    <p className="text-sm text-slate-700 mt-1">
                      With the highest vulnerability score (32%), the Eastern Region requires immediate
                      intervention in farm rehabilitation and technical support. Aging cocoa farms and
                      declining soil fertility are major challenges.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-amber-50 rounded-md">
                    <h3 className="font-medium text-amber-800">Central Region</h3>
                    <p className="text-sm text-slate-700 mt-1">
                      The Central Region is experiencing a transition away from cocoa cultivation due to
                      urbanization and alternative crops. Strategic investments in processing facilities
                      could leverage its coastal location and infrastructure.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-emerald-50 rounded-md">
                    <h3 className="font-medium text-emerald-800">Ashanti Region</h3>
                    <p className="text-sm text-slate-700 mt-1">
                      With the best infrastructure score (70%), the Ashanti Region offers opportunities
                      for value addition and processing expansion. Its central location makes it strategic
                      for distribution networks.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
} 