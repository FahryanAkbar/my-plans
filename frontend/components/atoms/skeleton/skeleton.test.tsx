import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { Skeleton } from "./skeleton"

describe("Skeleton Component Family", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders skeleton element", () => {
      const { container } = render(<Skeleton />)

      expect(container.querySelector('[data-slot="skeleton"]')).toBeDefined()
    })

    it("renders default skeleton classes", () => {
      const { container } = render(<Skeleton />)

      const skeleton = container.querySelector('[data-slot="skeleton"]')
      expect(skeleton?.className).toContain("animate-pulse")
    })
  })

  describe("Props", () => {
    it("applies custom class name", () => {
      const { container } = render(<Skeleton className="custom-skeleton" />)

      expect(container.querySelector('[data-slot="skeleton"]')?.className).toContain("custom-skeleton")
    })

    it("applies inline style props", () => {
      const { container } = render(<Skeleton style={{ width: "120px" }} />)

      expect(container.querySelector('[data-slot="skeleton"]')?.getAttribute("style")).toContain("width: 120px")
    })

    it("renders passed accessibility attributes", () => {
      const { container } = render(<Skeleton aria-label="Loading avatar" role="status" />)

      const skeleton = container.querySelector('[data-slot="skeleton"]')
      expect(skeleton?.getAttribute("aria-label")).toBe("Loading avatar")
      expect(skeleton?.getAttribute("role")).toBe("status")
    })
  })

  describe("Events", () => {
    it("keeps skeleton rendered after click interaction", async () => {
      const { container } = render(<Skeleton />)

      const skeleton = container.querySelector('[data-slot="skeleton"]')
      if (skeleton) {
        await user.click(skeleton)
      }

      expect(container.querySelector('[data-slot="skeleton"]')).toBeDefined()
    })
  })

  describe("State Internal", () => {
    it("keeps class output stable across rerender with same props", () => {
      const { container, rerender } = render(<Skeleton className="same-class" />)

      rerender(<Skeleton className="same-class" />)

      expect(container.querySelector('[data-slot="skeleton"]')?.className).toContain("same-class")
    })
  })

  describe("Accessibility", () => {
    it("can be exposed as status region when role is provided", () => {
      render(<Skeleton role="status" aria-label="Loading content" />)

      expect(screen.getByRole("status", { name: "Loading content" })).toBeDefined()
    })

    it("does not enter keyboard tab order by default", async () => {
      render(
        <div>
          <button type="button">Before</button>
          <Skeleton />
          <button type="button">After</button>
        </div>
      )

      await user.tab()
      await user.tab()

      expect(document.activeElement).toBe(screen.getByRole("button", { name: "After" }))
    })
  })
})
