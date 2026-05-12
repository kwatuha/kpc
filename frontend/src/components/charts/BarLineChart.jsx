import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { tokens } from '../../pages/dashboard/theme';
import {
    ResponsiveContainer,
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';

const BarLineChart = ({ 
    title = 'Chart', 
    data = [], 
    xDataKey = 'name', 
    barKeys = [], 
    lineKeys = [], 
    yAxisLabel = '', 
    horizontal = false 
}) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    // Safety check: ensure barKeys and lineKeys are arrays
    const safeBarKeys = Array.isArray(barKeys) ? barKeys : [];
    const safeLineKeys = Array.isArray(lineKeys) ? lineKeys : [];

    // If no specific keys provided, try to auto-detect from data
    const autoDetectKeys = () => {
        if (!data || data.length === 0) return { bars: [], lines: [] };
        
        const firstItem = data[0];
        if (!firstItem) return { bars: [], lines: [] };
        
        const numericKeys = Object.keys(firstItem).filter(key => 
            key !== xDataKey && 
            typeof firstItem[key] === 'number' && 
            !isNaN(firstItem[key])
        );
        
        // Split between bars and lines (first half as bars, second half as lines)
        const midPoint = Math.ceil(numericKeys.length / 2);
        return {
            bars: numericKeys.slice(0, midPoint),
            lines: numericKeys.slice(midPoint)
        };
    };

    // Use provided keys or auto-detected keys
    const finalBarKeys = safeBarKeys.length > 0 ? safeBarKeys : autoDetectKeys().bars;
    const finalLineKeys = safeLineKeys.length > 0 ? safeLineKeys : autoDetectKeys().lines;

    // Color palette for bars and lines - only using available colors
    const barColors = [colors.blueAccent[500], colors.greenAccent[500], colors.redAccent[500], colors.primary[500]];
    const lineColors = [colors.primary[500], colors.blueAccent[400], colors.greenAccent[400], colors.redAccent[400]];

    if (!data || data.length === 0) {
        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                p: 3
            }}>
                <Typography variant="h6" sx={{ color: colors.grey[600], mb: 1 }}>
                    📊 {title}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.grey[500] }}>
                    No data available for this chart
                </Typography>
            </Box>
        );
    }

    const hasBars = finalBarKeys.length > 0;
    const hasLines = finalLineKeys.length > 0;

    const chartLayout = horizontal ? 'vertical' : 'horizontal';
    const margin = horizontal ? { top: 20, right: 30, left: 100, bottom: 20 } : { top: 20, right: 30, left: 20, bottom: 60 };

    const renderXAxis = () => (
        <XAxis
            dataKey={horizontal ? undefined : xDataKey}
            type={horizontal ? 'number' : 'category'}
            angle={horizontal ? 0 : -45}
            textAnchor={horizontal ? 'middle' : 'end'}
            height={horizontal ? 30 : 70}
            interval={0}
        />
    );

    const renderYAxis = () => (
        <YAxis
            dataKey={horizontal ? xDataKey : undefined}
            type={horizontal ? 'category' : 'number'}
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
        />
    );

    return (
        <Box sx={{ 
            width: '100%', 
            height: '100%',
            p: 2
        }}>
            <Typography variant="h6" align="center" gutterBottom sx={{ 
                color: theme.palette.mode === 'dark' ? colors.grey[200] : colors.grey[800],
                fontWeight: 600
            }}>
                {title}
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
                <ComposedChart data={data} layout={chartLayout} margin={margin}>
                    <CartesianGrid strokeDasharray="3 3" />
                    {renderXAxis()}
                    {renderYAxis()}
                    <Tooltip />
                    <Legend />
                    {hasBars && finalBarKeys.map((key, index) => (
                        <Bar 
                            key={key} 
                            dataKey={key} 
                            fill={barColors[index % barColors.length]} 
                        />
                    ))}
                    {hasLines && finalLineKeys.map((key, index) => (
                        <Line 
                            key={key} 
                            type="monotone" 
                            dataKey={key} 
                            stroke={lineColors[index % lineColors.length]} 
                        />
                    ))}
                </ComposedChart>
            </ResponsiveContainer>
        </Box>
    );
};

export default BarLineChart;