import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
  CommandDialog,
} from "./command"

describe("Command Component Family", () => {
  let user: ReturnType<typeof userEvent.setup>
  
  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders basic command structure with children and items", () => {
      // Menggunakan data-testid karena elemen root Command dari library 'cmdk' tidak memiliki role semantik default yang mudah di-query secara langsung
      render(
        <Command data-testid="command-root">
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>Calendar</CommandItem>
              <CommandItem>Search Emoji</CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem>
                Settings
                <CommandShortcut>⌘S</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      )

      const root = screen.getByTestId("command-root")
      expect(root).toBeDefined()
      expect(root.getAttribute("data-slot")).toBe("command")

      const input = screen.getByPlaceholderText("Search...")
      expect(input).toBeDefined()

      const separator = screen.getByRole("separator")
      expect(separator).toBeDefined()
      expect(separator.getAttribute("data-slot")).toBe("command-separator")

      expect(screen.getByText("Suggestions")).toBeDefined()
      expect(screen.getByRole("option", { name: "Calendar" })).toBeDefined()
      expect(screen.getByRole("option", { name: "Search Emoji" })).toBeDefined()

      const shortcut = screen.getByText("⌘S")
      expect(shortcut).toBeDefined()
      expect(shortcut.textContent).toBe("⌘S")
    })

    it("renders CommandDialog when open is true with title, description, and children", () => {
      render(
        <CommandDialog open={true} title="Test Command Palette" description="Test Search description">
          <div data-testid="dialog-child">Dialog Child Content</div>
        </CommandDialog>
      )

      expect(screen.getByText("Dialog Child Content")).toBeDefined()
      expect(screen.getByText("Test Command Palette")).toBeDefined()
      expect(screen.getByText("Test Search description")).toBeDefined()
    })
  })

  describe("Props", () => {
    it("applies custom classNames correctly to each component", () => {
      // Menggunakan data-testid pada beberapa sub-komponen untuk mempermudah identifikasi elemen spesifik untuk pengujian className
      const { getByTestId } = render(
        <Command data-testid="command" className="custom-command">
          <CommandInput data-testid="input" className="custom-input" placeholder="Search..." />
          <CommandList data-testid="list" className="custom-list">
            <CommandEmpty data-testid="empty" className="custom-empty">
              No results
            </CommandEmpty>
            <CommandGroup data-testid="group" className="custom-group">
              <CommandItem data-testid="item" className="custom-item">
                Item
              </CommandItem>
            </CommandGroup>
            <CommandSeparator data-testid="separator" className="custom-separator" />
          </CommandList>
        </Command>
      )

      expect(getByTestId("command").className).toContain("custom-command")
      expect(getByTestId("input").className).toContain("custom-input")
      expect(getByTestId("list").className).toContain("custom-list")
      expect(getByTestId("group").className).toContain("custom-group")
      expect(getByTestId("item").className).toContain("custom-item")
      expect(getByTestId("separator").className).toContain("custom-separator")
    })

    it("applies disabled prop to CommandItem correctly", () => {
      render(
        <Command>
          <CommandList>
            <CommandItem disabled>Disabled Item</CommandItem>
          </CommandList>
        </Command>
      )
      const item = screen.getByRole("option", { name: "Disabled Item" })
      expect(item.getAttribute("data-disabled")).toBe("true")
    })

    it("renders close button in CommandDialog when showCloseButton is true", () => {
      render(
        <CommandDialog open={true} showCloseButton={true} title="Dialog Title">
          <div>Dialog Content</div>
        </CommandDialog>
      )
      const closeButton = screen.getByRole("button", { name: "Close" })
      expect(closeButton).toBeDefined()
    })
  })

  describe("Events", () => {
    it("calls onSelect callback when CommandItem is clicked", async () => {
      const handleSelect = vi.fn()
      render(
        <Command>
          <CommandList>
            <CommandItem onSelect={handleSelect}>Action Item</CommandItem>
          </CommandList>
        </Command>
      )

      const item = screen.getByRole("option", { name: "Action Item" })
      await user.click(item)
      expect(handleSelect).toHaveBeenCalledTimes(1)
    })

    it("does not call onSelect callback when disabled CommandItem is clicked", async () => {
      const handleSelect = vi.fn()
      render(
        <Command>
          <CommandList>
            <CommandItem disabled onSelect={handleSelect}>Disabled Action Item</CommandItem>
          </CommandList>
        </Command>
      )

      const item = screen.getByRole("option", { name: "Disabled Action Item" })
      await user.click(item)
      expect(handleSelect).not.toHaveBeenCalled()
    })
  })

  describe("State Internal", () => {
    it("filters list items according to text entered in CommandInput", async () => {
      render(
        <Command>
          <CommandInput placeholder="Search items..." />
          <CommandList>
            <CommandGroup heading="Fruits">
              <CommandItem>Apple</CommandItem>
              <CommandItem>Banana</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      )

      const input = screen.getByPlaceholderText("Search items...")
      await user.type(input, "Apple")

      expect(screen.getByRole("option", { name: "Apple" })).toBeDefined()
      expect(screen.queryByRole("option", { name: "Banana" })).toBeNull()
    })
  })

  describe("Accessibility", () => {
    it("supports keyboard navigation for focusing search input", async () => {
      render(
        <Command>
          <CommandInput placeholder="Search..." />
        </Command>
      )

      const input = screen.getByPlaceholderText("Search...")
      await user.tab()
      expect(document.activeElement).toBe(input)
    })

    it("has appropriate semantic roles for key subcomponents", () => {
      render(
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem>Settings Option</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      )

      expect(screen.getByRole("listbox")).toBeDefined()
      expect(screen.getByRole("separator")).toBeDefined()
      expect(screen.getByRole("option", { name: "Settings Option" })).toBeDefined()
    })
  })
})
