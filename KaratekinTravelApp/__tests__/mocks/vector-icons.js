// @expo/vector-icons ikonlari test agacinda gorsel olarak anlamsiz;
// isimlendirilmis bos bilesenler donduruluyor.
const React = require('react');
const makeIcon = (name) => {
  const Icon = (props) => React.createElement('Icon', { ...props, family: name });
  Icon.displayName = name;
  return Icon;
};
module.exports = new Proxy({}, {
  get: (_t, prop) => (prop === '__esModule' ? false : makeIcon(String(prop))),
});
