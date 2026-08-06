/**
 * @jest-environment jsdom
 */
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import SavedTripsScreen from "@/features/trips/screens/SavedTripsScreen";

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));
jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("@/shared/ui", () => {
  const actual = jest.requireActual("@/shared/ui");
  return {
    ...actual,
    AppHeader: ({ children }: any) => children || null,
  };
});

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

describe("SavedTripsScreen empty state", () => {
  it("shows EmptyState when list is empty", () => {
    let tree: any;
    act(() => {
      tree = TestRenderer.create(
        <SavedTripsScreen
          onBack={() => {}}
          savedTrips={[]}
          onBookmarkTrip={() => {}}
          onTripPress={() => {}}
        />,
      );
    });
    expect(() =>
      tree.root.findByProps({ testID: "empty-state" }),
    ).not.toThrow();
  });
});
