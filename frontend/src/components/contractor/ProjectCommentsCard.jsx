import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Button,
  useTheme,
} from '@mui/material';
import {
  Comment as CommentIcon,
  Reply as ReplyIcon,
  ThumbUp as LikeIcon,
  ThumbDown as DislikeIcon,
  Flag as FlagIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { tokens } from '../../pages/dashboard/theme';

const ProjectCommentsCard = ({ currentUser }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Mock data for project comments
  const [comments] = useState([
    {
      id: 1,
      projectName: 'Water Treatment Plant Construction',
      comment: 'The foundation work looks excellent. Please ensure the concrete curing process follows the specified timeline.',
      author: 'Dr. Aisha Mwangi',
      authorRole: 'Project Manager',
      timestamp: '2 hours ago',
      type: 'feedback',
      priority: 'medium',
      isRead: false,
      requiresResponse: true,
      attachments: 2,
    },
    {
      id: 2,
      projectName: 'Healthcare Center Renovation',
      comment: 'Great progress on the electrical installation. The wiring layout meets all safety standards.',
      author: 'John Kiprotich',
      authorRole: 'Technical Lead',
      timestamp: '4 hours ago',
      type: 'approval',
      priority: 'low',
      isRead: true,
      requiresResponse: false,
      attachments: 0,
    },
    {
      id: 3,
      projectName: 'Road Infrastructure Project',
      comment: 'URGENT: The material quality assessment is overdue. Please submit the certification report immediately.',
      author: 'Grace Akinyi',
      authorRole: 'Field Coordinator',
      timestamp: '6 hours ago',
      type: 'urgent',
      priority: 'high',
      isRead: false,
      requiresResponse: true,
      attachments: 1,
    },
    {
      id: 4,
      projectName: 'School Construction',
      comment: 'The safety protocol compliance check has been completed successfully. Well done on maintaining high standards.',
      author: 'Peter Mwangi',
      authorRole: 'Safety Officer',
      timestamp: '1 day ago',
      type: 'completion',
      priority: 'low',
      isRead: true,
      requiresResponse: false,
      attachments: 0,
    },
    {
      id: 5,
      projectName: 'Water Treatment Plant Construction',
      comment: 'Please provide updated photos of the foundation work for our records. The previous photos were not clear enough.',
      author: 'Mary Wanjiku',
      authorRole: 'Documentation Specialist',
      timestamp: '2 days ago',
      type: 'request',
      priority: 'medium',
      isRead: false,
      requiresResponse: true,
      attachments: 0,
    },
  ]);

  const getCommentIcon = (type) => {
    switch (type) {
      case 'feedback':
        return <CommentIcon />;
      case 'approval':
        return <LikeIcon />;
      case 'urgent':
        return <FlagIcon />;
      case 'completion':
        return <AssignmentIcon />;
      case 'request':
        return <ReplyIcon />;
      default:
        return <CommentIcon />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'feedback':
        return colors.blueAccent?.[500] || '#2196f3';
      case 'approval':
        return colors.greenAccent?.[500] || '#4caf50';
      case 'urgent':
        return colors.redAccent?.[500] || '#f44336';
      case 'completion':
        return colors.greenAccent?.[500] || '#4caf50';
      case 'request':
        return colors.yellowAccent?.[500] || '#ff9800';
      default:
        return colors.grey[400];
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return colors.redAccent?.[500] || '#f44336';
      case 'medium':
        return colors.yellowAccent?.[500] || '#ff9800';
      case 'low':
        return colors.greenAccent?.[500] || '#4caf50';
      default:
        return colors.grey[400];
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'feedback':
        return 'Feedback';
      case 'approval':
        return 'Approval';
      case 'urgent':
        return 'Urgent';
      case 'completion':
        return 'Completion';
      case 'request':
        return 'Request';
      default:
        return 'Comment';
    }
  };

  const handleReply = (commentId) => {
    console.log('Replying to comment:', commentId);
    // TODO: Implement reply functionality
  };

  const handleMarkAsRead = (commentId) => {
    console.log('Marking comment as read:', commentId);
    // TODO: Implement mark as read functionality
  };

  const handleViewAttachments = (commentId) => {
    console.log('Viewing attachments for comment:', commentId);
    // TODO: Implement view attachments functionality
  };

  const unreadComments = comments.filter(comment => !comment.isRead).length;
  const urgentComments = comments.filter(comment => comment.priority === 'high').length;
  const responseRequired = comments.filter(comment => comment.requiresResponse).length;

  return (
    <Card sx={{ 
      height: '100%',
      borderRadius: 3, 
      bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.primary[50],
      boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}15`,
      border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}30`,
    }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight="bold" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}>
            Project Comments
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            {unreadComments > 0 && (
              <Chip 
                label={`${unreadComments} unread`}
                size="small"
                sx={{ 
                  bgcolor: colors.blueAccent?.[500] || '#6870fa',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.7rem'
                }}
              />
            )}
            {urgentComments > 0 && (
              <Chip 
                label={`${urgentComments} urgent`}
                size="small"
                sx={{ 
                  bgcolor: colors.redAccent?.[500] || '#f44336',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.7rem'
                }}
              />
            )}
          </Box>
        </Box>

        {/* Summary Stats */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <Box sx={{ 
            p: 2, 
            bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100], 
            borderRadius: 2,
            border: `1px solid ${colors.blueAccent?.[500] || '#2196f3'}30`,
            flex: 1,
            minWidth: 100
          }}>
            <Typography variant="h6" color={colors.blueAccent?.[500] || '#2196f3'} fontWeight="bold">
              {unreadComments}
            </Typography>
            <Typography variant="caption" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}>
              Unread
            </Typography>
          </Box>
          <Box sx={{ 
            p: 2, 
            bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100], 
            borderRadius: 2,
            border: `1px solid ${colors.yellowAccent?.[500] || '#ff9800'}30`,
            flex: 1,
            minWidth: 100
          }}>
            <Typography variant="h6" color={colors.yellowAccent?.[500] || '#ff9800'} fontWeight="bold">
              {responseRequired}
            </Typography>
            <Typography variant="caption" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}>
              Need Response
            </Typography>
          </Box>
          <Box sx={{ 
            p: 2, 
            bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100], 
            borderRadius: 2,
            border: `1px solid ${colors.greenAccent?.[500] || '#4caf50'}30`,
            flex: 1,
            minWidth: 100
          }}>
            <Typography variant="h6" color={colors.greenAccent?.[500] || '#4caf50'} fontWeight="bold">
              {comments.length - unreadComments}
            </Typography>
            <Typography variant="caption" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}>
              Read
            </Typography>
          </Box>
        </Box>

        {/* Comments List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflowY: 'auto' }}>
          {comments.map((comment) => (
            <Box 
              key={comment.id}
              sx={{ 
                p: 2,
                borderRadius: 2,
                bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100],
                border: `1px solid ${getTypeColor(comment.type)}30`,
                borderLeft: `4px solid ${getTypeColor(comment.type)}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark' ? colors.primary[600] : colors.primary[200],
                  transform: 'translateX(4px)',
                }
              }}
            >
              <Box display="flex" alignItems="flex-start" gap={2}>
                <Avatar 
                  sx={{ 
                    bgcolor: getTypeColor(comment.type),
                    width: 40,
                    height: 40,
                    mt: 0.5
                  }}
                >
                  {getCommentIcon(comment.type)}
                </Avatar>
                
                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography 
                      variant="subtitle2" 
                      fontWeight="bold" 
                      color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}
                    >
                      {comment.projectName}
                    </Typography>
                    <Chip 
                      label={getTypeText(comment.type)} 
                      size="small" 
                      sx={{ 
                        bgcolor: getTypeColor(comment.type),
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.6rem',
                        height: 18
                      }}
                    />
                    <Chip 
                      label={comment.priority.toUpperCase()} 
                      size="small" 
                      sx={{ 
                        bgcolor: getPriorityColor(comment.priority),
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.6rem',
                        height: 18
                      }}
                    />
                    {!comment.isRead && (
                      <Chip 
                        label="NEW" 
                        size="small" 
                        sx={{ 
                          bgcolor: colors.blueAccent?.[500] || '#6870fa',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.6rem',
                          height: 18
                        }}
                      />
                    )}
                    {comment.requiresResponse && (
                      <Chip 
                        label="RESPONSE NEEDED" 
                        size="small" 
                        sx={{ 
                          bgcolor: colors.yellowAccent?.[500] || '#ff9800',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.6rem',
                          height: 18
                        }}
                      />
                    )}
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color={theme.palette.mode === 'dark' ? colors.grey[200] : colors.grey[700]}
                    sx={{ mb: 2 }}
                  >
                    {comment.comment}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <PersonIcon sx={{ fontSize: 12, color: theme.palette.mode === 'dark' ? colors.grey[400] : colors.grey[600] }} />
                        <Typography variant="caption" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}>
                          {comment.author} ({comment.authorRole})
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <ScheduleIcon sx={{ fontSize: 12, color: theme.palette.mode === 'dark' ? colors.grey[400] : colors.grey[600] }} />
                        <Typography variant="caption" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}>
                          {comment.timestamp}
                        </Typography>
                      </Box>
                      
                      {comment.attachments > 0 && (
                        <Typography variant="caption" color={colors.blueAccent?.[500] || '#6870fa'} fontWeight="bold">
                          {comment.attachments} attachment{comment.attachments > 1 ? 's' : ''}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  
                  <Box display="flex" gap={1}>
                    <Button 
                      size="small" 
                      variant="outlined"
                      startIcon={<ReplyIcon />}
                      onClick={() => handleReply(comment.id)}
                      sx={{ 
                        borderColor: colors.blueAccent?.[500] || '#6870fa',
                        color: colors.blueAccent?.[500] || '#6870fa',
                        fontSize: '0.6rem',
                        height: 20,
                        minWidth: 50,
                        '&:hover': { 
                          borderColor: colors.blueAccent?.[600] || '#535ac8',
                          bgcolor: colors.blueAccent?.[500] + '10'
                        }
                      }}
                    >
                      Reply
                    </Button>
                    
                    {!comment.isRead && (
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => handleMarkAsRead(comment.id)}
                        sx={{ 
                          borderColor: colors.greenAccent?.[500] || '#4caf50',
                          color: colors.greenAccent?.[500] || '#4caf50',
                          fontSize: '0.6rem',
                          height: 20,
                          minWidth: 50,
                          '&:hover': { 
                            borderColor: colors.greenAccent?.[600] || '#388e3c',
                            bgcolor: colors.greenAccent?.[500] + '10'
                          }
                        }}
                      >
                        Mark Read
                      </Button>
                    )}
                    
                    {comment.attachments > 0 && (
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => handleViewAttachments(comment.id)}
                        sx={{ 
                          borderColor: colors.yellowAccent?.[500] || '#ff9800',
                          color: colors.yellowAccent?.[500] || '#ff9800',
                          fontSize: '0.6rem',
                          height: 20,
                          minWidth: 50,
                          '&:hover': { 
                            borderColor: colors.yellowAccent?.[600] || '#f57c00',
                            bgcolor: colors.yellowAccent?.[500] + '10'
                          }
                        }}
                      >
                        View Files
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProjectCommentsCard;











