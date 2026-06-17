import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { Input } from "./input"
 
describe("Input Component Family", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders input element", () => {
      render(<Input placeholder="Enter text" />)

      expect(screen.getByPlaceholderText("Enter text")).toBeDefined()
    })

    it("renders provided default value", () => {
      render(<Input aria-label="Name field" defaultValue="John Doe" />)

      expect(screen.getByRole("textbox", { name: "Name field" }).getAttribute("value")).toBe("John Doe")
    })
  })

  describe("Props", () => {
    it("applies custom class name", () => {
      render(<Input aria-label="Email field" className="custom-input" />)

      expect(screen.getByRole("textbox", { name: "Email field" }).className).toContain("custom-input")
    })

    it("sets input type from prop", () => {
      render(<Input aria-label="Password field" type="password" />)

      expect(screen.getByLabelText("Password field").getAttribute("type")).toBe("password")
    })

    it("renders disabled state when disabled prop is true", () => {
      render(<Input aria-label="Disabled field" disabled />)

      expect(screen.getByRole("textbox", { name: "Disabled field" }).hasAttribute("disabled")).toBe(true)
    })
  })

  describe("Events", () => {
    it("calls onChange when user types", async () => {
      const handleChange = vi.fn()
      render(<Input aria-label="Typing field" onChange={handleChange} />)

      await user.type(screen.getByRole("textbox", { name: "Typing field" }), "abc")

      expect(handleChange).toHaveBeenCalled()
    })

    it("does not call onChange when input is disabled", async () => {
      const handleChange = vi.fn()
      render(<Input aria-label="Disabled typing field" disabled onChange={handleChange} />)

      await user.type(screen.getByRole("textbox", { name: "Disabled typing field" }), "abc")

      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  describe("State Internal", () => {
    it("updates input value in uncontrolled mode when user types", async () => {
      render(<Input aria-label="Uncontrolled field" />)

      const input = screen.getByRole("textbox", { name: "Uncontrolled field" })
      await user.type(input, "Budi Santoso")

      expect((input as HTMLInputElement).value).toBe("Budi Santoso")
    })
  })

  describe("Accessibility", () => {
    it("can be focused using keyboard tab navigation", async () => {
      render(
        <div>
          <button type="button">Before</button>
          <Input aria-label="Focusable field" />
        </div>
      )

      await user.tab()
      await user.tab()

      expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Focusable field" }))
    })
  })
})
