// src/components/charts/DonutChart.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';

// Define a new, sharper color palette for generic donut charts
const COLORS = [
  '#007bff', // Bright Blue
  '#ffc107', // Bright Yellow/Orange
  '#28a745', // Bright Green
  '#dc3545', // Bright Red
  '#6f42c1', // Bright Purple
  '#17a2b8', // Bright Cyan
  '#fd7e14', // Bright Orange
  '#6610f2'  // Deep Purple
];

const DonutChart = ({ title, data }) => {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
        <Typography variant="h6" align="center" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary">
          No data available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: 'background.paper' }}>
      <Typography variant="h6" align="center" gutterBottom>{title}</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={90}
            fill="#8884d8" // This fill prop is often overridden by Cell colors, but good to have a default
            paddingAngle={5}
            dataKey="value"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default DonutChart;