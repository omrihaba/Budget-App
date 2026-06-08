const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.serializer = config.serializer || {};
const originalGetPolyfills = config.serializer.getPolyfills;
config.serializer.getPolyfills = ({ platform }) => {
  const custom = [path.resolve(__dirname, 'polyfills.js')];
  const base = originalGetPolyfills ? originalGetPolyfills({ platform }) : [];
  return [...custom, ...base];
};

module.exports = config;
