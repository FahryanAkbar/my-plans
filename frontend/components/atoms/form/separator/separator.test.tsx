import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { Separator } from "./separator"

describe("Separator Component Family", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders separator element", () => {
      const { container } = render(<Separator />)

      expect(container.querySelector('[data-slot="separator"]')).toBeDefined()
    })

    it("renders horizontal orientation by default", () => {
      const { container } = render(<Separator />)

      expect(container.querySelector('[data-slot="separator"]')?.getAttribute("data-orientation")).toBe("horizontal")
    })
  })

  describe("Props", () => {
    it("applies custom class name", () => {
      const { container } = render(<Separator className="custom-separator" />)

      expect(container.querySelector('[data-slot="separator"]')?.className).toContain("custom-separator")
    })

    it("applies vertical orientation when orientation is vertical", () => {
      const { container } = render(<Separator orientation="vertical" />)

      expect(container.querySelector('[data-slot="separator"]')?.getAttribute("data-orientation")).toBe("vertical")
    })

    it("sets non decorative separator when decorative is false", () => {
      const { container } = render(<Separator decorative={false} />)

      expect(container.querySelector('[data-slot="separator"]')?.getAttribute("role")).toBe("separator")
    })
  })

  describe("Events", () => {
    it("keeps separator stable when user tabs through page", async () => {
      const { container } = render(
        <div>
          <button type="button">Before</button>
          <Separator decorative={false} />
          <button type="button">After</button>
        </div>
      )

      await user.tab()
      await user.tab()

      expect(container.querySelector('[data-slot="separator"]')).toBeDefined()
    })
  })

  describe("State Internal", () => {
    it("keeps orientation attribute stable after rerender", () => {
      const { container, rerender } = render(<Separator orientation="vertical" />)

      rerender(<Separator orientation="vertical" />)

      expect(container.querySelector('[data-slot="separator"]')?.getAttribute("data-orientation")).toBe("vertical")
    })
  })

  describe("Accessibility", () => {
    it("renders role separator when decorative is false", () => {
      const { container } = render(<Separator decorative={false} />)

      expect(container.querySelector('[data-slot="separator"]')?.getAttribute("role")).toBe("separator")
    })

    it("does not expose separator role when decorative is true", () => {
      const { container } = render(<Separator decorative />)

      expect(container.querySelector('[data-slot="separator"]')?.getAttribute("role")).toBe("none")
    })
  })
})
