import { Text, TextInput } from "react-native";

// Ensure default allowFontScaling=false globally without touching styles
// Only set once

const apply = () => {
  if (typeof (Text as any).defaultProps === "undefined")
    (Text as any).defaultProps = {};
  if (typeof (TextInput as any).defaultProps === "undefined")
    (TextInput as any).defaultProps = {};
  (Text as any).defaultProps.allowFontScaling = false;
  (TextInput as any).defaultProps.allowFontScaling = false;
};

export default apply;
