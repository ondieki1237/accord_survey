// app/admin/results/components/CompetencyRadar.tsx
import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';

interface CompetencyRadarProps {
    data: any[];
}

export const CompetencyRadar: React.FC<CompetencyRadarProps> = ({ data }) => {
    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} />
                    <Radar
                        name="Employee"
                        dataKey="A"
                        stroke="#0089f4"
                        fill="#0089f4"
                        fillOpacity={0.5}
                    />
                    <Radar
                        name="Org Average"
                        dataKey="B"
                        stroke="#94a3b8"
                        fill="#94a3b8"
                        fillOpacity={0.1}
                    />
                    <Legend />
                    <Tooltip />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};
