/**
 * @jest-environment jsdom
 */
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import ReviewCard from "@/shared/ui/cards/ReviewCard";

describe("ReviewCard", () => {
  it("renders with avatar and date", () => {
    let rendered: any;
    act(() => {
      rendered = TestRenderer.create(
        <ReviewCard
          avatar={{ uri: "https://example.com/a.jpg" } as any}
          name="John Doe"
          rating={4}
          date="2025-01-01"
          text="Nice trip!"
        />,
      );
    });
    expect(rendered.root).toBeTruthy();
  });

  it("renders minimal", () => {
    let rendered: any;
    act(() => {
      rendered = TestRenderer.create(
        <ReviewCard name="Jane" rating={5} text="Great!" />,
      );
    });
    expect(rendered.root).toBeTruthy();
  });

  it("renders without crash", () => {
    let test: any;
    act(() => {
      test = TestRenderer.create(
        <ReviewCard name="User" rating={3} text="ok" />,
      );
    });
    expect(test.toJSON()).toBeTruthy();
  });
});
