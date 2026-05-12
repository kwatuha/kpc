import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Star,
  ThumbUp,
  Assessment,
  Visibility
} from '@mui/icons-material';
import axiosInstance from '../../api/axiosInstance';

const FeedbackAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackData, setFeedbackData] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchFeedbackAnalytics();
  }, []);

  const fetchFeedbackAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/public/feedback?limit=1000');
      const feedbacks = response.data.feedbacks || [];
      
      // Calculate analytics
      const analyticsData = calculateAnalytics(feedbacks);
      setFeedbackData(feedbacks);
      setAnalytics(analyticsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching feedback analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (feedbacks) => {
    const withRatings = feedbacks.filter(f => 
      f.rating_overall_support !== null ||
      f.rating_quality_of_life_impact !== null ||
      f.rating_community_alignment !== null ||
      f.rating_transparency !== null ||
      f.rating_feasibility_confidence !== null
    );

    if (withRatings.length === 0) {
      return {
        totalWithRatings: 0,
        averages: {},
        distributions: {},
        byProject: [],
        trendData: []
      };
    }

    // Calculate averages
    const averages = {
      overall_support: calculateAverage(withRatings, 'rating_overall_support'),
      quality_of_life: calculateAverage(withRatings, 'rating_quality_of_life_impact'),
      community_alignment: calculateAverage(withRatings, 'rating_community_alignment'),
      transparency: calculateAverage(withRatings, 'rating_transparency'),
      feasibility: calculateAverage(withRatings, 'rating_feasibility_confidence')
    };

    // Calculate distributions
    const distributions = {
      overall_support: calculateDistribution(withRatings, 'rating_overall_support'),
      quality_of_life: calculateDistribution(withRatings, 'rating_quality_of_life_impact'),
      community_alignment: calculateDistribution(withRatings, 'rating_community_alignment'),
      transparency: calculateDistribution(withRatings, 'rating_transparency'),
      feasibility: calculateDistribution(withRatings, 'rating_feasibility_confidence')
    };

    // Calculate by project
    const byProject = calculateByProject(withRatings);

    // Calculate trends (monthly)
    const trendData = calculateTrends(withRatings);

    return {
      totalWithRatings: withRatings.length,
      averages,
      distributions,
      byProject,
      trendData
    };
  };

  const calculateAverage = (feedbacks, field) => {
    const values = feedbacks.map(f => f[field]).filter(v => v !== null && v !== undefined);
    if (values.length === 0) return 0;
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
  };

  const calculateDistribution = (feedbacks, field) => {
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedbacks.forEach(f => {
      const value = f[field];
      if (value >= 1 && value <= 5) {
        dist[value]++;
      }
    });
    return Object.entries(dist).map(([rating, count]) => ({
      rating: `${rating} Star${rating > 1 ? 's' : ''}`,
      count,
      percentage: feedbacks.length > 0 ? ((count / feedbacks.length) * 100).toFixed(1) : 0
    }));
  };

  const calculateByProject = (feedbacks) => {
    const projectMap = {};
    
    feedbacks.forEach(f => {
      if (!f.project_name) return;
      
      if (!projectMap[f.project_name]) {
        projectMap[f.project_name] = {
          name: f.project_name,
          count: 0,
          overall_support: [],
          quality_of_life: [],
          community_alignment: [],
          transparency: [],
          feasibility: []
        };
      }
      
      projectMap[f.project_name].count++;
      if (f.rating_overall_support) projectMap[f.project_name].overall_support.push(f.rating_overall_support);
      if (f.rating_quality_of_life_impact) projectMap[f.project_name].quality_of_life.push(f.rating_quality_of_life_impact);
      if (f.rating_community_alignment) projectMap[f.project_name].community_alignment.push(f.rating_community_alignment);
      if (f.rating_transparency) projectMap[f.project_name].transparency.push(f.rating_transparency);
      if (f.rating_feasibility_confidence) projectMap[f.project_name].feasibility.push(f.rating_feasibility_confidence);
    });

    return Object.values(projectMap).map(project => ({
      name: project.name,
      count: project.count,
      avg_overall: average(project.overall_support),
      avg_quality: average(project.quality_of_life),
      avg_alignment: average(project.community_alignment),
      avg_transparency: average(project.transparency),
      avg_feasibility: average(project.feasibility)
    })).sort((a, b) => b.count - a.count);
  };

  const calculateTrends = (feedbacks) => {
    const monthMap = {};
    
    feedbacks.forEach(f => {
      const date = new Date(f.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = {
          month: monthKey,
          count: 0,
          overall_support: [],
          quality_of_life: [],
          community_alignment: [],
          transparency: [],
          feasibility: []
        };
      }
      
      monthMap[monthKey].count++;
      if (f.rating_overall_support) monthMap[monthKey].overall_support.push(f.rating_overall_support);
      if (f.rating_quality_of_life_impact) monthMap[monthKey].quality_of_life.push(f.rating_quality_of_life_impact);
      if (f.rating_community_alignment) monthMap[monthKey].community_alignment.push(f.rating_community_alignment);
      if (f.rating_transparency) monthMap[monthKey].transparency.push(f.rating_transparency);
      if (f.rating_feasibility_confidence) monthMap[monthKey].feasibility.push(f.rating_feasibility_confidence);
    });

    return Object.values(monthMap).map(month => ({
      month: month.month,
      count: month.count,
      avg_overall: average(month.overall_support),
      avg_quality: average(month.quality_of_life),
      avg_alignment: average(month.community_alignment),
      avg_transparency: average(month.transparency),
      avg_feasibility: average(month.feasibility)
    })).sort((a, b) => a.month.localeCompare(b.month));
  };

  const average = (arr) => {
    if (!arr || arr.length === 0) return 0;
    return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#4caf50';
    if (rating >= 3.5) return '#8bc34a';
    if (rating >= 2.5) return '#fdd835';
    if (rating >= 1.5) return '#ff9800';
    return '#f44336';
  };

  const getRatingLabel = (rating) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 3.5) return 'Good';
    if (rating >= 2.5) return 'Average';
    if (rating >= 1.5) return 'Poor';
    return 'Very Poor';
  };

  const COLORS = ['#f44336', '#ff9800', '#fdd835', '#8bc34a', '#4caf50'];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!analytics || analytics.totalWithRatings === 0) {
    return (
      <Paper sx={{ p: 6, textAlign: 'center' }}>
        <Star sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No ratings data available yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ratings will appear here once citizens start rating projects
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ background: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)', color: 'white', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ThumbUp sx={{ mr: 1 }} />
                <Typography variant="body2">Overall Support</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {analytics.averages.overall_support}
              </Typography>
              <Typography variant="caption">
                out of 5.0
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)', color: 'white', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp sx={{ mr: 1 }} />
                <Typography variant="body2">Quality of Life</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {analytics.averages.quality_of_life}
              </Typography>
              <Typography variant="caption">
                out of 5.0
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)', color: 'white', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Star sx={{ mr: 1 }} />
                <Typography variant="body2">Alignment</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {analytics.averages.community_alignment}
              </Typography>
              <Typography variant="caption">
                out of 5.0
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)', color: 'white', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Visibility sx={{ mr: 1 }} />
                <Typography variant="body2">Implementation/Supervision</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {analytics.averages.transparency}
              </Typography>
              <Typography variant="caption">
                out of 5.0
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ background: 'linear-gradient(135deg, #00bcd4 0%, #4dd0e1 100%)', color: 'white', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assessment sx={{ mr: 1 }} />
                <Typography variant="body2">Feasibility</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {analytics.averages.feasibility}
              </Typography>
              <Typography variant="caption">
                out of 5.0
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth">
          <Tab label="Overview" />
          <Tab label="By Project" />
          <Tab label="Trends" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={2}>
          {/* Row 1: Bar Chart - Full Width */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, pb: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: '1rem', mb: 1 }}>
                Average Ratings Comparison
              </Typography>
              <ResponsiveContainer width={500} height={500}>
                <BarChart data={[
                  { name: 'Overall Support', value: parseFloat(analytics.averages.overall_support) },
                  { name: 'Quality of Life', value: parseFloat(analytics.averages.quality_of_life) },
                  { name: 'Community Alignment', value: parseFloat(analytics.averages.community_alignment) },
                  { name: 'Implementation/Supervision', value: parseFloat(analytics.averages.transparency) },
                  { name: 'Feasibility Confidence', value: parseFloat(analytics.averages.feasibility) }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-15} 
                    textAnchor="end" 
                    height={150}
                    tick={{ fontSize: 13, fill: '#333', fontWeight: 'bold' }}
                    interval={0}
                    tickFormatter={(value) => {
                      // Use clean, short labels as specified
                      const labelMap = {
                        'Overall Support': 'Support',
                        'Quality of Life': 'Quality',
                        'Community Alignment': 'Alignment',
                        'Implementation/Supervision': 'Implementation',
                        'Feasibility Confidence': 'Feasibility'
                      };
                      return labelMap[value] || value;
                    }}
                  />
                  <YAxis 
                    domain={[0, 5]} 
                    tick={{ fontSize: 14, fill: '#333', fontWeight: 'bold' }}
                    tickCount={6}
                  />
                  <Tooltip 
                    formatter={(value, name) => [value.toFixed(2), 'Rating']}
                    labelFormatter={(label) => `Dimension: ${label}`}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    wrapperStyle={{ paddingTop: '10px' }}
                  />
                  <Bar dataKey="value" fill="#2196f3" name="Average Rating">
                    {[0, 1, 2, 3, 4].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[4 - index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Row 2: All 5 Distribution Charts */}
          {/* First 2 Distribution Charts */}
          {['overall_support', 'quality_of_life'].map((dimension, idx) => (
            <Grid item xs={12} sm={6} md={2.4} key={dimension}>
              <Paper sx={{ p: 1.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.85rem', textAlign: 'center', mb: 0.5 }}>
                  {['Overall Support', 'Quality of Life'][idx]}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                  <ResponsiveContainer width={250} height={250}>
                    <PieChart>
                      <Pie
                        data={analytics.distributions[dimension]}
                        dataKey="count"
                        nameKey="rating"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={30}
                        label={(entry) => `${entry.rating}⭐`}
                        labelLine={false}
                      >
                        {analytics.distributions[dimension].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${value} (${props.payload.percentage}%)`,
                          'Count'
                        ]}
                        labelFormatter={(label) => `${label} Stars`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                {/* Legend below chart */}
                <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5 }}>
                  {analytics.distributions[dimension].map((entry, index) => (
                    <Chip
                      key={index}
                      label={`${entry.rating}⭐: ${entry.percentage}%`}
                      size="small"
                      sx={{
                        backgroundColor: COLORS[index],
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.65rem',
                        height: '20px'
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>
          ))}

          {/* Remaining 3 Distribution Charts */}
          {['community_alignment', 'transparency', 'feasibility'].map((dimension, idx) => (
            <Grid item xs={12} sm={6} md={2.4} key={dimension}>
              <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ textAlign: 'center', fontSize: '0.9rem', mb: 0.5 }}>
                  {['Community Alignment', 'Implementation/Supervision', 'Feasibility'][idx]}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.distributions[dimension]}
                        dataKey="count"
                        nameKey="rating"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={35}
                        label={(entry) => `${entry.rating}⭐: ${entry.percentage}%`}
                        labelLine={false}
                      >
                        {analytics.distributions[dimension].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${value} (${props.payload.percentage}%)`,
                          'Count'
                        ]}
                        labelFormatter={(label) => `${label} Stars`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                {/* Legend below chart */}
                <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5 }}>
                  {analytics.distributions[dimension].map((entry, index) => (
                    <Chip
                      key={index}
                      label={`${entry.rating}⭐: ${entry.percentage}%`}
                      size="small"
                      sx={{
                        backgroundColor: COLORS[index],
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                        height: '22px'
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 1 && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Project Name</strong></TableCell>
                  <TableCell align="center"><strong>Feedbacks</strong></TableCell>
                  <TableCell align="center"><strong>Support</strong></TableCell>
                  <TableCell align="center"><strong>Quality</strong></TableCell>
                  <TableCell align="center"><strong>Alignment</strong></TableCell>
                  <TableCell align="center"><strong>Implementation/Supervision</strong></TableCell>
                  <TableCell align="center"><strong>Feasibility</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analytics.byProject.slice(0, 20).map((project) => (
                  <TableRow key={project.name} hover>
                    <TableCell>{project.name}</TableCell>
                    <TableCell align="center">
                      <Chip label={project.count} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={project.avg_overall || 'N/A'} 
                        size="small"
                        sx={{ 
                          backgroundColor: project.avg_overall ? getRatingColor(project.avg_overall) : '#e0e0e0',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={project.avg_quality || 'N/A'} 
                        size="small"
                        sx={{ 
                          backgroundColor: project.avg_quality ? getRatingColor(project.avg_quality) : '#e0e0e0',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={project.avg_alignment || 'N/A'} 
                        size="small"
                        sx={{ 
                          backgroundColor: project.avg_alignment ? getRatingColor(project.avg_alignment) : '#e0e0e0',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={project.avg_transparency || 'N/A'} 
                        size="small"
                        sx={{ 
                          backgroundColor: project.avg_transparency ? getRatingColor(project.avg_transparency) : '#e0e0e0',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={project.avg_feasibility || 'N/A'} 
                        size="small"
                        sx={{ 
                          backgroundColor: project.avg_feasibility ? getRatingColor(project.avg_feasibility) : '#e0e0e0',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {activeTab === 2 && (
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Rating Trends Over Time
          </Typography>
          <ResponsiveContainer width="100%" height={650}>
            <LineChart data={analytics.trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#333', fontWeight: 'bold' }}
                angle={-15}
                textAnchor="end"
                height={100}
              />
              <YAxis 
                domain={[0, 5]} 
                tick={{ fontSize: 12, fill: '#333', fontWeight: 'bold' }}
                tickCount={6}
              />
              <Tooltip 
                formatter={(value, name) => [value ? value.toFixed(2) : 'N/A', name]}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Legend 
                verticalAlign="bottom" 
                height={60}
                wrapperStyle={{ 
                  paddingTop: '15px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
                iconType="circle"
              />
              <Line 
                type="monotone" 
                dataKey="avg_overall" 
                stroke="#2196f3" 
                name="Overall Support" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="avg_quality" 
                stroke="#4caf50" 
                name="Quality of Life" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="avg_alignment" 
                stroke="#ff9800" 
                name="Community Alignment" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="avg_transparency" 
                stroke="#9c27b0" 
                name="Implementation/Supervision" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="avg_feasibility" 
                stroke="#00bcd4" 
                name="Feasibility Confidence" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      )}
    </Box>
  );
};

export default FeedbackAnalytics;