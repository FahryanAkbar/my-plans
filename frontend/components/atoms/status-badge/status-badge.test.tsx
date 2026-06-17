import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { StatusBadge } from "./status-badge"

describe("StatusBadge Component Family", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders default planning label when no props are provided", () => {
      render(<StatusBadge />)

      expect(screen.getByText("Planning")).toBeDefined()
    })

    it("renders mapped label for in-progress status", () => {
      render(<StatusBadge status="In-Progress" />)

      expect(screen.getByText("In Progress")).toBeDefined()
    })
  })

  describe("Props", () => {
    it("applies custom label when label prop is provided", () => {
      render(<StatusBadge status="Completed" label="Done" />)

      expect(screen.getByText("Done")).toBeDefined()
    })

    it("renders fallback unknown label for custom status without label", () => {
      render(<StatusBadge status="custom" />)

      expect(screen.getByText("Unknown")).toBeDefined()
    })

    it("renders status dot when showDot is true", () => {
      const { container, rerender } = render(<StatusBadge status="Late" />)
      const spansWithoutDot = container.querySelectorAll("span").length

      rerender(<StatusBadge status="Late" showDot />)
      const spansWithDot = container.querySelectorAll("span").length

      expect(spansWithDot).toBe(spansWithoutDot + 1)
    })

    it("applies custom class name to badge root", () => {
      const { container } = render(<StatusBadge className="custom-badge" />)

      expect(container.firstElementChild?.className).toContain("custom-badge")
    })
  })

  describe("Events", () => {
    it("keeps status badge visible after click interaction", async () => {
      render(<StatusBadge status="At Risk" />)

      await user.click(screen.getByText("At Risk"))

      expect(screen.getByText("At Risk")).toBeDefined()
    })
  })

  describe("State Internal", () => {
    it("updates rendered label when status prop changes", () => {
      const { rerender } = render(<StatusBadge status="Planning" />)

      rerender(<StatusBadge status="Completed" />)

      expect(screen.queryByText("Planning")).toBeNull()
      expect(screen.getByText("Completed")).toBeDefined()
    })
  })

  describe("Accessibility", () => {
    it("exposes status text for assistive technologies", () => {
      render(<StatusBadge status="Late" />)

      expect(screen.getByText("Late")).toBeDefined()
    })

    it("does not enter keyboard tab order by default", async () => {
      render(
        <div>
          <button type="button">Before</button>
          <StatusBadge status="Completed" />
          <button type="button">After</button>
        </div>
      )

      await user.tab()
      await user.tab()

      expect(document.activeElement).toBe(screen.getByRole("button", { name: "After" }))
    })
  })
})
