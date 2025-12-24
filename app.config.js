require('dotenv').config();
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    eas: { ...(config.extra?.eas || {}), projectId: process.env.EAS_PROJECT_ID },
  },
});