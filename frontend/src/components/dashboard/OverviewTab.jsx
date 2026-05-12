import React from 'react';
import { Grid, Box } from '@mui/material';
import { Fade } from '@mui/material';
import { PieChart, Speed, Business, CheckCircle, TrendingUp } from '@mui/icons-material';
import DashboardCard from './DashboardCard';
import CircularChart from '../charts/CircularChart';
import LineBarComboChart from '../charts/LineBarComboChart';
import KPICard from './KPICard';

const OverviewTab = ({ dashboardData, financialSummary, formatCurrency }) => {
    return (
        <Grid container spacing={2}>
            {/* Project Status (Donut Chart) */}
            <Grid item xs={12} md={5}>
                <Fade in timeout={1200}>
                    <DashboardCard
                        title="Project Status"
                        icon={<PieChart sx={{ color: 'primary.main', fontSize: '1.2rem' }} />
                        color="#1976d2"
                        hoverColor="rgba(25, 118, 210, 0.2)"
                        gradient="linear-gradient(90deg, #1976d2, #42a5f5, #64b5f6)"
                    >
                        <Box sx={{ height: '240px', minWidth: '300px' }}>
                            {dashboardData.projectStatus.length > 0 ? (
                                <CircularChart
                                    title=""
                                    data={dashboardData.projectStatus}
                                    type="donut"
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

            {/* Project Performance Metrics */}
            <Grid item xs={12} md={4}>
                <Fade in timeout={1400}>
                    <DashboardCard
                        title="Project Performance Metrics"
                        icon={<Speed sx={{ color: 'info.main', fontSize: '1.2rem' }} />}
                        color="#2196f3"
                        hoverColor="rgba(33, 150, 243, 0.2)"
                        gradient="linear-gradient(90deg, #2196f3, #42a5f5, #64b5f6)"
                    >
                        <Box sx={{ height: '240px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* Completion Rate */}
                            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: '8px' }}>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50', mb: 0.5 }}>
                                    31%
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                                    Completion Rate
                                </Typography>
                            </Box>

                            {/* Health Score */}
                            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'rgba(33, 150, 243, 0.1)', borderRadius: '8px' }}>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196f3', mb: 0.5 }}>
                                    50%
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                                    Health Score
                                </Typography>
                            </Box>

                            {/* Average Progress */}
                            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'rgba(255, 152, 0, 0.1)', borderRadius: '8px' }}>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800', mb: 0.5 }}>
                                    31%
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                                    Average Progress
                                </Typography>
                            </Box>
                        </Box>
                    </DashboardCard>
                </Fade>
            </Grid>

            {/* KPI Cards Row */}
            <Grid item xs={12} md={3}>
                <Fade in timeout={1600}>
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 1.5, 
                        height: '340px',
                        justifyContent: 'space-between'
                    }}>
                        <KPICard
                            title="Total Contracted"
                            value={formatCurrency(financialSummary.totalContracted)}
                            icon={<Business />}
                            color="#1976d2"
                            subtitle="Contract sum across all departments"
                        />
                        <KPICard
                            title="Total Paid"
                            value={formatCurrency(financialSummary.totalPaid)}
                            icon={<CheckCircle />}
                            color="#4caf50"
                            subtitle="Amount disbursed to date"
                        />
                        <KPICard
                            title="Absorption Rate"
                            value={`${financialSummary.absorptionRate}%`}
                            icon={<TrendingUp />}
                            color="#ff9800"
                            subtitle="Paid vs contracted ratio"
                            progress={financialSummary.absorptionRate}
                        />
                    </Box>
                </Fade>
            </Grid>

            {/* Project Progress (Line/Bar Combo Chart) */}
            <Grid item xs={12} md={9}>
                <Fade in timeout={2000}>
                    <DashboardCard
                        title="Project Progress | Stratified By Departments"
                        icon={<PieChart sx={{ color: 'info.main', fontSize: '1.2rem' }} />}
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
        </Grid>
    );
};

export default React.memo(OverviewTab);

