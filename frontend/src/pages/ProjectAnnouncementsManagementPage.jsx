import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardMedia
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  CalendarToday as CalendarTodayIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Cancel as CancelIcon,
  Event as EventIcon,
  Announcement as AnnouncementIcon,
  Public as PublicIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import projectAnnouncementsService from '../api/projectAnnouncementsService';
// formatDate helper function
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const categories = [
  'All',
  'Project Launch',
  'Public Consultation',
  'Progress Update',
  'Completion',
  'Tender Notice',
  'General Announcement',
];

const statuses = [
  'All',
  'Upcoming',
  'Active',
  'Completed',
  'Cancelled',
];

const types = [
  'Meeting',
  'Workshop',
  'Public Forum',
  'Launch Event',
  'Progress Report',
  'Tender',
  'General',
];

const priorities = [
  'High',
  'Medium',
  'Low',
];

const getStatusColor = (status) => {
  switch (status) {
    case 'Upcoming':
      return { background: '#2196f3', text: '#ffffff', icon: <HourglassEmptyIcon sx={{ color: '#ffffff' }} /> };
    case 'Ongoing':
      return { background: '#4caf50', text: '#ffffff', icon: <CheckCircleIcon sx={{ color: '#ffffff' }} /> };
    case 'Completed':
      return { background: '#9e9e9e', text: '#ffffff', icon: <CheckCircleIcon sx={{ color: '#ffffff' }} /> };
    case 'Cancelled':
      return { background: '#f44336', text: '#ffffff', icon: <CancelIcon sx={{ color: '#ffffff' }} /> };
    default:
      return { background: '#e0e0e0', text: '#424242', icon: null };
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High':
      return { background: '#f44336', text: '#ffffff' };
    case 'Medium':
      return { background: '#ff9800', text: '#ffffff' };
    case 'Low':
      return { background: '#4caf50', text: '#ffffff' };
    default:
      return { background: '#e0e0e0', text: '#424242' };
  }
};

const ProjectAnnouncementsManagementPage = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    category: 'All',
    status: 'All',
    search: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    type: '',
    date: '',
    time: '',
    location: '',
    organizer: '',
    status: 'Upcoming',
    priority: 'Medium',
    imageUrl: '',
    attendees: 0,
    maxAttendees: 0
  });

  useEffect(() => {
    fetchAnnouncements();
  }, [filters, page]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        ...(filters.category !== 'All' && { category: filters.category }),
        ...(filters.status !== 'All' && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      };
      
      const data = await projectAnnouncementsService.getAnnouncements(params);
      setAnnouncements(data.announcements || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setError(null);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('Failed to load announcements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    // If already in YYYY-MM-DD format, return as is
    if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    // Otherwise, parse and format
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Helper function to format time for input field (HH:MM)
  const formatTimeForInput = (timeString) => {
    if (!timeString) return '';
    // If already in HH:MM format, return as is
    if (typeof timeString === 'string' && /^\d{2}:\d{2}/.test(timeString)) {
      return timeString.substring(0, 5); // Take only HH:MM part
    }
    return timeString;
  };

  const handleOpenDialog = (announcement = null) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setFormData({
        title: announcement.title || '',
        description: announcement.description || '',
        content: announcement.content || '',
        category: announcement.category || '',
        type: announcement.type || '',
        date: formatDateForInput(announcement.date),
        time: formatTimeForInput(announcement.time),
        location: announcement.location || '',
        organizer: announcement.organizer || '',
        status: announcement.status || 'Upcoming',
        priority: announcement.priority || 'Medium',
        imageUrl: announcement.image_url || '',
        attendees: announcement.attendees || 0,
        maxAttendees: announcement.max_attendees || 0
      });
    } else {
      setEditingAnnouncement(null);
      setFormData({
        title: '',
        description: '',
        content: '',
        category: '',
        type: '',
        date: '',
        time: '',
        location: '',
        organizer: '',
        status: 'Upcoming',
        priority: 'Medium',
        imageUrl: '',
        attendees: 0,
        maxAttendees: 0
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAnnouncement(null);
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        attendees: parseInt(formData.attendees),
        maxAttendees: parseInt(formData.maxAttendees)
      };

      if (editingAnnouncement) {
        await projectAnnouncementsService.updateAnnouncement(editingAnnouncement.id, submitData);
        setSuccessMessage('Announcement updated successfully!');
      } else {
        await projectAnnouncementsService.createAnnouncement(submitData);
        setSuccessMessage('Announcement created successfully!');
      }
      
      handleCloseDialog();
      fetchAnnouncements();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving announcement:', err);
      setError(err.response?.data?.error || 'Failed to save announcement. Please try again.');
    }
  };

  const handleDeleteClick = (announcement) => {
    setAnnouncementToDelete(announcement);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await projectAnnouncementsService.deleteAnnouncement(announcementToDelete.id);
      setSuccessMessage('Announcement deleted successfully!');
      setDeleteConfirmOpen(false);
      setAnnouncementToDelete(null);
      fetchAnnouncements();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting announcement:', err);
      setError('Failed to delete announcement. Please try again.');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Project Announcements
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage project announcements and public notices
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ textTransform: 'none' }}
        >
          Add New Announcement
        </Button>
      </Box>

      {/* Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search announcements..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                label="Category"
                onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              >
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Announcements Cards */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : announcements.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary" variant="h6" gutterBottom>
            No announcements found
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {filters.search || filters.category !== 'All' || filters.status !== 'All'
              ? 'Try adjusting your filters'
              : 'Create your first announcement to get started'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {announcements.map((announcement) => {
            const statusInfo = getStatusColor(announcement.status);
            const priorityInfo = getPriorityColor(announcement.priority);

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={announcement.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  {announcement.image_url && announcement.image_url.startsWith('http') && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={announcement.image_url}
                      alt=""
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                      sx={{ objectFit: 'cover' }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                    {/* Status and Priority Chips */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Chip
                        label={announcement.status}
                        size="small"
                        sx={{
                          backgroundColor: statusInfo.background,
                          color: statusInfo.text,
                          fontWeight: 'bold',
                          fontSize: '0.7rem',
                          height: '24px'
                        }}
                        icon={statusInfo.icon}
                      />
                      <Chip
                        label={announcement.priority}
                        size="small"
                        sx={{
                          backgroundColor: priorityInfo.background,
                          color: priorityInfo.text,
                          fontWeight: 'bold',
                          fontSize: '0.7rem',
                          height: '24px'
                        }}
                      />
                    </Box>

                    {/* Title */}
                    <Typography 
                      variant="h6" 
                      fontWeight="bold" 
                      sx={{ 
                        mb: 1, 
                        lineHeight: 1.3,
                        fontSize: '1rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {announcement.title}
                    </Typography>

                    {/* Description */}
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        flexGrow: 1
                      }}
                    >
                      {announcement.description}
                    </Typography>

                    {/* Category and Type */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                      <Chip
                        label={announcement.category}
                        size="small"
                        icon={<CategoryIcon sx={{ fontSize: 14 }} />}
                        sx={{ fontSize: '0.7rem', height: '22px' }}
                      />
                      <Chip
                        label={announcement.type}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: '22px' }}
                      />
                    </Box>

                    {/* Date and Time */}
                    <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                          {formatDate(announcement.date)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {announcement.time}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Location */}
                    <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          fontSize: '0.8rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {announcement.location}
                      </Typography>
                    </Box>

                    {/* Organizer */}
                    <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          fontSize: '0.8rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {announcement.organizer}
                      </Typography>
                    </Box>

                    {/* Attendance (if applicable) */}
                    {announcement.max_attendees > 0 && (
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          Attendance: {announcement.attendees}/{announcement.max_attendees}
                        </Typography>
                        <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 6, mt: 0.5 }}>
                          <Box
                            sx={{
                              width: `${(announcement.attendees / announcement.max_attendees) * 100}%`,
                              bgcolor: 'primary.main',
                              borderRadius: 1,
                              height: 6
                            }}
                          />
                        </Box>
                      </Box>
                    )}

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 'auto', pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenDialog(announcement)}
                        fullWidth
                        sx={{ 
                          textTransform: 'none',
                          fontSize: '0.75rem',
                          py: 0.75
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteClick(announcement)}
                        color="error"
                        fullWidth
                        sx={{ 
                          textTransform: 'none',
                          fontSize: '0.75rem',
                          py: 0.75
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Box display="flex" gap={1} alignItems="center">
            <Button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              size="small"
            >
              Previous
            </Button>
            <Typography variant="body2">
              Page {page} of {totalPages}
            </Typography>
            <Button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              size="small"
            >
              Next
            </Button>
          </Box>
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={2}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.filter(c => c !== 'All').map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Type"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  {types.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Organizer"
                value={formData.organizer}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {statuses.filter(s => s !== 'All').map((status) => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  {priorities.map((priority) => (
                    <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Image URL"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Max Attendees"
                type="number"
                value={formData.maxAttendees}
                onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingAnnouncement ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{announcementToDelete?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectAnnouncementsManagementPage;

