require('dotenv').config();
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    eas: { ...(config.extra?.eas || {}), projectId: "cb326385-0d3e-47e6-af70-5fd5080bf156" },
  },
});