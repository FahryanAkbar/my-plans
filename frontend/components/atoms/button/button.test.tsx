import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { Button } from "./button";

describe("Button Component", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })
  
  describe("Rendering", () => {
    it("renders button with children text", () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole("button", { name: "Click me" });

      expect(button).toBeInTheDocument();
    });

    it("renders as native button element by default", () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole("button", { name: "Click me" });

      expect(button.tagName.toLowerCase()).toBe("button");
    });

    it("uses default variant data attribute when no variant is passed", () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole("button", { name: "Click me" });

      expect(button).toHaveAttribute("data-variant", "default");
    });

    it("uses default size data attribute when no size is passed", () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole("button", { name: "Click me" });

      expect(button).toHaveAttribute("data-size", "default");
    });

    it("renders as a child element when asChild is true", () => {
      render(
        <Button asChild>
          <a href="/test">
            Link Button
          </a>
        </Button>
      );
      const link = screen.getByRole("link", { name: "Link Button" });

      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/test");
      expect(link).toHaveAttribute("data-slot", "button");
    });
  });

  describe("Props", () => {
    it("applies custom variant through data attribute", () => {
      render(
        <Button variant="outline" size="sm" className="custom-class">
          Custom Button
        </Button>
      );
      const button = screen.getByRole("button", { name: "Custom Button" });

      expect(button).toHaveAttribute("data-variant", "outline");
    });

    it("applies custom size through data attribute", () => {
      render(
        <Button variant="outline" size="sm" className="custom-class">
          Custom Button
        </Button>
      );
      const button = screen.getByRole("button", { name: "Custom Button" });

      expect(button).toHaveAttribute("data-size", "sm");
    });

    it("applies custom className", () => {
      render(
        <Button variant="outline" size="sm" className="custom-class">
          Custom Button
        </Button>
      );
      const button = screen.getByRole("button", { name: "Custom Button" });

      expect(button).toHaveClass("custom-class");
    });

    it("keeps multiline variant data attribute", () => {
      render(<Button variant="multiline">Multiline Button</Button>);
      const button = screen.getByRole("button", { name: "Multiline Button" });

      expect(button).toHaveAttribute("data-variant", "multiline");
    });

    it("keeps default size data attribute when multiline variant uses default size", () => {
      render(<Button variant="multiline">Multiline Button</Button>);
      const button = screen.getByRole("button", { name: "Multiline Button" });

      expect(button).toHaveAttribute("data-size", "default");
    });

    it("uses multiline classes from resolved internal size behavior", () => {
      render(<Button variant="multiline">Multiline Button</Button>);
      const button = screen.getByRole("button", { name: "Multiline Button" });

      expect(button).not.toHaveClass("h-10");
      expect(button).toHaveClass("whitespace-normal");
    });

    it("keeps custom size data attribute when multiline variant receives explicit size", () => {
      render(<Button variant="multiline" size="sm">Custom Multiline Button</Button>);
      const button = screen.getByRole("button", { name: "Custom Multiline Button" });

      expect(button).toHaveAttribute("data-size", "sm");
    });
  });

  describe("Events", () => {
    it("calls onClick callback when clicked", async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      const button = screen.getByRole("button", { name: "Click" });
      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("does not call onClick callback when disabled button is clicked", async () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled Click
        </Button>
      );
      const button = screen.getByRole("button", { name: "Disabled Click" });

      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("can be focused using keyboard navigation", async () => {
      render(<Button>Focus me</Button>);
      await user.tab();
      expect(screen.getByRole("button", { name: "Focus me" })).toHaveFocus();
    });
  });
});
