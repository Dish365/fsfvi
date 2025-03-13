"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VulnerabilityChart } from "@/components/data-visualization/vulnerability-chart";
import { TrendLineChart } from "@/components/data-visualization/trend-line-chart";
import { GhanaCocoaMap, ghanaCocoaRegions } from "@/components/data-visualization/ghana-cocoa-map";
import ghanaCocoaData from "@/data/ghana-cocoa-data";
import { calculateAllMetrics } from "@/lib/fsfvi-calculator";

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState<string>("1-year");
  
  // Calculate current metrics
  const metrics = calculateAllMetrics(ghanaCocoaData);
  
  // Mock historical data (5-year trends)
  const historicalVulnerability = [
    { year: 2019, value: 0.35 },
    { year: 2020, value: 0.33 },
    { year: 2021, value: 0.30 },
    { year: 2022, value: 0.27 },
    { year: 2023, value: metrics.systemVulnerability },
  ];
  
  // Mock projection data (3-year forecast)
  const projectedVulnerability = [
    { year: 2023, value: metrics.systemVulnerability },
    { year: 2024, value: Math.max(0.01, metrics.systemVulnerability - 0.03) },
    { year: 2025, value: Math.max(0.01, metrics.systemVulnerability - 0.05) },
    { year: 2026, value: Math.max(0.01, metrics.systemVulnerability - 0.08) },
  ];
  
  // Mock regional performance comparison
  const regionalComparison = [
    { name: "Ghana", value: metrics.systemVulnerability },
    { name: "Côte d'Ivoire", value: 0.22 },
    { name: "Nigeria", value: 0.29 },
    { name: "Cameroon", value: 0.31 },
  ];
  
  // Mock component performance over time data
  const componentPerformanceTrends = {
    production: [
      { year: 2019, value: 0.28 },
      { year: 2020, value: 0.26 },
      { year: 2021, value: 0.25 },
      { year: 2022, value: 0.23 },
      { year: 2023, value: metrics.componentMetrics.find(c => c.id === "production")?.vulnerability || 0.22 },
    ],
    processing: [
      { year: 2019, value: 0.38 },
      { year: 2020, value: 0.36 },
      { year: 2021, value: 0.35 },
      { year: 2022, value: 0.33 },
      { year: 2023, value: metrics.componentMetrics.find(c => c.id === "processing")?.vulnerability || 0.32 },
    ],
    market_access: [
      { year: 2019, value: 0.33 },
      { year: 2020, value: 0.32 },
      { year: 2021, value: 0.30 },
      { year: 2022, value: 0.29 },
      { year: 2023, value: metrics.componentMetrics.find(c => c.id === "market_access")?.vulnerability || 0.28 },
    ]
  };
  
  // Mock data for what-if scenario analysis
  const scenarioAnalysis = [
    { 
      name: "Current State", 
      vulnerability: metrics.systemVulnerability, 
      description: "Current resource allocation and performance" 
    },
    { 
      name: "Optimized Allocation", 
      vulnerability: Math.max(0.01, metrics.systemVulnerability - 0.07), 
      description: "Optimal resource allocation with current performance" 
    },
    { 
      name: "Performance Improvement", 
      vulnerability: Math.max(0.01, metrics.systemVulnerability - 0.05), 
      description: "Current allocation with 15% performance improvement" 
    },
    { 
      name: "Combined Strategy", 
      vulnerability: Math.max(0.01, metrics.systemVulnerability - 0.11), 
      description: "Optimal allocation with performance improvement" 
    },
  ];
  
  // Format percentage
  const formatPercentage = (value: number) => {
    return (value * 100).toFixed(1) + "%";
  };
  
  // Get trend data based on selected timeframe
  const getTrendData = () => {
    if (timeframe === "1-year") {
      return historicalVulnerability.slice(-2);
    } else if (timeframe === "3-year") {
      return historicalVulnerability.slice(-4);
    } else {
      return historicalVulnerability;
    }
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="mt-2 text-slate-600">
              Advanced analysis and insights for Ghana's cocoa value chain
            </p>
          </div>
          <div className="w-48">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger id="timeframe-select" aria-label="Select timeframe">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-year">1 Year</SelectItem>
                <SelectItem value="3-year">3 Years</SelectItem>
                <SelectItem value="5-year">5 Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Tabs defaultValue="trends">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trends">Trends & Forecasting</TabsTrigger>
            <TabsTrigger value="comparison">Comparative Analysis</TabsTrigger>
            <TabsTrigger value="scenarios">Scenario Analysis</TabsTrigger>
            <TabsTrigger value="regional">Regional Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trends" className="space-y-6 mt-6">
            {/* Vulnerability Trend Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>System Vulnerability Trend Analysis</CardTitle>
                <CardDescription>Historical trend and future projections</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <TrendLineChart
                  title=""
                  data={[
                    {
                      name: "Historical",
                      data: getTrendData(),
                      color: "#3b82f6"
                    },
                    {
                      name: "Projected",
                      data: projectedVulnerability,
                      color: "#8b5cf6",
                      dashed: true
                    }
                  ]}
                  xAxisKey="year"
                  yAxisKey="value"
                  xAxisLabel="Year"
                  yAxisLabel="Vulnerability Score"
                  valueFormatter={(value) => (value * 100).toFixed(1) + '%'}
                  height={350}
                />
              </CardContent>
            </Card>
            
            {/* Component Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Key Component Vulnerability Trends</CardTitle>
                <CardDescription>How major value chain components have changed over time</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <TrendLineChart
                  title=""
                  data={[
                    {
                      name: "Production",
                      data: componentPerformanceTrends.production,
                      color: "#22c55e"
                    },
                    {
                      name: "Processing",
                      data: componentPerformanceTrends.processing,
                      color: "#3b82f6"
                    },
                    {
                      name: "Market Access",
                      data: componentPerformanceTrends.market_access,
                      color: "#f59e0b"
                    }
                  ]}
                  xAxisKey="year"
                  yAxisKey="value"
                  xAxisLabel="Year"
                  yAxisLabel="Vulnerability Score"
                  valueFormatter={(value) => (value * 100).toFixed(1) + '%'}
                  height={350}
                />
              </CardContent>
            </Card>
            
            {/* Insights Card */}
            <Card>
              <CardHeader>
                <CardTitle>Key Insights & Observations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <h3 className="font-medium">System Vulnerability Reduction</h3>
                    <p className="text-slate-600 mt-1">
                      Overall system vulnerability has decreased by {formatPercentage(0.35 - metrics.systemVulnerability)} over 
                      the past 5 years, representing a significant improvement in resilience.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <h3 className="font-medium">Component Improvement</h3>
                    <p className="text-slate-600 mt-1">
                      The Production component has shown the greatest improvement, with vulnerability 
                      reduced by {formatPercentage(0.28 - (metrics.componentMetrics.find(c => c.id === "production")?.vulnerability || 0.22))}.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-amber-500 pl-4 py-2">
                    <h3 className="font-medium">Projected Impact</h3>
                    <p className="text-slate-600 mt-1">
                      Projections indicate that with continued improvement, system vulnerability could 
                      decrease to as low as {formatPercentage(projectedVulnerability[3].value)} by 2026.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="comparison" className="space-y-6 mt-6">
            {/* Regional Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Regional Vulnerability Comparison</CardTitle>
                <CardDescription>How Ghana compares to other cocoa-producing countries in West Africa</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <VulnerabilityChart
                  title=""
                  data={regionalComparison}
                  colorScheme="blue"
                  height={350}
                />
              </CardContent>
            </Card>
            
            {/* Comparative Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Comparative Analysis</CardTitle>
                <CardDescription>Detailed comparison with regional competitors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="font-medium mb-2">Strengths</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mr-2">
                          <span className="h-2 w-2 rounded-full bg-green-600"></span>
                        </span>
                        <span>Strong governance framework compared to Nigeria and Cameroon</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mr-2">
                          <span className="h-2 w-2 rounded-full bg-green-600"></span>
                        </span>
                        <span>Superior quality control standards and certification</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mr-2">
                          <span className="h-2 w-2 rounded-full bg-green-600"></span>
                        </span>
                        <span>Better production sustainability practices</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Areas for Improvement</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-red-100 flex items-center justify-center mr-2">
                          <span className="h-2 w-2 rounded-full bg-red-600"></span>
                        </span>
                        <span>Lower processing capacity than Côte d'Ivoire</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-red-100 flex items-center justify-center mr-2">
                          <span className="h-2 w-2 rounded-full bg-red-600"></span>
                        </span>
                        <span>Less diversified market access channels</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 h-5 w-5 rounded-full bg-red-100 flex items-center justify-center mr-2">
                          <span className="h-2 w-2 rounded-full bg-red-600"></span>
                        </span>
                        <span>Higher transportation and logistics costs</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Benchmark Targets */}
            <Card>
              <CardHeader>
                <CardTitle>Benchmark Targets</CardTitle>
                <CardDescription>Suggested improvement targets based on regional leaders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <h3 className="font-medium">Processing Capacity</h3>
                    <p className="text-slate-600 mt-1">
                      Increase local processing capacity from current 35% to 50% (Côte d'Ivoire benchmark) through
                      targeted investments in processing infrastructure and technology.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-purple-500 pl-4 py-2">
                    <h3 className="font-medium">Market Diversification</h3>
                    <p className="text-slate-600 mt-1">
                      Expand market reach to reduce dependency on traditional European markets by 25%,
                      focusing on emerging Asian and Middle Eastern markets.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-emerald-500 pl-4 py-2">
                    <h3 className="font-medium">Transportation Efficiency</h3>
                    <p className="text-slate-600 mt-1">
                      Improve rural road infrastructure and logistics coordination to reduce 
                      transportation costs by 15% within two years.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="scenarios" className="space-y-6 mt-6">
            {/* Scenario Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>What-If Scenario Analysis</CardTitle>
                <CardDescription>Impact of different intervention strategies</CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <VulnerabilityChart
                  title=""
                  data={scenarioAnalysis.map(scenario => ({
                    name: scenario.name,
                    value: scenario.vulnerability
                  }))}
                  colorScheme="purple"
                  height={350}
                />
              </CardContent>
            </Card>
            
            {/* Scenario Details */}
            <Card>
              <CardHeader>
                <CardTitle>Scenario Details</CardTitle>
                <CardDescription>Analysis of potential intervention strategies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scenarioAnalysis.map((scenario, index) => (
                    <div key={index} className={`border-l-4 pl-4 py-2 ${
                      index === 0 ? 'border-slate-500' :
                      index === 1 ? 'border-blue-500' :
                      index === 2 ? 'border-green-500' : 'border-purple-500'
                    }`}>
                      <h3 className="font-medium">{scenario.name}</h3>
                      <div className="flex items-center mt-1">
                        <span className="text-slate-600">Vulnerability:</span>
                        <span className="ml-2 font-semibold">{formatPercentage(scenario.vulnerability)}</span>
                        {index > 0 && (
                          <span className="ml-2 text-green-600 text-sm">
                            ({formatPercentage(scenarioAnalysis[0].vulnerability - scenario.vulnerability)} reduction)
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 mt-1">{scenario.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* ROI Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Return on Investment Analysis</CardTitle>
                <CardDescription>Estimated costs and benefits of intervention strategies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Strategy</th>
                        <th className="text-right py-2 font-medium">Est. Investment</th>
                        <th className="text-right py-2 font-medium">Vulnerability Reduction</th>
                        <th className="text-right py-2 font-medium">Economic Impact</th>
                        <th className="text-right py-2 font-medium">ROI</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2">Optimized Allocation</td>
                        <td className="text-right py-2">$0</td>
                        <td className="text-right py-2">{formatPercentage(0.07)}</td>
                        <td className="text-right py-2">$10.5M/year</td>
                        <td className="text-right py-2 font-medium text-green-600">High</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Performance Improvement</td>
                        <td className="text-right py-2">$15M</td>
                        <td className="text-right py-2">{formatPercentage(0.05)}</td>
                        <td className="text-right py-2">$8.2M/year</td>
                        <td className="text-right py-2 font-medium text-amber-600">Medium</td>
                      </tr>
                      <tr>
                        <td className="py-2">Combined Strategy</td>
                        <td className="text-right py-2">$15M</td>
                        <td className="text-right py-2">{formatPercentage(0.11)}</td>
                        <td className="text-right py-2">$17.8M/year</td>
                        <td className="text-right py-2 font-medium text-green-600">High</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="regional" className="space-y-6 mt-6">
            {/* Regional Map */}
            <Card>
              <CardHeader>
                <CardTitle>Regional Vulnerability Distribution</CardTitle>
                <CardDescription>Geographic analysis of cocoa production and vulnerability</CardDescription>
              </CardHeader>
              <CardContent className="h-[500px]">
                <GhanaCocoaMap
                  title=""
                  height={450}
                  showVulnerability={true}
                />
              </CardContent>
            </Card>
            
            {/* Regional Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Regional Performance Analysis</CardTitle>
                <CardDescription>Detailed metrics by region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Region</th>
                        <th className="text-right py-2 font-medium">Production Share</th>
                        <th className="text-right py-2 font-medium">Vulnerability Score</th>
                        <th className="text-right py-2 font-medium">Performance Gap</th>
                        <th className="text-right py-2 font-medium">Resource Allocation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ghanaCocoaRegions.map((region) => (
                        <tr key={region.id} className="border-b">
                          <td className="py-2">{region.name}</td>
                          <td className="text-right py-2">{region.production}%</td>
                          <td className="text-right py-2">{(region.vulnerabilityScore * 100).toFixed(1)}%</td>
                          <td className="text-right py-2">{((region.vulnerabilityScore * 1.5) * 100).toFixed(1)}%</td>
                          <td className="text-right py-2">${(region.production / 5).toFixed(1)}M</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            {/* Regional Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Regional Intervention Strategy</CardTitle>
                <CardDescription>Targeted recommendations by region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <h3 className="font-medium">Western Region - High Production / Low Vulnerability</h3>
                    <p className="text-slate-600 mt-1">
                      Focus on maintaining production efficiency while introducing more sustainable farming 
                      practices to ensure long-term soil health and biodiversity.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-amber-500 pl-4 py-2">
                    <h3 className="font-medium">Central Region - Medium Production / High Vulnerability</h3>
                    <p className="text-slate-600 mt-1">
                      Prioritize infrastructure improvement and climate resilience measures to address 
                      the high vulnerability in this traditionally productive region.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-emerald-500 pl-4 py-2">
                    <h3 className="font-medium">Eastern Region - Medium Production / Medium Vulnerability</h3>
                    <p className="text-slate-600 mt-1">
                      Implement balanced interventions focusing on farm rehabilitation, technical capacity 
                      building, and improved market access channels.
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