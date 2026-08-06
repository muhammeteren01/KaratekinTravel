/**
 * @jest-environment jsdom
 */
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import FilterChips from "@/shared/ui/FilterChips";

describe("FilterChips", () => {
  it("renders with default props", () => {
    let tree: any;
    const onSelect = jest.fn();
    act(() => {
      tree = TestRenderer.create(
        <FilterChips
          items={["Chip 1", "Chip 2", "Chip 3"]}
          selected="Chip 1"
          onSelect={onSelect}
        />,
      );
    });
    expect(tree.root).toBeTruthy();
  });

  it("renders with filled variant", () => {
    let tree: any;
    const onSelect = jest.fn();
    act(() => {
      tree = TestRenderer.create(
        <FilterChips
          items={[
            "Fiyata Göre Sırala",
            "En Çok Beğenilen",
            "Tarihe Göre Sırala",
          ]}
          selected="En Çok Beğenilen"
          onSelect={onSelect}
          variant="filled"
        />,
      );
    });
    expect(tree.root).toBeTruthy();
  });

  it("renders with outline variant", () => {
    let tree: any;
    const onSelect = jest.fn();
    act(() => {
      tree = TestRenderer.create(
        <FilterChips
          items={["Option A", "Option B", "Option C"]}
          selected="Option A"
          onSelect={onSelect}
          variant="outline"
        />,
      );
    });
    expect(tree.root).toBeTruthy();
  });

  it("renders with multiple selection", () => {
    let tree: any;
    const onSelect = jest.fn();
    act(() => {
      tree = TestRenderer.create(
        <FilterChips
          items={["Tag 1", "Tag 2", "Tag 3", "Tag 4"]}
          selected={["Tag 1", "Tag 3"]}
          onSelect={onSelect}
          multiple
        />,
      );
    });
    expect(tree.root).toBeTruthy();
  });

  it("renders non-scrollable chips", () => {
    let tree: any;
    const onSelect = jest.fn();
    act(() => {
      tree = TestRenderer.create(
        <FilterChips
          items={["Short", "List"]}
          selected="Short"
          onSelect={onSelect}
          scrollable={false}
        />,
      );
    });
    expect(tree.root).toBeTruthy();
  });
});
