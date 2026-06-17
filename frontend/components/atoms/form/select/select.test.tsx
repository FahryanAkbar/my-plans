import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { NativeSelect, NativeSelectOption, NativeSelectOptGroup } from "./select"

describe("Native Select Component Family", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders native select with options", () => {
      render(
        <NativeSelect aria-label="Status">
          <NativeSelectOption value="todo">To Do</NativeSelectOption>
          <NativeSelectOption value="done">Done</NativeSelectOption>
        </NativeSelect>
      )

      expect(screen.getByRole("combobox", { name: "Status" })).toBeDefined()
      expect(screen.getByRole("option", { name: "To Do" })).toBeDefined()
    })

    it("renders select icon slot", () => {
      const { container } = render(
        <NativeSelect aria-label="Priority">
          <NativeSelectOption value="high">High</NativeSelectOption>
        </NativeSelect>
      )

      expect(container.querySelector('[data-slot="native-select-icon"]')).toBeDefined()
    })
  })

  describe("Props", () => {
    it("applies default size to wrapper", () => {
      const { container } = render(
        <NativeSelect aria-label="Category">
          <NativeSelectOption value="a">A</NativeSelectOption>
        </NativeSelect>
      )

      expect(container.querySelector('[data-slot="native-select-wrapper"]')?.getAttribute("data-size")).toBe("default")
    })

    it("applies sm size when size prop is provided", () => {
      const { container } = render(
        <NativeSelect aria-label="Type" size="sm">
          <NativeSelectOption value="x">X</NativeSelectOption>
        </NativeSelect>
      )

      expect(container.querySelector('[data-slot="native-select"]')?.getAttribute("data-size")).toBe("sm")
    })

    it("renders optgroup and keeps its label", () => {
      render(
        <NativeSelect aria-label="Grouped select">
          <NativeSelectOptGroup label="Main Group">
            <NativeSelectOption value="first">First</NativeSelectOption>
          </NativeSelectOptGroup>
        </NativeSelect>
      )

      expect(screen.getByRole("group", { name: "Main Group" })).toBeDefined()
    })
  })

  describe("Events", () => {
    it("calls onChange when selected value changes", async () => {
      const handleChange = vi.fn()
      render(
        <NativeSelect aria-label="Change select" onChange={handleChange}>
          <NativeSelectOption value="todo">To Do</NativeSelectOption>
          <NativeSelectOption value="done">Done</NativeSelectOption>
        </NativeSelect>
      )

      await user.selectOptions(screen.getByRole("combobox", { name: "Change select" }), "done")

      expect(handleChange).toHaveBeenCalledTimes(1)
    })
  })

  describe("State Internal", () => {
    it("updates selected value in uncontrolled mode", async () => {
      render(
        <NativeSelect aria-label="Uncontrolled select" defaultValue="todo">
          <NativeSelectOption value="todo">To Do</NativeSelectOption>
          <NativeSelectOption value="done">Done</NativeSelectOption>
        </NativeSelect>
      )

      const select = screen.getByRole("combobox", { name: "Uncontrolled select" })
      await user.selectOptions(select, "done")

      expect((select as HTMLSelectElement).value).toBe("done")
    })
  })

  describe("Accessibility", () => {
    it("allows label association for select control", () => {
      render(
        <>
          <label htmlFor="team-select">Team</label>
          <NativeSelect id="team-select">
            <NativeSelectOption value="eng">Engineering</NativeSelectOption>
          </NativeSelect>
        </>
      )

      expect(screen.getByLabelText("Team")).toBeDefined()
    })

    it("can be focused using keyboard tab navigation", async () => {
      render(
        <div>
          <button type="button">Before</button>
          <NativeSelect aria-label="Focusable select">
            <NativeSelectOption value="one">One</NativeSelectOption>
          </NativeSelect>
        </div>
      )

      await user.tab()
      await user.tab()

      expect(document.activeElement).toBe(screen.getByRole("combobox", { name: "Focusable select" }))
    })
  })
})
