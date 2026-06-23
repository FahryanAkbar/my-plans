import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

vi.mock("recharts", () => {

  const ResponsiveContainer = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  )

  const PieChart = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  )

  const Pie = ({
    children,
    onMouseEnter,
    onMouseLeave,
    activeIndex,
    activeShape,
  }: {
    children?: React.ReactNode
    onMouseEnter?: (e: unknown, index: number) => void
    onMouseLeave?: () => void
    activeIndex?: number | number[]
    activeShape?: (props: Record<string, unknown>) => React.ReactElement
  }) => (
    <div
      data-testid="pie"
      onMouseEnter={() => onMouseEnter?.({}, 0)}
      onMouseLeave={() => onMouseLeave?.()}
    >
      {typeof activeIndex === "number" && activeIndex >= 0 && activeShape
        ? activeShape({ fill: "#22c55e", outerRadius: 80, innerRadius: 60, startAngle: 180, endAngle: 90, cx: 100, cy: 100 })
        : null}
      {children}
    </div>
  )

  const Cell = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
    <div data-testid="cell" data-class={className}>
      {children}
    </div>
  )
  const Tooltip = ({ content }: { content?: (arg: { active: boolean; payload: unknown[] }) => React.ReactNode }) => (
    <div data-testid="tooltip">{content?.({ active: true, payload: [] })}</div>
  )
  const Sector = () => <div data-testid="sector" />

  return {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Sector,
  }
})

import { GaugeChart } from "./gauge-chart"

const baseData = [
  { name: "Planned", value: 40, color: "#94a3b8" },
  { name: "Done", value: 60, color: "#22c55e" },
]

describe("GaugeChart Component Family", () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  describe("Rendering", () => {
    it("renders fallback value label and subLabel", () => {
      render(<GaugeChart data={baseData} value={65} subLabel="Completion" />)

      expect(screen.getByText("65")).toBeDefined()
      expect(screen.getByText("Completion")).toBeDefined()
    })

    it("renders chart container after mount", async () => {
      render(<GaugeChart data={baseData} value={40} />)

      expect(await screen.findByTestId("responsive-container")).toBeDefined()
    })
  })

  describe("Props", () => {
    it("applies custom className to root", () => {
      const { container } = render(<GaugeChart data={baseData} className="custom-gauge" />)

      expect(container.firstElementChild?.className).toContain("custom-gauge")
    })

    it("applies custom height style", () => {
      const { container } = render(<GaugeChart data={baseData} height={280} />)

      expect(container.firstElementChild?.getAttribute("style")).toContain("height: 280px")
    })

    it("clamps value to max boundary", () => {
      render(<GaugeChart data={baseData} value={150} min={0} max={100} />)

      expect(screen.getByText("100")).toBeDefined()
    })

    it("uses label prop when active segment is not set", () => {
      render(<GaugeChart data={baseData} value={25} label="Overall" />)

      expect(screen.getByText("Overall")).toBeDefined()
    })
  })

  describe("Events", () => {
    it("shows active segment task count on pie hover", async () => {
      const valueSegments = [
        { name: "In Progress", value: 30, count: 7, color: "#f59e0b" },
      ]

      render(<GaugeChart data={baseData} valueSegments={valueSegments} subLabel="Tasks" />)

      const pies = await screen.findAllByTestId("pie")
      await user.hover(pies[1])

      expect(screen.getByText("7 Tasks")).toBeDefined()
    })

    it("restores default label after pie mouse leave", async () => {
      const valueSegments = [
        { name: "In Progress", value: 30, count: 7, color: "#f59e0b" },
      ]

      render(<GaugeChart data={baseData} valueSegments={valueSegments} label="Overall" />)

      const pies = await screen.findAllByTestId("pie")
      await user.hover(pies[1])
      await user.unhover(pies[1])

      expect(screen.getByText("Overall")).toBeDefined()
    })

    it("applies dimmed class to non-active non-transparent segments on hover", async () => {
      const valueSegments = [
        { name: "In Progress", value: 20, count: 3, color: "#f59e0b" },
        { name: "Review", value: 30, count: 4, color: "#3b82f6" },
      ]

      render(<GaugeChart data={baseData} valueSegments={valueSegments} />)

      const pies = await screen.findAllByTestId("pie")
      await user.hover(pies[1])

      const classValues = screen
        .getAllByTestId("cell")
        .map((cell) => cell.getAttribute("data-class") || "")
      expect(classValues.some((v) => v.includes("opacity-20 saturate-50"))).toBe(true)
    })

    it("shows percentage text when active segment count is undefined", async () => {
      const valueSegments = [
        { name: "In Progress", value: 30, color: "#f59e0b" } as unknown as {
          name: string
          value: number
          count: number
          color: string
        },
      ]

      render(<GaugeChart data={baseData} valueSegments={valueSegments} />)

      const pies = await screen.findAllByTestId("pie")
      await user.hover(pies[1])

      expect(screen.getByText("30%")).toBeDefined()
    })
  })

  describe("State Internal", () => {
    it("updates normalized output when value prop changes", () => {
      const { rerender } = render(<GaugeChart data={baseData} value={20} />)

      rerender(<GaugeChart data={baseData} value={80} />)

      expect(screen.getByText("80")).toBeDefined()
    })
  })

  describe("Accessibility", () => {
    it("keeps textual summary available for screen readers", () => {
      render(<GaugeChart data={baseData} value={55} subLabel="Progress" />)

      expect(screen.getByText("55")).toBeDefined()
      expect(screen.getByText("Progress")).toBeDefined()
    })

    it("does not break tab flow around chart", async () => {
      render(
        <div>
          <button type="button">Before</button>
          <GaugeChart data={baseData} value={10} />
          <button type="button">After</button>
        </div>
      )

      await user.tab()
      await user.tab()

      expect(document.activeElement).toBe(screen.getByRole("button", { name: "After" }))
    })
  })
})
