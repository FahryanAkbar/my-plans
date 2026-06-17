import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogMedia,
} from "./alert-dialog"
import { Info } from "lucide-react"

describe("AlertDialog Component", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("does not render dialog content before trigger click", () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>
      )

      expect(screen.queryByText("Are you absolutely sure?")).not.toBeInTheDocument()
    })

    it("renders dialog title and description after trigger click", async () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
      )

      await user.click(screen.getByRole("button", { name: "Open" }))
      expect(screen.getByText("Are you absolutely sure?")).toBeInTheDocument()
    })
  })

  describe("Props", () => {
    it("applies custom className to dialog content", () => {
      render(
        <AlertDialog defaultOpen>
          <AlertDialogContent className="custom-content-class">
            <AlertDialogTitle>Dialog Title</AlertDialogTitle>
            <AlertDialogDescription>Dialog Description</AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>
      )

      expect(document.querySelector('[data-slot="alert-dialog-content"]')).toHaveClass(
        "custom-content-class"
      )
    })

    it("applies custom className to media slot", () => {
      render(
        <AlertDialog defaultOpen>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogMedia className="custom-media-class">
                <Info />
              </AlertDialogMedia>
              <AlertDialogTitle>Dialog Title</AlertDialogTitle>
              <AlertDialogDescription>Dialog Description</AlertDialogDescription>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
      )

      expect(document.querySelector('[data-slot="alert-dialog-media"]')).toHaveClass(
        "custom-media-class"
      )
    })
  })

  describe("Events", () => {
    it("calls onOpenChange with false when cancel is clicked", async () => {
      const handleOpenChange = vi.fn()
      render(
        <AlertDialog onOpenChange={handleOpenChange}>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>Description</AlertDialogDescription>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>
      )

      await user.click(screen.getByRole("button", { name: "Open" }))
      await user.click(screen.getByRole("button", { name: "Cancel" }))
      expect(handleOpenChange).toHaveBeenCalledWith(false)
    })

    it("calls action handler when action button is clicked", async () => {
      const handleAction = vi.fn()
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>Description</AlertDialogDescription>
            <AlertDialogAction onClick={handleAction}>Continue</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      )

      await user.click(screen.getByRole("button", { name: "Open" }))
      await user.click(screen.getByRole("button", { name: "Continue" }))
      expect(handleAction).toHaveBeenCalledTimes(1)
    })
  })

  describe("State Internal", () => {
    it("opens and closes dialog based on open prop", () => {
      const { rerender } = render(
        <AlertDialog open={false}>
          <AlertDialogContent>
            <AlertDialogTitle>Dialog Title</AlertDialogTitle>
            <AlertDialogDescription>Dialog Description</AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>
      )

      rerender(
        <AlertDialog open>
          <AlertDialogContent>
            <AlertDialogTitle>Dialog Title</AlertDialogTitle>
            <AlertDialogDescription>Dialog Description</AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>
      )

      expect(screen.getByText("Dialog Title")).toBeInTheDocument()
    })
  })

  describe("Accessibility", () => {
    it("renders alert dialog role when opened", () => {
      render(
        <AlertDialog defaultOpen>
          <AlertDialogContent>
            <AlertDialogTitle>Dialog Title</AlertDialogTitle>
            <AlertDialogDescription>Dialog Description</AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )

      expect(screen.getByRole("alertdialog")).toBeInTheDocument()
    })

    it("focuses first action in dialog when opened", async () => {
      render(
        <AlertDialog>
          <AlertDialogTrigger>Open</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogTitle>Dialog Title</AlertDialogTitle>
            <AlertDialogDescription>Dialog Description</AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )

      await user.click(screen.getByRole("button", { name: "Open" }))
      expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus()
    })
  })
})
