// Country area data and similar size comparisons
interface CountryArea {
  name: string;
  area_km2: number;
  area_sq_miles: number;
}

// Sample country area data (in km²)
const countryAreas: CountryArea[] = [
  { name: "Russia", area_km2: 17098242, area_sq_miles: 6601670 },
  { name: "Canada", area_km2: 9984670, area_sq_miles: 3855100 },
  { name: "China", area_km2: 9596961, area_sq_miles: 3705407 },
  { name: "United States", area_km2: 9525067, area_sq_miles: 3678000 },
  { name: "Brazil", area_km2: 8514877, area_sq_miles: 3287956 },
  { name: "Australia", area_km2: 7692024, area_sq_miles: 2969907 },
  { name: "India", area_km2: 3287263, area_sq_miles: 1269339 },
  { name: "Argentina", area_km2: 2780400, area_sq_miles: 1073518 },
  { name: "Kazakhstan", area_km2: 2724900, area_sq_miles: 1052339 },
  { name: "Algeria", area_km2: 2381741, area_sq_miles: 919595 },
  { name: "Democratic Republic of the Congo", area_km2: 2344858, area_sq_miles: 905355 },
  { name: "Saudi Arabia", area_km2: 2149690, area_sq_miles: 830000 },
  { name: "Mexico", area_km2: 1964375, area_sq_miles: 758449 },
  { name: "Indonesia", area_km2: 1904569, area_sq_miles: 735358 },
  { name: "Sudan", area_km2: 1886068, area_sq_miles: 728215 },
  { name: "Libya", area_km2: 1759540, area_sq_miles: 679362 },
  { name: "Iran", area_km2: 1648195, area_sq_miles: 636372 },
  { name: "Mongolia", area_km2: 1564110, area_sq_miles: 603909 },
  { name: "Peru", area_km2: 1285216, area_sq_miles: 496225 },
  { name: "Chad", area_km2: 1284000, area_sq_miles: 495755 },
  { name: "Niger", area_km2: 1267000, area_sq_miles: 489191 },
  { name: "Angola", area_km2: 1246700, area_sq_miles: 481354 },
  { name: "Mali", area_km2: 1240192, area_sq_miles: 478841 },
  { name: "South Africa", area_km2: 1221037, area_sq_miles: 471443 },
  { name: "Ethiopia", area_km2: 1104300, area_sq_miles: 426373 },
  { name: "Colombia", area_km2: 1141748, area_sq_miles: 440831 },
  { name: "Bolivia", area_km2: 1098581, area_sq_miles: 424164 },
  { name: "Mauritania", area_km2: 1030700, area_sq_miles: 397956 },
  { name: "Egypt", area_km2: 1001449, area_sq_miles: 386662 },
  { name: "Tanzania", area_km2: 945087, area_sq_miles: 364900 },
  { name: "Nigeria", area_km2: 923768, area_sq_miles: 356669 },
  { name: "Venezuela", area_km2: 916445, area_sq_miles: 353841 },
  { name: "Namibia", area_km2: 825615, area_sq_miles: 318772 },
  { name: "Mozambique", area_km2: 801590, area_sq_miles: 309496 },
  { name: "Pakistan", area_km2: 796095, area_sq_miles: 307374 },
  { name: "Turkey", area_km2: 783562, area_sq_miles: 302535 },
  { name: "Chile", area_km2: 756102, area_sq_miles: 291930 },
  { name: "Zambia", area_km2: 752618, area_sq_miles: 290586 },
  { name: "Myanmar", area_km2: 676578, area_sq_miles: 261228 },
  { name: "Afghanistan", area_km2: 652230, area_sq_miles: 251827 },
  { name: "South Sudan", area_km2: 644329, area_sq_miles: 248777 },
  { name: "France", area_km2: 643801, area_sq_miles: 248573 },
  { name: "Somalia", area_km2: 637657, area_sq_miles: 246201 },
  { name: "Central African Republic", area_km2: 622984, area_sq_miles: 240535 },
  { name: "Ukraine", area_km2: 603550, area_sq_miles: 233032 },
  { name: "Madagascar", area_km2: 587041, area_sq_miles: 226658 },
  { name: "Botswana", area_km2: 581730, area_sq_miles: 224607 },
  { name: "Kenya", area_km2: 580367, area_sq_miles: 224081 },
  { name: "Yemen", area_km2: 527968, area_sq_miles: 203850 },
  { name: "Thailand", area_km2: 513120, area_sq_miles: 198117 },
  { name: "Spain", area_km2: 505992, area_sq_miles: 195365 },
  { name: "Turkmenistan", area_km2: 488100, area_sq_miles: 188456 },
  { name: "Cameroon", area_km2: 475442, area_sq_miles: 183569 },
  { name: "Papua New Guinea", area_km2: 462840, area_sq_miles: 178704 },
  { name: "Sweden", area_km2: 450295, area_sq_miles: 173860 },
  { name: "Uzbekistan", area_km2: 447400, area_sq_miles: 172742 },
  { name: "Morocco", area_km2: 446550, area_sq_miles: 172414 },
  { name: "Iraq", area_km2: 438317, area_sq_miles: 169235 },
  { name: "Paraguay", area_km2: 406752, area_sq_miles: 157048 },
  { name: "Zimbabwe", area_km2: 390757, area_sq_miles: 150872 },
  { name: "Norway", area_km2: 385207, area_sq_miles: 148729 },
  { name: "Japan", area_km2: 377975, area_sq_miles: 145937 },
  { name: "Germany", area_km2: 357114, area_sq_miles: 137882 },
  { name: "Republic of the Congo", area_km2: 342000, area_sq_miles: 132047 },
  { name: "Finland", area_km2: 338424, area_sq_miles: 130688 },
  { name: "Vietnam", area_km2: 331212, area_sq_miles: 127882 },
  { name: "Malaysia", area_km2: 330803, area_sq_miles: 127720 },
  { name: "Poland", area_km2: 312679, area_sq_miles: 120726 },
  { name: "Oman", area_km2: 309500, area_sq_miles: 119499 },
  { name: "Italy", area_km2: 301340, area_sq_miles: 116348 },
  { name: "Philippines", area_km2: 300000, area_sq_miles: 115831 },
  { name: "Ecuador", area_km2: 283561, area_sq_miles: 109484 },
  { name: "Burkina Faso", area_km2: 274200, area_sq_miles: 105869 },
  { name: "New Zealand", area_km2: 270467, area_sq_miles: 104454 },
  { name: "Gabon", area_km2: 267668, area_sq_miles: 103347 },
  { name: "Guinea", area_km2: 245857, area_sq_miles: 94926 },
  { name: "United Kingdom", area_km2: 242900, area_sq_miles: 93780 },
  { name: "Ghana", area_km2: 238533, area_sq_miles: 92108 },
  { name: "Romania", area_km2: 238391, area_sq_miles: 92043 },
  { name: "Laos", area_km2: 236800, area_sq_miles: 91429 },
  { name: "Uganda", area_km2: 241550, area_sq_miles: 93265 },
  { name: "Guyana", area_km2: 214969, area_sq_miles: 83000 },
  { name: "Belarus", area_km2: 207600, area_sq_miles: 80155 },
  { name: "Senegal", area_km2: 196722, area_sq_miles: 75955 },
  { name: "Syria", area_km2: 185180, area_sq_miles: 71498 },
  { name: "Cambodia", area_km2: 181035, area_sq_miles: 69898 },
  { name: "Uruguay", area_km2: 176215, area_sq_miles: 68037 },
  { name: "Tunisia", area_km2: 163610, area_sq_miles: 63170 },
  { name: "Suriname", area_km2: 163820, area_sq_miles: 63251 },
  { name: "Bangladesh", area_km2: 147570, area_sq_miles: 56977 },
  { name: "Nepal", area_km2: 147181, area_sq_miles: 56827 },
  { name: "Tajikistan", area_km2: 143100, area_sq_miles: 55251 },
  { name: "Greece", area_km2: 131957, area_sq_miles: 50949 },
  { name: "Nicaragua", area_km2: 130373, area_sq_miles: 50337 },
  { name: "North Korea", area_km2: 120538, area_sq_miles: 46540 },
  { name: "Malawi", area_km2: 118484, area_sq_miles: 45747 },
  { name: "Eritrea", area_km2: 117600, area_sq_miles: 45405 },
  { name: "Benin", area_km2: 112622, area_sq_miles: 43483 },
  { name: "Honduras", area_km2: 112492, area_sq_miles: 43433 },
  { name: "Liberia", area_km2: 111369, area_sq_miles: 43000 },
  { name: "Bulgaria", area_km2: 110879, area_sq_miles: 42811 },
  { name: "Cuba", area_km2: 109884, area_sq_miles: 42426 },
  { name: "Guatemala", area_km2: 108889, area_sq_miles: 42042 },
  { name: "Iceland", area_km2: 103000, area_sq_miles: 39768 },
  { name: "South Korea", area_km2: 100210, area_sq_miles: 38691 },
  { name: "Hungary", area_km2: 93028, area_sq_miles: 35918 },
  { name: "Portugal", area_km2: 92090, area_sq_miles: 35556 },
  { name: "Jordan", area_km2: 89342, area_sq_miles: 34495 },
  { name: "Serbia", area_km2: 88361, area_sq_miles: 34116 },
  { name: "Azerbaijan", area_km2: 86600, area_sq_miles: 33436 },
  { name: "Austria", area_km2: 83871, area_sq_miles: 32387 },
  { name: "United Arab Emirates", area_km2: 83600, area_sq_miles: 32278 },
  { name: "Czech Republic", area_km2: 78867, area_sq_miles: 30451 },
  { name: "Panama", area_km2: 75417, area_sq_miles: 29119 },
  { name: "Sierra Leone", area_km2: 71740, area_sq_miles: 27699 },
  { name: "Ireland", area_km2: 70273, area_sq_miles: 27133 },
  { name: "Georgia", area_km2: 69700, area_sq_miles: 26911 },
  { name: "Sri Lanka", area_km2: 65610, area_sq_miles: 25332 },
  { name: "Lithuania", area_km2: 65300, area_sq_miles: 25213 },
  { name: "Latvia", area_km2: 64589, area_sq_miles: 24938 },
  { name: "Togo", area_km2: 56785, area_sq_miles: 21921 },
  { name: "Croatia", area_km2: 56594, area_sq_miles: 21851 },
  { name: "Bosnia and Herzegovina", area_km2: 51209, area_sq_miles: 19772 },
  { name: "Costa Rica", area_km2: 51100, area_sq_miles: 19729 },
  { name: "Slovakia", area_km2: 49035, area_sq_miles: 18933 },
  { name: "Dominican Republic", area_km2: 48670, area_sq_miles: 18792 },
  { name: "Estonia", area_km2: 45227, area_sq_miles: 17462 },
  { name: "Denmark", area_km2: 43094, area_sq_miles: 16639 },
  { name: "Netherlands", area_km2: 41850, area_sq_miles: 16156 },
  { name: "Switzerland", area_km2: 41284, area_sq_miles: 15940 },
  { name: "Bhutan", area_km2: 38394, area_sq_miles: 14824 },
  { name: "Guinea-Bissau", area_km2: 36125, area_sq_miles: 13948 },
  { name: "Taiwan", area_km2: 36193, area_sq_miles: 13972 },
  { name: "Moldova", area_km2: 33846, area_sq_miles: 13068 },
  { name: "Belgium", area_km2: 30528, area_sq_miles: 11787 },
  { name: "Lesotho", area_km2: 30355, area_sq_miles: 11720 },
  { name: "Armenia", area_km2: 29743, area_sq_miles: 11484 },
  { name: "Albania", area_km2: 28748, area_sq_miles: 11099 },
  { name: "Solomon Islands", area_km2: 28896, area_sq_miles: 11156 },
  { name: "Equatorial Guinea", area_km2: 28051, area_sq_miles: 10831 },
  { name: "Burundi", area_km2: 27834, area_sq_miles: 10747 },
  { name: "Haiti", area_km2: 27750, area_sq_miles: 10714 },
  { name: "Rwanda", area_km2: 26338, area_sq_miles: 10169 },
  { name: "North Macedonia", area_km2: 25713, area_sq_miles: 9928 },
  { name: "Djibouti", area_km2: 23200, area_sq_miles: 8958 },
  { name: "Belize", area_km2: 22966, area_sq_miles: 8867 },
  { name: "El Salvador", area_km2: 21041, area_sq_miles: 8124 },
  { name: "Israel", area_km2: 20770, area_sq_miles: 8019 },
  { name: "Slovenia", area_km2: 20273, area_sq_miles: 7827 },
  { name: "Fiji", area_km2: 18272, area_sq_miles: 7055 },
  { name: "Kuwait", area_km2: 17818, area_sq_miles: 6880 },
  { name: "Swaziland", area_km2: 17364, area_sq_miles: 6704 },
  { name: "East Timor", area_km2: 14874, area_sq_miles: 5743 },
  { name: "Bahamas", area_km2: 13943, area_sq_miles: 5383 },
  { name: "Montenegro", area_km2: 13812, area_sq_miles: 5333 },
  { name: "Vanuatu", area_km2: 12189, area_sq_miles: 4706 },
  { name: "Qatar", area_km2: 11586, area_sq_miles: 4473 },
  { name: "Gambia", area_km2: 10689, area_sq_miles: 4127 },
  { name: "Jamaica", area_km2: 10991, area_sq_miles: 4244 },
  { name: "Lebanon", area_km2: 10452, area_sq_miles: 4035 },
  { name: "Cyprus", area_km2: 9251, area_sq_miles: 3572 },
  { name: "Brunei", area_km2: 5765, area_sq_miles: 2226 },
  { name: "Trinidad and Tobago", area_km2: 5130, area_sq_miles: 1981 },
  { name: "Cape Verde", area_km2: 4033, area_sq_miles: 1557 },
  { name: "Samoa", area_km2: 2842, area_sq_miles: 1097 },
  { name: "Luxembourg", area_km2: 2586, area_sq_miles: 999 },
  { name: "Comoros", area_km2: 1862, area_sq_miles: 719 },
  { name: "Mauritius", area_km2: 2040, area_sq_miles: 788 },
  { name: "São Tomé and Príncipe", area_km2: 964, area_sq_miles: 372 },
  { name: "Kiribati", area_km2: 811, area_sq_miles: 313 },
  { name: "Dominica", area_km2: 751, area_sq_miles: 290 },
  { name: "Tonga", area_km2: 747, area_sq_miles: 288 },
  { name: "Micronesia", area_km2: 702, area_sq_miles: 271 },
  { name: "Singapore", area_km2: 719, area_sq_miles: 278 },
  { name: "Bahrain", area_km2: 765, area_sq_miles: 295 },
  { name: "Palau", area_km2: 459, area_sq_miles: 177 },
  { name: "Seychelles", area_km2: 452, area_sq_miles: 175 },
  { name: "Antigua and Barbuda", area_km2: 442, area_sq_miles: 171 },
  { name: "Andorra", area_km2: 468, area_sq_miles: 181 },
  { name: "Barbados", area_km2: 430, area_sq_miles: 166 },
  { name: "Saint Vincent and the Grenadines", area_km2: 389, area_sq_miles: 150 },
  { name: "Grenada", area_km2: 344, area_sq_miles: 133 },
  { name: "Malta", area_km2: 316, area_sq_miles: 122 },
  { name: "Maldives", area_km2: 300, area_sq_miles: 116 },
  { name: "Saint Kitts and Nevis", area_km2: 261, area_sq_miles: 101 },
  { name: "Marshall Islands", area_km2: 181, area_sq_miles: 70 },
  { name: "Liechtenstein", area_km2: 160, area_sq_miles: 62 },
  { name: "San Marino", area_km2: 61, area_sq_miles: 24 },
  { name: "Tuvalu", area_km2: 26, area_sq_miles: 10 },
  { name: "Nauru", area_km2: 21, area_sq_miles: 8 },
  { name: "Monaco", area_km2: 2, area_sq_miles: 1 },
  { name: "Vatican City", area_km2: 0.44, area_sq_miles: 0.17 }
];

// Function to get country area data
export function getCountryArea(countryName: string): CountryArea | null {
  const normalizedName = countryName.toLowerCase().trim();
  
  // Try exact match first
  let country = countryAreas.find(c => c.name.toLowerCase() === normalizedName);
  
  // Try partial match if exact match fails
  if (!country) {
    country = countryAreas.find(c => c.name.toLowerCase().includes(normalizedName) || normalizedName.includes(c.name.toLowerCase()));
  }
  
  // Handle common country name variations
  if (!country) {
    const variations: { [key: string]: string } = {
      'usa': 'United States',
      'us': 'United States',
      'america': 'United States',
      'uk': 'United Kingdom',
      'britain': 'United Kingdom',
      'drc': 'Democratic Republic of the Congo',
      'congo': 'Democratic Republic of the Congo',
      'south korea': 'South Korea',
      'north korea': 'North Korea',
      'uae': 'United Arab Emirates',
      'czechia': 'Czech Republic',
      'east timor': 'East Timor',
      'swaziland': 'Eswatini',
      'macedonia': 'North Macedonia',
      'vatican': 'Vatican City'
    };
    
    const variation = variations[normalizedName];
    if (variation) {
      country = countryAreas.find(c => c.name === variation);
    }
  }
  
  return country || null;
}

// Function to find a country with similar size
export function findSimilarSizeCountry(countryName: string): string | null {
  const country = getCountryArea(countryName);
  if (!country) return null;
  
  const targetArea = country.area_km2;
  const tolerance = targetArea * 0.2; // 20% tolerance
  
  // Find countries within 20% of the target area
  const similarCountries = countryAreas.filter(c => 
    c.name !== country.name && 
    Math.abs(c.area_km2 - targetArea) <= tolerance
  );
  
  if (similarCountries.length === 0) return null;
  
  // Return the closest match
  const closest = similarCountries.reduce((prev, curr) => 
    Math.abs(curr.area_km2 - targetArea) < Math.abs(prev.area_km2 - targetArea) ? curr : prev
  );
  
  return closest.name;
}

// Function to convert km² to square miles
export function km2ToSqMiles(km2: number): number {
  return Math.round(km2 * 0.386102 * 100) / 100;
}

// Function to convert square miles to km²
export function sqMilesToKm2(sqMiles: number): number {
  return Math.round(sqMiles * 2.58999 * 100) / 100;
}
