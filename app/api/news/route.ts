import { NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';

// Cache for RSS feed data
const rssCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

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

interface NewsArticle {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  relevanceScore: number;
}

// Function to fetch and parse RSS feed with caching
async function fetchRSSFeed(): Promise<any> {
  const cacheKey = 'bbc_rss';
  const cached = rssCache.get(cacheKey);
  
  // Check if cache is still valid
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    console.log('Using cached RSS feed data');
    return cached.data;
  }

  try {
    console.log('Fetching fresh RSS feed from BBC');
    const parser = new Parser();
    const feed = await parser.parseURL('https://feeds.bbci.co.uk/news/rss.xml');
    
    // Cache the data
    rssCache.set(cacheKey, {
      data: feed,
      timestamp: Date.now()
    });
    
    return feed;
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    throw new Error('Failed to fetch RSS feed');
  }
}

// Function to calculate relevance score for an article
function calculateRelevanceScore(article: any, cityName: string): number {
  const title = article.title?.toLowerCase() || '';
  const description = article.contentSnippet?.toLowerCase() || article.content?.toLowerCase() || '';
  const combinedText = `${title} ${description}`;
  
  let score = 0;
  
  // City name mentions (higher weight for title)
  const cityLower = cityName.toLowerCase();
  if (title.includes(cityLower)) score += 10;
  if (description.includes(cityLower)) score += 5;
  
  // Tourism keyword matches
  TOURISM_KEYWORDS.forEach(keyword => {
    if (combinedText.includes(keyword.toLowerCase())) {
      score += 2;
    }
  });
  
  return score;
}

// Function to filter and rank articles
function filterAndRankArticles(feed: any, cityName: string): NewsArticle[] {
  if (!feed.items || !Array.isArray(feed.items)) {
    return [];
  }

  const articles: NewsArticle[] = feed.items
    .map((item: any) => {
      const relevanceScore = calculateRelevanceScore(item, cityName);
      
      return {
        title: item.title || 'No title',
        link: item.link || '#',
        description: item.contentSnippet || item.content || 'No description available',
        pubDate: item.pubDate || new Date().toISOString(),
        relevanceScore
      };
    })
    .filter((article: NewsArticle) => article.relevanceScore > 0) // Only include relevant articles
    .sort((a: NewsArticle, b: NewsArticle) => b.relevanceScore - a.relevanceScore) // Sort by relevance
    .slice(0, 5); // Get top 5 articles

  return articles;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

    if (!city) {
      return NextResponse.json(
        { error: 'City parameter is required' },
        { status: 400 }
      );
    }

    console.log(`Fetching news for city: ${city}`);

    // Fetch RSS feed
    const feed = await fetchRSSFeed();
    
    // Filter and rank articles
    const relevantArticles = filterAndRankArticles(feed, city);
    
    console.log(`Found ${relevantArticles.length} relevant articles for ${city}`);

    return NextResponse.json({
      city,
      articles: relevantArticles,
      totalFound: relevantArticles.length,
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
