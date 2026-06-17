import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer"

function TestDrawer({
  open,
  onOpenChange,
  direction = "bottom",
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  direction?: "top" | "bottom" | "left" | "right"
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction={direction}>
      <DrawerTrigger>Open Drawer</DrawerTrigger>
      <DrawerContent className="custom-content">
        <DrawerHeader className="custom-header">
          <DrawerTitle>Drawer Title</DrawerTitle>
          <DrawerDescription>Drawer Description</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="custom-footer">
          <button type="button">Confirm</button>
          <DrawerClose>Close Drawer</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

describe("Drawer Component Family", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })


  describe("Rendering", () => {
    it("renders drawer content when open is true", () => {
      render(<TestDrawer open />)

      expect(screen.getByRole("heading", { name: "Drawer Title" })).toBeDefined()
    })

    it("renders drawer trigger button", () => {
      render(<TestDrawer />)

      expect(screen.getByRole("button", { name: "Open Drawer" })).toBeDefined()
    })
  })

  describe("Props", () => {
    it("applies custom class to drawer content", () => {
      render(<TestDrawer open />)

      const content = screen
        .getByRole("heading", { name: "Drawer Title" })
        .closest('[data-slot="drawer-content"]')
      expect(content?.className).toContain("custom-content")
    })

    it("applies right direction data attribute to content", () => {
      render(<TestDrawer open direction="right" />)

      const content = screen
        .getByRole("heading", { name: "Drawer Title" })
        .closest('[data-slot="drawer-content"]')
      expect(content?.getAttribute("data-vaul-drawer-direction")).toBe("right")
    })
  })

  describe("Events", () => {
    it("calls onOpenChange with true when trigger is clicked", async () => {
      const handleOpenChange = vi.fn()
      render(<TestDrawer onOpenChange={handleOpenChange} />)

      await user.click(screen.getByRole("button", { name: "Open Drawer" }))

      expect(handleOpenChange).toHaveBeenCalledWith(true)
    })

    it("calls onOpenChange with false when close button is clicked", async () => {
      const handleOpenChange = vi.fn()
      render(<TestDrawer onOpenChange={handleOpenChange} />)

      await user.click(screen.getByRole("button", { name: "Open Drawer" }))
      await user.click(screen.getByRole("button", { name: "Close Drawer" }))

      expect(handleOpenChange).toHaveBeenNthCalledWith(1, true)
      expect(handleOpenChange).toHaveBeenNthCalledWith(2, false)
    })
  })

  describe("State Internal", () => {
    it("shows content after trigger click in uncontrolled mode", async () => {
      render(<TestDrawer />)

      expect(screen.queryByRole("heading", { name: "Drawer Title" })).toBeNull()

      await user.click(screen.getByRole("button", { name: "Open Drawer" }))

      expect(screen.getByRole("heading", { name: "Drawer Title" })).toBeDefined()
    })
  })

  describe("Accessibility", () => {
    it("allows keyboard users to focus trigger and open drawer", async () => {
      render(<TestDrawer />)

      await user.tab()
      const trigger = screen.getByRole("button", { name: "Open Drawer" })
      expect(document.activeElement).toBe(trigger)

      await user.keyboard("{Enter}")
      expect(screen.getByRole("heading", { name: "Drawer Title" })).toBeDefined()
    })
  })
})
