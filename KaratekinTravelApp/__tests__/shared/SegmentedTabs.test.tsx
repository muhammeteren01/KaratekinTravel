/**
 * @jest-environment jsdom
 */
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import SegmentedTabs from "@/shared/ui/SegmentedTabs";

describe("SegmentedTabs", () => {
  it("renders with default props", () => {
    let tree: any;
    const onChange = jest.fn();
    act(() => {
      tree = TestRenderer.create(
        <SegmentedTabs
          items={["Tab 1", "Tab 2", "Tab 3"]}
          value="Tab 1"
          onChange={onChange}
        />,
      );
    });
    expect(tree.root).toBeTruthy();
  });

  it("renders with filled variant", () => {
    let tree: any;
    const onChange = jest.fn();
    act(() => {
      tree = TestRenderer.create(
        <SegmentedTabs
          items={["En Çok Beğenilen", "Tarih", "Fiyat"]}
          value="En Çok Beğenilen"
          onChange={onChange}
          variant="filled"
          size="md"
        />,
      );
    });
    expect(tree.root).toBeTruthy();
  });

  it("renders with outline variant", () => {
    let tree: any;
    const onChange = jest.fn();
    act(() => {
      tree = TestRenderer.create(
        <SegmentedTabs
          items={["En Son", "Arşiv"]}
          value="En Son"
          onChange={onChange}
          variant="outline"
          size="lg"
          scrollable={false}
        />,
      );
    });
    expect(tree.root).toBeTruthy();
  });

  it("renders scrollable tabs", () => {
    let tree: any;
    const onChange = jest.fn();
    act(() => {
      tree = TestRenderer.create(
        <SegmentedTabs
          items={["Tab 1", "Tab 2", "Tab 3", "Tab 4", "Tab 5"]}
          value="Tab 3"
          onChange={onChange}
          scrollable
          size="sm"
        />,
      );
    });
    expect(tree.root).toBeTruthy();
  });
});
