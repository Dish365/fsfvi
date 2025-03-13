"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AllocationPieChartProps {
  data: {
    id: string;
    name: string;
    allocation: number;
    category: string;
  }[];
  title: string;
  height?: number;
}

export function AllocationPieChart({
  data,
  title,
  height = 400,
}: AllocationPieChartProps) {
  // Format data for the chart
  const chartData = data.map((item) => ({
    name: item.name,
    value: parseFloat(item.allocation.toFixed(1)),
    category: item.category,
  }));

  // Calculate total allocation for percentage
  const totalAllocation = chartData.reduce((sum, item) => sum + item.value, 0);

  // Set of colors for the pie segments
  const COLORS = [
    "#3b82f6", // blue-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#f97316", // orange-500
    "#22c55e", // green-500
    "#14b8a6", // teal-500
    "#a855f7", // purple-500
    "#f43f5e", // rose-500
    "#0ea5e9", // sky-500
    "#eab308", // yellow-500
  ];

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalAllocation) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-3 shadow-md rounded-md border">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-slate-600">{data.category}</p>
          <p className="font-semibold">${data.value}M ({percentage}%)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={130}
              innerRadius={50}
              fill="#8884d8"
              dataKey="value"
              label={({ name, value }) => {
                const percentageValue = ((value / totalAllocation) * 100);
                const percentage = percentageValue.toFixed(0);
                return percentageValue > 5 ? `${name} (${percentage}%)` : "";
              }}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right" 
              formatter={(value, entry: any, index) => {
                const item = chartData[index];
                const percentage = ((item.value / totalAllocation) * 100).toFixed(1);
                return `${value} - $${item.value}M (${percentage}%)`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 