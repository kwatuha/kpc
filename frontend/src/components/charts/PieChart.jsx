// src/components/charts/PieChart.jsx

import React from 'react';
import { Box, Typography } from '@mui/material';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RADIAN = Math.PI / 180;
const renderCustomizedPieLabel = ({ cx, cy, midAngle, outerRadius, percent, name, value }) => {
    const radius = outerRadius * 1.1; // Place label slightly outside
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const textAnchor = x > cx ? 'start' : 'end';

    return (
        <text x={x} y={y} fill="black" textAnchor={textAnchor} dominantBaseline="central" fontSize="11px">
            {`${name} (${(percent * 100).toFixed(0)}%)`}
        </text>
    );
};

const PieChart = ({ title, data, dataKey, nameKey, colors }) => {
    const formattedData = data.map((entry, index) => ({
        ...entry,
        color: colors[index % colors.length]
    }));

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6" align="center" gutterBottom>{title}</Typography>
            <ResponsiveContainer width="100%" height="80%">
                <RechartsPieChart>
                    <Pie
                        data={formattedData}
                        dataKey={dataKey}
                        nameKey={nameKey}
                        cx="50%"
                        cy="50%"
                        outerRadius={80} // Slightly reduced radius to make room
                        fill="#8884d8"
                        labelLine={true}
                        label={renderCustomizedPieLabel}
                        isAnimationActive={false}
                    >
                        {formattedData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ paddingTop: '10px' }} />
                </RechartsPieChart>
            </ResponsiveContainer>
        </Box>
    );
};

export default PieChart;