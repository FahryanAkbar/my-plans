'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { CalendarIcon, X } from "lucide-react"
import { DateRange } from 'react-day-picker'
import { useMediaQuery } from 'usehooks-ts'

import { cn } from '@/lib'
import { 
  Button,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/atoms'

type DateRangePickerProps = {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  className?: string
}

export const DateRangePicker = ({
  value,
  onChange,
  className
}: DateRangePickerProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [date, setDate] = React.useState<DateRange | undefined>(value)

  React.useEffect(() => {
    setDate(value)
  }, [value])

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range)
    onChange?.(range)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleSelect(undefined)
  }

  const label = React.useMemo(() => {
    if (date?.from && date?.to) {
      return `${format(date.from, "MMM dd, yyyy")} - ${format(
        date.to,
        "MMM dd, yyyy"
      )}`
    }

    if (date?.from) {
      return format(date.from, "MMM dd, yyyy")
    }

    return "Pick a date"
  }, [date])

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "h-9 rounded-md px-3 justify-start text-left font-medium border-border/60 bg-background hover:bg-accent/50 transition-all",
              date && (date.from || date.to) && "border-primary/30 bg-primary/5 ring-offset-background",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">{label}</span>
            {date && (date.from || date.to) && (
              <div 
                role="button"
                onClick={handleClear}
                className="ml-2 p-0.5 rounded-sm hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={date}
              onSelect={handleSelect}
              numberOfMonths={isMobile ? 1 : 2}
              initialFocus
            />
          </PopoverContent>
      </Popover>
    </div>
  )
}
