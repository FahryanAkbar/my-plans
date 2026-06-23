import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "./card"

describe("Card Component Family", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders basic card composition layout with text content", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title Text</CardTitle>
            <CardDescription>Card Description Text</CardDescription>
            <CardAction>Card Action Text</CardAction>
          </CardHeader>
          <CardContent>Card Content Area</CardContent>
          <CardFooter>Card Footer Area</CardFooter>
        </Card>
      )

      expect(screen.getByText("Card Title Text")).toBeDefined()
      expect(screen.getByText("Card Description Text")).toBeDefined()
      expect(screen.getByText("Card Action Text")).toBeDefined()
      expect(screen.getByText("Card Content Area")).toBeDefined()
      expect(screen.getByText("Card Footer Area")).toBeDefined()
    })
  })

  describe("Props", () => {
    it("applies custom classNames to all card subcomponents", () => {
      // Menggunakan data-testid karena subkomponen Card adalah wrapper div murni tanpa role semantik default
      render(
        <Card data-testid="card" className="custom-card">
          <CardHeader data-testid="card-header" className="custom-header">
            <CardTitle data-testid="card-title" className="custom-title">
              Title
            </CardTitle>
            <CardDescription data-testid="card-desc" className="custom-desc">
              Desc
            </CardDescription>
            <CardAction data-testid="card-action" className="custom-action">
              Action
            </CardAction>
          </CardHeader>
          <CardContent data-testid="card-content" className="custom-content">
            Content
          </CardContent>
          <CardFooter data-testid="card-footer" className="custom-footer">
            Footer
          </CardFooter>
        </Card>
      )

      expect(screen.getByTestId("card").className).toContain("custom-card")
      expect(screen.getByTestId("card-header").className).toContain("custom-header")
      expect(screen.getByTestId("card-title").className).toContain("custom-title")
      expect(screen.getByTestId("card-desc").className).toContain("custom-desc")
      expect(screen.getByTestId("card-action").className).toContain("custom-action")
      expect(screen.getByTestId("card-content").className).toContain("custom-content")
      expect(screen.getByTestId("card-footer").className).toContain("custom-footer")
    })
  })

  describe("Events", () => {
    it("calls onClick callback when clicked", async () => {
      const handleClick = vi.fn()
      render(<Card onClick={handleClick}>Card Click Content</Card>)
      const card = screen.getByText("Card Click Content")

      await user.click(card)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe("State Internal", () => {
    it("does not maintain internal state and renders children dynamically", () => {
      const { rerender } = render(<Card>First Dynamic Content</Card>)
      expect(screen.getByText("First Dynamic Content")).toBeDefined()

      rerender(<Card>Second Dynamic Content</Card>)
      expect(screen.queryByText("First Dynamic Content")).toBeNull()
      expect(screen.getByText("Second Dynamic Content")).toBeDefined()
    })
  })

  describe("Accessibility", () => {
    it("assigns appropriate data-slot attributes to each component element", () => {
      // Menggunakan data-testid karena subkomponen Card adalah wrapper div murni tanpa role semantik default
      render(
        <Card data-testid="card">
          <CardHeader data-testid="card-header">
            <CardTitle data-testid="card-title">Title</CardTitle>
            <CardDescription data-testid="card-desc">Desc</CardDescription>
            <CardAction data-testid="card-action">Action</CardAction>
          </CardHeader>
          <CardContent data-testid="card-content">Content</CardContent>
          <CardFooter data-testid="card-footer">Footer</CardFooter>
        </Card>
      )

      expect(screen.getByTestId("card").getAttribute("data-slot")).toBe("card")
      expect(screen.getByTestId("card-header").getAttribute("data-slot")).toBe("card-header")
      expect(screen.getByTestId("card-title").getAttribute("data-slot")).toBe("card-title")
      expect(screen.getByTestId("card-desc").getAttribute("data-slot")).toBe("card-description")
      expect(screen.getByTestId("card-action").getAttribute("data-slot")).toBe("card-action")
      expect(screen.getByTestId("card-content").getAttribute("data-slot")).toBe("card-content")
      expect(screen.getByTestId("card-footer").getAttribute("data-slot")).toBe("card-footer")
    })
  })
})
