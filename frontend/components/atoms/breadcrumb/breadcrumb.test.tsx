import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "./breadcrumb"

describe("Breadcrumb Component", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders breadcrumb navigation landmark", () => {
      render(<Breadcrumb>content</Breadcrumb>)

      expect(screen.getByRole("navigation", { name: "breadcrumb" })).toBeInTheDocument()
    })

    it("renders list structure and list item content", () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>Home Item</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )

      expect(screen.getByRole("list")).toBeInTheDocument()
    })

    it("renders link content for breadcrumb link", () => {
      render(<BreadcrumbLink href="/home">Home</BreadcrumbLink>)

      expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument()
    })
  })

  describe("Props", () => {
    it("applies custom className to breadcrumb list", () => {
      render(<BreadcrumbList className="custom-list-class">List</BreadcrumbList>)

      expect(screen.getByRole("list")).toHaveClass("custom-list-class")
    })

    it("renders breadcrumb link with href attribute", () => {
      render(<BreadcrumbLink href="/home">Home</BreadcrumbLink>)

      expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/home")
    })

    it("renders breadcrumb link as child element when asChild is true", () => {
      render(
        <BreadcrumbLink asChild>
          <button type="button">Button Link</button>
        </BreadcrumbLink>
      )

      expect(screen.getByRole("button", { name: "Button Link" })).toBeInTheDocument()
    })

    it("sets aria-current page on breadcrumb page", () => {
      render(<BreadcrumbPage>Current Page</BreadcrumbPage>)

      expect(screen.getByRole("link", { name: "Current Page" })).toHaveAttribute(
        "aria-current",
        "page"
      )
    })
  })

  describe("Events", () => {
    it("calls onClick when breadcrumb link is clicked", async () => {
      const handleClick = vi.fn()
      render(
        <BreadcrumbLink asChild onClick={handleClick}>
          <button type="button">Home</button>
        </BreadcrumbLink>
      )

      await user.click(screen.getByRole("button", { name: "Home" }))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe("State Internal", () => {
    it("updates rendered breadcrumb page text on rerender", () => {
      const { rerender } = render(<BreadcrumbPage>Page A</BreadcrumbPage>)

      rerender(<BreadcrumbPage>Page B</BreadcrumbPage>)
      expect(screen.queryByText("Page A")).not.toBeInTheDocument()
    })
  })

  describe("Accessibility", () => {
    it("can focus breadcrumb link via keyboard tab", async () => {
      render(<BreadcrumbLink href="/home">Home</BreadcrumbLink>)

      await user.tab()
      expect(screen.getByRole("link", { name: "Home" })).toHaveFocus()
    })

    it("renders separator with presentation role", () => {
      render(<BreadcrumbSeparator />)

      expect(screen.getByRole("presentation", { hidden: true })).toBeInTheDocument()
    })

    it("renders ellipsis with screen-reader text", () => {
      render(<BreadcrumbEllipsis />)

      expect(screen.getByText("More")).toHaveClass("sr-only")
    })
  })
})
