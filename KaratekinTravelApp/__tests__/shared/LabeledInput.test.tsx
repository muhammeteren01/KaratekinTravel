/**
 * @jest-environment jsdom
 */
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import LabeledInput from "@/shared/ui/form/LabeledInput";
import { Text } from "react-native";

describe("LabeledInput", () => {
  it("renders with default props", () => {
    let tree: any;
    const onChangeText = jest.fn();
    act(() => {
      tree = TestRenderer.create(
        <LabeledInput
          label="Email"
          value="test@example.com"
          onChangeText={onChangeText}
          placeholder="Enter email"
        />,
      );
    });
    expect(tree.root).toBeTruthy();
  });

  it("renders with filled variant", () => {
    let tree: any;
    const onChangeText = jest.fn();
    act(() => {
      tree = TestRenderer.create(
        <LabeledInput
          label="Kart Numarası"
          value="1234 5678"
          onChangeText={onChangeText}
          placeholder="0000 0000 0000 0000"
          variant="filled"
          size="md"
          keyboardType="numeric"
        />,
      );
    });
    expect(tree.root).toBeTruthy();
  });

  it("renders with outline variant and prefix", () => {
    let tree: any;
    const onChangeText = jest.fn();
    act(() => {
      tree = TestRenderer.create(
        <LabeledInput
          label="Telefon Numarası"
          value="5551234567"
          onChangeText={onChangeText}
          placeholder="Telefon numaranızı girin"
          variant="outline"
          size="md"
          keyboardType="phone-pad"
          prefix={
            <Text style={{ fontSize: 16, color: "#333", fontWeight: "500" }}>
              +90
            </Text>
          }
        />,
      );
    });
    expect(tree.root).toBeTruthy();
  });

  it("renders with error text", () => {
    let tree: any;
    const onChangeText = jest.fn();
    act(() => {
      tree = TestRenderer.create(
        <LabeledInput
          label="İsim"
          value=""
          onChangeText={onChangeText}
          placeholder="İsminizi girin"
          errorText="Bu alan zorunludur"
          variant="outline"
        />,
      );
    });
    expect(tree.root).toBeTruthy();
  });

  it("renders with secure text entry", () => {
    let tree: any;
    const onChangeText = jest.fn();
    act(() => {
      tree = TestRenderer.create(
        <LabeledInput
          label="Şifre"
          value="secret123"
          onChangeText={onChangeText}
          placeholder="Şifrenizi girin"
          secureTextEntry
          variant="filled"
        />,
      );
    });
    expect(tree.root).toBeTruthy();
  });
});
