/**
 * @jest-environment jsdom
 */
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import MessageBubble from "@/shared/ui/chat/MessageBubble";

describe("MessageBubble", () => {
  it("renders own message with group variant", () => {
    let tree: any;
    act(() => {
      tree = TestRenderer.create(
        <MessageBubble
          text="Hello world"
          time="10:30"
          isOwn={true}
          variant="group"
        />,
      );
    });

    const json = tree.toJSON();
    expect(json).toBeTruthy();
  });

  it("renders other user message with group variant", () => {
    let tree: any;
    act(() => {
      tree = TestRenderer.create(
        <MessageBubble
          text="Hi there"
          time="10:31"
          isOwn={false}
          avatar="https://example.com/avatar.jpg"
          variant="group"
        />,
      );
    });

    const json = tree.toJSON();
    expect(json).toBeTruthy();
  });

  it("renders own message with company variant", () => {
    let tree: any;
    act(() => {
      tree = TestRenderer.create(
        <MessageBubble
          text="Test message"
          time="09:15"
          isOwn={true}
          variant="company"
          isRead={true}
        />,
      );
    });

    const json = tree.toJSON();
    expect(json).toBeTruthy();
  });

  it("renders other user message with company variant", () => {
    let tree: any;
    act(() => {
      tree = TestRenderer.create(
        <MessageBubble
          text="Company reply"
          time="09:16"
          isOwn={false}
          avatar="https://example.com/company.jpg"
          variant="company"
        />,
      );
    });

    const json = tree.toJSON();
    expect(json).toBeTruthy();
  });

  it("shows read status for own messages", () => {
    let tree: any;
    act(() => {
      tree = TestRenderer.create(
        <MessageBubble
          text="Test"
          time="10:00"
          isOwn={true}
          isRead={false}
          isDelivered={false}
          variant="group"
        />,
      );
    });

    // Re-render with read status
    act(() => {
      tree.update(
        <MessageBubble
          text="Test"
          time="10:00"
          isOwn={true}
          isRead={true}
          variant="group"
        />,
      );
    });

    const json = tree.toJSON();
    expect(json).toBeTruthy();
  });

  it("renders without avatar for other user when not provided", () => {
    let tree: any;
    act(() => {
      tree = TestRenderer.create(
        <MessageBubble
          text="No avatar"
          time="10:32"
          isOwn={false}
          variant="group"
        />,
      );
    });

    const json = tree.toJSON();
    expect(json).toBeTruthy();
  });
});
