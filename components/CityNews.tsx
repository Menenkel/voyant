'use client';

import { useState, useEffect } from 'react';

interface NewsArticle {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  relevanceScore: number;
}

interface NewsResponse {
  city: string;
  articles: NewsArticle[];
  totalFound: number;
  lastUpdated: string;
}

interface CityNewsProps {
  city: string;
  title?: string;
}

export default function CityNews({ city, title = "Latest News" }: CityNewsProps) {
  const [newsData, setNewsData] = useState<NewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    
    const fetchNews = async () => {
      if (!city) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const url = `/api/news?city=${encodeURIComponent(city)}`;
        
        // Add timeout to fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(url, { 
          signal: controller.signal 
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch news: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Only update state if component hasn't been cancelled
        if (!isCancelled) {
          setNewsData(data);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Error fetching news:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch news');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchNews();
    
    // Cleanup function to prevent race conditions
    return () => {
      isCancelled = true;
    };
  }, [city]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown date';
    }
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border-2 border-black p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-black flex items-center space-x-2">
            <span className="animate-pulse">📰</span>
            <span>{title}</span>
          </h4>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center space-x-2"
          >
            <span className="text-sm">Loading...</span>
            <span className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-3 text-gray-600">Loading news...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border-2 border-black p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-black flex items-center space-x-2">
            <span>📰</span>
            <span>{title}</span>
          </h4>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center space-x-2"
          >
            <span className="text-sm">{isExpanded ? 'Hide' : 'Show'}</span>
            <span className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
        </div>
        {isExpanded && (
          <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-red-800 font-medium">News Unavailable</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Only check for no news if we have data but no articles
  if (newsData && (!newsData.articles || newsData.articles.length === 0)) {
    return (
      <div className="bg-white rounded-lg border-2 border-black p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-black flex items-center space-x-2">
            <span>📰</span>
            <span>{title}</span>
          </h4>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center space-x-2"
          >
            <span className="text-sm">{isExpanded ? 'Hide' : 'Show'}</span>
            <span className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
        </div>
        {isExpanded && (
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📰</span>
              <div>
                <p className="text-gray-800 font-medium">No Recent News Found</p>
                <p className="text-gray-600 text-sm mt-1">
                  No relevant news articles found for {city} in the last 3 days.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border-2 border-black p-6 animate-fade-in hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-black flex items-center space-x-2">
          <span className="animate-pulse">📰</span>
          <span>{title}</span>
          <span className="text-sm text-gray-500 font-normal">
            ({newsData.totalFound} article{newsData.totalFound !== 1 ? 's' : ''})
          </span>
        </h4>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`transition-colors duration-200 flex items-center space-x-2 ${
            newsData.totalFound > 0 
              ? 'text-blue-600 hover:text-blue-800 font-medium' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <span className="text-sm">
            {isExpanded ? 'Hide' : newsData.totalFound > 0 ? `Show ${newsData.totalFound} article${newsData.totalFound !== 1 ? 's' : ''}` : 'Show'}
          </span>
          <span className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
      </div>
      
      {/* Show preview when collapsed and articles are available */}
      {!isExpanded && newsData.totalFound > 0 && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 font-medium mb-1">
            Latest: {newsData.articles[0].title}
          </p>
          <p className="text-xs text-blue-600">
            Click "Show" above to read the full article
          </p>
        </div>
      )}
      
      {isExpanded && (
        <div className="space-y-4">
        {newsData.articles.map((article, index) => (
          <div 
            key={index}
            className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="flex justify-between items-start mb-2">
              <h5 className="font-semibold text-gray-900 text-sm leading-tight flex-1 mr-3">
                <a 
                  href={article.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 transition-colors duration-200"
                >
                  {article.title}
                </a>
              </h5>
              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full whitespace-nowrap">
                {formatDate(article.pubDate)}
              </span>
            </div>
            
            <p className="text-gray-700 text-sm leading-relaxed mb-3">
              {truncateText(article.description)}
            </p>
            
            <div className="flex justify-between items-center">
              <a 
                href={article.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
              >
                <span>Read more</span>
                <span>↗</span>
              </a>
              <span className="text-xs text-gray-400">
                Relevance: {article.relevanceScore}
              </span>
            </div>
          </div>
        ))}
        
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            News powered by BBC • Last updated: {formatDate(newsData.lastUpdated)}
          </p>
        </div>
        </div>
      )}
    </div>
  );
}
