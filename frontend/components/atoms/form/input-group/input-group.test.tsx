import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
} from "./input-group"

describe("InputGroup Component Family", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders input group with input and button", () => {
      render(
        <InputGroup>
          <InputGroupInput placeholder="Enter text" />
          <InputGroupButton>Submit</InputGroupButton>
        </InputGroup>
      )

      expect(screen.getByPlaceholderText("Enter text")).toBeDefined()
      expect(screen.getByRole("button", { name: "Submit" })).toBeDefined()
    })

    it("renders textarea control when using input group textarea", () => {
      render(
        <InputGroup>
          <InputGroupTextarea aria-label="Notes area" />
        </InputGroup>
      )

      expect(screen.getByRole("textbox", { name: "Notes area" })).toBeDefined()
    })
  })

  describe("Props", () => {
    it("applies custom class to input group container", () => {
      render(
        <InputGroup className="custom-group">
          <InputGroupInput aria-label="Group input" />
        </InputGroup>
      )

      const group = screen.getByRole("group")
      expect(group.className).toContain("custom-group")
    })

    it("applies align data attribute in input group addon", () => {
      render(
        <InputGroup>
          <InputGroupAddon align="inline-end">Addon</InputGroupAddon>
          <InputGroupInput aria-label="Aligned input" />
        </InputGroup>
      )

      expect(screen.getByText("Addon").getAttribute("data-align")).toBe("inline-end")
    })

    it("applies size variant data attribute in input group button", () => {
      render(
        <InputGroup>
          <InputGroupInput aria-label="Size input" />
          <InputGroupButton size="icon-sm" aria-label="Icon action" />
        </InputGroup>
      )

      expect(screen.getByRole("button", { name: "Icon action" }).getAttribute("data-size")).toBe("icon-sm")
    })
  })

  describe("Events", () => {
    it("calls onClick when input group button is clicked", async () => {
      const handleClick = vi.fn()
      render(
        <InputGroup>
          <InputGroupInput aria-label="Action input" />
          <InputGroupButton onClick={handleClick}>Run</InputGroupButton>
        </InputGroup>
      )

      await user.click(screen.getByRole("button", { name: "Run" }))

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it("focuses input when addon is clicked", async () => {
      render(
        <InputGroup>
          <InputGroupAddon>Prefix</InputGroupAddon>
          <InputGroupInput aria-label="Focusable group input" />
        </InputGroup>
      )

      await user.click(screen.getByText("Prefix"))

      expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Focusable group input" }))
    })

    it("tidak memfokuskan input saat tombol di dalam addon diklik", async () => {
      render(
        <InputGroup>
          <InputGroupAddon>
            <button type="button">Click Me</button>
          </InputGroupAddon>
          <InputGroupInput aria-label="Button input" />
        </InputGroup>
      )

      await user.click(screen.getByRole("button", { name: "Click Me" }))
      expect(document.activeElement).not.toBe(screen.getByRole("textbox", { name: "Button input" }))
    })
  })

  describe("State Internal", () => {
    it("updates input group input value in uncontrolled mode", async () => {
      render(
        <InputGroup>
          <InputGroupInput aria-label="Typing group input" />
        </InputGroup>
      )

      const input = screen.getByRole("textbox", { name: "Typing group input" })
      await user.type(input, "input group value")

      expect((input as HTMLInputElement).value).toBe("input group value")
    })
  })

  describe("Accessibility", () => {
    it("allows keyboard users to focus the grouped input", async () => {
      render(
        <div>
          <button type="button">Before</button>
          <InputGroup>
            <InputGroupText>Tag</InputGroupText>
            <InputGroupInput aria-label="Keyboard group input" />
          </InputGroup>
        </div>
      )

      await user.tab()
      await user.tab()

      expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Keyboard group input" }))
    })
  })
})
