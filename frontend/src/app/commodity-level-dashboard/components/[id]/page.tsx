"use client";

import React from "react";
import { DashboardLayout } from "@/components/commodity-layout";
import { VulnerabilityMetricCard } from "@/components/vulnerability-metric-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ghanaCocoaData from "@/data/ghana-cocoa-data";
import { calculateAllMetrics } from "@/lib/fsfvi-calculator";
import { useParams } from "next/navigation";

// Server component that accepts the ID directly
export default function ComponentPage() {
  // Use the useParams hook to get the ID (client-side)
  const params = useParams();
  const id = params?.id as string;
  
  // Find the component by ID
  const component = ghanaCocoaData.components.find(c => 
    c.id === id || c.name.toLowerCase().replace(/\s+/g, '-') === id
  );
  
  // If component not found, show 404
  if (!component) {
    return null; // Handle this client-side instead of using notFound()
  }
  
  // Calculate metrics
  const metrics = calculateAllMetrics(ghanaCocoaData);
  const componentMetric = metrics.componentMetrics.find(m => m.id === component.id);
  
  if (!componentMetric) {
    return null; // Handle this client-side
  }
  
  // Format percentage
  const formatPercentage = (value: number) => {
    return (value * 100).toFixed(1) + "%";
  };
  
  // Get vulnerability level
  const getVulnerabilityLevel = (score: number) => {
    if (score < 0.15) return "Low";
    if (score < 0.25) return "Moderate";
    if (score < 0.35) return "High";
    return "Critical";
  };
  
  // Get color scheme
  const getColorScheme = (score: number) => {
    if (score < 0.15) return "success";
    if (score < 0.25) return "info";
    if (score < 0.35) return "warning";
    return "danger";
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{component.name}</h1>
          <p className="mt-2 text-slate-600">
            Component analysis for Ghana's cocoa value chain
          </p>
        </div>
        
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analysis">Detailed Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Component Status Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <VulnerabilityMetricCard
                title="Component Vulnerability"
                value={componentMetric.vulnerability}
                description={`${getVulnerabilityLevel(componentMetric.vulnerability)} vulnerability level`}
                colorScheme={getColorScheme(componentMetric.vulnerability)}
              />
              
              <VulnerabilityMetricCard
                title="Performance Gap"
                value={componentMetric.performanceGap}
                description={`Gap from benchmark performance`}
                colorScheme={getColorScheme(componentMetric.performanceGap)}
              />
              
              <VulnerabilityMetricCard
                title="Resource Allocation"
                value={componentMetric.allocation / ghanaCocoaData.totalBudget}
                description={`$${componentMetric.allocation}M allocated`}
                colorScheme="info"
              />
            </div>
            
            {/* Component Details */}
            <Card>
              <CardHeader>
                <CardTitle>Component Details</CardTitle>
                <CardDescription>Key information about this value chain component</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="font-medium text-sm text-slate-500">Category</h3>
                    <p className="mt-1 font-medium">{component.category}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-slate-500">Current Performance</h3>
                    <p className="mt-1 font-medium">{formatPercentage(component.observedPerformance / 100)}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-slate-500">Benchmark Performance</h3>
                    <p className="mt-1 font-medium">{formatPercentage(component.benchmarkPerformance / 100)}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-slate-500">Sensitivity Parameter (α)</h3>
                    <p className="mt-1 font-medium">{component.sensitivityParameter.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Improvement Strategies */}
            <Card>
              <CardHeader>
                <CardTitle>Improvement Strategies</CardTitle>
                <CardDescription>Recommended actions to reduce vulnerability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <h3 className="font-medium">Resource Allocation</h3>
                    <p className="text-slate-600 mt-1">
                      {componentMetric.performanceGap > 0.3
                        ? "Increasing resource allocation to this component would significantly reduce vulnerability."
                        : "This component has moderate sensitivity to additional resources."}
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-emerald-500 pl-4 py-2">
                    <h3 className="font-medium">Performance Enhancement</h3>
                    <p className="text-slate-600 mt-1">
                      Implementing best practices could reduce the performance gap of {formatPercentage(componentMetric.performanceGap)},
                      significantly improving overall system resilience.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analysis" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Impact Analysis</CardTitle>
                <CardDescription>
                  How this component affects the overall food system vulnerability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">System Contribution</h3>
                    <p className="text-slate-600 mt-1">
                      This component contributes approximately {formatPercentage(componentMetric.vulnerability * component.weight)} 
                      to the overall system vulnerability of {formatPercentage(metrics.systemVulnerability)}.
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="font-medium">Optimization Potential</h3>
                    <p className="text-slate-600 mt-1">
                      Based on sensitivity analysis, each additional $1M allocated to this component 
                      would reduce vulnerability by approximately {formatPercentage(component.sensitivityParameter * component.weight)}.
                    </p>
                  </div>
                  
                  <div className="mt-8 py-4 text-center">
                    <p className="text-slate-500">
                      Detailed trend analysis and regional breakdown coming soon.
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