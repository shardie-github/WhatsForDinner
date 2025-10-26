const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for workspace packages
const workspaceRoot = path.resolve(__dirname, '../..');
const projectRoot = __dirname;

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Add support for .native.tsx and .web.tsx files
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;