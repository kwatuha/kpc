import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Tooltip
} from '@mui/material';
import { 
  SentimentVeryDissatisfied,
  SentimentDissatisfied,
  SentimentNeutral,
  SentimentSatisfied,
  SentimentVerySatisfied
} from '@mui/icons-material';

/**
 * RatingInput Component - 5-point Likert scale rating input
 * 
 * @param {string} label - The question/label for the rating
 * @param {string} name - Field name for form data
 * @param {number} value - Current rating value (1-5)
 * @param {function} onChange - Handler for value changes
 * @param {array} descriptions - Array of 5 description strings for each rating level
 * @param {boolean} disabled - Whether the input is disabled
 */
const RatingInput = ({ 
  label, 
  name, 
  value, 
  onChange, 
  descriptions = [],
  disabled = false 
}) => {
  const defaultDescriptions = [
    'Strongly Oppose / Very Poor',
    'Oppose / Poor',
    'Neutral / Adequate',
    'Support / Good',
    'Strongly Support / Excellent'
  ];

  const displayDescriptions = descriptions.length === 5 ? descriptions : defaultDescriptions;

  const emoticons = [
    <SentimentVeryDissatisfied key="1" />,
    <SentimentDissatisfied key="2" />,
    <SentimentNeutral key="3" />,
    <SentimentSatisfied key="4" />,
    <SentimentVerySatisfied key="5" />
  ];

  const colors = [
    '#f44336', // Red - 1
    '#ff9800', // Orange - 2
    '#fdd835', // Yellow - 3
    '#8bc34a', // Light Green - 4
    '#4caf50'  // Green - 5
  ];

  const handleChange = (event) => {
    const newValue = parseInt(event.target.value);
    onChange({ target: { name, value: newValue } });
  };

  return (
    <Box sx={{ mb: 3 }}>
      <FormControl component="fieldset" fullWidth disabled={disabled}>
        <FormLabel 
          component="legend" 
          sx={{ 
            fontWeight: 'bold', 
            color: 'text.primary',
            mb: 2,
            fontSize: '1rem',
            lineHeight: 1.6
          }}
        >
          {label}
        </FormLabel>
        
        <RadioGroup
          row
          name={name}
          value={value || ''}
          onChange={handleChange}
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1
          }}
        >
          {[1, 2, 3, 4, 5].map((rating) => (
            <Tooltip 
              key={rating} 
              title={displayDescriptions[rating - 1]} 
              arrow 
              placement="top"
            >
              <Paper
                elevation={value === rating ? 4 : 1}
                sx={{
                  flex: '1 1 0',
                  minWidth: { xs: '70px', sm: '85px', md: '100px' },
                  textAlign: 'center',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  border: value === rating 
                    ? `4px solid ${colors[rating - 1]}` // Thicker border when selected
                    : '2px solid #e0e0e0',
                  backgroundColor: value === rating 
                    ? `${colors[rating - 1]}20` // Slightly more visible background when selected
                    : 'white',
                  boxShadow: value === rating 
                    ? `0 4px 12px ${colors[rating - 1]}40` // Add shadow with rating color
                    : undefined,
                  '&:hover': {
                    transform: disabled ? 'none' : 'translateY(-4px)',
                    boxShadow: disabled ? 1 : 6,
                    borderColor: colors[rating - 1],
                    backgroundColor: `${colors[rating - 1]}08`
                  }
                }}
              >
                <FormControlLabel
                  value={rating}
                  control={
                    <Radio 
                      sx={{ 
                        display: 'none' // Hide default radio button
                      }} 
                    />
                  }
                  label={
                    <Box sx={{ py: 2, px: { xs: 0.5, sm: 1, md: 1.5 } }}>
                      <Box 
                        sx={{ 
                          color: colors[rating - 1],
                          fontSize: { xs: '1.75rem', sm: '2rem' },
                          display: 'flex',
                          justifyContent: 'center',
                          mb: 0.5
                        }}
                      >
                        {emoticons[rating - 1]}
                      </Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: { xs: '1.1rem', sm: '1.25rem' },
                          color: 'text.primary' // Always dark for readability
                        }}
                      >
                        {rating}
                      </Typography>
                      <Box 
                        sx={{ 
                          display: { xs: 'none', md: 'block' },
                        }}
                      >
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'rgba(0, 0, 0, 0.75)', // Always dark for readability
                            fontSize: '0.75rem',
                            fontWeight: value === rating ? 600 : 500, // Bolder when selected
                            lineHeight: 1.3,
                            mt: 0.5,
                            minHeight: '38px',
                            px: 0.5,
                            wordWrap: 'break-word'
                          }}
                        >
                          {displayDescriptions[rating - 1].split('/')[0].trim()}
                        </Typography>
                      </Box>
                    </Box>
                  }
                  sx={{ 
                    margin: 0,
                    width: '100%',
                    '& .MuiFormControlLabel-label': {
                      width: '100%'
                    }
                  }}
                />
              </Paper>
            </Tooltip>
          ))}
        </RadioGroup>

        {/* Description for selected rating */}
        {value && (
          <Box 
            sx={{ 
              mt: 2, 
              p: 2.5, 
              backgroundColor: `${colors[value - 1]}15`,
              borderLeft: `5px solid ${colors[value - 1]}`,
              borderRadius: '8px',
              boxShadow: `0 2px 8px ${colors[value - 1]}20`
            }}
          >
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'rgba(0, 0, 0, 0.87)',
                fontWeight: 500,
                fontSize: '0.95rem',
                lineHeight: 1.6
              }}
            >
              <Box component="span" sx={{ fontWeight: 700, color: colors[value - 1] }}>
                Selected Rating {value}/5:
              </Box>{' '}
              {displayDescriptions[value - 1]}
            </Typography>
          </Box>
        )}
      </FormControl>
    </Box>
  );
};

export default RatingInput;

