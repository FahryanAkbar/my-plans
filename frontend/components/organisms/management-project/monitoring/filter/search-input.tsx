"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

import { Search, X } from "lucide-react"
import { Input } from "@/components/atoms"
import { useDebounce } from "@/hooks"

type SearchInputProps = {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  shortcut?: string
  onClear?: () => void
  className?: string
}

export const SearchInput = ({
  value,
  onChange,
  placeholder = "Search...",
  shortcut,
  onClear,
  className,
}: SearchInputProps) => {
  const [internalValue, setInternalValue] = React.useState(value || "")
  const debouncedValue = useDebounce(internalValue, 500)
  const isControlled = value !== undefined

  React.useEffect(() => {
    if (isControlled) {
      setInternalValue(value || "")
    }
  }, [isControlled, value])

  React.useEffect(() => {
    if (!onChange) return;
    if (debouncedValue !== (value ?? "")) {
      onChange(debouncedValue)
    }
  }, [debouncedValue, onChange, value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value)
  }

  const handleClear = () => {
    setInternalValue("")
    onClear?.()
  }

  return (
    <div className={cn("relative w-full", className)}>
      <Search 
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" 
      />
      <Input
        value={internalValue}
        maxLength={30}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-9 pr-16 h-9"
      />

      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {internalValue && (
          <button
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {shortcut && (
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
            {shortcut}
          </span>
        )}
      </div>
    </div>
  )
}
