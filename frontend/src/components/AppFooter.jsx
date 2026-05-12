import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * @param {{
 *   variant?: 'inline' | 'fixed';
 *   barColor?: string;
 *   contact?: React.ReactNode;
 * }} props
 * — inline: sits in document flow (e.g. bottom of main column)
 * — fixed: full viewport width at bottom (e.g. login/register)
 * — barColor: footer background (default gray for app shell)
 * — contact: optional row above copyright (e.g. portal links on auth pages)
 */
export default function AppFooter({ variant = 'inline', barColor = '#424242', contact = null }) {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      role="contentinfo"
      sx={{
        width: '100%',
        flexShrink: 0,
        bgcolor: barColor,
        color: 'rgba(255, 255, 255, 0.92)',
        py: contact ? { xs: 1.75, sm: 1.5 } : 1.25,
        px: { xs: 1.5, sm: 2 },
        textAlign: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        ...(variant === 'fixed'
          ? {
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1300,
            }
          : {}),
      }}
    >
      {contact ? (
        <Box
          sx={{
            maxWidth: 960,
            mx: 'auto',
            mb: 1.25,
            pb: 1.25,
            borderBottom: '1px solid rgba(255, 255, 255, 0.14)',
            fontSize: '0.75rem',
            lineHeight: 1.6,
            color: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          {contact}
        </Box>
      ) : null}
      <Typography variant="caption" component="p" sx={{ m: 0, fontSize: '0.8125rem', opacity: 0.92 }}>
        © {year} Kenya Medical Research Institute · KIMES — Integrated Monitoring &amp; Evaluation System.
      </Typography>
    </Box>
  );
}
