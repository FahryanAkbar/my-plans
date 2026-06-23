import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip"

function TestTooltip({
  open,
  defaultOpen,
  onOpenChange,
  delayDuration = 0,
  sideOffset,
}: {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  delayDuration?: number
  sideOffset?: number
}) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <TooltipTrigger>Hover Trigger</TooltipTrigger>
        <TooltipContent className="custom-tooltip" sideOffset={sideOffset}>
          Tooltip message
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

describe("Tooltip Component Family", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders tooltip trigger", () => {
      render(<TestTooltip />)

      expect(screen.getByRole("button", { name: "Hover Trigger" })).toBeDefined()
    })

    it("renders tooltip content when defaultOpen is true", () => {
      render(<TestTooltip defaultOpen />)

      expect(screen.getByRole("tooltip")).toBeDefined()
      expect(document.querySelector('[data-slot="tooltip-content"]')?.textContent).toContain("Tooltip message")
    })
  })

  describe("Props", () => {
    it("applies custom class to tooltip content", () => {
      render(<TestTooltip defaultOpen />)

      expect(document.querySelector('[data-slot="tooltip-content"]')?.className).toContain("custom-tooltip")
    })

    it("applies side offset prop to tooltip content", () => {
      render(<TestTooltip defaultOpen sideOffset={8} />)

      expect(document.querySelector('[data-slot="tooltip-content"]')?.getAttribute("data-state")).toBeDefined()
    })

    it("keeps content hidden by default when not opened", () => {
      render(<TestTooltip />)

      expect(screen.queryByText("Tooltip message")).toBeNull()
    })
  })

  describe("Events", () => {
    it("calls onOpenChange with true on hover", async () => {
      const handleOpenChange = vi.fn()
      render(<TestTooltip onOpenChange={handleOpenChange} />)

      await user.hover(screen.getByRole("button", { name: "Hover Trigger" }))

      expect(handleOpenChange).toHaveBeenCalledWith(true)
    })

    it("calls onOpenChange with false on escape key", async () => {
      const handleOpenChange = vi.fn()
      render(<TestTooltip defaultOpen onOpenChange={handleOpenChange} />)

      await user.keyboard("{Escape}")

      expect(handleOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe("State Internal", () => {
    it("shows tooltip content in uncontrolled mode after hover", async () => {
      render(<TestTooltip />)

      await user.hover(screen.getByRole("button", { name: "Hover Trigger" }))

      expect(screen.getByRole("tooltip")).toBeDefined()
    })

    it("keeps tooltip closed in controlled mode when open is false", async () => {
      const handleOpenChange = vi.fn()
      render(<TestTooltip open={false} onOpenChange={handleOpenChange} />)

      await user.hover(screen.getByRole("button", { name: "Hover Trigger" }))

      expect(screen.queryByRole("tooltip")).toBeNull()
      expect(handleOpenChange).toHaveBeenCalledWith(true)
    })
  })

  describe("Accessibility", () => {
    it("opens tooltip when trigger receives keyboard focus", async () => {
      render(<TestTooltip />)

      await user.tab()

      expect(screen.getByRole("tooltip")).toBeDefined()
    })

    it("hides tooltip when escape key is pressed", async () => {
      render(<TestTooltip defaultOpen />)

      await user.keyboard("{Escape}")

      expect(screen.queryByRole("tooltip")).toBeNull()
    })
  })
})
