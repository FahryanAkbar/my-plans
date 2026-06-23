import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import * as React from "react"
import { Calendar } from "./calendar"
import type { DateRange } from "react-day-picker"

const meta: Meta<typeof Calendar> = {
  title: "Atoms/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center p-6 bg-background rounded-xl border max-w-sm mx-auto shadow-sm">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Calendar>

export const SingleSelect: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>(new Date())

    return (
      <div className="flex flex-col gap-4 items-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
        />
        <div className="text-xs text-muted-foreground">
          Selected Date: {date ? date.toLocaleDateString() : "None"}
        </div>
      </div>
    )
  },
}

export const RangeSelect: Story = {
  render: () => {
    const [range, setRange] = React.useState<DateRange | undefined>({
      from: new Date(),
      to: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000), // + 5 days
    })

    return (
      <div className="flex flex-col gap-4 items-center">
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange}
        />
        <div className="text-xs text-muted-foreground text-center">
          Range:{" "}
          {range?.from ? range.from.toLocaleDateString() : "None"}{" "}
          {range?.to ? ` - ${range.to.toLocaleDateString()}` : ""}
        </div>
      </div>
    )
  },
}

export const MultipleSelect: Story = {
  render: () => {
    const [dates, setDates] = React.useState<Date[] | undefined>([new Date()])

    return (
      <div className="flex flex-col gap-4 items-center">
        <Calendar
          mode="multiple"
          selected={dates}
          onSelect={setDates}
        />
        <div className="text-xs text-muted-foreground text-center">
          Selected {dates?.length ?? 0} date(s)
        </div>
      </div>
    )
  },
}

export const WithDropdowns: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>(new Date())

    return (
      <div className="flex flex-col gap-4 items-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          captionLayout="dropdown"
          startMonth={new Date(2020, 0)}
          endMonth={new Date(2030, 11)}
        />
      </div>
    )
  },
}

export const ShowWeekNumbers: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>(new Date())

    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        showWeekNumber
      />
    )
  },
}
