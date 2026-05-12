import React from 'react';
import { Grid, Box, Typography, LinearProgress } from '@mui/material';
import { Fade } from '@mui/material';
import { Timeline, Warning, Schedule, TrendingDown } from '@mui/icons-material';
import DashboardCard from './DashboardCard';
import LineBarComboChart from '../charts/LineBarComboChart';

const AnalyticsTab = ({ dashboardData, atRiskProjects, totalProjects, completedProjects, delayedProjects, stalledProjects, riskLevel }) => {
    return (
        <Grid container spacing={2}>
            {/* Project Progress (Line/Bar Combo Chart) */}
            <Grid item xs={12} md={9}>
                <Fade in timeout={2000}>
                    <DashboardCard
                        title="Project Progress | Stratified By Departments"
                        icon={<Timeline sx={{ color: 'info.main', fontSize: '1.2rem' }} />}
                        height="400px"
                        color="#009688"
                        hoverColor="rgba(0, 150, 136, 0.2)"
                        gradient="linear-gradient(90deg, #009688, #26a69a, #4db6ac)"
                    >
                        <Box sx={{ height: '320px', minWidth: '700px' }}>
                            {dashboardData.projectProgress.length > 0 ? (
                                <LineBarComboChart
                                    title=""
                                    data={dashboardData.projectProgress}
                                    barKeys={['allocatedBudget', 'contractSum', 'amountPaid']}
                                    xAxisKey="department"
                                    yAxisLabelLeft="Budget/Contract Sum"
                                />
                            ) : (
                                <Box sx={{ 
                                    p: 4, 
                                    border: '2px dashed rgba(0,0,0,0.1)', 
                                    borderRadius: '8px',
                                    textAlign: 'center',
                                    color: 'text.secondary'
                                }}>
                                    No data available
                                </Box>
                            )}
                        </Box>
                    </DashboardCard>
                </Fade>
            </Grid>

            <Grid item xs={12} md={3}>
                <Fade in timeout={2200}>
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 1.5, 
                        height: '400px',
                        justifyContent: 'space-between'
                    }}>
                        {/* Project Risk Level */}
                        <DashboardCard
                            title="Project Risk Level"
                            icon={<Warning sx={{ color: '#f44336', fontSize: '1.2rem' }} />}
                            height="120px"
                            color="#f44336"
                            hoverColor="rgba(244, 67, 54, 0.2)"
                            gradient="linear-gradient(90deg, #f44336, #e57373, #ef5350)"
                        >
                            <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.75rem' }}>
                                        Project Risk Level
                                    </Typography>
                                    <Warning sx={{ color: '#f44336', fontSize: '1.2rem' }} />
                                </Box>
                                <Box>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 0.5 }}>
                                        {riskLevel}%
                                    </Typography>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={riskLevel} 
                                        sx={{ 
                                            height: 6, 
                                            borderRadius: 3,
                                            backgroundColor: 'rgba(0,0,0,0.1)',
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: riskLevel <= 10 ? '#4caf50' : riskLevel <= 20 ? '#ff9800' : '#f44336',
                                                borderRadius: 3
                                            }
                                        }} 
                                    />
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', mt: 0.5, display: 'block' }}>
                                        {riskLevel <= 10 ? 'Low Risk' : riskLevel <= 20 ? 'Medium Risk' : 'High Risk'}
                                    </Typography>
                                </Box>
                            </Box>
                        </DashboardCard>

                        {/* Project Timeline Metrics */}
                        <DashboardCard
                            title="Project Timeline Metrics"
                            icon={<Schedule sx={{ color: '#4caf50', fontSize: '1.2rem' }} />}
                            height="120px"
                            color="#4caf50"
                            hoverColor="rgba(76, 175, 80, 0.2)"
                            gradient="linear-gradient(90deg, #4caf50, #66bb6a, #81c784)"
                        >
                            <Box sx={{ p: 2, height: '100%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.75rem' }}>
                                        Project Timeline Metrics
                                    </Typography>
                                    <Schedule sx={{ color: '#4caf50', fontSize: '1.2rem' }} />
                                </Box>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50', fontSize: '1.1rem' }}>
                                            {Math.round((completedProjects / totalProjects) * 100)}%
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                                            On-Time Delivery
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ff9800', fontSize: '1.1rem' }}>
                                            {Math.round((delayedProjects + stalledProjects) / totalProjects * 100)}%
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                                            Delayed Projects
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </DashboardCard>

                        {/* Issues Summary */}
                        <DashboardCard
                            title="Issues Summary"
                            icon={<TrendingDown sx={{ color: '#ff9800', fontSize: '1.2rem' }} />}
                            height="120px"
                            color="#ff9800"
                            hoverColor="rgba(255, 152, 0, 0.2)"
                            gradient="linear-gradient(90deg, #ff9800, #ffb74d, #ffcc80)"
                        >
                            <Box sx={{ p: 2, height: '100%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.75rem' }}>
                                        Issues Summary
                                    </Typography>
                                    <TrendingDown sx={{ color: '#ff9800', fontSize: '1.2rem' }} />
                                </Box>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f44336', fontSize: '1.1rem' }}>
                                            {delayedProjects}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                                            Delayed
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ff9800', fontSize: '1.1rem' }}>
                                            {stalledProjects}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                                            Stalled
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#e91e63', fontSize: '1.1rem' }}>
                                            {atRiskProjects}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                                            At Risk
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </DashboardCard>
                    </Box>
                </Fade>
            </Grid>
        </Grid>
    );
};

export default React.memo(AnalyticsTab);

