import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants } from "./tabs"

function TestTabs({
  value,
  defaultValue = "overview",
  onValueChange,
  orientation = "horizontal",
  variant = "default",
}: {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: "horizontal" | "vertical"
  variant?: "default" | "line"
}) {
  return (
    <Tabs value={value} defaultValue={defaultValue} onValueChange={onValueChange} orientation={orientation}>
      <TabsList variant={variant} className="custom-tabs-list">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Overview Content</TabsContent>
      <TabsContent value="details">Details Content</TabsContent>
    </Tabs>
  )
}

describe("Tabs Component Family", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders tabs list and trigger buttons", () => {
      render(<TestTabs />)

      expect(screen.getByRole("tablist")).toBeDefined()
      expect(screen.getByRole("tab", { name: "Overview" })).toBeDefined()
      expect(screen.getByRole("tab", { name: "Details" })).toBeDefined()
    })

    it("renders content for default active tab", () => {
      render(<TestTabs defaultValue="overview" />)

      expect(screen.getByText("Overview Content")).toBeDefined()
    })
  })

  describe("Props", () => {
    it("applies default orientation to tabs root", () => {
      const { container } = render(<TestTabs />)

      expect(container.querySelector('[data-slot="tabs"]')?.getAttribute("data-orientation")).toBe("horizontal")
    })

    it("applies vertical orientation when orientation prop is vertical", () => {
      const { container } = render(<TestTabs orientation="vertical" />)

      expect(container.querySelector('[data-slot="tabs"]')?.getAttribute("data-orientation")).toBe("vertical")
    })

    it("applies line variant to tabs list", () => {
      const { container } = render(<TestTabs variant="line" />)

      expect(container.querySelector('[data-slot="tabs-list"]')?.getAttribute("data-variant")).toBe("line")
    })

    it("returns default tabs list variant classes from helper", () => {
      expect(tabsListVariants({ variant: "default" })).toContain("bg-muted")
    })
  })

  describe("Events", () => {
    it("calls onValueChange when inactive tab is clicked", async () => {
      const handleValueChange = vi.fn()
      render(<TestTabs onValueChange={handleValueChange} />)

      await user.click(screen.getByRole("tab", { name: "Details" }))

      expect(handleValueChange).toHaveBeenCalledWith("details")
    })

    it("switches visible content when another tab is clicked", async () => {
      render(<TestTabs defaultValue="overview" />)

      await user.click(screen.getByRole("tab", { name: "Details" }))

      expect(screen.getByText("Details Content")).toBeDefined()
    })
  })

  describe("State Internal", () => {
    it("updates active tab in uncontrolled mode", async () => {
      render(<TestTabs defaultValue="overview" />)

      const detailsTab = screen.getByRole("tab", { name: "Details" })
      await user.click(detailsTab)

      expect(detailsTab.getAttribute("aria-selected")).toBe("true")
    })

    it("keeps active tab controlled by value prop", async () => {
      const handleValueChange = vi.fn()
      render(<TestTabs value="overview" onValueChange={handleValueChange} />)

      await user.click(screen.getByRole("tab", { name: "Details" }))

      expect(screen.getByRole("tab", { name: "Overview" }).getAttribute("aria-selected")).toBe("true")
    })
  })

  describe("Accessibility", () => {
    it("supports keyboard navigation to focus tabs", async () => {
      render(<TestTabs />)

      await user.tab()
      expect(document.activeElement).toBe(screen.getByRole("tab", { name: "Overview" }))
    })

    it("supports keyboard activation with Enter key", async () => {
      render(<TestTabs defaultValue="overview" />)

      await user.tab()
      await user.keyboard("{ArrowRight}")
      await user.keyboard("{Enter}")

      expect(screen.getByRole("tab", { name: "Details" }).getAttribute("aria-selected")).toBe("true")
    })
  })
})
