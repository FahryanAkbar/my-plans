import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { Logo } from "./logo"

describe("Logo Component Family", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders default label text", () => {
      render(<Logo />)

      expect(screen.getByText("Jotion")).toBeDefined()
    })

    it("renders both light and dark logo images", () => {
      render(<Logo />)

      expect(screen.getAllByAltText("Logo").length).toBe(2)
    })
  })

  describe("Props", () => {
    it("renders custom name label", () => {
      render(<Logo name="Workspace" />)

      expect(screen.getByText("Workspace")).toBeDefined()
    })

    it("hides label when showLabel is false", () => {
      render(<Logo showLabel={false} />)

      expect(screen.queryByText("Jotion")).toBeNull()
    })

    it("applies href and aria-label when rendered as link", () => {
      render(<Logo href="/dashboard" name="Acme" />)

      const link = screen.getByRole("link", { name: "Acme home" })
      expect(link.getAttribute("href")).toBe("/dashboard")
    })

    it("applies custom class names to wrapper, icon, and label", () => {
      const { container } = render(
        <Logo className="wrapper-class" iconClassName="icon-class" labelClassName="label-class" />
      )

      expect(container.firstElementChild?.className).toContain("wrapper-class")
      expect(screen.getAllByAltText("Logo")[0].className).toContain("icon-class")
      expect(screen.getByText("Jotion").className).toContain("label-class")
    })

    it("uses internal fallback values when nullish content props are passed", () => {
      render(
        <Logo
          name={null as unknown as string}
          iconSize={null as unknown as number}
          lightSrc={null as unknown as string}
          darkSrc={null as unknown as string}
          alt={null as unknown as string}
        />
      )

      const images = screen.getAllByRole("img")
      expect(images[0].getAttribute("src")).toContain("/logo.svg")
      expect(images[1].getAttribute("src")).toContain("/logo-dark.svg")
      expect(images[0].getAttribute("width")).toBe("40")
      expect(images[0].getAttribute("height")).toBe("40")
      expect(images[0].getAttribute("alt")).toBe("Logo")
      expect(screen.getByText("Jotion")).toBeDefined()
    })
  })

  describe("Events", () => {
    it("keeps link rendered after click interaction", async () => {
      render(<Logo href="/home" name="App" />)

      const link = screen.getByRole("link", { name: "App home" })
      await user.click(link)

      expect(screen.getByRole("link", { name: "App home" })).toBeDefined()
    })
  })

  describe("State Internal", () => {
    it("keeps label visibility stable across rerender with same props", () => {
      const { rerender } = render(<Logo showLabel={false} />)

      rerender(<Logo showLabel={false} />)

      expect(screen.queryByText("Jotion")).toBeNull()
    })
  })

  describe("Accessibility", () => {
    it("uses custom alt text for logo images", () => {
      render(<Logo alt="Company logo" />)

      expect(screen.getAllByAltText("Company logo").length).toBe(2)
    })

    it("allows keyboard users to focus linked logo", async () => {
      render(
        <div>
          <button type="button">Before</button>
          <Logo href="/" name="Jotion" />
        </div>
      )

      await user.tab()
      await user.tab()

      expect(document.activeElement).toBe(screen.getByRole("link", { name: "Jotion home" }))
    })
  })
})
