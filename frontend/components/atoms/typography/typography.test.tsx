import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import Typography, { variantClasses } from "./typography"

describe("Typography Component Family", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders paragraph variant by default", () => {
      render(<Typography>Paragraph Content</Typography>)

      expect(screen.getByText("Paragraph Content").tagName).toBe("P")
    })

    it("renders heading h1 variant with heading semantics", () => {
      render(<Typography variant="h1">Page Title</Typography>)

      expect(screen.getByRole("heading", { level: 1, name: "Page Title" })).toBeDefined()
    })
  })

  describe("Props", () => {
    it("applies inlineCode variant as code element", () => {
      render(<Typography variant="inlineCode">const x = 1</Typography>)

      expect(screen.getByText("const x = 1").tagName).toBe("CODE")
    })

    it("applies list variant as unordered list element", () => {
      render(
        <Typography variant="list">
          <li>First item</li>
        </Typography>
      )

      expect(screen.getByRole("list")).toBeDefined()
    })

    it("applies custom class name", () => {
      render(<Typography className="custom-typography">Text</Typography>)

      expect(screen.getByText("Text").className).toContain("custom-typography")
    })

    it("renders child element directly when asChild is true", () => {
      render(
        <Typography asChild variant="span">
          <a href="/docs">Documentation</a>
        </Typography>
      )

      expect(screen.getByRole("link", { name: "Documentation" })).toBeDefined()
      expect(screen.getByRole("link", { name: "Documentation" }).getAttribute("data-variant")).toBe("span")
    })

    it("contains expected class token from variantClasses map", () => {
      expect(variantClasses.caption).toContain("text-xs")
    })
  })

  describe("Events", () => {
    it("calls onClick handler when typography element is clicked", async () => {
      const handleClick = vi.fn()
      render(<Typography onClick={handleClick}>Clickable text</Typography>)

      await user.click(screen.getByText("Clickable text"))

      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe("State Internal", () => {
    it("updates rendered element when variant prop changes", () => {
      const { rerender } = render(<Typography variant="p">Body text</Typography>)

      rerender(<Typography variant="h3">Body text</Typography>)

      expect(screen.getByRole("heading", { level: 3, name: "Body text" })).toBeDefined()
    })
  })

  describe("Accessibility", () => {
    it("supports keyboard focus on asChild anchor content", async () => {
      render(
        <div>
          <button type="button">Before</button>
          <Typography asChild variant="span">
            <a href="/profile">Profile Link</a>
          </Typography>
        </div>
      )

      await user.tab()
      await user.tab()

      expect(document.activeElement).toBe(screen.getByRole("link", { name: "Profile Link" }))
    })
  })
})
