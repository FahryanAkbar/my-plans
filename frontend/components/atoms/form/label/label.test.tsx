import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { Label } from "./label"

describe("Label", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders label text", () => {
      render(<Label htmlFor="full-name">Full Name</Label>)

      expect(screen.getByText("Full Name")).toBeDefined()
    })

    it("renders label with data-slot attribute", () => {
      render(<Label htmlFor="email">Email</Label>)

      expect(screen.getByText("Email").getAttribute("data-slot")).toBe("label")
    })
  })

  describe("Props", () => {
    it("applies custom class name", () => {
      render(
        <Label htmlFor="phone" className="custom-label">
          Phone
        </Label>
      )

      expect(screen.getByText("Phone").className).toContain("custom-label")
    })

    it("binds htmlFor to input id", () => {
      render(
        <>
          <Label htmlFor="username">Username</Label>
          <input id="username" />
        </>
      )

      expect(screen.getByText("Username").getAttribute("for")).toBe("username")
    })
  })

  describe("Events", () => {
    it("focuses the related input when label is clicked", async () => {
      render(
        <>
          <Label htmlFor="nickname">Nickname</Label>
          <input id="nickname" aria-label="Nickname input" />
        </>
      )

      await user.click(screen.getByText("Nickname"))

      expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Nickname input" }))
    })
  })

  describe("State Internal", () => {
    it("keeps label text stable after interaction", async () => {
      render(
        <>
          <Label htmlFor="city">City</Label>
          <input id="city" aria-label="City input" />
        </>
      )

      await user.click(screen.getByText("City"))

      expect(screen.getByText("City")).toBeDefined()
    })
  })

  describe("Accessibility", () => {
    it("allows screen query by visible accessible label text", () => {
      render(
        <>
          <Label htmlFor="password">Password</Label>
          <input id="password" />
        </>
      )

      expect(screen.getByLabelText("Password")).toBeDefined()
    })

    it("allows keyboard users to focus input and keep label association", async () => {
      render(
        <div>
          <button type="button">Before</button>
          <Label htmlFor="company">Company</Label>
          <input id="company" />
        </div>
      )

      await user.tab()
      await user.tab()

      expect(document.activeElement).toBe(screen.getByLabelText("Company"))
    })
  })
})
