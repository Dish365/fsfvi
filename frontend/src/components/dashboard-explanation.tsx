"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DashboardExplanationProps {
  isOpen?: boolean;
  onClose?: () => void;
  trigger?: React.ReactNode;
  renderAsSection?: boolean;
}

export function DashboardExplanation({
  isOpen,
  onClose,
  trigger,
  renderAsSection = false,
}: DashboardExplanationProps) {
  const [open, setOpen] = React.useState(isOpen || false);

  React.useEffect(() => {
    if (isOpen !== undefined) {
      setOpen(isOpen);
    }
  }, [isOpen]);

  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose();
  };

  const content = (
    <Tabs defaultValue="overview" className="mt-4">
      <TabsList className="grid grid-cols-2">
        <TabsTrigger value="overview">Dashboard Overview</TabsTrigger>
        <TabsTrigger value="components">Value Chain Components</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4 mt-4">
        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold mb-2">Dashboard Explanation</h2>
          <p>
            This dashboard provides a comprehensive analysis of Ghana's cocoa value chain 
            using the Food System Food Value Index (FSFVI) methodology. It presents key 
            vulnerability metrics, resource allocation, and performance gaps to help identify 
            areas for improvement in the cocoa sector.
          </p>

          <h3 className="text-lg font-medium mt-4">Top-Level Metrics</h3>
          <ul className="mt-2 space-y-2">
            <li>
              <strong>System Vulnerability (FSFVI):</strong> The overall vulnerability score indicating 
              the level of risk in Ghana's cocoa value chain. Calculated as a weighted sum of all component 
              vulnerabilities.
            </li>
            <li>
              <strong>Total Allocated Resources:</strong> Shows how the total budget is currently allocated 
              across the value chain components.
            </li>
            <li>
              <strong>Highest Gap Component:</strong> Identifies the component with the largest performance 
              gap (difference between observed and benchmark performance).
            </li>
            <li>
              <strong>Total Value Chain Components:</strong> Indicates the number of components being 
              assessed in the dashboard.
            </li>
          </ul>

          <h3 className="text-lg font-medium mt-4">Key Sections</h3>
          <ol className="mt-2 space-y-2">
            <li>
              <strong>High Vulnerability Components:</strong> Highlights the three most vulnerable components 
              of the value chain, focusing on areas needing immediate attention.
            </li>
            <li>
              <strong>Value Chain Component Analysis:</strong> Provides a detailed breakdown of all seven components, 
              including performance gaps, vulnerability scores, weights, and resource allocations.
            </li>
          </ol>

          <h3 className="text-lg font-medium mt-4">Navigation</h3>
          <p>
            The sidebar provides access to different stakeholder views and specialized interfaces:
          </p>
          <ul className="mt-2 space-y-1">
            <li><strong>Stakeholder Views:</strong> Government Dashboard, Investor Interface, Value Chain Dashboard</li>
            <li><strong>Components:</strong> Detailed analysis of individual components</li>
            <li><strong>Analytics:</strong> Advanced data analysis and visualization</li>
            <li><strong>Optimization:</strong> Resource allocation optimization tools</li>
          </ul>

          <h3 className="text-lg font-medium mt-4">FSFVI Calculations</h3>
          <p>
            The dashboard is powered by the FSFVI calculation framework that:
          </p>
          <ol className="mt-2 space-y-1 list-decimal pl-5">
            <li>Calculates performance gaps between observed and benchmark performance (δᵢ = |xᵢ-x̄ᵢ|/xᵢ)</li>
            <li>Determines component vulnerability based on performance gaps and resource allocation (νᵢ(fᵢ) = δᵢ·1/(1+αᵢfᵢ))</li>
            <li>Computes system vulnerability as a weighted sum of component vulnerabilities (FSFVI = Σωᵢ·νᵢ(fᵢ))</li>
            <li>Allows for optimization of resource allocation to minimize vulnerability (Min Σωᵢ·νᵢ(fᵢ) subject to Σfᵢ ≤ F)</li>
          </ol>
        </div>
      </TabsContent>

      <TabsContent value="components" className="space-y-4 mt-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="bg-green-50">
              <CardTitle>Production (Primary Production)</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div><span className="font-medium">Performance Gap:</span> 30.8%</div>
                <div><span className="font-medium">Vulnerability:</span> 9.0%</div>
                <div><span className="font-medium">Weight:</span> 25.0%</div>
                <div><span className="font-medium">Allocation:</span> $30.0M</div>
              </div>
              <p className="text-sm text-slate-700 mb-2">
                Encompasses cocoa bean farming and harvesting activities - the foundation of the value chain. 
                With a relatively low vulnerability score, production is one of the strongest components, 
                but still faces challenges from aging trees, climate change, and pest/disease pressure.
              </p>
              <p className="text-sm text-slate-700">
                <strong>Key challenges:</strong> Aging trees, climate change vulnerability, pest and disease pressure.
              </p>
              <p className="text-sm text-slate-700">
                <strong>Opportunities:</strong> Adoption of improved varieties, sustainable farming practices, and 
                enhanced farmer technical knowledge.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle>Processing (Value Addition)</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div><span className="font-medium">Performance Gap:</span> 66.7%</div>
                <div><span className="font-medium">Vulnerability:</span> 30.3%</div>
                <div><span className="font-medium">Weight:</span> 20.0%</div>
                <div><span className="font-medium">Allocation:</span> $20.0M</div>
              </div>
              <p className="text-sm text-slate-700 mb-2">
                Involves transformation of raw cocoa beans into intermediate or finished products.
                With a substantial performance gap, processing shows significant room for improvement.
                Ghana processes only a fraction of its cocoa domestically, with most exported as raw beans.
              </p>
              <p className="text-sm text-slate-700">
                <strong>Key challenges:</strong> Limited domestic processing capacity, outdated technology, high operating costs.
              </p>
              <p className="text-sm text-slate-700">
                <strong>Opportunities:</strong> Increase local value addition, improve processing technology,
                develop specialty chocolate and cocoa products.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-indigo-50">
              <CardTitle>Market Access (Distribution)</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div><span className="font-medium">Performance Gap:</span> 45.5%</div>
                <div><span className="font-medium">Vulnerability:</span> 26.0%</div>
                <div><span className="font-medium">Weight:</span> 15.0%</div>
                <div><span className="font-medium">Allocation:</span> $15.0M</div>
              </div>
              <p className="text-sm text-slate-700 mb-2">
                Covers channels and systems through which cocoa products reach markets.
                Faces challenges in diversifying market destinations and responding to changing
                market demands, particularly around sustainability requirements.
              </p>
              <p className="text-sm text-slate-700">
                <strong>Key challenges:</strong> Heavy reliance on traditional European markets, limited direct trade relationships,
                evolving sustainability requirements.
              </p>
              <p className="text-sm text-slate-700">
                <strong>Opportunities:</strong> Market diversification (especially Asian markets), improved market information systems,
                targeting premium and specialty markets.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-amber-50">
              <CardTitle>Infrastructure (Supporting Systems)</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div><span className="font-medium">Performance Gap:</span> 75.0%</div>
                <div><span className="font-medium">Vulnerability:</span> 33.2%</div>
                <div><span className="font-medium">Weight:</span> 15.0%</div>
                <div><span className="font-medium">Allocation:</span> $18.0M</div>
              </div>
              <p className="text-sm text-slate-700 mb-2">
                Encompasses physical structures supporting the cocoa value chain (roads, storage, electricity).
                With a high performance gap and significant vulnerability, infrastructure represents a
                critical weakness, with rural roads often in poor condition.
              </p>
              <p className="text-sm text-slate-700">
                <strong>Key challenges:</strong> Poor rural road networks, inadequate storage facilities, unreliable electricity.
              </p>
              <p className="text-sm text-slate-700">
                <strong>Opportunities:</strong> Public-private partnerships for infrastructure development,
                renewable energy solutions, improved post-harvest handling facilities.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-purple-50">
              <CardTitle>Technical Capacity (Human Resources)</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div><span className="font-medium">Performance Gap:</span> 60.0%</div>
                <div><span className="font-medium">Vulnerability:</span> 45.5%</div>
                <div><span className="font-medium">Weight:</span> 10.0%</div>
                <div><span className="font-medium">Allocation:</span> $8.0M</div>
              </div>
              <p className="text-sm text-slate-700 mb-2">
                Relates to knowledge, skills, and technical abilities throughout the value chain.
                Many cocoa farmers lack access to updated agricultural techniques and 
                business management skills, making this a major area for improvement.
              </p>
              <p className="text-sm text-slate-700">
                <strong>Key challenges:</strong> Limited farmer field schools, aging farmer population,
                inadequate extension services, knowledge gaps.
              </p>
              <p className="text-sm text-slate-700">
                <strong>Opportunities:</strong> Enhanced training programs, youth engagement initiatives,
                digital knowledge platforms, peer-to-peer learning networks.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-red-50">
              <CardTitle>Financial Services (Support Services)</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div><span className="font-medium">Performance Gap:</span> 85.7%</div>
                <div><span className="font-medium">Vulnerability:</span> 68.6%</div>
                <div><span className="font-medium">Weight:</span> 10.0%</div>
                <div><span className="font-medium">Allocation:</span> $5.0M</div>
              </div>
              <p className="text-sm text-slate-700 mb-2">
                Covers access to credit, insurance, and financial products for value chain actors.
                With the highest vulnerability score and largest performance gap, this represents
                the most critical vulnerability in the system.
              </p>
              <p className="text-sm text-slate-700">
                <strong>Key challenges:</strong> Limited access to affordable credit, lack of suitable insurance products,
                insufficient financial literacy among smallholders.
              </p>
              <p className="text-sm text-slate-700">
                <strong>Opportunities:</strong> Microfinance expansion, mobile banking solutions,
                crop insurance products, value chain financing mechanisms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-emerald-50">
              <CardTitle>Policy Environment (Governance)</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div><span className="font-medium">Performance Gap:</span> 25.0%</div>
                <div><span className="font-medium">Vulnerability:</span> 22.3%</div>
                <div><span className="font-medium">Weight:</span> 5.0%</div>
                <div><span className="font-medium">Allocation:</span> $4.0M</div>
              </div>
              <p className="text-sm text-slate-700 mb-2">
                Encompasses regulations, laws, and governance structures affecting cocoa.
                With the lowest performance gap and relatively low vulnerability, 
                the policy environment is comparatively strong but still has implementation gaps.
              </p>
              <p className="text-sm text-slate-700">
                <strong>Key challenges:</strong> Policy implementation gaps, inter-agency coordination,
                adapting to evolving international sustainability standards.
              </p>
              <p className="text-sm text-slate-700">
                <strong>Opportunities:</strong> Enhanced policy coherence, improved transparency in cocoa governance,
                evidence-based policy development using FSFVI data.
              </p>
            </CardContent>
          </Card>
        </div>

        {!renderAsSection && (
          <div className="mt-6 text-center">
            <Button onClick={handleClose}>Close Explanation</Button>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );

  if (renderAsSection) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Ghana Cocoa Value Chain Explanation</CardTitle>
        </CardHeader>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Ghana Cocoa Value Chain Dashboard</DialogTitle>
          <DialogDescription>
            A comprehensive explanation of the FSFVI dashboard and its components
          </DialogDescription>
        </DialogHeader>

        {content}
      </DialogContent>
    </Dialog>
  );
} 