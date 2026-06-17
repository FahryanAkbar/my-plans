import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { Badge } from "./badge"
import { tokens } from "@/lib"

describe("Badge Component", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders badge content text", () => {
      render(<Badge>Default Badge</Badge>)

      expect(screen.getByText("Default Badge")).toBeInTheDocument()
    })

    it("renders as span by default", () => {
      render(<Badge>Default Badge</Badge>)

      expect(screen.getByText("Default Badge").tagName.toLowerCase()).toBe("span")
    })

    it("renders with default variant data attribute", () => {
      render(<Badge>Default Badge</Badge>)

      expect(screen.getByText("Default Badge")).toHaveAttribute("data-variant", "default")
    })
  })

  describe("Props", () => {
    const variants = [
      { name: "default", token: tokens.badge.primary },
      { name: "secondary", token: tokens.badge.purple },
      { name: "success", token: tokens.badge.success },
      { name: "warning", token: tokens.badge.warning },
      { name: "destructive", token: tokens.badge.danger },
      { name: "info", token: tokens.badge.info },
      { name: "outline", token: tokens.badge.outline },
      { name: "neutral", token: tokens.badge.neutral },
    ] as const

    variants.forEach(({ name, token }) => {
      it(`applies variant "${name}" classes`, () => {
        render(<Badge variant={name}>{name} Badge</Badge>)

        const badge = screen.getByText(`${name} Badge`)
        expect(badge).toHaveAttribute("data-variant", name)

        token.split(" ").forEach((cls) => {
          expect(badge.className).toContain(cls)
        })
      })
    })

    it("merges custom className", () => {
      render(<Badge className="custom-class-123">Custom Badge</Badge>)

      expect(screen.getByText("Custom Badge")).toHaveClass("custom-class-123")
    })

    it("forwards native span props", () => {
      render(
        <Badge id="test-badge-id" title="Badge Title">
          Interactive Badge
        </Badge>
      )

      const badge = screen.getByText("Interactive Badge")
      expect(badge).toHaveAttribute("id", "test-badge-id")
      expect(badge).toHaveAttribute("title", "Badge Title")
    })

    it("renders as child element when asChild is true", () => {
      render(
        <Badge asChild>
          <a href="/docs">Link Badge</a>
        </Badge>
      )

      const link = screen.getByRole("link", { name: "Link Badge" })
      expect(link).toHaveAttribute("href", "/docs")
      expect(link).toHaveAttribute("data-slot", "badge")
    })
  })

  describe("Events", () => {
    it("calls onClick when clicked", async () => {
      const handleClick = vi.fn()
      render(<Badge onClick={handleClick}>Clickable Badge</Badge>)

      await user.click(screen.getByText("Clickable Badge"))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe("State Internal", () => {
    it("updates displayed text when rerendered", () => {
      const { rerender } = render(<Badge>First Label</Badge>)

      rerender(<Badge>Second Label</Badge>)
      expect(screen.queryByText("First Label")).not.toBeInTheDocument()
    })
  })

  describe("Accessibility", () => {
    it("is reachable by keyboard when rendered as link", async () => {
      render(
        <Badge asChild>
          <a href="/docs">Link Badge</a>
        </Badge>
      )

      await user.tab()
      expect(screen.getByRole("link", { name: "Link Badge" })).toHaveFocus()
    })

    it("includes data-slot badge attribute", () => {
      render(<Badge>Semantic Badge</Badge>)

      expect(screen.getByText("Semantic Badge")).toHaveAttribute("data-slot", "badge")
    })
  })
})
