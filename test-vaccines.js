const fs = require('fs');
const path = require('path');

// Simple test to verify CSV loading
function loadVaccineData() {
  try {
    const csvPath = path.join(process.cwd(), 'Claimate_Vaccines.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    
    // Skip header line
    const dataLines = lines.slice(1).filter(line => line.trim());
    
    const vaccineData = dataLines.map(line => {
      // Parse CSV line properly handling commas within quoted fields
      const fields = [];
      let currentField = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          fields.push(currentField.trim());
          currentField = '';
        } else {
          currentField += char;
        }
      }
      fields.push(currentField.trim());
      
      const [country, ISO3, mandatoryVaccines, recommendedVaccines] = fields;
      return {
        country: country.replace(/"/g, ''),
        ISO3: ISO3.replace(/"/g, ''),
        mandatoryVaccines: mandatoryVaccines.replace(/"/g, ''),
        recommendedVaccines: recommendedVaccines.replace(/"/g, '')
      };
    });
    
    return vaccineData;
  } catch (error) {
    console.error('Error loading vaccine data:', error);
    return [];
  }
}

function getVaccineDataByISO3(iso3) {
  const vaccineData = loadVaccineData();
  return vaccineData.find(data => 
    data.ISO3.toLowerCase() === iso3.toLowerCase()
  ) || null;
}

function getVaccineDataByCountry(countryName) {
  const vaccineData = loadVaccineData();
  
  // Try exact match first
  let found = vaccineData.find(data => 
    data.country.toLowerCase() === countryName.toLowerCase()
  );
  
  if (found) return found;
  
  // Try partial match
  found = vaccineData.find(data => 
    data.country.toLowerCase().includes(countryName.toLowerCase()) ||
    countryName.toLowerCase().includes(data.country.toLowerCase())
  );
  
  return found || null;
}

console.log('Testing vaccine data loading...');
const data = loadVaccineData();
console.log('Total countries loaded:', data.length);
console.log('Sample data for Austria:', getVaccineDataByISO3('AUT'));
console.log('Sample data for France:', getVaccineDataByCountry('France'));
console.log('Sample data for United States:', getVaccineDataByCountry('United States'));
