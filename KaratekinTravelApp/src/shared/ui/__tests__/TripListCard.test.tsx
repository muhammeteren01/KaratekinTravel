/**
 * @jest-environment jsdom
 */
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import TripListCard from "@/shared/ui/cards/TripListCard";

describe("TripListCard", () => {
  it("renders simple variant", () => {
    let rendered: any;
    act(() => {
      rendered = TestRenderer.create(
        <TripListCard
          image={{ uri: "https://example.com/img.jpg" } as any}
          title="Title"
          dateText="2025-01-01"
          city="City"
          region="Region"
          priceText="$100"
        />,
      );
    });
    expect(rendered.root).toBeTruthy();
  });

  it("renders allTrips variant", () => {
    let rendered: any;
    act(() => {
      rendered = TestRenderer.create(
        <TripListCard
          image={{ uri: "https://example.com/img.jpg" } as any}
          title="Title"
          variant="allTrips"
          dateText="2025-01-01"
          capacityText={"Kapasite 10 Kişi"}
          joinedText={"5 Kişi Katıldı"}
          priceText="$100"
        />,
      );
    });
    expect(rendered.root).toBeTruthy();
  });

  it("renders without crash", () => {
    let test: any;
    act(() => {
      test = TestRenderer.create(
        <TripListCard
          image={{ uri: "https://example.com/img.jpg" } as any}
          title="Title"
        />,
      );
    });
    expect(test.toJSON()).toBeTruthy();
  });
});
