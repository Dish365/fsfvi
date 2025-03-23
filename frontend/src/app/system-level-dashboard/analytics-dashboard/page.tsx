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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  LineChart,
  Line
} from 'recharts';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { HelpCircle, Download, RefreshCw, Filter } from "lucide-react";
import kenyaData from "@/data/kenya_fsfvi_optimized.json";

// Type for Kenya FSFVI Data
interface KenyaFSFVIData {
  subsectors: Record<string, {
    name: string;
    indicators: Array<{
      projectName: string;
      matchScore: number;
      expenditures: number;
      value: number | null;
      benchmark: number | null;
      performanceGap: number;
    }>;
    totalExpenditures: number;
    averagePerformanceGap: number;
  }>;
}

// Type assertion for the Kenya data
const typedKenyaData = kenyaData as KenyaFSFVIData;

// Generate colors for charts
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', 
  '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'
];

// Extended color palette with more distinct colors for subsector identification
const EXTENDED_COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', 
  '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57',
  '#FF5733', '#C70039', '#900C3F', '#581845', '#2471A3',
  '#229954', '#D4AC0D', '#BA4A00', '#7D3C98', '#2E4053',
  '#1ABC9C', '#F1C40F', '#3498DB', '#E74C3C', '#9B59B6'
];

export default function AnalyticsDashboard() {
  // State for analytics data
  const [subsectorMetrics, setSubsectorMetrics] = useState<any[]>([]);
  const [projectMetrics, setProjectMetrics] = useState<any[]>([]);
  const [gapDistribution, setGapDistribution] = useState<any[]>([]);
  const [fundingEfficiency, setFundingEfficiency] = useState<any[]>([]);
  const [selectedSubsector, setSelectedSubsector] = useState<string>("");

  // Process data on component mount
  useEffect(() => {
    processData();
  }, []);

  // Process data for analytics
  const processData = () => {
    // 1. Process subsector metrics
    const subsectorData = Object.entries(typedKenyaData.subsectors).map(([id, subsector]) => {
      // Calculate average match score
      const avgMatchScore = subsector.indicators.reduce(
        (sum, indicator) => sum + indicator.matchScore, 
        0
      ) / subsector.indicators.length;

      // Calculate count of high gap indicators (> 5.0)
      const highGapCount = subsector.indicators.filter(
        indicator => indicator.performanceGap > 5.0
      ).length;

      // Calculate funding per indicator
      const fundingPerIndicator = subsector.totalExpenditures / 
        (subsector.indicators.length || 1);

      return {
        id,
        name: subsector.name,
        totalExpenditures: subsector.totalExpenditures,
        averagePerformanceGap: subsector.averagePerformanceGap,
        avgMatchScore,
        indicatorCount: subsector.indicators.length,
        highGapCount,
        fundingPerIndicator
      };
    });

    setSubsectorMetrics(subsectorData);
    if (subsectorData.length > 0 && !selectedSubsector) {
      setSelectedSubsector(subsectorData[0].id);
    }

    // 2. Process project metrics
    const allProjects: any[] = [];
    
    Object.entries(typedKenyaData.subsectors).forEach(([subsectorId, subsector]) => {
      // Group indicators by project name
      const projectGroups: Record<string, any[]> = {};
      
      subsector.indicators.forEach(indicator => {
        if (!projectGroups[indicator.projectName]) {
          projectGroups[indicator.projectName] = [];
        }
        projectGroups[indicator.projectName].push(indicator);
      });
      
      // Aggregate project data
      Object.entries(projectGroups).forEach(([projectName, indicators]) => {
        const totalExpenditure = indicators.reduce(
          (sum, indicator) => sum + indicator.expenditures, 0
        );
        
        const avgPerformanceGap = indicators.reduce(
          (sum, indicator) => sum + indicator.performanceGap, 0
        ) / indicators.length;
        
        const avgMatchScore = indicators.reduce(
          (sum, indicator) => sum + indicator.matchScore, 0
        ) / indicators.length;
        
        allProjects.push({
          projectName,
          subsectorId,
          subsectorName: subsector.name,
          totalExpenditure,
          indicatorCount: indicators.length,
          avgPerformanceGap,
          avgMatchScore,
          highGapCount: indicators.filter(i => i.performanceGap > 5.0).length
        });
      });
    });
    
    setProjectMetrics(allProjects);

    // 3. Process gap distribution
    const gapRanges = [
      { range: "0-0.5", min: 0, max: 0.5, count: 0 },
      { range: "0.5-1", min: 0.5, max: 1, count: 0 },
      { range: "1-2", min: 1, max: 2, count: 0 },
      { range: "2-3", min: 2, max: 3, count: 0 },
      { range: "3-5", min: 3, max: 5, count: 0 },
      { range: "5-8", min: 5, max: 8, count: 0 },
      { range: ">8", min: 8, max: Infinity, count: 0 }
    ];

    // Count indicators in each gap range
    Object.values(typedKenyaData.subsectors).forEach(subsector => {
      subsector.indicators.forEach(indicator => {
        const gap = indicator.performanceGap;
        const rangeItem = gapRanges.find(r => gap >= r.min && gap < r.max);
        if (rangeItem) {
          rangeItem.count++;
        }
      });
    });

    setGapDistribution(gapRanges);

    // 4. Calculate funding efficiency
    const efficiencyData = Object.entries(typedKenyaData.subsectors).map(([id, subsector]) => {
      // Calculate impact score (inverse of performance gap)
      const impactScore = 1 / (subsector.averagePerformanceGap + 0.1); // Add 0.1 to avoid division by zero
      
      // Calculate efficiency (impact per dollar)
      const efficiency = impactScore / (subsector.totalExpenditures || 1);
      
      // Calculate opportunity score
      const opportunityScore = subsector.averagePerformanceGap * 
        (subsector.indicators.length / 10) * // Scale by number of indicators
        (subsector.totalExpenditures < 1 ? 2 : 1); // Boost for underfunded areas
      
      return {
        id,
        name: subsector.name,
        expenditure: subsector.totalExpenditures,
        gap: subsector.averagePerformanceGap,
        impactScore: impactScore.toFixed(2),
        efficiency: efficiency.toFixed(2),
        opportunityScore: opportunityScore.toFixed(2)
      };
    });

    setFundingEfficiency(efficiencyData);
  };

  // Filter projects by selected subsector
  const filteredProjects = selectedSubsector 
    ? projectMetrics.filter(project => project.subsectorId === selectedSubsector)
    : projectMetrics;

  // Get selected subsector name
  const selectedSubsectorName = selectedSubsector 
    ? typedKenyaData.subsectors[selectedSubsector]?.name 
    : "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kenya FSFVI Analytics</h1>
        <p className="mt-2 text-slate-600">
          In-depth analysis of Kenya's food system indicators, performance gaps, and resource allocation
        </p>
      </div>

      {/* Top-level KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-slate-500">Total Subsectors</p>
              <p className="text-3xl font-bold">
                {Object.keys(typedKenyaData.subsectors).length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-slate-500">Total Projects</p>
              <p className="text-3xl font-bold">
                {new Set(projectMetrics.map(p => p.projectName)).size}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-slate-500">Avg Performance Gap</p>
              <p className="text-3xl font-bold">
                {((subsectorMetrics.reduce((sum, s) => sum + s.averagePerformanceGap, 0) / 
                  Math.max(1, subsectorMetrics.length)) * 100).toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-slate-500">High Gap Indicators</p>
              <p className="text-3xl font-bold">
                {subsectorMetrics.reduce((sum, s) => sum + s.highGapCount, 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance-gaps">Performance Gaps</TabsTrigger>
          <TabsTrigger value="funding">Funding Allocation</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunity Analysis</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Subsector Comparison */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Subsector Comparison</CardTitle>
                <CardDescription>
                  Comparing expenditures and performance gaps across subsectors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={subsectorMetrics.sort((a, b) => b.averagePerformanceGap - a.averagePerformanceGap)} 
                      margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }} 
                        interval={0} 
                        angle={-45} 
                        textAnchor="end" 
                      />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <RechartsTooltip 
                        formatter={(value: any, name: string) => {
                          if (name === "Performance Gap") 
                            return [`${(Number(value) * 100).toFixed(1)}%`, name];
                          return [`$${Number(value).toFixed(2)}M`, name];
                        }}
                      />
                      <Legend />
                      <Bar 
                        yAxisId="left" 
                        dataKey="averagePerformanceGap" 
                        name="Performance Gap" 
                        fill="#8884d8" 
                      />
                      <Bar 
                        yAxisId="right" 
                        dataKey="totalExpenditures" 
                        name="Total Expenditures ($M)" 
                        fill="#82ca9d" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Performance Gap Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Gap Distribution</CardTitle>
                <CardDescription>
                  Distribution of indicators by performance gap range
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={gapDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="range"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      >
                        {gapDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value: any, name: string, props: any) => {
                          return [`${value} indicators`, props.payload.range];
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Subsector Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Subsector Metrics</CardTitle>
                <CardDescription>
                  Key metrics by subsector
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={90} data={subsectorMetrics.slice(0, 8).map(subsector => {
                      // Calculate max values for normalization
                      const maxGap = Math.max(...subsectorMetrics.map(s => s.averagePerformanceGap));
                      const maxCount = Math.max(...subsectorMetrics.map(s => s.indicatorCount));
                      
                      // Normalize values to 0-100 scale
                      return {
                        ...subsector,
                        normalizedGap: (subsector.averagePerformanceGap / maxGap) * 100,
                        normalizedCount: (subsector.indicatorCount / maxCount) * 100
                      };
                    })}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Performance Gap"
                        dataKey="normalizedGap"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                      />
                      <Radar
                        name="Indicator Count"
                        dataKey="normalizedCount"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                        fillOpacity={0.6}
                      />
                      <RechartsTooltip 
                        formatter={(value: any, name: string, props: any) => {
                          // Show original values in tooltip, not normalized ones
                          if (name === "Performance Gap") {
                            const originalGap = props.payload.averagePerformanceGap;
                            return [`${(originalGap * 100).toFixed(1)}%`, name];
                          }
                          if (name === "Indicator Count") {
                            return [props.payload.indicatorCount, name];
                          }
                          return [value, name];
                        }}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Gaps Tab */}
        <TabsContent value="performance-gaps" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Top High Gap Indicators */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Top High Gap Indicators by Subsector</CardTitle>
                <CardDescription>
                  Subsectors with the highest number of extreme performance gaps ({'>'}500%)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={subsectorMetrics
                        .filter(subsector => subsector.highGapCount > 0)
                        .sort((a, b) => b.highGapCount - a.highGapCount)
                        .slice(0, 10)
                      }
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis type="number" />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={150} 
                        tick={{ fontSize: 12 }} 
                      />
                      <CartesianGrid strokeDasharray="3 3" />
                      <RechartsTooltip
                        formatter={(value: any) => [`${value} indicators`, 'High Gap Count']}
                      />
                      <Bar 
                        dataKey="highGapCount" 
                        fill="#ff7300" 
                        name="High Gap Indicators" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-sm text-slate-600">
                  <p>High gap indicators show where current performance is significantly below benchmarks, 
                    potentially indicating priority areas for intervention or data quality issues.</p>
                </div>
              </CardContent>
            </Card>

            {/* Performance Gap Scatterplot */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Performance Gap vs. Expenditure</CardTitle>
                <CardDescription>
                  Analyzing the relationship between funding and performance gaps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[450px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid />
                      <XAxis 
                        type="number" 
                        dataKey="totalExpenditures" 
                        name="Expenditure" 
                        unit="M" 
                        label={{ 
                          value: 'Expenditure ($M)', 
                          position: 'insideBottom', 
                          offset: -5 
                        }} 
                      />
                      <YAxis 
                        type="number" 
                        dataKey="averagePerformanceGap" 
                        name="Performance Gap" 
                        label={{ 
                          value: 'Performance Gap', 
                          angle: -90, 
                          position: 'insideLeft' 
                        }} 
                      />
                      <ZAxis 
                        type="number" 
                        dataKey="indicatorCount" 
                        range={[60, 400]} 
                        name="Indicator Count" 
                      />
                      <RechartsTooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-3 border shadow-md rounded">
                                <p className="text-base font-medium text-gray-900">{payload[0].payload.name}</p>
                                <p className="text-sm mt-1">Performance Gap: <span className="font-medium">{(payload[0].payload.averagePerformanceGap * 100).toFixed(1)}%</span></p>
                                <p className="text-sm">Expenditure: <span className="font-medium">${payload[0].payload.totalExpenditures.toFixed(2)}M</span></p>
                                <p className="text-sm">Indicator Count: <span className="font-medium">{payload[0].payload.indicatorCount}</span></p>
                                <p className="text-sm">High Gap Indicators: <span className="font-medium">{payload[0].payload.highGapCount}</span></p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Scatter 
                        name="Subsectors" 
                        data={subsectorMetrics} 
                        fill="#8884d8"
                      >
                        {subsectorMetrics.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={EXTENDED_COLORS[index % EXTENDED_COLORS.length]} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-sm text-slate-600">
                  <p>Bubble size represents the number of indicators in each subsector. Hover over bubbles to see subsector details.
                    This visualization helps identify outliers and potential inefficiencies in resource allocation.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Funding Tab */}
        <TabsContent value="funding" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Funding Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Funding Distribution</CardTitle>
                <CardDescription>
                  Distribution of funds across subsectors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={subsectorMetrics}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        fill="#8884d8"
                        paddingAngle={1}
                        dataKey="totalExpenditures"
                        nameKey="name"
                        label={({name, percent}) => 
                          percent > 0.05 ? `${name}: ${(percent * 100).toFixed(1)}%` : ''
                        }
                      >
                        {subsectorMetrics.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value: any, name: string) => {
                          return [`$${Number(value).toFixed(2)}M`, name];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Funding Efficiency */}
            <Card>
              <CardHeader>
                <CardTitle>Funding Efficiency</CardTitle>
                <CardDescription>
                  Comparing impact per dollar across subsectors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={fundingEfficiency.sort((a, b) => Number(b.efficiency) - Number(a.efficiency))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }} 
                        interval={0} 
                        angle={-45} 
                        textAnchor="end" 
                      />
                      <YAxis />
                      <RechartsTooltip 
                        formatter={(value: any, name: string) => {
                          return [value, name === "efficiency" ? "Impact per $M" : name];
                        }}
                      />
                      <Bar 
                        dataKey="efficiency" 
                        fill="#82ca9d" 
                        name="Impact per $M" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Project Breakdown */}
            <Card className="col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Project Breakdown by Subsector</CardTitle>
                  <CardDescription>
                    Explore projects and their metrics within each subsector
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Subsector:</span>
                  <select 
                    className="text-sm border rounded px-2 py-1"
                    value={selectedSubsector}
                    onChange={(e) => setSelectedSubsector(e.target.value)}
                    aria-label="Select subsector"
                  >
                    {subsectorMetrics.map(subsector => (
                      <option key={subsector.id} value={subsector.id}>
                        {subsector.name}
                      </option>
                    ))}
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-medium mb-4">{selectedSubsectorName}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Project Name</th>
                        <th className="text-right p-2">Expenditure ($M)</th>
                        <th className="text-right p-2">Avg. Performance Gap</th>
                        <th className="text-right p-2">Match Score</th>
                        <th className="text-right p-2">Indicators</th>
                        <th className="text-right p-2">High Gap Indicators</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProjects.map((project, index) => (
                        <tr key={index} className="border-b hover:bg-slate-50">
                          <td className="p-2">{project.projectName}</td>
                          <td className="text-right p-2">${project.totalExpenditure.toFixed(2)}M</td>
                          <td className="text-right p-2">{(project.avgPerformanceGap * 100).toFixed(1)}%</td>
                          <td className="text-right p-2">{project.avgMatchScore.toFixed(1)}</td>
                          <td className="text-right p-2">{project.indicatorCount}</td>
                          <td className="text-right p-2">{project.highGapCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Opportunity Map */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Opportunity Map</CardTitle>
                <CardDescription>
                  Visualizing improvement opportunities based on performance gaps and potential impact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                      data={fundingEfficiency.map(item => ({
                        name: item.name,
                        size: Number(item.opportunityScore) * 100,
                        gap: item.gap,
                        expenditure: item.expenditure
                      }))}
                      dataKey="size"
                      nameKey="name"
                      stroke="#fff"
                      fill="#8884d8"
                    >
                      <RechartsTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-2 border shadow-sm rounded">
                                <p className="font-semibold">{data.name}</p>
                                <p>Performance Gap: {(data.gap * 100).toFixed(1)}%</p>
                                <p>Expenditure: ${data.expenditure.toFixed(2)}M</p>
                                <p>Opportunity Score: {(data.size / 100).toFixed(2)}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </Treemap>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-sm text-slate-600">
                  <p>The opportunity map shows potential areas for intervention, with larger boxes indicating 
                    higher opportunity scores (based on performance gaps, number of indicators, and current funding).</p>
                </div>
              </CardContent>
            </Card>

            {/* Gap-Expenditure Correlation */}
            <Card>
              <CardHeader>
                <CardTitle>Gap-Expenditure Correlation</CardTitle>
                <CardDescription>
                  Analyzing correlation between funding and performance gaps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={subsectorMetrics.sort((a, b) => a.totalExpenditures - b.totalExpenditures)}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="totalExpenditures" 
                        type="number"
                        label={{ 
                          value: 'Expenditure ($M)', 
                          position: 'insideBottom', 
                          offset: -5 
                        }}
                      />
                      <YAxis 
                        label={{ 
                          value: 'Performance Gap', 
                          angle: -90, 
                          position: 'insideLeft' 
                        }}
                      />
                      <RechartsTooltip 
                        formatter={(value: any, name: string) => {
                          if (name === "averagePerformanceGap") 
                            return [`${(Number(value) * 100).toFixed(1)}%`, "Performance Gap"];
                          return [`$${Number(value).toFixed(2)}M`, "Expenditure"];
                        }}
                        labelFormatter={(value) => {
                          const item = subsectorMetrics.find(s => s.totalExpenditures === value);
                          return item ? item.name : "";
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="averagePerformanceGap" 
                        stroke="#8884d8" 
                        dot={{ r: 4 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Investment Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Recommendations</CardTitle>
                <CardDescription>
                  Top areas with potential for high impact from additional funding
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fundingEfficiency
                    .sort((a, b) => Number(b.opportunityScore) - Number(a.opportunityScore))
                    .slice(0, 5)
                    .map((item, index) => (
                      <div key={index} className="p-3 rounded border bg-slate-50">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">{item.name}</h4>
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            Score: {item.opportunityScore}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-1 text-sm">
                          <div>
                            <span className="text-slate-500">Current Gap:</span> 
                            <span className="ml-1 font-medium">{(item.gap * 100).toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Current Funding:</span> 
                            <span className="ml-1 font-medium">${item.expenditure.toFixed(2)}M</span>
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-slate-600">
                          {Number(item.opportunityScore) > 3 
                            ? "High priority - significant improvement potential" 
                            : "Medium priority - moderate improvement potential"}
                        </div>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" className="gap-1">
          <RefreshCw size={16} />
          <span>Refresh Data</span>
        </Button>
        <Button variant="outline" className="gap-1">
          <Download size={16} />
          <span>Export Analysis</span>
        </Button>
      </div>
    </div>
  );
} 