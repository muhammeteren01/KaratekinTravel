/**
 * @jest-environment jsdom
 */
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import FormRow from "@/shared/ui/form/FormRow";
import { View, Text } from "react-native";

describe("FormRow", () => {
  it("renders with default props", () => {
    let tree: any;
    act(() => {
      tree = TestRenderer.create(
        <FormRow>
          <View style={{ flex: 1 }}>
            <Text>Field 1</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text>Field 2</Text>
          </View>
        </FormRow>,
      );
    });
    expect(tree.root).toBeTruthy();
  });

  it("renders with custom gap", () => {
    let tree: any;
    act(() => {
      tree = TestRenderer.create(
        <FormRow gap={24}>
          <View style={{ flex: 1 }}>
            <Text>Field 1</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text>Field 2</Text>
          </View>
        </FormRow>,
      );
    });
    expect(tree.root).toBeTruthy();
  });

  it("renders with custom justify", () => {
    let tree: any;
    act(() => {
      tree = TestRenderer.create(
        <FormRow justify="flex-start" gap={12}>
          <View>
            <Text>Field 1</Text>
          </View>
          <View>
            <Text>Field 2</Text>
          </View>
        </FormRow>,
      );
    });
    expect(tree.root).toBeTruthy();
  });

  it("renders with three children", () => {
    let tree: any;
    act(() => {
      tree = TestRenderer.create(
        <FormRow gap={8} justify="space-between">
          <View style={{ flex: 1 }}>
            <Text>Field 1</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text>Field 2</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text>Field 3</Text>
          </View>
        </FormRow>,
      );
    });
    expect(tree.root).toBeTruthy();
  });

  it("renders with custom style", () => {
    let tree: any;
    act(() => {
      tree = TestRenderer.create(
        <FormRow style={{ marginBottom: 20, backgroundColor: "#f0f0f0" }}>
          <View style={{ flex: 1 }}>
            <Text>Field 1</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text>Field 2</Text>
          </View>
        </FormRow>,
      );
    });
    expect(tree.root).toBeTruthy();
  });
});
