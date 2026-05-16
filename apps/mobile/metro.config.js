const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Watch monorepo root
config.watchFolders = [
  ...(config.watchFolders || []),
  workspaceRoot,
];

// 2. Resolve node_modules from both app and workspace
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// 3. Prevent duplicate versions of core packages
config.resolver.extraNodeModules = {
  react: path.resolve(workspaceRoot, "node_modules/react"),
  "react-native": path.resolve(workspaceRoot, "node_modules/react-native"),
  "expo-router": path.resolve(workspaceRoot, "node_modules/expo-router"),
  "@react-navigation/native": path.resolve(workspaceRoot, "node_modules/@react-navigation/native"),
};

// 4. FIX FOR WEB — required for Expo SDK 55
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

module.exports = withNativeWind(config, { input: "./global.css" });
