/**
 * @jest-environment jsdom
 */
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import BottomTabBar from "@/shared/ui/navigation/BottomTabBar";

describe("BottomTabBar", () => {
  it("renders with home active", () => {
    let rendered: any;
    act(() => {
      rendered = TestRenderer.create(
        <BottomTabBar active={"home" as any} onPress={() => {}} />,
      );
    });
    expect(rendered.root).toBeTruthy();
  });

  it("renders with profile active", () => {
    let rendered: any;
    act(() => {
      rendered = TestRenderer.create(
        <BottomTabBar active={"profile" as any} onPress={() => {}} />,
      );
    });
    expect(rendered.root).toBeTruthy();
  });

  it("renders without crash", () => {
    let test: any;
    act(() => {
      test = TestRenderer.create(
        <BottomTabBar active={"home" as any} onPress={() => {}} />,
      );
    });
    expect(test.toJSON()).toBeTruthy();
  });
});
