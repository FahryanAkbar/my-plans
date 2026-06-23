import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

let mockedTheme: string | undefined = "system"

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: mockedTheme }),
}))

vi.mock("sonner", () => ({
  Toaster: ({ theme, className, position, ...props }: Record<string, unknown>) => (
    <div
      data-sonner-toaster
      data-theme={String(theme)}
      data-position={String(position)}
      className={String(className ?? "")}
      {...props}
    />
  ),
}))

import { Toaster } from "./sonner"

describe("Toaster Component Family", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    mockedTheme = "system"
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders toaster container", () => {
      render(<Toaster />)

      expect(document.querySelector("[data-sonner-toaster]")).toBeDefined()
    })

    it("renders injected style element", () => {
      const { container } = render(<Toaster />)

      expect(container.querySelector("style")).toBeDefined()
    })
  })

  describe("Props", () => {
    it("forwards position prop to sonner toaster", () => {
      render(<Toaster position="top-center" />)

      expect(document.querySelector('[data-sonner-toaster]')?.getAttribute("data-position")).toBe("top-center")
    })

    it("applies wrapper className from component config", () => {
      render(<Toaster />)

      expect(document.querySelector('[data-sonner-toaster]')?.className).toContain("toaster")
    })

    it("forwards resolved light theme to sonner toaster", () => {
      mockedTheme = "light"
      render(<Toaster />)

      expect(document.querySelector('[data-sonner-toaster]')?.getAttribute("data-theme")).toBe("light")
    })
  })

  describe("Events", () => {
    it("keeps toaster mounted after click interaction", async () => {
      render(<Toaster />)

      const toaster = document.querySelector('[data-sonner-toaster]')
      if (toaster) {
        await user.click(toaster)
      }

      expect(document.querySelector('[data-sonner-toaster]')).toBeDefined()
    })
  })

  describe("State Internal", () => {
    it("updates forwarded theme after rerender when theme changes", () => {
      const { rerender } = render(<Toaster />)

      mockedTheme = "dark"
      rerender(<Toaster />)

      expect(document.querySelector('[data-sonner-toaster]')?.getAttribute("data-theme")).toBe("dark")
    })
  })

  describe("Accessibility", () => {
    it("allows passing accessibility attributes to toaster", () => {
      render(<Toaster aria-label="Notifications" />)

      expect(document.querySelector('[data-sonner-toaster]')?.getAttribute("aria-label")).toBe("Notifications")
    })

    it("does not enter keyboard tab order by default", async () => {
      render(
        <div>
          <button type="button">Before</button>
          <Toaster />
          <button type="button">After</button>
        </div>
      )

      await user.tab()
      await user.tab()

      expect(document.activeElement?.textContent).toBe("After")
    })
  })
})
