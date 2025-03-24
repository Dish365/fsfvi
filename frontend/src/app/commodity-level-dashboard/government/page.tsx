"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { VulnerabilityMetricCard } from "@/components/vulnerability-metric-card";
import { ValueChainComponentTable } from "@/components/value-chain-component-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ghanaCocoaData, { ValueChainComponent } from "@/data/ghana-cocoa-data";
import { calculateAllMetrics } from "@/lib/fsfvi-calculator";

export default function GovernmentDashboard() {
  // Calculate metrics
  const metrics = calculateAllMetrics(ghanaCocoaData);
  const systemVulnerability = metrics.systemVulnerability;
  
  // Find highest vulnerability components
  const sortedByVulnerability = [...metrics.componentMetrics]
    .sort((a, b) => b.vulnerability - a.vulnerability);
  
  const highVulnerabilityComponents = sortedByVulnerability.slice(0, 3);
  
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
  
  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Government Dashboard</h1>
          <p className="mt-2 text-slate-600">
            Policy analysis and strategic planning for Ghana's cocoa value chain
          </p>
        </div>
        
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">System Overview</TabsTrigger>
            <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
            <TabsTrigger value="policy">Policy Simulation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* System Status Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <VulnerabilityMetricCard
                title="System Vulnerability"
                value={systemVulnerability}
                description={`${getVulnerabilityLevel(systemVulnerability)} vulnerability level`}
                colorScheme={systemVulnerability > 0.25 ? "danger" : "warning"}
              />
              
              <VulnerabilityMetricCard
                title="Policy Effectiveness"
                value={1 - systemVulnerability}
                description="Current policy impact score"
                colorScheme="info"
              />
              
              <VulnerabilityMetricCard
                title="Resource Allocation"
                value={1}
                description={`$${ghanaCocoaData.totalBudget}M total budget utilized`}
                colorScheme="success"
              />
            </div>
            
            {/* Key Performance Areas */}
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Areas</CardTitle>
                <CardDescription>Major value chain components requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <ValueChainComponentTable 
                  components={highVulnerabilityComponents.map(
                    metric => ghanaCocoaData.components.find(
                      c => c.id === metric.id
                    )
                  ).filter(Boolean) as ValueChainComponent[]}
                />
              </CardContent>
            </Card>
            
            {/* Policy Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Policy Recommendations</CardTitle>
                <CardDescription>Strategic actions to improve system resilience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {highVulnerabilityComponents.map((component, index) => (
                    <div key={component.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <h3 className="font-medium text-lg">{index + 1}. Strengthen {component.name}</h3>
                      <p className="text-slate-600 mt-1">
                        Current vulnerability: {formatPercentage(component.vulnerability)} with 
                        ${component.allocation}M allocation. Increase funding and implement 
                        targeted interventions to close the {formatPercentage(component.performanceGap)} 
                        performance gap.
                      </p>
                    </div>
                  ))}
                  
                  <div className="border-l-4 border-emerald-500 pl-4 py-2 mt-6">
                    <h3 className="font-medium text-lg">4. Cross-Sector Coordination</h3>
                    <p className="text-slate-600 mt-1">
                      Improve coordination between agricultural, trade, and infrastructure 
                      ministries to ensure coherent policy implementation across the cocoa value chain.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="vulnerabilities" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>System Vulnerability Analysis</CardTitle>
                <CardDescription>
                  Comprehensive analysis of all value chain components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ValueChainComponentTable components={ghanaCocoaData.components} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="policy" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Policy Simulation</CardTitle>
                <CardDescription>
                  Simulate the impact of different policy interventions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-8 text-center">
                  <p className="text-slate-600">
                    Policy simulation module coming soon. This feature will allow you to 
                    test different policy scenarios and evaluate their impact on the cocoa 
                    value chain vulnerability and overall system resilience.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
} 