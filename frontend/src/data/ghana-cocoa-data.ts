// Mock data for Ghana's Cocoa Value Chain FSFVI calculations

export interface ValueChainComponent {
  id: string;
  name: string;
  category: string;
  description: string;
  observedPerformance: number; // xᵢ - observed performance
  benchmarkPerformance: number; // x̄ᵢ - benchmark performance
  weight: number; // ωᵢ - component weight in overall index
  sensitivityParameter: number; // αᵢ - sensitivity parameter
  currentAllocation: number; // fᵢ - current financial allocation
}

export interface FSFVIData {
  country: string;
  commodity: string;
  year: number;
  totalBudget: number; // F - total budget constraint
  components: ValueChainComponent[];
}

const ghanaCocoaData: FSFVIData = {
  country: "Ghana",
  commodity: "Cocoa",
  year: 2023,
  totalBudget: 100.0, // in millions USD
  components: [
    {
      id: "production",
      name: "Production",
      category: "Primary Production",
      description: "Cocoa bean farming and harvesting activities",
      observedPerformance: 65.0, // in percentage
      benchmarkPerformance: 85.0, // in percentage
      weight: 0.25, // 25% weight in overall index
      sensitivityParameter: 0.08,
      currentAllocation: 30.0 // in millions USD
    },
    {
      id: "processing",
      name: "Processing",
      category: "Value Addition",
      description: "Primary processing of cocoa beans into cocoa products",
      observedPerformance: 45.0,
      benchmarkPerformance: 75.0,
      weight: 0.20,
      sensitivityParameter: 0.06,
      currentAllocation: 20.0
    },
    {
      id: "market_access",
      name: "Market Access",
      category: "Distribution",
      description: "Access to local and international markets for cocoa products",
      observedPerformance: 55.0,
      benchmarkPerformance: 80.0,
      weight: 0.15,
      sensitivityParameter: 0.05,
      currentAllocation: 15.0
    },
    {
      id: "infrastructure",
      name: "Infrastructure",
      category: "Supporting Systems",
      description: "Roads, storage, and logistics infrastructure",
      observedPerformance: 40.0,
      benchmarkPerformance: 70.0,
      weight: 0.15,
      sensitivityParameter: 0.07,
      currentAllocation: 18.0
    },
    {
      id: "technical_capacity",
      name: "Technical Capacity",
      category: "Human Resources",
      description: "Farmer knowledge and skills in modern cocoa farming practices",
      observedPerformance: 50.0,
      benchmarkPerformance: 80.0,
      weight: 0.10,
      sensitivityParameter: 0.04,
      currentAllocation: 8.0
    },
    {
      id: "financial_services",
      name: "Financial Services",
      category: "Support Services",
      description: "Access to loans, insurance and other financial services",
      observedPerformance: 35.0,
      benchmarkPerformance: 65.0,
      weight: 0.10,
      sensitivityParameter: 0.05,
      currentAllocation: 5.0
    },
    {
      id: "policy_environment",
      name: "Policy Environment",
      category: "Governance",
      description: "Regulatory frameworks and policies affecting cocoa sector",
      observedPerformance: 60.0,
      benchmarkPerformance: 75.0,
      weight: 0.05,
      sensitivityParameter: 0.03,
      currentAllocation: 4.0
    }
  ]
};

export default ghanaCocoaData; 