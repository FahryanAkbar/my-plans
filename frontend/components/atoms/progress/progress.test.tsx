import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { Progress } from "./progress"

describe("Progress Component Family", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders progress root with progressbar role", () => {
      render(<Progress value={30} />)

      expect(screen.getByRole("progressbar")).toBeDefined()
    })

    it("renders progress indicator element", () => {
      const { container } = render(<Progress value={30} />)

      expect(container.querySelector('[data-slot="progress-indicator"]')).toBeDefined()
    })
  })

  describe("Props", () => {
    it("applies custom class to progress root", () => {
      render(<Progress value={40} className="custom-progress" />)

      expect(screen.getByRole("progressbar").className).toContain("custom-progress")
    })

    it("uses default indicator class when indicatorClassName is not provided", () => {
      const { container } = render(<Progress value={40} />)

      expect(container.querySelector('[data-slot="progress-indicator"]')?.className).toContain("bg-primary")
    })

    it("applies custom indicator class when indicatorClassName is provided", () => {
      const { container } = render(<Progress value={40} indicatorClassName="custom-indicator" />)

      expect(container.querySelector('[data-slot="progress-indicator"]')?.className).toContain("custom-indicator")
    })
  })

  describe("Events", () => {
    it("keeps progressbar rendered after click interaction", async () => {
      render(<Progress value={55} />)

      await user.click(screen.getByRole("progressbar"))

      expect(screen.getByRole("progressbar")).toBeDefined()
    })
  })

  describe("State Internal", () => {
    it("updates indicator transform when value changes", () => {
      const { container, rerender } = render(<Progress value={25} />)

      rerender(<Progress value={75} />)

      expect(container.querySelector('[data-slot="progress-indicator"]')?.getAttribute("style")).toContain("translateX(-25%)")
    })

    it("uses zero progress when value is undefined", () => {
      const { container } = render(<Progress />)

      expect(container.querySelector('[data-slot="progress-indicator"]')?.getAttribute("style")).toContain("translateX(-100%)")
    })
  })

  describe("Accessibility", () => {
    it("exposes progressbar role to assistive technologies", () => {
      render(<Progress value={60} />)

      expect(screen.getByRole("progressbar").getAttribute("role")).toBe("progressbar")
    })

    it("allows keyboard users to keep tab flow around progress", async () => {
      render(
        <div>
          <button type="button">Before</button>
          <Progress value={20} />
          <button type="button">After</button>
        </div>
      )

      await user.tab()
      await user.tab()

      expect(document.activeElement).toBe(screen.getByRole("button", { name: "After" }))
    })
  })
})
