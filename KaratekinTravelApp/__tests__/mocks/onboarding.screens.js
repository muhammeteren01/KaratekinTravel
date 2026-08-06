const React = require("react");

exports.SplashScreen = ({ onAnimationFinish }) => {
  React.useEffect(() => {
    onAnimationFinish && onAnimationFinish();
  }, [onAnimationFinish]);
  return React.createElement("div", null, "Splash");
};

exports.OnboardingScreen = ({ onComplete }) => {
  return React.createElement(
    "button",
    { onClick: () => onComplete && onComplete() },
    "Onboarding",
  );
};
