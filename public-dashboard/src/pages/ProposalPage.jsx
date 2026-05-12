import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Send as SendIcon,
  LocationOn as LocationIcon,
  Category as CategoryIcon,
  AttachMoney as MoneyIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { formatCurrency } from '../utils/formatters';

const CitizenProposalsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);

  // Form state for new proposal
  const [proposalForm, setProposalForm] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    estimatedCost: '',
    proposerName: '',
    proposerEmail: '',
    proposerPhone: '',
    proposerAddress: '',
    justification: '',
    expectedBenefits: '',
    timeline: '',
    attachments: []
  });

  // Mock data for existing proposals
  const [proposals] = useState([
    {
      id: 1,
      title: 'Construction of Modern Market in Kondele',
      description: 'Proposal for a modern market facility to serve the growing population in Kondele area',
      category: 'Infrastructure',
      location: 'Kondele Ward',
      estimatedCost: 15000000,
      proposerName: 'John Mwangi',
      proposerEmail: 'john.mwangi@email.com',
      proposerPhone: '+254712345678',
      status: 'Under Review',
      submissionDate: '2024-01-15',
      justification: 'The current market is overcrowded and lacks proper facilities',
      expectedBenefits: 'Improved trading environment, increased revenue, better hygiene',
      timeline: '12 months'
    },
    {
      id: 2,
      title: 'Youth Skills Training Center',
      description: 'Establishment of a vocational training center for youth empowerment',
      category: 'Education',
      location: 'Kisumu Central',
      estimatedCost: 25000000,
      proposerName: 'Sarah Akinyi',
      proposerEmail: 'sarah.akinyi@email.com',
      proposerPhone: '+254723456789',
      status: 'Approved',
      submissionDate: '2024-01-10',
      justification: 'High unemployment rate among youth in the area',
      expectedBenefits: 'Youth employment, skill development, economic growth',
      timeline: '18 months'
    },
    {
      id: 3,
      title: 'Water Supply Project for Rural Areas',
      description: 'Extension of clean water supply to underserved rural communities',
      category: 'Water & Sanitation',
      location: 'Nyakach Sub-County',
      estimatedCost: 35000000,
      proposerName: 'Peter Ochieng',
      proposerEmail: 'peter.ochieng@email.com',
      proposerPhone: '+254734567890',
      status: 'Rejected',
      submissionDate: '2024-01-05',
      justification: 'Communities lack access to clean water',
      expectedBenefits: 'Improved health, reduced waterborne diseases',
      timeline: '24 months'
    }
  ]);

  const categories = [
    'Infrastructure',
    'Education',
    'Health',
    'Water & Sanitation',
    'Agriculture',
    'Transport',
    'Environment',
    'Social Services',
    'Technology',
    'Other'
  ];

  const statusColors = {
    'Under Review': 'warning',
    'Approved': 'success',
    'Rejected': 'error',
    'Draft': 'info'
  };

  const handleInputChange = (field) => (event) => {
    setProposalForm({
      ...proposalForm,
      [field]: event.target.value
    });
  };

  const handleSubmitProposal = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccessMessage('Proposal submitted successfully! It will be reviewed by the relevant department.');
      setProposalForm({
        title: '',
        description: '',
        category: '',
        location: '',
        estimatedCost: '',
        proposerName: '',
        proposerEmail: '',
        proposerPhone: '',
        proposerAddress: '',
        justification: '',
        expectedBenefits: '',
        timeline: '',
        attachments: []
      });
    } catch (error) {
      setErrorMessage('Failed to submit proposal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProposal = (proposal) => {
    setSelectedProposal(proposal);
    setViewDialogOpen(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          View Citizen Proposals
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse community project proposals submitted by citizens
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', px: 2 }}>
            <Button
              variant={activeTab === 0 ? 'contained' : 'text'}
              onClick={() => setActiveTab(0)}
              startIcon={<AddIcon />}
              sx={{ mr: 2, borderRadius: 2 }}
            >
              Submit Proposal
            </Button>
            <Button
              variant={activeTab === 1 ? 'contained' : 'text'}
              onClick={() => setActiveTab(1)}
              startIcon={<ViewIcon />}
              sx={{ borderRadius: 2 }}
            >
              View Proposals
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Success/Error Messages */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert severity="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage('')}
      >
        <Alert severity="error" onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      </Snackbar>

      {/* Tab Content */}
      {activeTab === 0 ? (
        // Submit Proposal Tab
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
            Submit New Project Proposal
          </Typography>

          <Grid container spacing={3}>
            {/* Project Details */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                Project Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Project Title"
                value={proposalForm.title}
                onChange={handleInputChange('title')}
                required
                placeholder="Enter a descriptive title for your project"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={proposalForm.category}
                  onChange={handleInputChange('category')}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Description"
                value={proposalForm.description}
                onChange={handleInputChange('description')}
                multiline
                rows={4}
                required
                placeholder="Provide a detailed description of your project idea"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                value={proposalForm.location}
                onChange={handleInputChange('location')}
                required
                placeholder="e.g., Kondele Ward, Kisumu Central"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Estimated Cost (KES)"
                value={proposalForm.estimatedCost}
                onChange={handleInputChange('estimatedCost')}
                type="number"
                required
                placeholder="Enter estimated project cost"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Justification"
                value={proposalForm.justification}
                onChange={handleInputChange('justification')}
                multiline
                rows={3}
                required
                placeholder="Explain why this project is needed"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Expected Benefits"
                value={proposalForm.expectedBenefits}
                onChange={handleInputChange('expectedBenefits')}
                multiline
                rows={3}
                required
                placeholder="Describe the expected benefits and impact"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Proposed Timeline"
                value={proposalForm.timeline}
                onChange={handleInputChange('timeline')}
                required
                placeholder="e.g., 12 months, 2 years"
              />
            </Grid>

            {/* Proposer Information */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                Your Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={proposalForm.proposerName}
                onChange={handleInputChange('proposerName')}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                value={proposalForm.proposerEmail}
                onChange={handleInputChange('proposerEmail')}
                type="email"
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={proposalForm.proposerPhone}
                onChange={handleInputChange('proposerPhone')}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Address"
                value={proposalForm.proposerAddress}
                onChange={handleInputChange('proposerAddress')}
                required
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSubmitProposal}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    borderRadius: 2
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Proposal'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      ) : (
        // View Proposals Tab
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
            Community Project Proposals
          </Typography>

          <Grid container spacing={3}>
            {proposals.map((proposal) => (
              <Grid item xs={12} md={6} lg={4} key={proposal.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Chip
                        label={proposal.status}
                        color={statusColors[proposal.status]}
                        size="small"
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleViewProposal(proposal)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Box>

                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {proposal.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {proposal.description}
                    </Typography>

                    <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CategoryIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {proposal.category}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {proposal.location}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MoneyIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatCurrency(proposal.estimatedCost)}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {proposal.proposerName}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Submitted: {formatDate(proposal.submissionDate)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* View Proposal Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold">
            {selectedProposal?.title}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedProposal && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Category
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedProposal.category}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Location
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedProposal.location}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Estimated Cost
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formatCurrency(selectedProposal.estimatedCost)}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Timeline
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedProposal.timeline}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Proposer
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedProposal.proposerName}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedProposal.proposerEmail}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Phone
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedProposal.proposerPhone}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Status
                  </Typography>
                  <Chip
                    label={selectedProposal.status}
                    color={statusColors[selectedProposal.status]}
                    sx={{ mb: 2 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedProposal.description}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Justification
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedProposal.justification}
                  </Typography>

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Expected Benefits
                  </Typography>
                  <Typography variant="body1">
                    {selectedProposal.expectedBenefits}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CitizenProposalsPage;
