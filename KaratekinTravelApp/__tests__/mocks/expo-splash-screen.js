// expo-splash-screen ESM olarak yayinlaniyor ve transformIgnorePatterns
// node_modules'u disladigi icin jest onu ayristiramiyordu.
module.exports = {
  preventAutoHideAsync: async () => {},
  hideAsync: async () => {},
  setOptions: () => {},
};
