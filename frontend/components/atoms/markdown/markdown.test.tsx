import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { MarkdownRenderer } from "./markdown-renderer"

describe("MarkdownRenderer Component Family", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders paragraph content", () => {
      render(<MarkdownRenderer content="Hello markdown" />)

      expect(screen.getByText("Hello markdown")).toBeDefined()
    })

    it("renders heading and list elements", () => {
      render(<MarkdownRenderer content={"# Title\n\n- Item One"} />)

      expect(screen.getByRole("heading", { name: "Title" })).toBeDefined()
      expect(screen.getByRole("list")).toBeDefined()
      expect(screen.getByText("Item One")).toBeDefined()
    })

    it("renders h2, h3 and ordered list from markdown", () => {
      render(<MarkdownRenderer content={"## Subtitle\n\n### Section\n\n1. First item"} />)

      expect(screen.getByRole("heading", { level: 2, name: "Subtitle" })).toBeDefined()
      expect(screen.getByRole("heading", { level: 3, name: "Section" })).toBeDefined()
      expect(screen.getByRole("list")).toBeDefined()
      expect(screen.getByText("First item")).toBeDefined()
    })
  })

  describe("Props", () => {
    it("applies custom class name to wrapper", () => {
      const { container } = render(
        <MarkdownRenderer content="Class test" className="custom-markdown" />
      )

      expect(container.firstElementChild?.className).toContain("custom-markdown")
    })

    it("renders mention content text from markdown link syntax", () => {
      render(<MarkdownRenderer content="[Mention](mention:user-1)" />)

      expect(screen.getByText("Mention")).toBeDefined()
      expect(screen.queryByRole("link", { name: "Mention" })).toBeNull()
    })

    it("renders normal link as anchor with target blank", () => {
      render(<MarkdownRenderer content="[Docs](https://example.com)" />)

      const link = screen.getByRole("link", { name: "Docs" })
      expect(link.getAttribute("href")).toBe("https://example.com")
      expect(link.getAttribute("target")).toBe("_blank")
    })

    it("renders strong and emphasis markdown styles", () => {
      render(<MarkdownRenderer content={"**Bold Text** and *Italic Text*"} />)

      expect(screen.getByText("Bold Text").tagName).toBe("STRONG")
      expect(screen.getByText("Italic Text").tagName).toBe("EM")
    })

    it("renders code block, blockquote, separator, and table", () => {
      render(
        <MarkdownRenderer
          content={
            "```ts\nconst x = 1\n```\n\n> Quoted note\n\n---\n\n| Name | Value |\n| --- | --- |\n| Alpha | 1 |"
          }
        />
      )

      expect(screen.getByText("const x = 1").closest("code")).toBeDefined()
      expect(screen.getByText("Quoted note").closest("blockquote")).toBeDefined()
      expect(document.querySelector("hr")).toBeDefined()
      expect(screen.getByRole("table")).toBeDefined()
      expect(screen.getByRole("columnheader", { name: "Name" })).toBeDefined()
      expect(screen.getByRole("cell", { name: "Alpha" })).toBeDefined()
    })
  })

  describe("Events", () => {
    it("keeps mention token visible after click", async () => {
      render(<MarkdownRenderer content="[User](mention:42)" />)

      await user.click(screen.getByText("User"))

      expect(screen.getByText("User")).toBeDefined()
    })

    it("keeps standard link visible after click", async () => {
      render(<MarkdownRenderer content="[Open](https://example.com)" />)

      await user.click(screen.getByRole("link", { name: "Open" }))

      expect(screen.getByRole("link", { name: "Open" })).toBeDefined()
    })
  })

  describe("State Internal", () => {
    it("updates rendered output when content prop changes", () => {
      const { rerender } = render(<MarkdownRenderer content="Old text" />)

      rerender(<MarkdownRenderer content="New text" />)

      expect(screen.queryByText("Old text")).toBeNull()
      expect(screen.getByText("New text")).toBeDefined()
    })
  })

  describe("Accessibility", () => {
    it("exposes heading semantics for markdown heading", () => {
      render(<MarkdownRenderer content="# Accessible Title" />)

      expect(screen.getByRole("heading", { level: 1, name: "Accessible Title" })).toBeDefined()
    })

    it("allows keyboard users to focus standard markdown link", async () => {
      render(
        <div>
          <button type="button">Before</button>
          <MarkdownRenderer content="[Focusable](https://example.com)" />
        </div>
      )

      await user.tab()
      await user.tab()

      expect(document.activeElement).toBe(screen.getByRole("link", { name: "Focusable" }))
    })
  })
})
