import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "@/App";

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: MockIntersectionObserver,
});

describe("App", () => {
  it("renders without crashing", () => {
    expect(() => render(<App />)).not.toThrow();
  });
});