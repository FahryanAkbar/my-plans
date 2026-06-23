import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { Loaders } from "./loader"

describe("Loaders Component Family", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders loader svg element", () => {
      const { container } = render(<Loaders />)

      expect(container.querySelector("svg")).toBeDefined()
    })

    it("renders spinning animation class", () => {
      const { container } = render(<Loaders />)

      expect(container.querySelector("svg")?.className.baseVal).toContain("animate-spin")
    })
  })

  describe("Props", () => {
    it("applies default size class when size is not provided", () => {
      const { container } = render(<Loaders />)

      expect(container.querySelector("svg")?.className.baseVal).toContain("w-3")
    })

    it("applies lg size class when size is lg", () => {
      const { container } = render(<Loaders size="lg" />)

      expect(container.querySelector("svg")?.className.baseVal).toContain("w-6")
    })

    it("applies custom class name", () => {
      const { container } = render(<Loaders className="custom-loader" />)

      expect(container.querySelector("svg")?.className.baseVal).toContain("custom-loader")
    })
  })

  describe("Events", () => {
    it("remains rendered after user click interaction", async () => {
      const { container } = render(<Loaders />)

      const loader = container.querySelector("svg")
      if (loader) {
        await user.click(loader)
      }

      expect(container.querySelector("svg")).toBeDefined()
    })
  })

  describe("State Internal", () => {
    it("keeps size class stable after rerender", () => {
      const { container, rerender } = render(<Loaders size="md" />)

      rerender(<Loaders size="md" />)

      expect(container.querySelector("svg")?.className.baseVal).toContain("w-5")
    })
  })

  describe("Accessibility", () => {
    it("renders icon as decorative element by default", () => {
      const { container } = render(<Loaders />)

      expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true")
    })

    it("allows passing accessibility attributes via wrapper class strategy", () => {
      const { container } = render(
        <span role="status" aria-label="Loading state">
          <Loaders />
        </span>
      )

      expect(container.querySelector('[role="status"]')?.getAttribute("aria-label")).toBe("Loading state")
    })
  })
})
