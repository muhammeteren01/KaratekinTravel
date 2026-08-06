/**
 * @jest-environment jsdom
 */
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import ChatComposer from "@/shared/ui/chat/ChatComposer";

describe("ChatComposer", () => {
  it("renders with empty value", () => {
    let tree: any;
    const mockOnChange = jest.fn();
    const mockOnSend = jest.fn();

    act(() => {
      tree = TestRenderer.create(
        <ChatComposer
          value=""
          onChangeText={mockOnChange}
          onSend={mockOnSend}
        />,
      );
    });

    const json = tree.toJSON();
    expect(json).toBeTruthy();
  });

  it("renders with text value", () => {
    let tree: any;
    const mockOnChange = jest.fn();
    const mockOnSend = jest.fn();

    act(() => {
      tree = TestRenderer.create(
        <ChatComposer
          value="Hello world"
          onChangeText={mockOnChange}
          onSend={mockOnSend}
        />,
      );
    });

    const json = tree.toJSON();
    expect(json).toBeTruthy();
  });

  it("renders with custom placeholder", () => {
    let tree: any;
    const mockOnChange = jest.fn();
    const mockOnSend = jest.fn();

    act(() => {
      tree = TestRenderer.create(
        <ChatComposer
          value=""
          onChangeText={mockOnChange}
          onSend={mockOnSend}
          placeholder="Type here..."
        />,
      );
    });

    const json = tree.toJSON();
    expect(json).toBeTruthy();
  });

  it("renders in disabled state", () => {
    let tree: any;
    const mockOnChange = jest.fn();
    const mockOnSend = jest.fn();

    act(() => {
      tree = TestRenderer.create(
        <ChatComposer
          value="Test"
          onChangeText={mockOnChange}
          onSend={mockOnSend}
          disabled={true}
        />,
      );
    });

    const json = tree.toJSON();
    expect(json).toBeTruthy();
  });

  it("updates when value changes", () => {
    let tree: any;
    const mockOnChange = jest.fn();
    const mockOnSend = jest.fn();

    act(() => {
      tree = TestRenderer.create(
        <ChatComposer
          value=""
          onChangeText={mockOnChange}
          onSend={mockOnSend}
        />,
      );
    });

    // Update with new value
    act(() => {
      tree.update(
        <ChatComposer
          value="New message"
          onChangeText={mockOnChange}
          onSend={mockOnSend}
        />,
      );
    });

    const json = tree.toJSON();
    expect(json).toBeTruthy();
  });
});
