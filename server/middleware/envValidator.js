const validateEnv = () => {
  const required = [
    'FIREBASE_SERVICE_ACCOUNT',
    'JWT_SECRET',
    'ADMIN_PASSWORD',
    'NODE_ENV'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('================================================');
    console.error('CRITICAL ERROR: Missing Environment Variables');
    console.error('The following variables are required but missing:');
    missing.forEach(v => console.error(` - ${v}`));
    console.error('------------------------------------------------');
    console.error('To prevent a restart loop on Render, the server');
    console.error('will continue to run in a DEGRADED state.');
    console.error('API requests requiring a database will fail until');
    console.error('these variables are configured.');
    console.error('================================================');

    // We return false to indicate validation failed,
    // but we don't exit here to allow the server to "stay up" and avoid loops.
    return {
      success: false,
      missing
    };
  }

  console.log('✅ Environment variables validated successfully.');
  return {
    success: true,
    missing: []
  };
};

module.exports = validateEnv;
