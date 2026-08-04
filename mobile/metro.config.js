const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for .mjs files (often used by Firebase 11+)
config.resolver.sourceExts.push('mjs');

module.exports = config;
