"use client";

import React from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ghanaCocoaData from "@/data/ghana-cocoa-data";
import { calculateAllMetrics } from "@/lib/fsfvi-calculator";
import Link from "next/link";

export default function ComponentsIndex() {
  // Calculate metrics
  const metrics = calculateAllMetrics(ghanaCocoaData);
  
  // Group components by category
  const componentsByCategory = ghanaCocoaData.components.reduce((acc, component) => {
    if (!acc[component.category]) {
      acc[component.category] = [];
    }
    acc[component.category].push(component);
    return acc;
  }, {} as Record<string, typeof ghanaCocoaData.components>);
  
  // Get vulnerability level color
  const getVulnerabilityColor = (componentId: string) => {
    const componentMetric = metrics.componentMetrics.find(m => m.id === componentId);
    if (!componentMetric) return "bg-blue-100";
    
    const vuln = componentMetric.vulnerability;
    if (vuln < 0.15) return "bg-green-100";
    if (vuln < 0.25) return "bg-blue-100";
    if (vuln < 0.35) return "bg-amber-100";
    return "bg-red-100";
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Value Chain Components</h1>
          <p className="mt-2 text-slate-600">
            Detailed analysis of all components in Ghana's cocoa value chain
          </p>
        </div>
        
        <div className="space-y-6">
          {Object.entries(componentsByCategory).map(([category, components]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {components.map(component => {
                    const componentMetric = metrics.componentMetrics.find(m => m.id === component.id);
                    const vulnerabilityScore = componentMetric?.vulnerability || 0;
                    
                    return (
                      <Link 
                        href={`/components/${component.id}`} 
                        key={component.id}
                        className="block"
                      >
                        <div className={`p-4 rounded-md ${getVulnerabilityColor(component.id)} hover:shadow-md transition-shadow`}>
                          <h3 className="font-medium">{component.name}</h3>
                          <div className="mt-2 text-sm text-slate-700">
                            <div className="flex justify-between">
                              <span>Vulnerability:</span>
                              <span className="font-medium">{(vulnerabilityScore * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span>Allocation:</span>
                              <span className="font-medium">${component.currentAllocation}M</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
} 