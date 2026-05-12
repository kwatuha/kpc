// src/components/charts/DonutChart.jsx
import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const DonutChart = ({ title, data, colors }) => {
    // Map data to include colors for the chart and legend
    const chartData = data.map((item, index) => ({
        ...item,
        color: colors[index % colors.length]
    }));

    // Custom Tooltip for better readability
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const dataItem = payload[0].payload;
            return (
                <Box sx={{ p: 1, bgcolor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #ccc' }}>
                    <Typography variant="body2" sx={{ color: dataItem.color, fontWeight: 'bold' }}>{dataItem.name}</Typography>
                    <Typography variant="body2">{`Projects: ${dataItem.value}`}</Typography>
                </Box>
            );
        }
        return null;
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', p: 2, flexWrap: 'wrap' }}>
            <Typography variant="h6" align="center" sx={{ width: '100%', mb: 2 }}>{title}</Typography>
            <Box sx={{ width: '60%', height: '100%', minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            nameKey="name"
                            isAnimationActive={false} // Prevents animation issues
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </RechartsPieChart>
                </ResponsiveContainer>
            </Box>
            <Box sx={{ width: '40%', pl: 2, pr: 1, height: '100%', overflowY: 'auto' }}>
                <List dense>
                    {chartData.map((entry, index) => (
                        <ListItem key={`legend-${index}`} sx={{ p: 0, m: 0 }}>
                            <ListItemIcon sx={{ minWidth: '24px' }}>
                                <Box sx={{ width: 10, height: 10, bgcolor: entry.color, borderRadius: '50%' }} />
                            </ListItemIcon>
                            <ListItemText primary={entry.name} sx={{ m: 0 }} />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Box>
    );
};

export default DonutChart;