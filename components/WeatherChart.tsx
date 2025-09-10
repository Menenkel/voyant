'use client';

import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WeatherDay {
  date: string;
  max_temp: number;
  min_temp: number;
  precipitation: number;
  wind_speed: number;
  weather_code: number;
  weather_description: string;
}

interface WeatherChartProps {
  forecast: WeatherDay[];
  location: string;
  useImperialUnits?: boolean;
}

const WeatherChart: React.FC<WeatherChartProps> = ({ forecast, location, useImperialUnits = false }) => {
  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const [isDailyExpanded, setIsDailyExpanded] = useState(false);
  
  // Unit conversion functions
  const convertTemperature = (celsius: number): number => {
    return useImperialUnits ? Math.round((celsius * 9/5 + 32) * 10) / 10 : Math.round(celsius * 10) / 10;
  };

  const convertWindSpeed = (kmh: number): number => {
    return useImperialUnits ? Math.round((kmh * 0.621371) * 10) / 10 : Math.round(kmh * 10) / 10;
  };

  const getTemperatureUnit = (): string => {
    return useImperialUnits ? '°F' : '°C';
  };

  const getWindSpeedUnit = (): string => {
    return useImperialUnits ? 'mph' : 'km/h';
  };
  
  // Format dates for display (timezone-safe)
  const formatDate = (dateString: string) => {
    // Parse the date string directly to avoid timezone issues
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Show first 7 days by default for charts, all 16 when expanded
  const chartForecast = isChartExpanded ? forecast : forecast.slice(0, 7);
  const dates = chartForecast.map(day => formatDate(day.date));
  const maxTemps = chartForecast.map(day => convertTemperature(day.max_temp));
  const minTemps = chartForecast.map(day => convertTemperature(day.min_temp));
  const precipitation = chartForecast.map(day => day.precipitation);

  // Show first 4 days by default for daily cards, all 16 when expanded
  const dailyForecast = isDailyExpanded ? forecast : forecast.slice(0, 4);

  // Temperature stream graph data - single dataset showing range
  const temperatureData = {
    labels: dates,
    datasets: [
      {
        label: `Temperature Range (${getTemperatureUnit()})`,
        data: maxTemps,
        borderColor: 'transparent',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(220, 38, 38, 0.8)'); // red-600 at top
          gradient.addColorStop(0.3, 'rgba(251, 146, 60, 0.7)'); // orange-400
          gradient.addColorStop(0.6, 'rgba(156, 163, 175, 0.6)'); // gray-400
          gradient.addColorStop(1, 'rgba(107, 114, 128, 0.5)'); // gray-500 at bottom
          return gradient;
        },
        borderWidth: 0,
        fill: '+1', // Fill to the next dataset (minTemps)
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: '#dc2626',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
      {
        label: `Min Temperature (${getTemperatureUnit()})`,
        data: minTemps,
        borderColor: '#6b7280', // gray-500
        backgroundColor: 'rgba(107, 114, 128, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: '#6b7280',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
    ],
  };

  // Precipitation chart data
  const precipitationData = {
    labels: dates,
    datasets: [
      {
        label: 'Precipitation (mm)',
        data: precipitation,
        backgroundColor: 'rgba(30, 64, 175, 0.6)', // petrol blue (blue-800)
        borderColor: '#1e40af', // petrol blue (blue-800)
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#000000', // black
          font: {
            size: 12,
            weight: '500' as const,
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: true,
        text: `${isChartExpanded ? '16' : '7'}-Day Weather Forecast - ${location}`,
        color: '#000000', // black
        font: {
          size: 16,
          weight: '600' as const,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)', // white with opacity
        titleColor: '#000000', // black
        bodyColor: '#000000', // black
        borderColor: '#000000', // black
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function(context: any) {
            return context[0].label;
          },
          label: function(context: any) {
            const datasetLabel = context.dataset.label;
            const value = context.parsed.y;
            const dataIndex = context.dataIndex;
            
            if (datasetLabel.includes('Temperature Range')) {
              const maxTemp = maxTemps[dataIndex];
              const minTemp = minTemps[dataIndex];
              return `Max: ${maxTemp}${getTemperatureUnit()}, Min: ${minTemp}${getTemperatureUnit()}`;
            } else if (datasetLabel.includes('Min Temperature')) {
              return null; // Hide this dataset from tooltip
            } else if (datasetLabel.includes('Temperature')) {
              return `${datasetLabel}: ${value}${getTemperatureUnit()}`;
            } else if (datasetLabel.includes('Precipitation')) {
              return `${datasetLabel}: ${value}mm`;
            }
            return `${datasetLabel}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.2)', // black with opacity
          drawBorder: false,
        },
        ticks: {
          color: '#000000', // black
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.2)', // black with opacity
          drawBorder: false,
        },
        ticks: {
          color: '#000000', // black
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return value + '°C';
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  const precipitationOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        ...chartOptions.plugins.title,
        text: `${isChartExpanded ? '16' : '7'}-Day Precipitation Forecast - ${location}`,
      },
    },
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        ticks: {
          ...chartOptions.scales.y.ticks,
          callback: function(value: any) {
            return value + 'mm';
          },
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Chart Expand/Collapse Button */}
      {forecast.length > 7 && (
        <div className="flex justify-center">
          <button
            onClick={() => setIsChartExpanded(!isChartExpanded)}
            className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 border-2 border-black"
          >
            {isChartExpanded ? (
              <>
                <span>Show 7-Day Chart</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </>
            ) : (
              <>
                <span>Show 16-Day Chart</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}

      {/* Temperature Stream Graph */}
      <div className="bg-white rounded-lg p-6 border-2 border-black shadow-lg animate-fade-in hover:shadow-xl transition-all duration-300">
        <div className="h-64">
          <Line data={temperatureData} options={chartOptions} />
        </div>
      </div>

      {/* Precipitation Chart */}
      <div className="bg-white rounded-lg p-6 border-2 border-black shadow-lg animate-fade-in hover:shadow-xl transition-all duration-300">
        <div className="h-48">
          <Bar data={precipitationData} options={precipitationOptions} />
        </div>
      </div>

      {/* Daily Weather Summary Cards */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-black">Daily Forecast</h3>
          {forecast.length > 4 && (
            <button
              onClick={() => setIsDailyExpanded(!isDailyExpanded)}
              className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 text-sm border-2 border-black"
            >
              {isDailyExpanded ? (
                <>
                  <span>Show 4 Days</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  <span>Show All {forecast.length} Days</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dailyForecast.map((day, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 text-center border-2 border-black hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg">
              <p className="text-black text-sm font-medium mb-2">
                {formatDate(day.date)}
              </p>
              <div className="text-2xl mb-2 animate-pulse">
                {day.weather_description === 'Clear sky' && '☀️'}
                {day.weather_description === 'Partly cloudy' && '⛅'}
                {day.weather_description === 'Overcast' && '☁️'}
                {day.weather_description === 'Slight rain' && '🌦️'}
                {day.weather_description === 'Moderate rain' && '🌧️'}
                {day.weather_description === 'Heavy rain' && '⛈️'}
                {day.weather_description === 'Thunderstorm' && '⛈️'}
                {day.weather_description === 'Snow' && '❄️'}
                {!['Clear sky', 'Partly cloudy', 'Overcast', 'Slight rain', 'Moderate rain', 'Heavy rain', 'Thunderstorm', 'Snow'].includes(day.weather_description) && '🌤️'}
              </div>
              <p className="text-black font-semibold text-sm mb-1">
                {day.weather_description}
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-red-600 font-semibold">
                  {convertTemperature(day.max_temp)}{getTemperatureUnit()}
                </span>
                <span className="text-gray-500 font-semibold">
                  {convertTemperature(day.min_temp)}{getTemperatureUnit()}
                </span>
              </div>
              <p className="text-gray-600 text-xs mt-1">
                {day.precipitation}mm • {convertWindSpeed(day.wind_speed)} {getWindSpeedUnit()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherChart;
