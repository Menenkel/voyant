import fs from 'fs';
import path from 'path';

export interface VaccineData {
  country: string;
  ISO3: string;
  mandatoryVaccines: string;
  recommendedVaccines: string;
}

let vaccineDataCache: VaccineData[] | null = null;

export function loadVaccineData(): VaccineData[] {
  if (vaccineDataCache) {
    return vaccineDataCache;
  }

  try {
    const csvPath = path.join(process.cwd(), 'Claimate_Vaccines.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    
    // Skip header line
    const dataLines = lines.slice(1).filter(line => line.trim());
    
    vaccineDataCache = dataLines.map(line => {
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
    
    return vaccineDataCache;
  } catch (error) {
    console.error('Error loading vaccine data:', error);
    return [];
  }
}

export function getVaccineDataByCountry(countryName: string): VaccineData | null {
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

export function getVaccineDataByISO3(iso3: string): VaccineData | null {
  const vaccineData = loadVaccineData();
  
  return vaccineData.find(data => 
    data.ISO3.toLowerCase() === iso3.toLowerCase()
  ) || null;
}

export function formatVaccineInfo(vaccineData: VaccineData): string {
  let info = '';
  
  if (vaccineData.mandatoryVaccines && vaccineData.mandatoryVaccines !== 'None') {
    info += `**Mandatory Vaccines:** ${vaccineData.mandatoryVaccines}\n\n`;
  }
  
  if (vaccineData.recommendedVaccines && vaccineData.recommendedVaccines !== 'None') {
    info += `**Recommended Vaccines:** ${vaccineData.recommendedVaccines}\n\n`;
  }
  
  info += '**IMPORTANT:** Check the latest vaccination requirements online before traveling, as requirements may change.';
  
  return info;
}
