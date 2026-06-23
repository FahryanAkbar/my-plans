import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { Checkbox } from "./checkbox"

describe("Checkbox", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders with default props and unchecked state", () => {
      render(<Checkbox />)
      const checkbox = screen.getByRole("checkbox")
      expect(checkbox).toBeDefined()
      expect(checkbox.getAttribute("data-slot")).toBe("checkbox")
      expect(checkbox.getAttribute("aria-checked")).toBe("false")
    })

    it("renders in checked state when checked prop is true", () => {
      render(<Checkbox checked={true} onCheckedChange={() => {}} />)
      const checkbox = screen.getByRole("checkbox")
      expect(checkbox.getAttribute("aria-checked")).toBe("true")
    })

    it("renders the indicator when checked", () => {
      const { container } = render(
        <Checkbox checked={true} onCheckedChange={() => {}} />
      )
      const indicator = container.querySelector("[data-slot='checkbox-indicator']")
      expect(indicator).not.toBeNull()
    })
  })

  describe("Props", () => {
    it("merges custom classNames correctly", () => {
      render(<Checkbox className="custom-checkbox-class" />)
      const checkbox = screen.getByRole("checkbox")
      expect(checkbox.className).toContain("custom-checkbox-class")
    })

    it("renders disabled state when disabled prop is true", () => {
      render(<Checkbox disabled />)
      const checkbox = screen.getByRole("checkbox")
      expect(checkbox.hasAttribute("disabled")).toBe(true)
    })
  })

  describe("Events", () => {
    it("calls onCheckedChange callback when clicked", async () => {
      const handleCheckedChange = vi.fn()
      render(<Checkbox onCheckedChange={handleCheckedChange} />)
      const checkbox = screen.getByRole("checkbox")

      await user.click(checkbox)
      expect(handleCheckedChange).toHaveBeenCalledTimes(1)
      expect(handleCheckedChange).toHaveBeenCalledWith(true)
    })

    it("does not call callback when disabled checkbox is clicked", async () => {
      const handleCheckedChange = vi.fn()
      render(<Checkbox disabled onCheckedChange={handleCheckedChange} />)
      const checkbox = screen.getByRole("checkbox")

      await user.click(checkbox)
      expect(handleCheckedChange).not.toHaveBeenCalled()
    })
  })

  describe("State Internal", () => {
    it("toggles checked state in uncontrolled mode", async () => {
      render(<Checkbox />)
      const checkbox = screen.getByRole("checkbox")
      expect(checkbox.getAttribute("aria-checked")).toBe("false")

      await user.click(checkbox)
      expect(checkbox.getAttribute("aria-checked")).toBe("true")
    })
  })

  describe("Accessibility", () => {
    it("can be focused using keyboard tab navigation", async () => {
      render(<Checkbox />)
      const checkbox = screen.getByRole("checkbox")

      await user.tab()
      expect(document.activeElement).toBe(checkbox)
    })

    it("can be toggled using Space key when focused", async () => {
      const handleCheckedChange = vi.fn()
      render(<Checkbox onCheckedChange={handleCheckedChange} />)

      await user.tab()
      await user.keyboard(" ")
      expect(handleCheckedChange).toHaveBeenCalledWith(true)
    })
  })
})
