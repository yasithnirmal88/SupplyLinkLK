module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": ".",
            "react-native-worklets/plugin": "react-native-worklets-core/plugin",
          },
        },
      ],
      "nativewind/babel",
      "react-native-worklets-core/plugin",
      "react-native-reanimated/plugin",
    ],
  };
};