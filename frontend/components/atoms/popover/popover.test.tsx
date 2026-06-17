import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./popover"

function TestPopover({
  open,
  onOpenChange,
  align,
  sideOffset,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  align?: "start" | "center" | "end"
  sideOffset?: number
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor />
      <PopoverTrigger>Open Popover</PopoverTrigger>
      <PopoverContent className="custom-content" align={align} sideOffset={sideOffset}>
        <PopoverHeader className="custom-header">
          <PopoverTitle className="custom-title">Popover Title</PopoverTitle>
          <PopoverDescription className="custom-description">Popover Description</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  )
}

describe("Popover Component Family", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders trigger button", () => {
      render(<TestPopover />)

      expect(screen.getByRole("button", { name: "Open Popover" })).toBeDefined()
    })

    it("renders content title and description when open is true", () => {
      render(<TestPopover open />)

      expect(screen.getByText("Popover Title")).toBeDefined()
      expect(screen.getByText("Popover Description")).toBeDefined()
    })
  })

  describe("Props", () => {
    it("applies custom class to popover content", () => {
      render(<TestPopover open />)

      const content = screen.getByText("Popover Title").closest('[data-slot="popover-content"]')
      expect(content?.className).toContain("custom-content")
    })

    it("applies custom class to popover header", () => {
      render(<TestPopover open />)

      const header = screen.getByText("Popover Title").closest('[data-slot="popover-header"]')
      expect(header?.className).toContain("custom-header")
    })

    it("applies align and sideOffset props to content", () => {
      render(<TestPopover open align="end" sideOffset={12} />)

      const content = screen.getByText("Popover Title").closest('[data-slot="popover-content"]')
      expect(content?.getAttribute("data-align")).toBe("end")
      expect(content?.getAttribute("data-side")).toBeDefined()
    })
  })

  describe("Events", () => {
    it("calls onOpenChange with true when trigger is clicked", async () => {
      const handleOpenChange = vi.fn()
      render(<TestPopover onOpenChange={handleOpenChange} />)

      await user.click(screen.getByRole("button", { name: "Open Popover" }))

      expect(handleOpenChange).toHaveBeenCalledWith(true)
    })

    it("calls onOpenChange with false when escape is pressed while open", async () => {
      const handleOpenChange = vi.fn()
      render(<TestPopover open onOpenChange={handleOpenChange} />)

      await user.keyboard("{Escape}")

      expect(handleOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe("State Internal", () => {
    it("opens popover content in uncontrolled mode after trigger click", async () => {
      render(<TestPopover />)

      expect(screen.queryByText("Popover Title")).toBeNull()

      await user.click(screen.getByRole("button", { name: "Open Popover" }))

      expect(screen.getByText("Popover Title")).toBeDefined()
    })
  })

  describe("Accessibility", () => {
    it("allows keyboard users to focus trigger and open popover", async () => {
      render(<TestPopover />)

      await user.tab()
      const trigger = screen.getByRole("button", { name: "Open Popover" })
      expect(document.activeElement).toBe(trigger)

      await user.keyboard("{Enter}")
      expect(screen.getByText("Popover Title")).toBeDefined()
    })

    it("renders popover content with dialog role when open", () => {
      render(<TestPopover open />)

      expect(screen.getByRole("dialog")).toBeDefined()
    })
  })
})
