import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Chip,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Paper,
  LinearProgress,
  Divider,
  Card,
  CardMedia
} from '@mui/material';
import {
  Close,
  LocationOn,
  AccountBalanceWallet,
  CalendarToday,
  Business,
  Assessment,
  Comment,
  PhotoLibrary,
  NavigateBefore,
  NavigateNext,
  Map as MapIcon
} from '@mui/icons-material';
import { getProjectDetails, getProjectMap } from '../services/publicApi';
import { formatCurrency, formatDate, getStatusColor, formatStatus } from '../utils/formatters';
import ProjectFeedbackModal from './ProjectFeedbackModal';
import ReadOnlyMapComponent from './ReadOnlyMapComponent';

// Get API base URL for image serving
// In production, API is on port 3000, frontend can be on port 8080 (nginx) or 5174 (public dashboard)
const getApiBaseUrl = () => {
  // Check if we have an explicit API URL in env
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl && !apiUrl.startsWith('/') && apiUrl.includes('://')) {
    // Full URL provided (e.g., http://165.22.227.234:3000/api)
    // Extract base URL (remove /api and /public)
    const url = new URL(apiUrl);
    return `${url.protocol}//${url.host}`;
  }
  // In production, API is on port 3000
  // Frontend can be accessed via:
  // - Port 8080 (nginx proxy for main app)
  // - Port 5174 (public dashboard)
  // Both need to use port 3000 for API/image requests
  const origin = window.location.origin;
  if (origin.includes(':8080') || origin.includes(':5174')) {
    // Production: replace frontend port with 3000 for API
    return origin.replace(/:8080|:5174/, ':3000');
  }
  // Development or same origin (localhost)
  return window.location.origin;
};

const ProjectDetailsModal = ({ open, onClose, projectId, project }) => {
  const [projectDetails, setProjectDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  useEffect(() => {
    if (open) {
      if (project) {
        // Use provided project data if available, but also fetch latest to ensure we have updated status
        setProjectDetails(project);
        setLoading(false);
        setError(null);
        // Fetch latest data in background to ensure status is up-to-date
        if (projectId) {
          fetchProjectDetails(true); // Pass true to indicate background refresh
        }
      } else if (projectId) {
        // Only fetch if projectId is provided and no project data is available
        fetchProjectDetails(false);
      } else {
        setError('No project data or project ID provided');
        setLoading(false);
      }
    } else {
      // Reset state when modal closes
      setProjectDetails(null);
      setError(null);
      setLoading(false);
    }
  }, [open, projectId, project]);

  const fetchProjectDetails = async (isBackgroundRefresh = false) => {
    // Don't show loading if this is a background refresh
    if (!isBackgroundRefresh) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await getProjectDetails(projectId);
      // API returns project data directly, not wrapped in { project: ... }
      
      // If map data is not included in project details, fetch it separately
      if (!data.map && projectId) {
        try {
          const mapData = await getProjectMap(projectId);
          if (mapData) {
            data.map = mapData;
          }
        } catch (mapError) {
          // Map data is optional, so don't fail the whole request if map fetch fails
          console.warn('Could not fetch map data:', mapError);
        }
      }
      
      setProjectDetails(data);
    } catch (err) {
      console.error('Error fetching project details:', err);
      // Only show error if this wasn't a background refresh
      if (!isBackgroundRefresh) {
        setError(err.response?.data?.error || err.message || 'Failed to load project details. Please try again later.');
      }
    } finally {
      if (!isBackgroundRefresh) {
        setLoading(false);
      }
    }
  };

  const handleOpenFeedback = () => {
    setFeedbackModalOpen(true);
  };

  const handleCloseFeedback = () => {
    setFeedbackModalOpen(false);
  };

  if (!open) return null;

  const projectData = projectDetails || project;
  const thumbnail = projectData?.thumbnail || projectData?.photo;

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 2,
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          position: 'relative'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Assessment sx={{ fontSize: '2rem' }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Project Details
              </Typography>
            </Box>
            <IconButton 
              onClick={onClose}
              sx={{ 
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ m: 3 }}>
              {error}
            </Alert>
          ) : projectData ? (
            <Box>
              {/* Project Photo */}
              {thumbnail && (
                <Box
                  sx={{
                    width: '100%',
                    height: '400px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <img
                    src={(() => {
                      if (!thumbnail) return '';
                      const apiBaseUrl = getApiBaseUrl();
                      if (thumbnail.startsWith('http://') || thumbnail.startsWith('https://')) {
                        return thumbnail;
                      } else if (thumbnail.startsWith('/uploads/')) {
                        return `${apiBaseUrl}${thumbnail}`;
                      } else if (thumbnail.startsWith('uploads/')) {
                        return `${apiBaseUrl}/${thumbnail}`;
                      } else if (thumbnail.startsWith('/')) {
                        return `${apiBaseUrl}${thumbnail}`;
                      } else {
                        return `${apiBaseUrl}/uploads/${thumbnail}`;
                      }
                    })()}
                    alt={projectData.project_name || projectData.projectName}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Box>
              )}

              <Box sx={{ p: 3 }}>
                {/* Status Chip */}
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    label={formatStatus(projectData.status)}
                    size="medium"
                    sx={{
                      backgroundColor: getStatusColor(projectData.status),
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      height: '32px'
                    }}
                  />
                </Box>

                {/* Project Name */}
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                  {projectData.project_name || projectData.projectName}
                </Typography>

                {/* Description */}
                {projectData.description && (
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {projectData.description}
                  </Typography>
                )}

                <Divider sx={{ my: 3 }} />

                {/* Project Information Grid */}
                <Grid container spacing={3}>
                  {/* Location */}
                  {(projectData.ward_name || projectData.subcounty_name || projectData.department_name) && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <LocationOn sx={{ fontSize: 24, color: 'primary.main', mt: 0.5 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            Location
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {projectData.ward_name || projectData.subcounty_name || projectData.department_name || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}

                  {/* Budget */}
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <AccountBalanceWallet sx={{ fontSize: 24, color: 'success.main', mt: 0.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          Budget
                        </Typography>
                        <Typography variant="body1" fontWeight="bold" color="success.main">
                          {formatCurrency(projectData.budget || projectData.costOfProject)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Dates */}
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <CalendarToday sx={{ fontSize: 24, color: 'text.secondary', mt: 0.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          Timeline
                        </Typography>
                        <Typography variant="body2">
                          <strong>Start:</strong> {formatDate(projectData.start_date || projectData.startDate)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>End:</strong> {formatDate(projectData.end_date || projectData.endDate)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Department */}
                  {projectData.department_name && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <Business sx={{ fontSize: 24, color: 'text.secondary', mt: 0.5 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            Department
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {projectData.department_name}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}

                  {/* Financial Year */}
                  {projectData.financialYear && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <CalendarToday sx={{ fontSize: 24, color: 'text.secondary', mt: 0.5 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            Financial Year
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {projectData.financialYear}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}

                  {/* Progress */}
                  <Grid item xs={12}>
                    <Box sx={{ mt: 1 }}>
                      {(() => {
                        // Calculate progress: 100% if status contains "completed", otherwise use completionPercentage
                        const status = projectData.status?.toLowerCase() || '';
                        const progress = status.includes('completed') 
                          ? 100 
                          : Math.min(100, Math.max(0, parseFloat(projectData.completionPercentage) || 0));
                        
                        return (
                          <>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                Project Progress
                              </Typography>
                              <Typography variant="body2" fontWeight="bold" color="primary.main">
                                {progress}%
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={progress}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: '#e0e0e0',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: getStatusColor(projectData.status),
                                  borderRadius: 4
                                }
                              }}
                            />
                          </>
                        );
                      })()}
                    </Box>
                  </Grid>
                </Grid>

                {/* Project Map */}
                {projectData.map && (() => {
                  // Extract the actual GeoJSON - handle both nested and direct structures
                  const mapGeoJson = projectData.map?.geoJson || projectData.map;
                  
                  // Debug logging
                  console.log('[ProjectDetailsModal] Map data:', projectData.map);
                  console.log('[ProjectDetailsModal] Extracted geoJson:', mapGeoJson);
                  console.log('[ProjectDetailsModal] Has features?', mapGeoJson?.features);
                  
                  // Only show map section if we have valid GeoJSON with features
                  if (!mapGeoJson || !mapGeoJson.features || mapGeoJson.features.length === 0) {
                    return null;
                  }
                  
                  return (
                    <>
                      <Divider sx={{ my: 3 }} />
                      <Box sx={{ mt: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <MapIcon sx={{ fontSize: 24, color: 'primary.main' }} />
                          <Typography variant="h6" fontWeight="bold">
                            Project Location
                          </Typography>
                        </Box>
                        <Paper 
                          elevation={2}
                          sx={{ 
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1px solid #e0e0e0'
                          }}
                        >
                          <ReadOnlyMapComponent
                            geoJson={mapGeoJson}
                            projectName={projectData.project_name || projectData.projectName}
                            style={{ height: '400px', width: '100%' }}
                          />
                        </Paper>
                      {/* Coordinates Display */}
                      {(() => {
                        const geoJsonData = projectData.map?.geoJson || projectData.map;
                        if (!geoJsonData || !geoJsonData.features || !geoJsonData.features[0]?.geometry) return null;
                        
                        const geometry = geoJsonData.features[0].geometry;
                        let coordsText = '';
                        try {
                          if (geometry.type === 'Point') {
                            const [lng, lat] = geometry.coordinates;
                            coordsText = `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                          } else if (geometry.type === 'LineString' || geometry.type === 'MultiPoint') {
                            const firstCoord = geometry.coordinates[0];
                            const [lng, lat] = firstCoord;
                            coordsText = `Starting Point: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                          } else if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
                            const firstCoord = geometry.type === 'Polygon' 
                              ? geometry.coordinates[0][0]
                              : geometry.coordinates[0][0][0];
                            const [lng, lat] = firstCoord;
                            coordsText = `Area Center: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                          }
                        } catch (e) {
                          console.error('Error extracting coordinates:', e);
                          return null;
                        }
                        return coordsText ? (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            {coordsText}
                          </Typography>
                        ) : null;
                      })()}
                      </Box>
                    </>
                  );
                })()}

                {/* Project Photos Gallery */}
                {projectData.photos && projectData.photos.length > 0 && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Box sx={{ mt: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <PhotoLibrary sx={{ fontSize: 24, color: 'primary.main' }} />
                        <Typography variant="h6" fontWeight="bold">
                          Project Photos
                        </Typography>
                        <Chip 
                          label={projectData.photos.length} 
                          size="small" 
                          sx={{ ml: 1 }}
                        />
                      </Box>
                      <Grid container spacing={2}>
                        {projectData.photos.map((photo, index) => {
                          // Construct photo URL - use API base URL for images
                          // Static files are served from /uploads on the API server
                          // File paths in DB are like: "uploads/project-photos/filename.jpg"
                          const apiBaseUrl = getApiBaseUrl();
                          let photoUrl = photo.filePath || '';
                          if (!photoUrl) {
                            photoUrl = '';
                          } else if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
                            // Already a full URL
                            photoUrl = photoUrl;
                          } else if (photoUrl.startsWith('/uploads/')) {
                            // Already has /uploads/ prefix
                            photoUrl = `${apiBaseUrl}${photoUrl}`;
                          } else if (photoUrl.startsWith('uploads/')) {
                            // Has uploads/ prefix but missing leading slash
                            photoUrl = `${apiBaseUrl}/${photoUrl}`;
                          } else if (photoUrl.startsWith('/')) {
                            // Starts with / but not /uploads/
                            photoUrl = `${apiBaseUrl}${photoUrl}`;
                          } else {
                            // Relative path - add /uploads/ prefix
                            photoUrl = `${apiBaseUrl}/uploads/${photoUrl}`;
                          }
                          
                          // Debug logging for first photo
                          if (index === 0) {
                            console.log('Photo URL Debug:', {
                              originalFilePath: photo.filePath,
                              constructedUrl: photoUrl,
                              photoId: photo.photoId,
                              fileName: photo.fileName,
                              windowOrigin: window.location.origin
                            });
                          }
                          
                          return (
                            <Grid item xs={12} sm={6} md={4} key={photo.photoId || index}>
                              <Card 
                                sx={{ 
                                  height: '100%',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                  transition: 'transform 0.2s, box-shadow 0.2s',
                                  cursor: 'pointer',
                                  '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
                                  }
                                }}
                                onClick={() => {
                                  setSelectedPhotoIndex(index);
                                  setPhotoViewerOpen(true);
                                }}
                              >
                                <CardMedia
                                  component="img"
                                  height="200"
                                  image={photoUrl}
                                  alt={photo.description || `Project photo ${index + 1}`}
                                  sx={{
                                    objectFit: 'cover',
                                    backgroundColor: '#f5f5f5'
                                  }}
                                  onError={(e) => {
                                    console.error('Image load error for photo:', {
                                      attemptedUrl: photoUrl,
                                      filePath: photo.filePath,
                                      photoId: photo.photoId,
                                      fileName: photo.fileName,
                                      errorSrc: e.target.src
                                    });
                                    // Set placeholder
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                                  }}
                                  onLoad={() => {
                                    if (index === 0) {
                                      console.log('First photo loaded successfully:', photoUrl);
                                    }
                                  }}
                                />
                                {photo.description && (
                                  <Box sx={{ p: 1.5 }}>
                                    <Typography 
                                      variant="caption" 
                                      color="text.secondary"
                                      sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                      }}
                                    >
                                      {photo.description}
                                    </Typography>
                                  </Box>
                                )}
                              </Card>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No project data available
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Comment />}
            onClick={handleOpenFeedback}
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 'bold'
            }}
          >
            Add Comment
          </Button>
          <Button 
            onClick={onClose}
            variant="contained"
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 'bold'
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Project Feedback Modal */}
      <ProjectFeedbackModal
        open={feedbackModalOpen}
        onClose={handleCloseFeedback}
        project={projectData ? {
          ...projectData,
          projectName: projectData.project_name || projectData.projectName,
          project_name: projectData.project_name || projectData.projectName,
          startDate: projectData.start_date || projectData.startDate,
          endDate: projectData.end_date || projectData.endDate,
          department: projectData.department_name || projectData.department,
          statusColor: getStatusColor(projectData.status)
        } : null}
      />

      {/* Photo Viewer Modal */}
      <Dialog
        open={photoViewerOpen}
        onClose={() => setPhotoViewerOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            borderRadius: '8px'
          }
        }}
      >
        {projectData?.photos && projectData.photos.length > 0 && (
          <>
            <DialogTitle sx={{ 
              color: 'white', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              pb: 1
            }}>
              <Typography variant="h6">
                {projectData.photos[selectedPhotoIndex]?.description || 
                 `Photo ${selectedPhotoIndex + 1} of ${projectData.photos.length}`}
              </Typography>
              <IconButton 
                onClick={() => setPhotoViewerOpen(false)}
                sx={{ color: 'white' }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0, position: 'relative', minHeight: '60vh' }}>
              <Box sx={{ position: 'relative', width: '100%', height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Previous Button */}
                {projectData.photos.length > 1 && (
                  <IconButton
                    onClick={() => {
                      const prevIndex = selectedPhotoIndex > 0 
                        ? selectedPhotoIndex - 1 
                        : projectData.photos.length - 1;
                      setSelectedPhotoIndex(prevIndex);
                    }}
                    sx={{
                      position: 'absolute',
                      left: 16,
                      color: 'white',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
                      zIndex: 1
                    }}
                  >
                    <NavigateBefore />
                  </IconButton>
                )}

                {/* Main Image */}
                {(() => {
                  const selectedPhoto = projectData.photos[selectedPhotoIndex];
                  const apiBaseUrl = getApiBaseUrl();
                  let photoUrl = selectedPhoto?.filePath || '';
                  if (photoUrl && !photoUrl.startsWith('http')) {
                    if (photoUrl.startsWith('/uploads/')) {
                      photoUrl = `${apiBaseUrl}${photoUrl}`;
                    } else if (photoUrl.startsWith('uploads/')) {
                      photoUrl = `${apiBaseUrl}/${photoUrl}`;
                    } else {
                      photoUrl = `${apiBaseUrl}/uploads/${photoUrl}`;
                    }
                  }
                  
                  return (
                    <img
                      src={photoUrl}
                      alt={selectedPhoto?.description || `Photo ${selectedPhotoIndex + 1}`}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                  );
                })()}

                {/* Next Button */}
                {projectData.photos.length > 1 && (
                  <IconButton
                    onClick={() => {
                      const nextIndex = selectedPhotoIndex < projectData.photos.length - 1 
                        ? selectedPhotoIndex + 1 
                        : 0;
                      setSelectedPhotoIndex(nextIndex);
                    }}
                    sx={{
                      position: 'absolute',
                      right: 16,
                      color: 'white',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
                      zIndex: 1
                    }}
                  >
                    <NavigateNext />
                  </IconButton>
                )}
              </Box>

              {/* Photo Counter */}
              {projectData.photos.length > 1 && (
                <Box sx={{ 
                  position: 'absolute', 
                  bottom: 16, 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  px: 2,
                  py: 1,
                  borderRadius: '20px'
                }}>
                  <Typography variant="body2">
                    {selectedPhotoIndex + 1} / {projectData.photos.length}
                  </Typography>
                </Box>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
};

export default ProjectDetailsModal;

