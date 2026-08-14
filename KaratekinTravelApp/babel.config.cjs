module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': './src',
          },
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        },
      ],
      // Reanimated/Worklets babel eklentisi burada listelenmiyor:
      // SDK 54'te babel-preset-expo, react-native-worklets kuruluysa
      // eklentiyi kendisi ekliyor. Elle eklemek onu iki kez uygular.
    ],
  };
};
