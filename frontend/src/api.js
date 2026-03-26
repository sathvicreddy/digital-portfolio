// Central API configuration
// Automatically uses localhost in development, production URL when deployed
export const API_BASE = import.meta.env.DEV
  ? 'http://localhost:5000'
  : 'https://digital-portfolio-xsmf.onrender.com';
