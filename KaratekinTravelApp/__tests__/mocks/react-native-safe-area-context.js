module.exports = {
  SafeAreaView: ({ children }) => children || null,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
};
