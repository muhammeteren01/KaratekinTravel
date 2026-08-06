/**
 * @jest-environment jsdom
 */
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import DateSeparator from "@/shared/ui/chat/DateSeparator";

describe("DateSeparator", () => {
  it("renders with date text", () => {
    let tree: any;
    act(() => {
      tree = TestRenderer.create(<DateSeparator text="Bugün" />);
    });

    const json = tree.toJSON();
    expect(json).toBeTruthy();
  });

  it("renders with different date text", () => {
    let tree: any;
    act(() => {
      tree = TestRenderer.create(<DateSeparator text="Yesterday" />);
    });

    const json = tree.toJSON();
    expect(json).toBeTruthy();
  });

  it("renders with custom styles", () => {
    let tree: any;
    act(() => {
      tree = TestRenderer.create(
        <DateSeparator
          text="Today"
          containerStyle={{ marginVertical: 12 }}
          textStyle={{ fontSize: 12 }}
        />,
      );
    });

    const json = tree.toJSON();
    expect(json).toBeTruthy();
  });

  it("updates when text changes", () => {
    let tree: any;
    act(() => {
      tree = TestRenderer.create(<DateSeparator text="Monday" />);
    });

    // Update with new text
    act(() => {
      tree.update(<DateSeparator text="Tuesday" />);
    });

    const json = tree.toJSON();
    expect(json).toBeTruthy();
  });
});
