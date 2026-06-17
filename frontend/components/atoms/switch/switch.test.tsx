import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { Switch } from "./switch"

describe("Switch Component Family", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders switch root element", () => {
      render(<Switch />)

      expect(screen.getByRole("switch")).toBeDefined()
    })

    it("renders switch thumb element", () => {
      const { container } = render(<Switch />)

      expect(container.querySelector('[data-slot="switch-thumb"]')).toBeDefined()
    })
  })

  describe("Props", () => {
    it("applies custom class to switch root", () => {
      render(<Switch className="custom-switch" />)

      expect(screen.getByRole("switch").className).toContain("custom-switch")
    })

    it("uses default size when size prop is not provided", () => {
      render(<Switch />)

      expect(screen.getByRole("switch").getAttribute("data-size")).toBe("default")
    })

    it("applies small size when size is sm", () => {
      render(<Switch size="sm" />)

      expect(screen.getByRole("switch").getAttribute("data-size")).toBe("sm")
    })

    it("renders disabled state when disabled prop is true", () => {
      render(<Switch disabled />)

      expect(screen.getByRole("switch").getAttribute("data-disabled")).toBe("")
    })
  })

  describe("Events", () => {
    it("calls onCheckedChange when switch is clicked", async () => {
      const handleCheckedChange = vi.fn()
      render(<Switch onCheckedChange={handleCheckedChange} />)

      await user.click(screen.getByRole("switch"))

      expect(handleCheckedChange).toHaveBeenCalledWith(true)
    })

    it("does not call onCheckedChange when switch is disabled", async () => {
      const handleCheckedChange = vi.fn()
      render(<Switch disabled onCheckedChange={handleCheckedChange} />)

      await user.click(screen.getByRole("switch"))

      expect(handleCheckedChange).not.toHaveBeenCalled()
    })
  })

  describe("State Internal", () => {
    it("toggles checked state in uncontrolled mode when clicked", async () => {
      render(<Switch />)

      const switchElement = screen.getByRole("switch")
      expect(switchElement.getAttribute("aria-checked")).toBe("false")

      await user.click(switchElement)

      expect(switchElement.getAttribute("aria-checked")).toBe("true")
    })

    it("keeps checked state controlled by checked prop", async () => {
      const handleCheckedChange = vi.fn()
      render(<Switch checked={false} onCheckedChange={handleCheckedChange} />)

      const switchElement = screen.getByRole("switch")
      await user.click(switchElement)

      expect(switchElement.getAttribute("aria-checked")).toBe("false")
    })
  })

  describe("Accessibility", () => {
    it("can be focused using keyboard tab navigation", async () => {
      render(
        <div>
          <button type="button">Before</button>
          <Switch />
        </div>
      )

      await user.tab()
      await user.tab()

      expect(document.activeElement).toBe(screen.getByRole("switch"))
    })

    it("can be toggled with keyboard space key", async () => {
      render(<Switch />)

      const switchElement = screen.getByRole("switch")
      await user.tab()
      await user.keyboard(" ")

      expect(switchElement.getAttribute("aria-checked")).toBe("true")
    })
  })
})
