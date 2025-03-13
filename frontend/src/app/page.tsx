"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { VulnerabilityMetricCard } from "@/components/vulnerability-metric-card";
import { ValueChainComponentTable } from "@/components/value-chain-component-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ghanaCocoaData from "@/data/ghana-cocoa-data";
import { calculateAllMetrics } from "@/lib/fsfvi-calculator";

export default function Home() {
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  
  // Calculate metrics
  const metrics = calculateAllMetrics(ghanaCocoaData, allocations);
  const systemVulnerability = metrics.systemVulnerability;
  
  // Find highest vulnerability components
  const sortedByVulnerability = [...metrics.componentMetrics]
    .sort((a, b) => b.vulnerability - a.vulnerability);
  
  const highVulnerabilityComponents = sortedByVulnerability.slice(0, 3);
  
  // Calculate total allocation
  const totalAllocation = ghanaCocoaData.components.reduce(
    (sum, component) => sum + (allocations[component.id] || component.currentAllocation),
    0
  );
  
  // Get vulnerability level description
  const getVulnerabilityLevel = (score: number) => {
    if (score < 0.15) return "Low";
    if (score < 0.25) return "Moderate";
    if (score < 0.35) return "High";
    return "Critical";
  };
  
  // Determine color scheme based on vulnerability score
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
          <h1 className="text-3xl font-bold tracking-tight">Ghana Cocoa Value Chain Dashboard</h1>
          <p className="mt-2 text-slate-600">
            Food System Food Value Index (FSFVI) analysis and vulnerability assessment
          </p>
        </div>
        
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <VulnerabilityMetricCard
            title="System Vulnerability (FSFVI)"
            value={systemVulnerability}
            description={`${getVulnerabilityLevel(systemVulnerability)} vulnerability level`}
            colorScheme={getColorScheme(systemVulnerability)}
          />
          
          <VulnerabilityMetricCard
            title="Total Allocated Resources"
            value={totalAllocation / ghanaCocoaData.totalBudget}
            description={`$${totalAllocation.toFixed(1)}M of $${ghanaCocoaData.totalBudget}M budget`}
            colorScheme="info"
          />
          
          <VulnerabilityMetricCard
            title="Highest Gap Component"
            value={sortedByVulnerability[0].performanceGap}
            description={`${sortedByVulnerability[0].name}`}
            colorScheme="warning"
          />
          
          <VulnerabilityMetricCard
            title="Total Value Chain Components"
            value={ghanaCocoaData.components.length / 10}
            description={`${ghanaCocoaData.components.length} assessed components`}
            colorScheme="success"
            showProgress={false}
          />
        </div>
        
        {/* High Vulnerability Components */}
        <Card>
          <CardHeader>
            <CardTitle>High Vulnerability Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {highVulnerabilityComponents.map((component) => (
                <Card key={component.id} className="overflow-hidden">
                  <div 
                    className={`h-2 w-full ${
                      getColorScheme(component.vulnerability) === "danger" 
                        ? "bg-red-500" 
                        : getColorScheme(component.vulnerability) === "warning"
                          ? "bg-amber-500"
                          : "bg-blue-500"
                    }`}
                  />
                  <CardContent className="p-4">
                    <h3 className="font-medium">{component.name}</h3>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-slate-500">Vulnerability:</span>
                      <span className="font-semibold">
                        {(component.vulnerability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-sm text-slate-500">Performance Gap:</span>
                      <span className="font-semibold">
                        {(component.performanceGap * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-sm text-slate-500">Allocation:</span>
                      <span className="font-semibold">${component.allocation.toFixed(1)}M</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Value Chain Components Table */}
        <Card>
          <CardHeader>
            <CardTitle>Value Chain Component Analysis</CardTitle>
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
