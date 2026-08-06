const React = require("react");

const createElement = (tag) =>
  React.forwardRef((props, ref) =>
    React.createElement(tag, { ref, ...props }, props.children),
  );

const noop = () => {};

const Dimensions = {
  get: () => ({ width: 375, height: 667, scale: 2, fontScale: 2 }),
  addEventListener: noop,
  removeEventListener: noop,
};

const AppState = {
  addEventListener: (_, cb) => ({ remove: noop }),
  removeEventListener: noop,
};

const Animated = {
  Value: function (v) {
    this._v = v;
  },
  spring: () => ({ start: (cb) => cb && cb() }),
  timing: () => ({ start: (cb) => cb && cb() }),
};

const StyleSheet = { create: (styles) => styles, flatten: (s) => s };

// Simple FlatList mock that renders children from data or ListEmptyComponent
const FlatList = ({
  data = [],
  renderItem,
  ListEmptyComponent,
  children,
  ...rest
}) => {
  const content =
    Array.isArray(data) && data.length > 0 && typeof renderItem === "function"
      ? data.map((item, index) => renderItem({ item, index }))
      : typeof ListEmptyComponent === "function"
        ? React.createElement(ListEmptyComponent)
        : ListEmptyComponent || null;
  return React.createElement("div", { ...rest }, content || children);
};

module.exports = {
  // Primitives as web tags for jsdom
  View: createElement("div"),
  Text: createElement("span"),
  Image: createElement("img"),
  ScrollView: createElement("div"),
  FlatList,
  TouchableOpacity: createElement("button"),
  TouchableHighlight: createElement("button"),
  TouchableWithoutFeedback: createElement("div"),
  Modal: createElement("div"),
  TextInput: createElement("input"),
  StyleSheet,
  Dimensions,
  AppState,
  Animated,
  Platform: { OS: "ios", select: (o) => o.ios },
};
