'use client';

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface RiskRadarChartProps {
  hazardIndicators: { [key: string]: number };
  secondHazardIndicators?: { [key: string]: number };
  firstDestination?: string;
  secondDestination?: string;
}

export default function RiskRadarChart({ 
  hazardIndicators, 
  secondHazardIndicators, 
  firstDestination = 'First Destination', 
  secondDestination = 'Second Destination' 
}: RiskRadarChartProps) {
  // Transform the hazard indicators into the format needed for the radar chart
  const data = Object.entries(hazardIndicators).map(([key, value]) => ({
    indicator: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    [firstDestination]: value,
    ...(secondHazardIndicators && { [secondDestination]: secondHazardIndicators[key] || 0 }),
    fullMark: 10,
  }));

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-yellow-500/30 p-3 rounded-lg shadow-lg z-50">
          <p className="text-white font-semibold">{label}</p>
          {payload.map((entry: { color: string; name: string; value: number }, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: <span className="text-white font-bold">{entry.value}/10</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis 
            dataKey="indicator" 
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
            tickLine={{ stroke: '#374151' }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 10]} 
            tick={{ fill: '#9CA3AF', fontSize: 10 }}
            tickLine={{ stroke: '#374151' }}
          />
          <Radar
            name={firstDestination}
            dataKey={firstDestination}
            stroke="#F59E0B"
            fill="#F59E0B"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          {secondHazardIndicators && (
            <Radar
              name={secondDestination}
              dataKey={secondDestination}
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          )}
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(245, 158, 11, 0.1)' }}
            wrapperStyle={{ zIndex: 1000 }}
          />
          {secondHazardIndicators && (
            <Legend 
              wrapperStyle={{ color: '#9CA3AF' }}
              formatter={(value) => <span style={{ color: '#9CA3AF' }}>{value}</span>}
            />
          )}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
