import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { VisuallyHidden } from "./visually-hidden"

describe("VisuallyHidden Component Family", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders hidden text content", () => {
      render(<VisuallyHidden>Screen reader text</VisuallyHidden>)

      expect(screen.getByText("Screen reader text")).toBeDefined()
    })

    it("renders as span element", () => {
      render(<VisuallyHidden>Hidden label</VisuallyHidden>)

      expect(screen.getByText("Hidden label").tagName).toBe("SPAN")
    })
  })

  describe("Props", () => {
    it("applies custom className", () => {
      render(<VisuallyHidden className="custom-hidden">Hidden class</VisuallyHidden>)

      expect(screen.getByText("Hidden class").className).toContain("custom-hidden")
    })

    it("forwards aria attributes", () => {
      render(<VisuallyHidden aria-label="Hidden aria">Hidden aria text</VisuallyHidden>)

      expect(screen.getByLabelText("Hidden aria")).toBeDefined()
    })

    it("keeps clipping styles for visual hiding", () => {
      render(<VisuallyHidden>Clip text</VisuallyHidden>)

      const element = screen.getByText("Clip text")
      expect((element as HTMLSpanElement).style.clip).toContain("rect(")
      expect((element as HTMLSpanElement).style.clipPath).toBe("inset(50%)")
    })
  })

  describe("Events", () => {
    it("calls click handler when hidden element is clicked programmatically", async () => {
      const handleClick = vi.fn()
      render(<VisuallyHidden onClick={handleClick}>Clickable hidden</VisuallyHidden>)

      await user.click(screen.getByText("Clickable hidden"))

      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe("State Internal", () => {
    it("keeps hidden text updated after rerender", () => {
      const { rerender } = render(<VisuallyHidden>Old hidden text</VisuallyHidden>)

      rerender(<VisuallyHidden>New hidden text</VisuallyHidden>)

      expect(screen.queryByText("Old hidden text")).toBeNull()
      expect(screen.getByText("New hidden text")).toBeDefined()
    })

    it("forwards ref to span element", () => {
      const ref = React.createRef<HTMLSpanElement>()
      render(<VisuallyHidden ref={ref}>Ref text</VisuallyHidden>)

      expect(ref.current?.tagName).toBe("SPAN")
    })
  })

  describe("Accessibility", () => {
    it("can provide accessible label for icon button via aria-labelledby", () => {
      render(
        <div>
          <VisuallyHidden id="edit-label">Edit item</VisuallyHidden>
          <button type="button" aria-labelledby="edit-label">
            ?
          </button>
        </div>
      )

      expect(screen.getByRole("button", { name: "Edit item" })).toBeDefined()
    })

    it("does not receive keyboard focus by default", async () => {
      render(
        <div>
          <button type="button">Before</button>
          <VisuallyHidden>Hidden focus</VisuallyHidden>
          <button type="button">After</button>
        </div>
      )

      await user.tab()
      await user.tab()

      expect(document.activeElement).toBe(screen.getByRole("button", { name: "After" }))
    })
  })
})
