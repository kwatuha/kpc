import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { tokens } from '../../pages/dashboard/theme';

const TypingIndicator = ({ users }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  // Helper function to check if current mode is a dark theme
  const isDarkMode = theme.palette.mode === 'dark';

  if (!users || users.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0]} is typing...`;
    } else if (users.length === 2) {
      return `${users[0]} and ${users[1]} are typing...`;
    } else {
      return `${users[0]} and ${users.length - 1} others are typing...`;
    }
  };

  return (
    <Box
      sx={{
        px: 2,
        py: 1,
        backgroundColor: isDarkMode ? colors.primary[500] : colors.primary[50],
        borderTop: `1px solid ${isDarkMode ? colors.primary[200] : colors.primary[100]}`
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {/* Animated typing dots */}
          {[0, 1, 2].map((dot) => (
            <Box
              key={dot}
              sx={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                backgroundColor: isDarkMode ? colors.grey[300] : colors.grey[600],
                animation: 'typing 1.4s infinite',
                animationDelay: `${dot * 0.2}s`,
                '@keyframes typing': {
                  '0%, 60%, 100%': {
                    transform: 'translateY(0)',
                    opacity: 0.5
                  },
                  '30%': {
                    transform: 'translateY(-10px)',
                    opacity: 1
                  }
                }
              }}
            />
          ))}
        </Box>
        <Typography
          variant="body2"
          sx={{
            color: isDarkMode ? colors.grey[300] : colors.grey[600],
            fontStyle: 'italic'
          }}
        >
          {getTypingText()}
        </Typography>
      </Box>
    </Box>
  );
};

export default TypingIndicator;

