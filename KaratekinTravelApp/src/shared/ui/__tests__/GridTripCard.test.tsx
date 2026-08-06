/**
 * @jest-environment jsdom
 */
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import GridTripCard from "@/shared/ui/cards/GridTripCard";

describe("GridTripCard", () => {
  it("renders with price and rating", () => {
    let rendered: any;
    act(() => {
      rendered = TestRenderer.create(
        <GridTripCard
          image={{ uri: "https://example.com/img.jpg" } as any}
          title="Title"
          locationText="Location"
          priceText="$100"
          rating={4.5}
        />,
      );
    });
    expect(rendered.root).toBeTruthy();
  });

  it("renders minimal", () => {
    let rendered: any;
    act(() => {
      rendered = TestRenderer.create(
        <GridTripCard
          image={{ uri: "https://example.com/img.jpg" } as any}
          title="Title"
          locationText="Location"
        />,
      );
    });
    expect(rendered.root).toBeTruthy();
  });

  it("renders without crash", () => {
    let test: any;
    act(() => {
      test = TestRenderer.create(
        <GridTripCard
          image={{ uri: "https://example.com/img.jpg" } as any}
          title="Title"
          locationText="Location"
        />,
      );
    });
    expect(test.toJSON()).toBeTruthy();
  });
});
