import { NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';

// Cache for RSS feed data
const rssCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1 * 60 * 60 * 1000; // 1 hour in milliseconds

// Tourism-relevant keywords for filtering
const TOURISM_KEYWORDS = [
  "festival", "concert", "event", "exhibition", "holiday", "celebration",
  "demonstration", "protest", "strike",
  "flight", "airport", "train", "metro", "bus",
  "hotel", "restaurant", "food", "market", "ticket", "price", "inflation",
  "crime", "police", "safety", "security", "attack",
  "weather", "storm", "flood", "heatwave", "drought", "landslide", "health", "vaccination",
  "tsunami", "hail", "tornado", "cyclone", "typhoon",
  "travel", "visa"
];

// Publication names that contain city names but shouldn't match
const PUBLICATION_EXCLUSIONS = [
  "washington post", "washington times", "washington examiner",
  "new york times", "new york post", "new york daily news",
  "los angeles times", "la times",
  "chicago tribune", "chicago sun-times",
  "boston globe", "boston herald",
  "miami herald", "miami times",
  "philadelphia inquirer", "philadelphia daily news",
  "houston chronicle", "houston press",
  "dallas morning news", "dallas times herald",
  "atlanta journal", "atlanta constitution",
  "seattle times", "seattle post-intelligencer",
  "denver post", "denver rocky mountain news",
  "minneapolis star tribune", "minneapolis tribune",
  "detroit free press", "detroit news",
  "cleveland plain dealer", "cleveland press",
  "cincinnati enquirer", "cincinnati post",
  "pittsburgh post-gazette", "pittsburgh press",
  "baltimore sun", "baltimore news-american",
  "st. louis post-dispatch", "st. louis globe-democrat",
  "kansas city star", "kansas city times",
  "milwaukee journal", "milwaukee sentinel",
  "indianapolis star", "indianapolis news",
  "columbus dispatch", "columbus citizen-journal",
  "louisville courier-journal", "louisville times",
  "nashville tennessean", "nashville banner",
  "memphis commercial appeal", "memphis press-scimitar",
  "new orleans times-picayune", "new orleans states-item",
  "oklahoma city oklahoman", "oklahoma city times",
  "tulsa world", "tulsa tribune",
  "albuquerque journal", "albuquerque tribune",
  "phoenix republic", "phoenix gazette",
  "las vegas review-journal", "las vegas sun",
  "salt lake city tribune", "salt lake city deseret news",
  "portland oregonian", "portland journal",
  "sacramento bee", "sacramento union",
  "san jose mercury news", "san jose news",
  "san diego union-tribune", "san diego evening tribune",
  "san antonio express-news", "san antonio light",
  "austin american-statesman", "austin statesman",
  "fort worth star-telegram", "fort worth press",
  "el paso times", "el paso herald-post",
  "corpus christi caller-times", "corpus christi times",
  "laredo morning times", "laredo times",
  "brownsville herald", "brownsville news",
  "mcallen monitor", "mcallen evening news",
  "harlingen valley morning star", "harlingen star",
  "waco tribune-herald", "waco news-tribune",
  "killeen daily herald", "killeen herald",
  "college station eagle", "college station daily",
  "bryan eagle", "bryan daily",
  "temple daily telegram", "temple herald",
  "belton journal", "belton herald",
  "killeen daily herald", "killeen herald",
  "copperas cove leader-press", "copperas cove herald",
  "harker heights herald", "harker heights news",
  "nolanville herald", "nolanville news",
  "lampasas dispatch-record", "lampasas herald",
  "burnet bulletin", "burnet county news",
  "marble falls highlander", "marble falls news",
  "llano county journal", "llano county news",
  "mason county news", "mason county herald",
  "gillespie county news", "gillespie county herald",
  "fredericksburg standard-radio post", "fredericksburg news",
  "kerrville daily times", "kerrville herald",
  "bandera bulletin", "bandera county news",
  "medina county news", "medina county herald",
  "uvalde leader-news", "uvalde herald",
  "real county news", "real county herald",
  "edwards county news", "edwards county herald",
  "kinney county news", "kinney county herald",
  "val verde county news", "val verde county herald",
  "terrell county news", "terrell county herald",
  "brewster county news", "brewster county herald",
  "presidio county news", "presidio county herald",
  "jeff davis county news", "jeff davis county herald",
  "culberson county news", "culberson county herald",
  "hudspeth county news", "hudspeth county herald",
  "el paso county news", "el paso county herald",
  "hudspeth county news", "hudspeth county herald",
  "culberson county news", "culberson county herald",
  "jeff davis county news", "jeff davis county herald",
  "presidio county news", "presidio county herald",
  "brewster county news", "brewster county herald",
  "terrell county news", "terrell county herald",
  "val verde county news", "val verde county herald",
  "kinney county news", "kinney county herald",
  "edwards county news", "edwards county herald",
  "real county news", "real county herald",
  "uvalde leader-news", "uvalde herald",
  "bandera bulletin", "bandera county news",
  "kerrville daily times", "kerrville herald",
  "fredericksburg standard-radio post", "fredericksburg news",
  "gillespie county news", "gillespie county herald",
  "mason county news", "mason county herald",
  "llano county journal", "llano county news",
  "marble falls highlander", "marble falls news",
  "burnet bulletin", "burnet county news",
  "lampasas dispatch-record", "lampasas herald",
  "nolanville herald", "nolanville news",
  "harker heights herald", "harker heights news",
  "copperas cove leader-press", "copperas cove herald",
  "killeen daily herald", "killeen herald",
  "belton journal", "belton herald",
  "temple daily telegram", "temple herald",
  "bryan eagle", "bryan daily",
  "college station eagle", "college station daily",
  "killeen daily herald", "killeen herald",
  "waco tribune-herald", "waco news-tribune",
  "harlingen valley morning star", "harlingen star",
  "mcallen monitor", "mcallen evening news",
  "brownsville herald", "brownsville news",
  "laredo morning times", "laredo times",
  "corpus christi caller-times", "corpus christi times",
  "el paso times", "el paso herald-post",
  "fort worth star-telegram", "fort worth press",
  "austin american-statesman", "austin statesman",
  "san antonio express-news", "san antonio light",
  "san diego union-tribune", "san diego evening tribune",
  "san jose mercury news", "san jose news",
  "sacramento bee", "sacramento union",
  "portland oregonian", "portland journal",
  "salt lake city tribune", "salt lake city deseret news",
  "las vegas review-journal", "las vegas sun",
  "phoenix republic", "phoenix gazette",
  "albuquerque journal", "albuquerque tribune",
  "tulsa world", "tulsa tribune",
  "oklahoma city oklahoman", "oklahoma city times",
  "new orleans times-picayune", "new orleans states-item",
  "memphis commercial appeal", "memphis press-scimitar",
  "nashville tennessean", "nashville banner",
  "louisville courier-journal", "louisville times",
  "columbus dispatch", "columbus citizen-journal",
  "indianapolis star", "indianapolis news",
  "milwaukee journal", "milwaukee sentinel",
  "kansas city star", "kansas city times",
  "st. louis post-dispatch", "st. louis globe-democrat",
  "baltimore sun", "baltimore news-american",
  "pittsburgh post-gazette", "pittsburgh press",
  "cincinnati enquirer", "cincinnati post",
  "cleveland plain dealer", "cleveland press",
  "detroit free press", "detroit news",
  "minneapolis star tribune", "minneapolis tribune",
  "denver post", "denver rocky mountain news",
  "seattle times", "seattle post-intelligencer",
  "atlanta journal", "atlanta constitution",
  "dallas morning news", "dallas times herald",
  "houston chronicle", "houston press",
  "philadelphia inquirer", "philadelphia daily news",
  "miami herald", "miami times",
  "boston globe", "boston herald",
  "chicago tribune", "chicago sun-times",
  "los angeles times", "la times",
  "new york times", "new york post", "new york daily news",
  "washington post", "washington times", "washington examiner"
];

interface NewsArticle {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  relevanceScore: number;
}

// RSS feed sources for better international coverage
const RSS_FEEDS = [
  // UK Sources
  { name: 'BBC', url: 'https://feeds.bbci.co.uk/news/rss.xml' },
  { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { name: 'Guardian', url: 'https://www.theguardian.com/world/rss' },
  
  // US Sources
  { name: 'CNN', url: 'http://rss.cnn.com/rss/edition.rss' },
  { name: 'CNN World', url: 'http://rss.cnn.com/rss/edition_world.rss' },
  { name: 'NPR', url: 'https://feeds.npr.org/1001/rss.xml' },
  { name: 'NPR World', url: 'https://feeds.npr.org/1004/rss.xml' },
  { name: 'PBS', url: 'https://feeds.feedburner.com/PBSNewsHour' },
  
  // International Sources
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
  { name: 'DW News', url: 'https://rss.dw.com/rdf/rss-en-all' },
  { name: 'Reuters', url: 'https://feeds.reuters.com/reuters/topNews' },
  { name: 'AP News', url: 'https://feeds.apnews.com/apnews/topnews' },
  
  // News Aggregators
  { name: 'Google News', url: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en' },
  { name: 'Yahoo News', url: 'https://news.yahoo.com/rss/' },
  
  // Specialized International
  { name: 'BBC Business', url: 'https://feeds.bbci.co.uk/news/business/rss.xml' },
  { name: 'BBC Technology', url: 'https://feeds.bbci.co.uk/news/technology/rss.xml' }
];

// Function to fetch and parse RSS feed with caching
async function fetchRSSFeed(forceRefresh: boolean = false): Promise<any> {
  const cacheKey = 'multi_rss';
  const cached = rssCache.get(cacheKey);
  
  // Check if cache is still valid (unless force refresh is requested)
  if (!forceRefresh && cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    console.log('Using cached RSS feed data');
    return cached.data;
  }

  try {
    console.log('Fetching fresh RSS feeds from multiple sources');
    const parser = new Parser();
    const allItems: any[] = [];
    
    // Fetch from multiple sources
    for (const feedSource of RSS_FEEDS) {
      try {
        const feed = await parser.parseURL(feedSource.url);
        if (feed.items) {
          // Add source information to each item
          feed.items.forEach((item: any) => {
            item.source = feedSource.name;
          });
          allItems.push(...feed.items);
        }
      } catch (error) {
        console.warn(`Failed to fetch ${feedSource.name} feed:`, error);
        // Continue with other feeds even if one fails
      }
    }
    
    // Create a combined feed object
    const combinedFeed = {
      title: 'Combined News Feed',
      items: allItems,
      lastBuildDate: new Date().toISOString()
    };
    
    // Cache the data
    rssCache.set(cacheKey, {
      data: combinedFeed,
      timestamp: Date.now()
    });
    
    return combinedFeed;
  } catch (error) {
    console.error('Error fetching RSS feeds:', error);
    throw new Error('Failed to fetch RSS feeds');
  }
}

// City name variations and aliases for better matching
const CITY_ALIASES: { [key: string]: string[] } = {
  'new york': ['nyc', 'manhattan', 'brooklyn', 'queens', 'bronx', 'staten island'],
  'los angeles': ['la', 'hollywood', 'beverly hills', 'santa monica'],
  'san francisco': ['sf', 'bay area', 'silicon valley'],
  'washington': ['dc', 'washington dc', 'district of columbia'],
  'mumbai': ['bombay'],
  'kolkata': ['calcutta'],
  'chennai': ['madras'],
  'bangalore': ['bengaluru'],
  'pune': ['punjab'],
  'hyderabad': ['secunderabad'],
  'moscow': ['moscow city'],
  'st petersburg': ['saint petersburg', 'leningrad'],
  'rome': ['roma'],
  'milan': ['milano'],
  'naples': ['napoli'],
  'florence': ['firenze'],
  'venice': ['venezia'],
  'munich': ['münchen'],
  'cologne': ['köln'],
  'vienna': ['wien'],
  'prague': ['praha'],
  'budapest': ['budapest city'],
  'warsaw': ['warszawa'],
  'copenhagen': ['københavn'],
  'stockholm': ['stockholm city'],
  'oslo': ['oslo city'],
  'helsinki': ['helsingfors'],
  'madrid': ['madrid city'],
  'barcelona': ['barcelona city'],
  'lisbon': ['lisboa'],
  'athens': ['athina'],
  'istanbul': ['constantinople'],
  'ankara': ['ankara city'],
  'cairo': ['al qahirah'],
  'jerusalem': ['al quds'],
  'tel aviv': ['tel aviv yafo'],
  'dubai': ['dubai city'],
  'riyadh': ['riyadh city'],
  'doha': ['doha city'],
  'kuwait city': ['kuwait'],
  'manama': ['manama city'],
  'muscat': ['muscat city'],
  'abu dhabi': ['abu dhabi city'],
  'singapore': ['singapore city'],
  'hong kong': ['hongkong', 'hk'],
  'taipei': ['taipei city'],
  'seoul': ['seoul city'],
  'tokyo': ['tokyo city', 'tōkyō'],
  'osaka': ['osaka city'],
  'kyoto': ['kyoto city'],
  'yokohama': ['yokohama city'],
  'nagoya': ['nagoya city'],
  'sapporo': ['sapporo city'],
  'fukuoka': ['fukuoka city'],
  'kobe': ['kobe city'],
  'kawasaki': ['kawasaki city'],
  'saitama': ['saitama city'],
  'hiroshima': ['hiroshima city'],
  'sendai': ['sendai city'],
  'chiba': ['chiba city'],
  'kitakyushu': ['kitakyushu city'],
  'sakai': ['sakai city'],
  'niigata': ['niigata city'],
  'hamamatsu': ['hamamatsu city'],
  'okayama': ['okayama city'],
  'kumamoto': ['kumamoto city'],
  'shizuoka': ['shizuoka city'],
  'sagamihara': ['sagamihara city'],
  'nara': ['nara city'],
  'matsuyama': ['matsuyama city'],
  'kagoshima': ['kagoshima city'],
  'funabashi': ['funabashi city'],
  'kashiwa': ['kashiwa city'],
  'himeji': ['himeji city'],
  'machida': ['machida city'],
  'nagasaki': ['nagasaki city'],
  'kumagaya': ['kumagaya city'],
  'okazaki': ['okazaki city'],
  'kawagoe': ['kawagoe city'],
  'hachioji': ['hachioji city'],
  'utsunomiya': ['utsunomiya city'],
  'matsudo': ['matsudo city'],
  'nishinomiya': ['nishinomiya city'],
  'kanazawa': ['kanazawa city'],
  'koshigaya': ['koshigaya city'],
  'katsushika': ['katsushika city'],
  'ota': ['ota city'],
  'matsubara': ['matsubara city'],
  'kawaguchi': ['kawaguchi city'],
  'soka': ['soka city'],
  'toshima': ['toshima city'],
  'minato': ['minato city'],
  'shibuya': ['shibuya city'],
  'shinjuku': ['shinjuku city'],
  'nakano': ['nakano city'],
  'suginami': ['suginami city'],
  'meguro': ['meguro city'],
  'setagaya': ['setagaya city'],
  'ota ward': ['ota ward'],
  'katsushika ward': ['katsushika ward'],
  'edogawa': ['edogawa city'],
  'sumida': ['sumida city'],
  'koto': ['koto city'],
  'chuo': ['chuo city'],
  'chiyoda': ['chiyoda city'],
  'bunkyo': ['bunkyo city'],
  'taito': ['taito city'],
  'arakawa': ['arakawa city'],
  'adachi': ['adachi city'],
  'kita': ['kita city'],
  'itabashi': ['itabashi city'],
  'nerima': ['nerima city'],
  'toshima ward': ['toshima ward'],
  'minato ward': ['minato ward'],
  'shibuya ward': ['shibuya ward'],
  'shinjuku ward': ['shinjuku ward'],
  'nakano ward': ['nakano ward'],
  'suginami ward': ['suginami ward'],
  'meguro ward': ['meguro ward'],
  'setagaya ward': ['setagaya ward'],
  'ota ward': ['ota ward'],
  'katsushika ward': ['katsushika ward'],
  'edogawa ward': ['edogawa ward'],
  'sumida ward': ['sumida ward'],
  'koto ward': ['koto ward'],
  'chuo ward': ['chuo ward'],
  'chiyoda ward': ['chiyoda ward'],
  'bunkyo ward': ['bunkyo ward'],
  'taito ward': ['taito ward'],
  'arakawa ward': ['arakawa ward'],
  'adachi ward': ['adachi ward'],
  'kita ward': ['kita ward'],
  'itabashi ward': ['itabashi ward'],
  'nerima ward': ['nerima ward']
};

// Function to calculate relevance score for an article
function calculateRelevanceScore(article: any, cityName: string): number {
  const title = article.title?.toLowerCase() || '';
  const description = article.contentSnippet?.toLowerCase() || article.content?.toLowerCase() || '';
  const combinedText = `${title} ${description}`;
  
  let score = 0;
  
  // City name mentions (higher weight for title)
  const cityLower = cityName.toLowerCase();
  
  // Extract just the city name (remove country if present)
  const cityOnly = cityLower.split(',')[0].trim();
  const cityWords = cityOnly.split(' ').filter(word => word.length > 2); // Filter out short words like "de", "la", etc.
  
  // Get city aliases for both full name and city-only name
  const aliases = CITY_ALIASES[cityLower] || CITY_ALIASES[cityOnly] || [];
  const allCityNames = [cityLower, cityOnly, ...aliases];
  
  // Check if the article is from a publication that contains the city name but shouldn't match
  const isPublicationExclusion = PUBLICATION_EXCLUSIONS.some(publication => {
    return combinedText.includes(publication.toLowerCase());
  });
  
  if (isPublicationExclusion) {
    return 0; // Exclude articles from publications that contain city names
  }
  
  // Check for exact city name match (including aliases)
  allCityNames.forEach(city => {
    // Use word boundaries to avoid partial matches
    const cityRegex = new RegExp(`\\b${city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (cityRegex.test(title)) score += 10;
    if (cityRegex.test(description)) score += 5;
  });
  
  // For multi-word cities, only check individual words if they're significant
  if (cityWords.length > 1) {
    cityWords.forEach(word => {
      // Only match significant words (longer than 3 characters)
      if (word.length > 3) {
        const wordRegex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (wordRegex.test(title)) score += 2; // Reduced weight for individual words
        if (wordRegex.test(description)) score += 1;
      }
    });
  }
  
  // Only return score if the full city name or a significant alias is mentioned
  const hasFullCityMatch = allCityNames.some(city => {
    const cityRegex = new RegExp(`\\b${city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return cityRegex.test(title) || cityRegex.test(description);
  });
  
  if (!hasFullCityMatch) {
    return 0; // No full city name mention = not relevant
  }
  
  // Tourism keyword matches (only if city is mentioned)
  TOURISM_KEYWORDS.forEach(keyword => {
    if (combinedText.includes(keyword.toLowerCase())) {
      score += 2;
    }
  });
  
  return score;
}

// Function to filter and rank articles
function filterAndRankArticles(feed: any, cityName: string, hoursBack: number = 72): NewsArticle[] {
  if (!feed.items || !Array.isArray(feed.items)) {
    return [];
  }

  // Calculate cutoff time (default: 72 hours back)
  const cutoffTime = new Date(Date.now() - (hoursBack * 60 * 60 * 1000));

  const articles: NewsArticle[] = feed.items
    .map((item: any) => {
      const relevanceScore = calculateRelevanceScore(item, cityName);
      const pubDate = new Date(item.pubDate || new Date().toISOString());
      
      return {
        title: item.title || 'No title',
        link: item.link || '#',
        description: item.contentSnippet || item.content || 'No description available',
        pubDate: item.pubDate || new Date().toISOString(),
        relevanceScore,
        source: item.source || 'Unknown',
        pubDateObj: pubDate
      };
    })
    .filter((article: any) => {
      // Filter by relevance and time
      return article.relevanceScore > 0 && article.pubDateObj >= cutoffTime;
    })
    .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore) // Sort by relevance
    .slice(0, 5) // Get top 5 articles
    .map((article: any) => ({
      title: article.title,
      link: article.link,
      description: article.description,
      pubDate: article.pubDate,
      relevanceScore: article.relevanceScore,
      source: article.source
    }));

  return articles;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const hoursBack = parseInt(searchParams.get('hours') || '72'); // Default to 72 hours (3 days)
    const forceRefresh = searchParams.get('forceRefresh') === 'true';

    if (!city) {
      return NextResponse.json(
        { error: 'City parameter is required' },
        { status: 400 }
      );
    }

    console.log(`Fetching news for city: ${city} (last ${hoursBack} hours)`);

    // Fetch RSS feed (with optional force refresh)
    const feed = await fetchRSSFeed(forceRefresh);
    
    // Filter and rank articles
    const relevantArticles = filterAndRankArticles(feed, city, hoursBack);
    
    console.log(`Found ${relevantArticles.length} relevant articles for ${city}`);

    return NextResponse.json({
      city,
      articles: relevantArticles,
      totalFound: relevantArticles.length,
      hoursBack,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in news API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news articles' },
      { status: 500 }
    );
  }
}
