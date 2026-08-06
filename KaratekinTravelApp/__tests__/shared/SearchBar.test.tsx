/**
 * @jest-environment jsdom
 */
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import SearchBar from "@/shared/ui/SearchBar";

jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));

describe("SearchBar", () => {
  it("renders with default props", () => {
    let tree: any;
    const onChangeText = jest.fn();
    act(() => {
      tree = TestRenderer.create(
        <SearchBar
          value=""
          onChangeText={onChangeText}
          placeholder="Search..."
        />,
      );
    });
    expect(tree.root).toBeTruthy();
  });

  it("renders with value and filter button", () => {
    let tree: any;
    const onChangeText = jest.fn();
    const onFilterPress = jest.fn();
    act(() => {
      tree = TestRenderer.create(
        <SearchBar
          value="test query"
          onChangeText={onChangeText}
          onFilterPress={onFilterPress}
          placeholder="Gezi Ara..."
        />,
      );
    });
    expect(tree.root).toBeTruthy();
  });

  it("renders with compact size", () => {
    let tree: any;
    const onChangeText = jest.fn();
    act(() => {
      tree = TestRenderer.create(
        <SearchBar
          value=""
          onChangeText={onChangeText}
          size="compact"
          placeholder="Ara..."
        />,
      );
    });
    expect(tree.root).toBeTruthy();
  });

  it("renders with outline variant", () => {
    let tree: any;
    const onChangeText = jest.fn();
    act(() => {
      tree = TestRenderer.create(
        <SearchBar
          value=""
          onChangeText={onChangeText}
          variant="outline"
          placeholder="Search..."
        />,
      );
    });
    expect(tree.root).toBeTruthy();
  });

  it("renders with clear button when value is present", () => {
    let tree: any;
    const onChangeText = jest.fn();
    const onClear = jest.fn();
    act(() => {
      tree = TestRenderer.create(
        <SearchBar
          value="search text"
          onChangeText={onChangeText}
          onClear={onClear}
          placeholder="Search..."
        />,
      );
    });
    expect(tree.root).toBeTruthy();
  });
});
