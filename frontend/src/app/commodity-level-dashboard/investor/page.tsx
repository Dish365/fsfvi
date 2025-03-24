"use client";

import React, { useState } from "react";
import { VulnerabilityMetricCard } from "@/components/vulnerability-metric-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { VulnerabilityChart } from "@/components/data-visualization/vulnerability-chart";
import { AllocationPieChart } from "@/components/data-visualization/allocation-pie-chart";
import { TrendLineChart } from "@/components/data-visualization/trend-line-chart";
import ghanaCocoaData from "@/data/ghana-cocoa-data";
import { calculateAllMetrics } from "@/lib/fsfvi-calculator";

// Mock ROI data
const roiData = [
  { name: "Production", color: "#3b82f6", trends: [
    { period: "2020", value: 7.2 },
    { period: "2021", value: 8.5 },
    { period: "2022", value: 10.1 },
    { period: "2023", value: 12.4 },
    { period: "2024 (Proj)", value: 15.2 },
  ]},
  { name: "Processing", color: "#8b5cf6", trends: [
    { period: "2020", value: 12.8 },
    { period: "2021", value: 11.5 },
    { period: "2022", value: 13.7 },
    { period: "2023", value: 16.5 },
    { period: "2024 (Proj)", value: 19.0 },
  ]},
  { name: "Market Access", color: "#ec4899", trends: [
    { period: "2020", value: 9.5 },
    { period: "2021", value: 10.2 },
    { period: "2022", value: 11.0 },
    { period: "2023", value: 12.8 },
    { period: "2024 (Proj)", value: 14.5 },
  ]},
];

// Mock Risk data
const riskData = [
  { name: "Policy Risk", color: "#ef4444", trends: [
    { period: "2020", value: 42 },
    { period: "2021", value: 38 },
    { period: "2022", value: 35 },
    { period: "2023", value: 30 },
    { period: "2024 (Proj)", value: 28 },
  ]},
  { name: "Climate Risk", color: "#f97316", trends: [
    { period: "2020", value: 35 },
    { period: "2021", value: 40 },
    { period: "2022", value: 45 },
    { period: "2023", value: 48 },
    { period: "2024 (Proj)", value: 52 },
  ]},
  { name: "Market Risk", color: "#eab308", trends: [
    { period: "2020", value: 28 },
    { period: "2021", value: 30 },
    { period: "2022", value: 25 },
    { period: "2023", value: 32 },
    { period: "2024 (Proj)", value: 30 },
  ]},
];

export default function InvestorInterface() {
  const [investmentAmount, setInvestmentAmount] = useState<number>(10);
  const [selectedComponent, setSelectedComponent] = useState<string>("production");
  
  // Calculate metrics
  const metrics = calculateAllMetrics(ghanaCocoaData);
  
  // Find component with best ROI potential (lowest vulnerability, highest weight)
  const sortedByInvestmentPotential = [...metrics.componentMetrics]
    .sort((a, b) => {
      // Lower vulnerability and higher weight is better for investment
      const aScore = a.vulnerability / a.performanceGap; // Lower is better
      const bScore = b.vulnerability / b.performanceGap; // Lower is better
      return aScore - bScore;
    });
  
  const bestInvestmentComponent = sortedByInvestmentPotential[0];
  
  // Calculate estimated ROI (mock calculation)
  const calculateEstimatedROI = (componentId: string, amount: number) => {
    const component = ghanaCocoaData.components.find(c => c.id === componentId);
    if (!component) return 0;
    
    // ROI increases with investment amount but diminishes with vulnerability
    const vulnerability = metrics.componentMetrics.find(m => m.id === componentId)?.vulnerability || 0;
    const baseROI = component.benchmarkPerformance / component.observedPerformance; // Higher gap means more potential
    
    return baseROI * (1 - vulnerability) * (1 + Math.log10(amount + 1) / 5);
  };
  
  const estimatedROI = calculateEstimatedROI(selectedComponent, investmentAmount);
  
  // Helper for formatting
  const formatPercentage = (value: number) => {
    return (value * 100).toFixed(1) + "%";
  };
  
  const formatCurrency = (value: number) => {
    return `$${value.toFixed(1)}M`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Investor Interface</h1>
          <p className="mt-2 text-slate-600">
            Investment analysis and risk assessment for Ghana's cocoa value chain
          </p>
        </div>
        
        <Tabs defaultValue="investment">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="investment">Investment Opportunities</TabsTrigger>
            <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
            <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
          </TabsList>
          
          <TabsContent value="investment" className="space-y-6 mt-6">
            {/* Investment Summary */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <VulnerabilityMetricCard
                title="System Vulnerability"
                value={metrics.systemVulnerability}
                description="Current system fragility level"
                colorScheme="warning"
              />
              
              <VulnerabilityMetricCard
                title="Average ROI Potential"
                value={0.132} // Mock data
                description="Projected 5-year return rate"
                colorScheme="success"
              />
              
              <VulnerabilityMetricCard
                title="Best Investment Component"
                value={bestInvestmentComponent.performanceGap}
                description={bestInvestmentComponent.name}
                colorScheme="info"
              />
              
              <VulnerabilityMetricCard
                title="Total Value Chain Budget"
                value={ghanaCocoaData.totalBudget / 200}
                description={`$${ghanaCocoaData.totalBudget}M allocated`}
                colorScheme="success"
                showProgress={false}
              />
            </div>
            
            {/* Resource Allocation */}
            <AllocationPieChart
              data={ghanaCocoaData.components.map(component => ({
                id: component.id,
                name: component.name,
                category: component.category,
                allocation: component.currentAllocation
              }))}
              title="Current Resource Allocation by Component"
              height={350}
            />
            
            {/* Investment Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Opportunities</CardTitle>
                <CardDescription>Components with highest investment potential based on FSFVI analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {sortedByInvestmentPotential.slice(0, 3).map((component) => {
                    const fullComponent = ghanaCocoaData.components.find(c => c.id === component.id);
                    
                    return (
                      <Card key={component.id} className="overflow-hidden">
                        <div className="h-2 w-full bg-blue-500" />
                        <CardContent className="p-4">
                          <h3 className="font-medium">{component.name}</h3>
                          <div className="mt-2">
                            <div className="text-sm text-slate-500">Performance Gap:</div>
                            <div className="text-lg font-semibold">{formatPercentage(component.performanceGap)}</div>
                          </div>
                          <div className="mt-2">
                            <div className="text-sm text-slate-500">Vulnerability:</div>
                            <div className="text-lg font-semibold">{formatPercentage(component.vulnerability)}</div>
                          </div>
                          <div className="mt-2">
                            <div className="text-sm text-slate-500">Current Allocation:</div>
                            <div className="text-lg font-semibold">${component.allocation}M</div>
                          </div>
                          <div className="mt-2">
                            <div className="text-sm text-slate-500">Category:</div>
                            <div className="text-lg font-semibold">{fullComponent?.category}</div>
                          </div>
                          <div className="mt-4">
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => setSelectedComponent(component.id)}
                            >
                              Analyze Opportunity
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            {/* Investment Simulator */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Simulator</CardTitle>
                <CardDescription>
                  Simulate investment returns based on component and amount
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1" id="component-select-label">
                      Select Component:
                    </label>
                    <select 
                      className="border rounded-md p-2 w-full"
                      value={selectedComponent}
                      onChange={(e) => setSelectedComponent(e.target.value)}
                      aria-labelledby="component-select-label"
                    >
                      {ghanaCocoaData.components.map((component) => (
                        <option key={component.id} value={component.id}>
                          {component.name} ({component.category})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Investment Amount: {formatCurrency(investmentAmount)}
                    </label>
                    <Slider
                      value={[investmentAmount]}
                      min={1}
                      max={50}
                      step={0.5}
                      onValueChange={(values) => setInvestmentAmount(values[0])}
                    />
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-md">
                    <h3 className="font-medium mb-2">Investment Analysis</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-slate-500">Estimated Annual ROI:</div>
                        <div className="text-xl font-semibold text-emerald-600">
                          {formatPercentage(estimatedROI)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500">5-Year Return (Projected):</div>
                        <div className="text-xl font-semibold text-emerald-600">
                          {formatCurrency(investmentAmount * (1 + estimatedROI) ** 5 - investmentAmount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500">Vulnerability Reduction:</div>
                        <div className="text-xl font-semibold text-blue-600">
                          {formatPercentage(0.03 * Math.log10(investmentAmount + 1))}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500">Risk Level:</div>
                        <div className="text-xl font-semibold text-amber-600">
                          {metrics.componentMetrics.find(m => m.id === selectedComponent)?.vulnerability as number > 0.25 ? "High" : "Moderate"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="roi" className="space-y-6 mt-6">
            {/* ROI Trends */}
            <TrendLineChart
              data={roiData}
              title="Return on Investment Trends by Component"
              description="Historical and projected ROI for key value chain components"
              yAxisLabel="ROI (%)"
              xAxisLabel="Year"
              valueFormatter={(value) => `${value.toFixed(1)}%`}
            />
            
            {/* Component Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Component ROI Analysis</CardTitle>
                <CardDescription>
                  Detailed analysis of returns across value chain components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VulnerabilityChart
                  data={metrics.componentMetrics}
                  title="Vulnerability vs. Performance Gap Analysis"
                  height={350}
                />
              </CardContent>
            </Card>
            
            {/* Investment Success Factors */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Success Factors</CardTitle>
                <CardDescription>Key factors influencing investment returns in Ghana's cocoa sector</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-700">1</div>
                    <div>
                      <h3 className="font-medium text-lg text-blue-700">Performance Gap Closure</h3>
                      <p className="text-slate-600">
                        Components with larger gaps between observed and benchmark performance offer greater potential
                        for improvement and return on investment. Focus on components where targeted investment can
                        close significant performance gaps.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-lg">
                    <div className="bg-emerald-100 p-2 rounded-full text-emerald-700">2</div>
                    <div>
                      <h3 className="font-medium text-lg text-emerald-700">Vulnerability Reduction</h3>
                      <p className="text-slate-600">
                        Investments that reduce systemic vulnerability provide long-term stability and sustainability. 
                        Components with high vulnerability but strong sensitivity to funding (high αᵢ) provide excellent 
                        opportunities for impactful investment.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-lg">
                    <div className="bg-amber-100 p-2 rounded-full text-amber-700">3</div>
                    <div>
                      <h3 className="font-medium text-lg text-amber-700">Component Weighting</h3>
                      <p className="text-slate-600">
                        Components with higher weights (ωᵢ) in the FSFVI calculations have greater impact on the overall
                        system vulnerability. Addressing vulnerabilities in high-weight components provides amplified
                        benefits to the entire value chain.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="risk" className="space-y-6 mt-6">
            {/* Risk Trends */}
            <TrendLineChart
              data={riskData}
              title="Risk Trends by Category"
              description="Historical and projected risk levels (lower is better)"
              yAxisLabel="Risk Score"
              xAxisLabel="Year"
              valueFormatter={(value) => `${value.toFixed(0)}`}
            />
            
            {/* Risk Analysis Table */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment Matrix</CardTitle>
                <CardDescription>Evaluation of key risks across the cocoa value chain</CardDescription>
              </CardHeader>
              <CardContent>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border p-2 text-left">Risk Category</th>
                      <th className="border p-2 text-left">Description</th>
                      <th className="border p-2 text-center">Likelihood</th>
                      <th className="border p-2 text-center">Impact</th>
                      <th className="border p-2 text-center">Score</th>
                      <th className="border p-2 text-left">Mitigation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2 font-medium">Climate Risk</td>
                      <td className="border p-2 text-sm">Increasing temperature and erratic rainfall patterns affecting yields</td>
                      <td className="border p-2 text-center bg-red-100">High</td>
                      <td className="border p-2 text-center bg-red-100">High</td>
                      <td className="border p-2 text-center font-bold">52</td>
                      <td className="border p-2 text-sm">Drought-resistant varieties, irrigation systems</td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-medium">Policy Risk</td>
                      <td className="border p-2 text-sm">Regulatory changes and trade policies affecting exports</td>
                      <td className="border p-2 text-center bg-amber-100">Medium</td>
                      <td className="border p-2 text-center bg-amber-100">Medium</td>
                      <td className="border p-2 text-center font-bold">28</td>
                      <td className="border p-2 text-sm">Policy advocacy, diversification of markets</td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-medium">Market Risk</td>
                      <td className="border p-2 text-sm">Price volatility and changing consumer preferences</td>
                      <td className="border p-2 text-center bg-amber-100">Medium</td>
                      <td className="border p-2 text-center bg-amber-100">Medium</td>
                      <td className="border p-2 text-center font-bold">30</td>
                      <td className="border p-2 text-sm">Forward contracts, quality improvements, value addition</td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-medium">Production Risk</td>
                      <td className="border p-2 text-sm">Pests, diseases, and aging cocoa trees</td>
                      <td className="border p-2 text-center bg-red-100">High</td>
                      <td className="border p-2 text-center bg-amber-100">Medium</td>
                      <td className="border p-2 text-center font-bold">42</td>
                      <td className="border p-2 text-sm">Farm rehabilitation, improved farm management practices</td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-medium">Infrastructure Risk</td>
                      <td className="border p-2 text-sm">Poor roads, storage facilities affecting transportation</td>
                      <td className="border p-2 text-center bg-amber-100">Medium</td>
                      <td className="border p-2 text-center bg-amber-100">Medium</td>
                      <td className="border p-2 text-center font-bold">38</td>
                      <td className="border p-2 text-sm">Investment in rural roads, modern storage facilities</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
            
            {/* Risk Mitigation */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Mitigation Strategies</CardTitle>
                <CardDescription>Strategic approaches to manage and reduce investment risks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                    <h3 className="font-medium">Diversification</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Spread investments across multiple components of the value chain to reduce exposure
                      to component-specific risks. Consider a balanced portfolio approach across production,
                      processing, and market access.
                    </p>
                  </div>
                  
                  <div className="p-4 border-l-4 border-emerald-500 bg-emerald-50">
                    <h3 className="font-medium">Technological Innovation</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Invest in climate-smart agriculture technologies, improved processing equipment,
                      and digital platforms for market access to improve resilience against environmental
                      and market disruptions.
                    </p>
                  </div>
                  
                  <div className="p-4 border-l-4 border-amber-500 bg-amber-50">
                    <h3 className="font-medium">Insurance & Hedging</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Utilize agricultural insurance products, weather index insurance, and price
                      hedging instruments to protect against yield losses and price volatility risks.
                    </p>
                  </div>
                  
                  <div className="p-4 border-l-4 border-purple-500 bg-purple-50">
                    <h3 className="font-medium">Stakeholder Engagement</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Develop strong relationships with local producer organizations, government bodies,
                      and other value chain actors to stay informed about potential risks and collaborate
                      on mitigation strategies.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
} 