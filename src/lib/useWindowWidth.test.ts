import { describe, it, expect, afterEach } from "vitest";
// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { useWindowWidth } from "./useWindowWidth";

const originalInnerWidth = window.innerWidth;

describe("useWindowWidth", () => {
  afterEach(() => {
    window.innerWidth = originalInnerWidth;
  });

  it("returns the initial window width", () => {
    window.innerWidth = 1200;
    const { result } = renderHook(() => useWindowWidth());
    expect(result.current).toBe(1200);
  });

  it("updates width on window resize", () => {
    const { result } = renderHook(() => useWindowWidth());
    act(() => {
      window.innerWidth = 900;
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current).toBe(900);
  });
});
