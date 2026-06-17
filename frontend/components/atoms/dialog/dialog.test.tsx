import React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog"

function TestDialog({
  showContentCloseButton = true,
  showFooterCloseButton = false,
  open,
  onOpenChange,
}: {
  showContentCloseButton?: boolean
  showFooterCloseButton?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger>Open Dialog</DialogTrigger>
      <DialogContent showCloseButton={showContentCloseButton}>
        <DialogHeader className="custom-header">
          <DialogTitle>Delete Item</DialogTitle>
          <DialogDescription>
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton={showFooterCloseButton} className="custom-footer">
          <button type="button">Confirm</button>
        </DialogFooter>
      </DialogContent>
      <DialogClose />
    </Dialog>
  )
}

describe("Dialog Component Family", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  describe("Rendering", () => {
    it("renders dialog content when open is true", () => {
      render(<TestDialog open />)

      expect(screen.getByRole("heading", { name: "Delete Item" })).toBeDefined()
      expect(screen.getByText("This action cannot be undone.")).toBeDefined()
      expect(screen.getByRole("button", { name: "Confirm" })).toBeDefined()
    })
  })

  describe("Props", () => {
    it("hides the content close button when showCloseButton is false", () => {
      render(<TestDialog open showContentCloseButton={false} />)

      expect(screen.queryByRole("button", { name: "Close" })).toBeNull()
    })

    it("renders footer close button when showCloseButton is true", () => {
      render(<TestDialog open showFooterCloseButton />)

      expect(screen.getAllByRole("button", { name: "Close" }).length).toBe(2)
    })
  })

  describe("Events", () => {
    it("closes dialog when default content close button is clicked", async () => {
      const user = userEvent.setup()
      render(<TestDialog />)

      await user.click(screen.getByRole("button", { name: "Open Dialog" }))
      await user.click(screen.getByRole("button", { name: "Close" }))

      expect(screen.queryByRole("heading", { name: "Delete Item" })).toBeNull()
    })

    it("closes dialog when footer close button is clicked", async () => {
      const user = userEvent.setup()
      render(<TestDialog showFooterCloseButton />)

      await user.click(screen.getByRole("button", { name: "Open Dialog" }))
      const closeButtons = screen.getAllByRole("button", { name: "Close" })
      await user.click(closeButtons[1])

      expect(screen.queryByRole("heading", { name: "Delete Item" })).toBeNull()
    })
  })

  describe("Accessibility", () => {
    it("allows keyboard users to focus trigger and open dialog", async () => {
      const user = userEvent.setup()
      render(<TestDialog />)

      await user.tab()
      const trigger = screen.getByRole("button", { name: "Open Dialog" })
      expect(document.activeElement).toBe(trigger)

      await user.keyboard("{Enter}")
      expect(screen.getByRole("heading", { name: "Delete Item" })).toBeDefined()
    })
  })

  describe("State Internal", () => {
    it("keeps custom class contract for header and footer when dialog is open", () => {
      render(<TestDialog open showFooterCloseButton />)

      const title = screen.getByText("Delete Item")
      const header = title.closest('[data-slot="dialog-header"]')
      const footer = screen
        .getByRole("button", { name: "Confirm" })
        .closest('[data-slot="dialog-footer"]')

      expect(header?.className).toContain("custom-header")
      expect(footer?.className).toContain("custom-footer")
    })
  })
})
