"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface TrendData {
  period: string;
  value: number;
}

interface TrendSeriesData {
  name: string;
  color: string;
  trends: TrendData[];
  dashed?: boolean;
}

interface DataPointSeriesData {
  name: string;
  color: string;
  data: any[];
  dashed?: boolean;
}

interface TrendLineChartProps {
  data: (TrendSeriesData | DataPointSeriesData)[];
  title: string;
  description?: string;
  yAxisLabel?: string;
  xAxisLabel?: string;
  height?: number;
  valueFormatter?: (value: number) => string;
  xAxisKey?: string;
  yAxisKey?: string;
}

export function TrendLineChart({
  data,
  title,
  description,
  yAxisLabel = "Value",
  xAxisLabel = "Period",
  height = 400,
  valueFormatter = (value) => value.toString(),
  xAxisKey,
  yAxisKey
}: TrendLineChartProps) {
  // Determine if we're using the new format with data array or the old format with trends array
  const isNewFormat = data.length > 0 && 'data' in data[0] && xAxisKey && yAxisKey;
  
  // Process data based on format
  let periods: string[] = [];
  let chartData: Record<string, any>[] = [];
  
  if (isNewFormat) {
    // Get all unique periods/x-axis values
    periods = Array.from(
      new Set(data.flatMap(series => 
        (series as DataPointSeriesData).data.map(point => String(point[xAxisKey]))
      ))
    ).sort();
    
    // Create chart data with all series values
    chartData = periods.map(period => {
      const point: Record<string, any> = { period };
      
      data.forEach(series => {
        const seriesData = series as DataPointSeriesData;
        const match = seriesData.data.find(p => String(p[xAxisKey]) === period);
        point[seriesData.name] = match ? match[yAxisKey] : null;
      });
      
      return point;
    });
  } else {
    // Original format processing
    periods = Array.from(
      new Set(data.flatMap(series => 
        (series as TrendSeriesData).trends.map(point => point.period)
      ))
    ).sort();
    
    chartData = periods.map(period => {
      const point: Record<string, any> = { period };
      
      data.forEach(series => {
        const seriesData = series as TrendSeriesData;
        const match = seriesData.trends.find(p => p.period === period);
        point[seriesData.name] = match ? match.value : null;
      });
      
      return point;
    });
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="period" 
              label={{ 
                value: xAxisLabel, 
                position: "insideBottom", 
                offset: -10 
              }} 
            />
            <YAxis 
              label={{ 
                value: yAxisLabel, 
                angle: -90, 
                position: "insideLeft" 
              }} 
            />
            <Tooltip 
              formatter={(value) => value !== null ? [valueFormatter(value as number), ""] : ["N/A", ""]}
              labelFormatter={(label) => `${xAxisLabel}: ${label}`}
            />
            <Legend />
            {data.map((series, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={series.name}
                name={series.name}
                stroke={series.color}
                activeDot={{ r: 8 }}
                connectNulls
                strokeWidth={2}
                strokeDasharray={series.dashed ? "5 5" : undefined}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 