module.exports = {
  __esModule: true,
  default: {
    addEventListener: (cb) => {
      cb({ isConnected: true });
      return () => {};
    },
    fetch: async () => ({ isConnected: true }),
  },
};
