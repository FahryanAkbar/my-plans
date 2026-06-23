import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
} from "./avatar"

describe("Avatar Component", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders avatar root container", () => {
      const { container } = render(<Avatar />)

      expect(container.querySelector('[data-slot="avatar"]')).toBeInTheDocument()
    })

    it("renders fallback content", () => {
      render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      )

      expect(screen.getByText("JD")).toBeInTheDocument()
    })

    it("renders avatar badge content", () => {
      render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
          <AvatarBadge>Online</AvatarBadge>
        </Avatar>
      )

      expect(screen.getByText("Online")).toBeInTheDocument()
    })

    it("renders avatar image slot inside avatar root", () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="/avatar.png" alt="User Avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      )

      expect(container.querySelector('[data-slot="avatar"]')).toBeInTheDocument()
    })
  })

  describe("Props", () => {
    it("applies avatar size data attribute", () => {
      const { container } = render(<Avatar size="lg" />)

      expect(container.querySelector('[data-slot="avatar"]')).toHaveAttribute("data-size", "lg")
    })

    it("merges custom className on avatar badge", () => {
      const { container } = render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
          <AvatarBadge className="custom-badge">Online</AvatarBadge>
        </Avatar>
      )

      expect(container.querySelector('[data-slot="avatar-badge"]')).toHaveClass("custom-badge")
    })

    it("merges custom className on avatar group count", () => {
      const { container } = render(
        <AvatarGroup>
          <Avatar>
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <AvatarGroupCount className="custom-count">+3</AvatarGroupCount>
        </AvatarGroup>
      )

      expect(container.querySelector('[data-slot="avatar-group-count"]')).toHaveClass("custom-count")
    })
  })

  describe("Events", () => {
    it("calls onClick when avatar is clicked", async () => {
      const handleClick = vi.fn()
      const { container } = render(
        <Avatar onClick={handleClick}>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      )

      const avatar = container.querySelector('[data-slot="avatar"]')
      expect(avatar).not.toBeNull()
      if (!avatar) return

      await user.click(avatar)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe("State Internal", () => {
    it("updates fallback text when rerendered", () => {
      const { rerender } = render(
        <Avatar>
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
      )

      rerender(
        <Avatar>
          <AvatarFallback>B</AvatarFallback>
        </Avatar>
      )

      expect(screen.queryByText("A")).not.toBeInTheDocument()
    })
  })

  describe("Accessibility", () => {
    it("renders fallback text for non-visual identification", () => {
      render(
        <Avatar>
          <AvatarFallback>UA</AvatarFallback>
        </Avatar>
      )

      expect(screen.getByText("UA")).toBeInTheDocument()
    })

    it("renders avatar group with multiple member labels", () => {
      render(
        <AvatarGroup>
          <Avatar>
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>B</AvatarFallback>
          </Avatar>
        </AvatarGroup>
      )

      expect(screen.getByText("A")).toBeInTheDocument()
    })
  })
})
