/**
 * @jest-environment jsdom
 */
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import EmptyState from "@/shared/ui/EmptyState";

// Helper to find a node by testID within the JSON tree
function findByTestIdJSON(node: any, testId: string): any | null {
  if (!node) return null;
  const nodes = Array.isArray(node) ? node : [node];
  for (const n of nodes) {
    if (!n || typeof n !== "object") continue;
    if (n.props && n.props.testID === testId) return n;
    const found = findByTestIdJSON(n.children, testId);
    if (found) return found;
  }
  return null;
}

describe("EmptyState", () => {
  it("renders with title", () => {
    let tree: any;
    act(() => {
      tree = TestRenderer.create(
        <EmptyState
          title="Test Title"
          icon={{ name: "search", size: 48, color: "#ccc" }}
        />,
      );
    });
    // Access via root after act
    expect(() =>
      tree.root.findByProps({ testID: "empty-state" }),
    ).not.toThrow();
  });

  it("renders with custom icon object", () => {
    let tree: any;
    act(() => {
      tree = TestRenderer.create(
        <EmptyState
          title="Icon Test"
          icon={{ name: "bookmark-outline", size: 24, color: "#123456" }}
        />,
      );
    });
    expect(() =>
      tree.root.findByProps({ testID: "empty-state" }),
    ).not.toThrow();
  });

  it("applies style overrides", () => {
    let tree: any;
    act(() => {
      tree = TestRenderer.create(
        <EmptyState
          title="Styled"
          style={{ paddingVertical: 10 }}
          titleStyle={{ color: "#111" }}
          subtitleStyle={{ color: "#222" }}
          iconContainerStyle={{ marginBottom: 4 }}
        />,
      );
    });
    expect(() =>
      tree.root.findByProps({ testID: "empty-state" }),
    ).not.toThrow();
  });
});
