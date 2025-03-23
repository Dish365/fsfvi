#!/usr/bin/env node

// Script to process the CSV data into optimized JSON format
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
  console.log('Starting CSV to JSON conversion process...');
  const fs = require('fs');
  const path = require('path');
  const Papa = require('papaparse');
  
  // Define paths
  const baseDir = process.cwd();
  const csvFilePath = path.join(baseDir, 'src', 'data', 'Final_Combined_Matches_with_Manual_Entries.csv');
  const jsonFilePath = path.join(baseDir, 'src', 'data', 'kenya_fsfvi_optimized.json');
  
  console.log('Reading CSV from:', csvFilePath);
  console.log('Writing JSON to:', jsonFilePath);
  
  // Read the CSV file
  const csvData = fs.readFileSync(csvFilePath, 'utf8');
  console.log(`Successfully read CSV file (${csvData.length} bytes)`);
  
  // Parse the CSV
  Papa.parse(csvData, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: (results) => {
      console.log(`Parsed CSV with ${results.data.length} rows`);
      
      // Initialize the data structure
      const fsfviData = {
        subsectors: {},
        totalBudget: 0
      };
      
      // Process each row from the CSV
      results.data.forEach((row) => {
        // Skip rows with missing essential data
        if (!row['subsector'] || row['subsector'] === '') {
          console.warn('Skipping row with missing subsector');
          return;
        }
        
        // Calculate performance gap for each indicator
        const value = row['Value'];
        const benchmark = row['benchmark'];
        const performanceGap = value ? Math.abs(value - benchmark) / value : 0;
        
        const subsectorName = row['subsector'];
        const expenditure = row['Expenditures (million USD)'] || 0;
        
        // Add to total budget
        fsfviData.totalBudget += expenditure;
        
        // Create subsector if it doesn't exist
        if (!fsfviData.subsectors[subsectorName]) {
          fsfviData.subsectors[subsectorName] = {
            name: subsectorName,
            indicators: [],
            totalExpenditures: 0
          };
        }
        
        // Add indicator to subsector
        fsfviData.subsectors[subsectorName].indicators.push({
          projectName: row['project name'],
          matchScore: row['match_score'],
          expenditures: expenditure,
          value: value,
          benchmark: benchmark,
          performanceGap: performanceGap
        });
        
        // Update subsector total expenditures
        fsfviData.subsectors[subsectorName].totalExpenditures += expenditure;
      });
      
      // Calculate average performance gaps for each subsector
      Object.values(fsfviData.subsectors).forEach(subsector => {
        if (subsector.indicators.length > 0) {
          const totalGap = subsector.indicators.reduce((sum, indicator) => 
            sum + (indicator.performanceGap || 0), 0);
          subsector.averagePerformanceGap = totalGap / subsector.indicators.length;
        }
      });
      
      // Write optimized data to JSON file
      fs.writeFileSync(
        jsonFilePath, 
        JSON.stringify(fsfviData, null, 2)
      );
      
      console.log(`Processed CSV to optimized JSON structure with ${Object.keys(fsfviData.subsectors).length} subsectors`);
      console.log(`Total budget: $${fsfviData.totalBudget.toFixed(2)}M`);
      
      // Log some sample data
      const subsectorNames = Object.keys(fsfviData.subsectors);
      if (subsectorNames.length > 0) {
        const sampleSubsector = fsfviData.subsectors[subsectorNames[0]];
        console.log(`Sample subsector: ${sampleSubsector.name}`);
        console.log(`- Total expenditures: $${sampleSubsector.totalExpenditures.toFixed(2)}M`);
        console.log(`- Average performance gap: ${(sampleSubsector.averagePerformanceGap || 0) * 100}%`);
        console.log(`- Number of indicators: ${sampleSubsector.indicators.length}`);
      }
      
      console.log('Process completed successfully.');
    },
    error: (error) => {
      console.error('Error processing CSV data:', error);
      process.exit(1);
    }
  });
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
} 