import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  CircularProgress,
  Alert,
  Typography,
  Paper,
  Grid,
  useTheme
} from '@mui/material';
import ReportFilters from './ReportFilters';
import ReportTabs from './ReportTabs';
import apiService from '../api';
import KpiCard from './KpiCard';
import DepartmentSummaryReport from './DepartmentSummaryReport';
import ProjectSummaryReport from './ProjectSummaryReport';
import ProjectOverviewDashboard from './ProjectOverviewDashboard';
import SubcountySummaryReport from './SubcountySummaryReport';
import WardSummaryReport from './WardSummaryReport';
import YearlyTrendsReport from './YearlyTrendsReport';
 

const ReportsDashboard = () => {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState('ProjectSummary'); // Set initial tab to a valid one
    const [filters, setFilters] = useState({});
    const [allMetadata, setAllMetadata] = useState({});
    const [metadataLoading, setMetadataLoading] = useState(true);
    const [kpiData, setKpiData] = useState({ totalProjects: 0, totalBudget: 0, totalPaid: 0 });

    useEffect(() => {
      const fetchMetadata = async () => {
        try {
          const fetchedMetadata = await apiService.metadata.getAllMetadata();
          setAllMetadata(fetchedMetadata);
        } catch (err) {
          console.error("Failed to fetch metadata:", err);
        } finally {
          setMetadataLoading(false);
        }
      };
      fetchMetadata();
    }, []);

    useEffect(() => {
      const fetchKpiData = async () => {
        try {
          const fetchedKpis = await apiService.reports.getSummaryKpis(filters);
          setKpiData({
            totalProjects: fetchedKpis.totalProjects || 0,
            totalBudget: fetchedKpis.totalBudget || 0,
            totalPaid: fetchedKpis.totalPaid || 0,
          });
        } catch (err) {
          console.error("Failed to fetch KPI data:", err);
        }
      };
      fetchKpiData();
    }, [filters]);

    const handleFilterChange = useCallback((event) => {
      const { name, value } = event.target;
      setFilters(prevFilters => ({
        ...prevFilters,
        [name]: value,
      }));
    }, []);

    const handleClearFilters = useCallback(() => {
      setFilters({});
    }, []);

    const renderReportComponent = () => {
        if (metadataLoading) {
            return (
                <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Loading report metadata...</Typography>
                </Box>
            );
        }
        
        switch(activeTab) {
            case 'DepartmentSummary':
                return <DepartmentSummaryReport filters={filters} />;
            case 'ProjectSummary':
                return (
                    // Give Project Summary charts more space
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <ProjectSummaryReport filters={filters} reportType="ProjectsByStatus" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <ProjectSummaryReport filters={filters} reportType="BudgetPaidByStatus" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <ProjectSummaryReport filters={filters} reportType="ProjectsByStatusAndYear" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <ProjectSummaryReport filters={filters} reportType="ProjectsOverTime" />
                        </Grid>
                    </Grid>
                );
            case 'ProjectOverviewSummary':
                return <ProjectOverviewDashboard filters={filters} />;
            case 'SubcountySummary':
                return <SubcountySummaryReport filters={filters} />;
            case 'WardSummary':
                return <WardSummaryReport filters={filters} />;
            case 'YearlyTrends':
                return <YearlyTrendsReport filters={filters} />;
            default:
                return (
                    <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                        <Typography variant="h6">Select a report to view.</Typography>
                    </Box>
                );
        }
    };

    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: theme.palette.primary.main, fontWeight: 'bold', mb: 3 }}>
          Comprehensive Reports
        </Typography>
        
        <ReportFilters
          filterState={filters}
          handleFilterChange={handleFilterChange}
          handleApplyFilters={() => {}}
          handleClearFilters={handleClearFilters}
          allMetadata={allMetadata}
        />

        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <KpiCard label="Total Projects" value={kpiData.totalProjects} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <KpiCard label="Total Budget" value={kpiData.totalBudget} isCurrency={true} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <KpiCard label="Total Paid" value={kpiData.totalPaid} isCurrency={true} />
          </Grid>
        </Grid>
        <ReportTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <Paper elevation={2} sx={{ p: 3, borderRadius: '12px', mt: 3 }}>
          {renderReportComponent()}
        </Paper>
      </Box>
    );
};

export default ReportsDashboard;