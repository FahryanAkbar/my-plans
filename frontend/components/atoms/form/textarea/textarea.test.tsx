import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { Textarea } from "./textarea"

describe("Textarea Component Family", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders textarea element", () => {
      render(<Textarea aria-label="Description" />)

      expect(screen.getByRole("textbox", { name: "Description" })).toBeDefined()
    })

    it("renders placeholder text", () => {
      render(<Textarea placeholder="Write description" />)

      expect(screen.getByPlaceholderText("Write description")).toBeDefined()
    })
  })

  describe("Props", () => {
    it("applies custom class name", () => {
      render(<Textarea aria-label="Custom textarea" className="custom-textarea" />)

      expect(screen.getByRole("textbox", { name: "Custom textarea" }).className).toContain("custom-textarea")
    })

    it("renders disabled state when disabled prop is true", () => {
      render(<Textarea aria-label="Disabled textarea" disabled />)

      expect(screen.getByRole("textbox", { name: "Disabled textarea" }).hasAttribute("disabled")).toBe(true)
    })

    it("renders default value from prop", () => {
      render(<Textarea aria-label="Default textarea" defaultValue="Initial value" />)

      expect((screen.getByRole("textbox", { name: "Default textarea" }) as HTMLTextAreaElement).value).toBe("Initial value")
    })
  })

  describe("Events", () => {
    it("calls onChange when user types", async () => {
      const handleChange = vi.fn()
      render(<Textarea aria-label="Typing textarea" onChange={handleChange} />)

      await user.type(screen.getByRole("textbox", { name: "Typing textarea" }), "Hello")

      expect(handleChange).toHaveBeenCalled()
    })

    it("does not call onChange when textarea is disabled", async () => {
      const handleChange = vi.fn()
      render(<Textarea aria-label="Disabled typing textarea" disabled onChange={handleChange} />)

      await user.type(screen.getByRole("textbox", { name: "Disabled typing textarea" }), "Hello")

      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  describe("State Internal", () => {
    it("updates textarea value in uncontrolled mode", async () => {
      render(<Textarea aria-label="Uncontrolled textarea" />)

      const textarea = screen.getByRole("textbox", { name: "Uncontrolled textarea" })
      await user.type(textarea, "Textarea content")

      expect((textarea as HTMLTextAreaElement).value).toBe("Textarea content")
    })
  })

  describe("Accessibility", () => {
    it("can be queried by associated label", () => {
      render(
        <>
          <label htmlFor="notes">Notes</label>
          <Textarea id="notes" />
        </>
      )

      expect(screen.getByLabelText("Notes")).toBeDefined()
    })

    it("can be focused using keyboard tab navigation", async () => {
      render(
        <div>
          <button type="button">Before</button>
          <Textarea aria-label="Focusable textarea" />
        </div>
      )

      await user.tab()
      await user.tab()

      expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Focusable textarea" }))
    })
  })
})
