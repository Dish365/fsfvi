import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ValueChainComponent } from "@/data/ghana-cocoa-data";
import { calculatePerformanceGap, calculateComponentVulnerability } from "@/lib/fsfvi-calculator";

interface ValueChainComponentTableProps {
  components: ValueChainComponent[];
  customAllocations?: Record<string, number>;
}

export function ValueChainComponentTable({ 
  components, 
  customAllocations 
}: ValueChainComponentTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Component</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Performance Gap</TableHead>
            <TableHead className="text-right">Vulnerability</TableHead>
            <TableHead className="text-right">Weight</TableHead>
            <TableHead className="text-right">Allocation ($M)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {components.map((component) => {
            const allocation = customAllocations 
              ? (customAllocations[component.id] || component.currentAllocation)
              : component.currentAllocation;
              
            const performanceGap = calculatePerformanceGap(component);
            const vulnerability = calculateComponentVulnerability(component, allocation);
            
            // Determine color based on vulnerability score
            const getVulnerabilityColor = (score: number) => {
              if (score < 0.1) return "bg-emerald-500";
              if (score < 0.2) return "bg-amber-500";
              return "bg-red-500";
            };
            
            // Format percentage with 1 decimal place
            const formatPercentage = (value: number) => {
              return (value * 100).toFixed(1) + "%";
            };
            
            return (
              <TableRow key={component.id}>
                <TableCell className="font-medium">{component.name}</TableCell>
                <TableCell>{component.category}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Progress 
                      value={performanceGap * 100} 
                      max={100} 
                      className="h-2 w-16 bg-slate-200"
                    />
                    <span>{formatPercentage(performanceGap)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Progress 
                      value={vulnerability * 100} 
                      max={100} 
                      className={`h-2 w-16 ${getVulnerabilityColor(vulnerability)}`}
                    />
                    <span>{formatPercentage(vulnerability)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">{formatPercentage(component.weight)}</TableCell>
                <TableCell className="text-right">${allocation.toFixed(1)}M</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
} 