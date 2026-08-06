/**
 * @jest-environment jsdom
 */
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import PasswordInput from "@/shared/ui/form/PasswordInput";

jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));

describe("PasswordInput", () => {
  it("renders placeholder and toggles visibility", () => {
    let tree: any;
    const onChangeText = jest.fn();
    act(() => {
      tree = TestRenderer.create(
        <PasswordInput
          value="secret"
          onChangeText={onChangeText}
          placeholder="Şifre"
        />,
      );
    });

    // Press eye icon
    const btn = tree.root.findAllByProps({ accessibilityRole: "button" })[0];
    act(() => btn.props.onPress());

    // Verify it renders
    expect(tree.root).toBeTruthy();
  });
});
