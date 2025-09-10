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
        <div className="bg-white border-2 border-black p-3 rounded-lg shadow-lg z-50">
          <p className="text-black font-semibold">{label}</p>
          {payload.map((entry: { color: string; name: string; value: number }, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: <span className="text-black font-bold">{entry.value}/10</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="mb-2 text-center">
        <p className="text-sm text-gray-600">
          <strong>Higher values = Higher risk</strong> • Scale: 0 (low risk) to 10 (extreme risk)
        </p>
      </div>
      <div className="h-[28rem] p-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#000000" strokeWidth={1.5} />
            <PolarAngleAxis 
              dataKey="indicator" 
              tick={{ fill: '#000000', fontSize: 14, fontWeight: 'bold' }}
              tickLine={{ stroke: '#000000', strokeWidth: 2 }}
              tickFormatter={(value) => value}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 10]} 
              tick={{ fill: '#000000', fontSize: 14, fontWeight: 'bold' }}
              tickLine={{ stroke: '#000000', strokeWidth: 2 }}
              tickCount={6}
            />
            <Radar
              name={firstDestination}
              dataKey={firstDestination}
              stroke="#2563eb"
              fill="#2563eb"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            {secondHazardIndicators && (
              <Radar
                name={secondDestination}
                dataKey={secondDestination}
                stroke="#dc2626"
                fill="#dc2626"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            )}
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
              wrapperStyle={{ zIndex: 1000 }}
            />
            {secondHazardIndicators && (
              <Legend 
                wrapperStyle={{ color: '#000000' }}
                formatter={(value) => (
                  <span style={{ 
                    color: value === firstDestination ? '#2563eb' : '#dc2626',
                    fontWeight: 'bold'
                  }}>
                    {value}
                  </span>
                )}
              />
            )}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
