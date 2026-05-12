import { Typography, Box, useTheme } from "@mui/material";
import { tokens } from "./theme";

const Header = ({ title, subtitle }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box display="flex" alignItems="baseline" gap={1} flexWrap="wrap">
      <Typography
        variant="h2"
        color={colors.grey[100]}
        fontWeight="bold"
        sx={{ m: 0, fontSize: { xs: '1.1rem', sm: '1.35rem', md: '1.55rem' }, lineHeight: 1.2 }}
      >
        {title}
      </Typography>
      {subtitle && (
        <>
          <Typography 
            component="span" 
            sx={{ 
              color: colors.greenAccent[400], 
              fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.85rem' },
              fontWeight: 500,
              opacity: 0.8
            }}
          >
            •
          </Typography>
          <Typography 
            component="span" 
            variant="h5" 
            color={colors.greenAccent[400]} 
            sx={{ 
              fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.85rem' },
              fontWeight: 500,
              lineHeight: 1.2
            }}
          >
            {subtitle}
          </Typography>
        </>
      )}
    </Box>
  );
};

export default Header;
