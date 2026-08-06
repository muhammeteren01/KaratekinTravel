/**
 * @jest-environment jsdom
 */
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import ChatContainer from "@/shared/ui/chat/ChatContainer";
import { View, Text } from "react-native";

describe("ChatContainer", () => {
  it("renders with children", () => {
    let tree: any;

    act(() => {
      tree = TestRenderer.create(
        <ChatContainer>
          <View>
            <Text>Test Content</Text>
          </View>
        </ChatContainer>,
      );
    });

    const json = tree.toJSON();
    expect(json).toBeTruthy();
  });

  it("renders with custom style", () => {
    let tree: any;

    act(() => {
      tree = TestRenderer.create(
        <ChatContainer style={{ backgroundColor: "#FFF" }}>
          <View />
        </ChatContainer>,
      );
    });

    const json = tree.toJSON();
    expect(json).toBeTruthy();
  });

  it("renders multiple children", () => {
    let tree: any;

    act(() => {
      tree = TestRenderer.create(
        <ChatContainer>
          <View />
          <View />
          <View />
        </ChatContainer>,
      );
    });

    const json = tree.toJSON();
    expect(json).toBeTruthy();
  });
});
