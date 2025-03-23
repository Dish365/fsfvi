#!/usr/bin/env node

// Script to test the FSFVI algorithms with Kenya data
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'CommonJS',
    moduleResolution: 'Node',
    target: 'ES2020',
    esModuleInterop: true
  }
});

try {
  console.log('Testing FSFVI algorithms with Kenya data...');
  const fs = require('fs');
  const path = require('path');
  
  // Import required modules
  const { 
    preprocessData, 
    calculateVulnerabilities, 
    calculateFSFVI, 
    optimizeResourceAllocation,
    calculateEfficiencyMetrics,
    calculateComponentAverageGap
  } = require('../src/lib/fsfvi-algorithms');
  
  // Load the Kenya FSFVI optimized JSON data
  const dataFilePath = path.join(process.cwd(), 'src', 'data', 'kenya_fsfvi_optimized.json');
  const kenyaData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
  
  // Adapt data to FSFVI format
  const adaptData = (data) => {
    const fsfviData = {
      subsectors: {},
      totalBudget: data.totalBudget || 0
    };
  
    // Map each subsector
    Object.keys(data.subsectors).forEach(key => {
      const subsector = data.subsectors[key];
      
      fsfviData.subsectors[key] = {
        id: key,
        name: subsector.name,
        indicators: subsector.indicators || [],
        totalExpenditures: subsector.totalExpenditures || 0,
        averagePerformanceGap: subsector.averagePerformanceGap || 0
      };
    });
    
    return fsfviData;
  };
  
  const adaptedData = adaptData(kenyaData);
  console.log(`Loaded data with ${Object.keys(adaptedData.subsectors).length} subsectors`);
  console.log(`Total budget: $${adaptedData.totalBudget.toFixed(2)}M`);
  
  // Analyze high performance gap indicators
  console.log('\n--- Analyzing High Performance Gap Indicators ---');
  let totalHighGapIndicators = 0;
  let maxGap = 0;
  let maxGapIndicator = null;
  
  // Identify subsectors with high gap indicators
  const subsectorsWithHighGaps = {};
  
  Object.entries(adaptedData.subsectors).forEach(([key, subsector]) => {
    // Find indicators with gaps > 5.0
    const highGapIndicators = subsector.indicators.filter(i => i.performanceGap > 5.0);
    if (highGapIndicators.length > 0) {
      subsectorsWithHighGaps[key] = highGapIndicators.length;
      totalHighGapIndicators += highGapIndicators.length;
      
      // Find max gap
      highGapIndicators.forEach(indicator => {
        if (indicator.performanceGap > maxGap) {
          maxGap = indicator.performanceGap;
          maxGapIndicator = {
            subsector: subsector.name,
            project: indicator.projectName,
            value: indicator.value,
            benchmark: indicator.benchmark,
            gap: indicator.performanceGap
          };
        }
      });
    }
  });
  
  console.log(`Found ${totalHighGapIndicators} indicators with performance gaps > 5.0`);
  console.log('Subsectors with high gap indicators:');
  Object.entries(subsectorsWithHighGaps)
    .sort((a, b) => b[1] - a[1])
    .forEach(([key, count]) => {
      console.log(`- ${key}: ${count} high gap indicators`);
    });
  
  if (maxGapIndicator) {
    console.log('\nMaximum performance gap:');
    console.log(`- Subsector: ${maxGapIndicator.subsector}`);
    console.log(`- Project: ${maxGapIndicator.project}`);
    console.log(`- Current Value: ${maxGapIndicator.value}`);
    console.log(`- Benchmark: ${maxGapIndicator.benchmark}`);
    console.log(`- Performance Gap: ${(maxGapIndicator.gap * 100).toFixed(2)}%`);
  }
  
  // Test different capping approaches
  console.log('\n--- Testing Different Capping Approaches ---');
  
  // Define test configurations
  const capConfigurations = [
    { name: "Original Cap (5.0)", options: { capMaxGap: 5.0 } },
    { name: "Increased Cap (8.0)", options: { capMaxGap: 8.0 } },
    { name: "Percentile Cap (95th)", options: { usePercentileCapping: true, percentileThreshold: 95 } },
    { name: "Per-subsector Caps", options: { 
      perSubsectorCaps: {
        "Food security": 8.0,
        "Nutritional status": 7.0,
        "Food availability": 6.5,
        "Environmental impacts": 6.0
      }
    }}
  ];
  
  // Test each configuration
  capConfigurations.forEach(config => {
    console.log(`\nTesting: ${config.name}`);
    
    // Process data with this configuration
    const processedData = preprocessData(adaptedData, { gapCalculation: config.options });
    
    // Calculate FSFVI
    const dataWithVulnerabilities = calculateVulnerabilities(processedData);
    const fsfvi = calculateFSFVI(dataWithVulnerabilities);
    
    console.log(`- FSFVI: ${(fsfvi * 100).toFixed(2)}%`);
    
    // Get average performance gap across all subsectors
    const avgPerformanceGap = Object.values(processedData.subsectors)
      .reduce((sum, s) => sum + s.averagePerformanceGap, 0) / 
      Object.values(processedData.subsectors).length;
    
    console.log(`- Average Performance Gap: ${(avgPerformanceGap * 100).toFixed(2)}%`);
  });
  
  // Test Algorithm 1: Preprocess data with new increased cap
  console.log('\n--- Testing Algorithm 1: Preprocess Data with Improved Capping ---');
  const gapCalculation = {
    useWeightedAverage: true,
    trimOutliers: true,
    capMaxGap: 8.0,
    usePercentileCapping: true,
    percentileThreshold: 95,
    perSubsectorCaps: {
      "Food security": 8.0,
      "Nutritional status": 7.0,
      "Food availability": 6.5,
      "Environmental impacts": 6.0
    }
  };
  
  const preprocessedData = preprocessData(adaptedData, { gapCalculation });
  console.log('Data preprocessing complete with improved capping');
  
  // Output some sample data
  const sampleSubsector = Object.values(preprocessedData.subsectors)[0];
  console.log(`Sample subsector: ${sampleSubsector.name}`);
  console.log(`Average performance gap: ${(sampleSubsector.averagePerformanceGap * 100).toFixed(2)}%`);
  
  // Test Algorithm 2: Calculate Component Vulnerabilities
  console.log('\n--- Testing Algorithm 2: Calculate Component Vulnerabilities ---');
  const dataWithVulnerabilities = calculateVulnerabilities(preprocessedData);
  console.log('Component vulnerability calculations complete');
  
  // Output sample vulnerability data
  const vulnerableSubsectors = Object.values(dataWithVulnerabilities.subsectors)
    .sort((a, b) => (b.vulnerability || 0) - (a.vulnerability || 0));
  
  console.log('Top 3 vulnerable subsectors:');
  vulnerableSubsectors.slice(0, 3).forEach(subsector => {
    console.log(`- ${subsector.name}: ${((subsector.vulnerability || 0) * 100).toFixed(2)}%`);
    console.log(`  Weight: ${((subsector.weight || 0) * 100).toFixed(2)}%`);
    console.log(`  Performance Gap: ${(subsector.averagePerformanceGap * 100).toFixed(2)}%`);
    console.log(`  Allocation: $${subsector.totalExpenditures.toFixed(2)}M`);
  });
  
  // Test Algorithm 3: Calculate System Vulnerability (FSFVI)
  console.log('\n--- Testing Algorithm 3: Calculate System Vulnerability (FSFVI) ---');
  const fsfvi = calculateFSFVI(dataWithVulnerabilities);
  console.log(`System FSFVI: ${(fsfvi * 100).toFixed(2)}%`);
  
  // Test Algorithm 4: Optimize Resource Allocation
  console.log('\n--- Testing Algorithm 4: Optimize Resource Allocation ---');
  const optimization = optimizeResourceAllocation(preprocessedData);
  
  console.log(`Original FSFVI: ${(optimization.originalFSFVI * 100).toFixed(2)}%`);
  console.log(`Optimized FSFVI: ${(optimization.optimizedFSFVI * 100).toFixed(2)}%`);
  
  // Calculate efficiency metrics
  const efficiency = calculateEfficiencyMetrics(
    optimization.originalFSFVI,
    optimization.optimizedFSFVI
  );
  
  console.log(`Absolute Improvement: ${(efficiency.absoluteGap * 100).toFixed(2)} percentage points`);
  console.log(`Relative Improvement: ${(efficiency.gapRatio * 100).toFixed(2)}%`);
  console.log(`Efficiency Index: ${(efficiency.efficiencyIndex * 100).toFixed(2)}%`);
  
  // Show allocation changes for the most vulnerable subsectors
  console.log('\nAllocation Changes for Top 3 Vulnerable Subsectors:');
  vulnerableSubsectors.slice(0, 3).forEach(subsector => {
    const id = subsector.id;
    const originalAllocation = optimization.originalAllocations[id];
    const optimizedAllocation = optimization.optimizedAllocations[id];
    const change = optimizedAllocation - originalAllocation;
    const percentChange = (change / originalAllocation) * 100;
    
    console.log(`- ${subsector.name}:`);
    console.log(`  Original: $${originalAllocation.toFixed(2)}M`);
    console.log(`  Optimized: $${optimizedAllocation.toFixed(2)}M`);
    console.log(`  Change: $${change.toFixed(2)}M (${percentChange.toFixed(2)}%)`);
  });
  
  console.log('\nFSFVI algorithm testing complete!');
  
} catch (error) {
  console.error('Error testing FSFVI algorithms:', error);
  process.exit(1);
} 