/**
 * @jest-environment jsdom
 */
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import ReportButton from "@/shared/ui/chat/ReportButton";

describe("ReportButton", () => {
  it("renders with default text", () => {
    let tree: any;
    const mockOnPress = jest.fn();

    act(() => {
      tree = TestRenderer.create(<ReportButton onPress={mockOnPress} />);
    });

    const json = tree.toJSON();
    expect(json).toBeTruthy();
  });

  it("renders with custom text", () => {
    let tree: any;
    const mockOnPress = jest.fn();

    act(() => {
      tree = TestRenderer.create(
        <ReportButton onPress={mockOnPress} text="Report Issue" />,
      );
    });

    const json = tree.toJSON();
    expect(json).toBeTruthy();
  });

  it("renders with custom style", () => {
    let tree: any;
    const mockOnPress = jest.fn();

    act(() => {
      tree = TestRenderer.create(
        <ReportButton onPress={mockOnPress} style={{ marginTop: 20 }} />,
      );
    });

    const json = tree.toJSON();
    expect(json).toBeTruthy();
  });
});
