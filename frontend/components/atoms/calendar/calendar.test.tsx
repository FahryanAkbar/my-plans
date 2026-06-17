import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { CalendarDay, type Modifiers } from "react-day-picker"
import { Calendar, CalendarDayButton } from "./calendar"

describe("Calendar", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders the root calendar wrapper and month grid correctly", () => {
      const { container } = render(<Calendar month={new Date(2026, 4, 1)} />)
      
      // Menggunakan querySelector karena data-slot="calendar" disematkan pada custom Root component wrapper
      const root = container.querySelector('[data-slot="calendar"]')
      expect(root).not.toBeNull()
      
      expect(screen.getByRole("grid")).toBeDefined()
    })

    it("renders week numbers when showWeekNumber is true", () => {
      const { container } = render(
        <Calendar showWeekNumber month={new Date(2026, 4, 1)} />
      )
      
      // Menggunakan querySelector karena nomor minggu adalah cell khusus yang dirender oleh react-day-picker
      const weekNumberHeader = container.querySelector(".rdp-week_number_header")
      expect(weekNumberHeader).not.toBeNull()
    })
  })

  describe("Props", () => {
    it("renders day-picker in single mode with selected date", () => {
      const selectedDate = new Date(2026, 4, 15)
      const { container } = render(
        <Calendar mode="single" selected={selectedDate} month={selectedDate} />
      )

      // Menggunakan querySelector karena kita perlu memverifikasi keberadaan data attribute kustom untuk selected single
      const selectedTime = selectedDate.getTime()
      const selectedDayBtn = container.querySelector(`[data-day="${selectedTime}"]`)
      expect(selectedDayBtn).not.toBeNull()
      expect(selectedDayBtn?.getAttribute("data-selected-single")).toBe("true")
    })

    it("renders correctly in range mode with start, middle, and end dates", () => {
      const fromDate = new Date(2026, 4, 10)
      const midDate = new Date(2026, 4, 11)
      const toDate = new Date(2026, 4, 12)
      const { container } = render(
        <Calendar
          mode="range"
          selected={{ from: fromDate, to: toDate }}
          month={fromDate}
        />
      )

      // Menggunakan querySelector karena kita perlu memverifikasi atribut state range pada data attribute kustom
      const startBtn = container.querySelector(`[data-day="${fromDate.getTime()}"]`)
      const middleBtn = container.querySelector(`[data-day="${midDate.getTime()}"]`)
      const endBtn = container.querySelector(`[data-day="${toDate.getTime()}"]`)

      expect(startBtn).not.toBeNull()
      expect(startBtn?.getAttribute("data-range-start")).toBe("true")
      
      expect(middleBtn).not.toBeNull()
      expect(middleBtn?.getAttribute("data-range-middle")).toBe("true")

      expect(endBtn).not.toBeNull()
      expect(endBtn?.getAttribute("data-range-end")).toBe("true")
    })

    it("renders with dropdown caption layout and custom dropdowns", () => {
      const month = new Date(2026, 4, 1)
      const { container } = render(
        <Calendar
          captionLayout="dropdown"
          month={month}
          startMonth={new Date(2025, 0)}
          endMonth={new Date(2027, 11)}
        />
      )

      const dropdowns = container.querySelector(".cn-calendar-dropdown-root")
      expect(dropdowns).not.toBeNull()
    })

    it("applies custom className through props to the root container", () => {
      const { container } = render(
        <Calendar className="custom-calendar-class" month={new Date(2026, 4, 1)} />
      )
      
      // Menggunakan querySelector karena data-slot="calendar" disematkan pada custom Root component wrapper
      const root = container.querySelector('[data-slot="calendar"]')
      expect(root?.className).toContain("custom-calendar-class")
    })
  })

  describe("Events", () => {
    it("triggers onSelect callback when a date button is clicked", async () => {
      const handleSelect = vi.fn()
      render(
        <Calendar
          mode="single"
          month={new Date(2026, 4, 1)}
          onSelect={handleSelect}
        />
      )

      const dayBtn = screen.getByRole("button", { name: /15th/ })
      await user.click(dayBtn)

      expect(handleSelect).toHaveBeenCalled()
    })
  })

  describe("State Internal", () => {
    it("changes the displayed month caption when next month navigation button is clicked", async () => {
      render(<Calendar defaultMonth={new Date(2026, 4, 1)} />)

      expect(screen.getByText("May 2026")).toBeDefined()

      const nextBtn = screen.getByRole("button", { name: /next/i })
      await user.click(nextBtn)

      expect(screen.getByText("June 2026")).toBeDefined()
    })
  })

  describe("Accessibility", () => {
    it("focuses the button when CalendarDayButton is rendered with modifiers.focused true", () => {
      const mockDay = new CalendarDay(new Date(2026, 4, 15), new Date(2026, 4, 1))
      const mockModifiers: Modifiers = {
        focused: true,
        selected: false,
        range_start: false,
        range_end: false,
        range_middle: false,
      }

      // Menggunakan data-testid karena menguji CalendarDayButton secara terisolasi tanpa container Calendar penuh
      render(
        <CalendarDayButton
          day={mockDay}
          modifiers={mockModifiers}
          data-testid="day-btn"
        />
      )

      const btn = screen.getByTestId("day-btn")
      expect(document.activeElement).toBe(btn)
    })

    it("allows user to navigate focus onto navigation buttons via keyboard tab", async () => {
      render(<Calendar month={new Date(2026, 4, 1)} />)
      
      const prevBtn = screen.getByRole("button", { name: /previous/i })
      
      await user.tab()
      expect(document.activeElement).toBe(prevBtn)
    })
  })
})
