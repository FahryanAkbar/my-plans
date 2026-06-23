import * as React from "react"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Checkbox } from "./checkbox"
import { cn } from "@/lib/utils"

const meta: Meta<typeof Checkbox> = {
  title: "Atoms/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    disabled: { control: "boolean" },
    checked: { control: "boolean" },
  },
}

export default meta
type Story = StoryObj<typeof Checkbox>

export const Default: Story = {
  render: (args) => <Checkbox {...args} />,
}

export const WithLabel: Story = {
  render: (args) => {
    const id = "terms-checkbox"
    return (
      <div className="flex items-center space-x-2">
        <Checkbox id={id} {...args} />
        <label
          htmlFor={id}
          className="text-sm font-medium leading-none cursor-pointer select-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Accept terms and conditions
        </label>
      </div>
    )
  },
}

export const DisabledStates: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled-unchecked" disabled />
        <label
          htmlFor="disabled-unchecked"
          className="text-sm font-medium leading-none cursor-not-allowed select-none text-muted-foreground opacity-70"
        >
          Disabled unchecked
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled-checked" defaultChecked disabled />
        <label
          htmlFor="disabled-checked"
          className="text-sm font-medium leading-none cursor-not-allowed select-none text-muted-foreground opacity-70"
        >
          Disabled checked
        </label>
      </div>
    </div>
  ),
}

export const InteractiveTaskList: Story = {
  render: () => {
    const [tasks, setTasks] = React.useState([
      { id: "1", title: "Review pull requests", done: true },
      { id: "2", title: "Update design tokens in components", done: false },
      { id: "3", title: "Write unit tests for Card and Button", done: false },
      { id: "4", title: "Draft next week's sprint goals", done: false },
    ])

    const toggleTask = (id: string) => {
      setTasks(prev =>
        prev.map(t => (t.id === id ? { ...t, done: !t.done } : t))
      )
    }

    return (
      <div className="w-95 p-6 border border-border bg-card rounded-xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <h3 className="font-semibold text-foreground text-sm">Today&apos;s Tasks</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full font-medium">
            {tasks.filter(t => t.done).length}/{tasks.length} Done
          </span>
        </div>
        <div className="space-y-3">
          {tasks.map((task) => {
            const taskId = `task-${task.id}`
            return (
              <div key={task.id} className="flex items-center space-x-3 group">
                <Checkbox
                  id={taskId}
                  checked={task.done}
                  onCheckedChange={() => toggleTask(task.id)}
                />
                <label
                  htmlFor={taskId}
                  className={cn(
                    "text-sm font-medium leading-none cursor-pointer select-none transition-all duration-200",
                    task.done ? "line-through text-muted-foreground/60" : "text-foreground hover:text-foreground/80"
                  )}
                >
                  {task.title}
                </label>
              </div>
            )
          })}
        </div>
      </div>
    )
  },
}

export const CardSelection: Story = {
  render: () => {
    const [selected, setSelected] = React.useState<string[]>([])

    const toggle = (id: string) => {
      setSelected(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      )
    }

    return (
      <div className="flex gap-4 w-135">
        <div
          onClick={() => toggle("editor")}
          className={cn(
            "flex-1 p-5 border rounded-xl cursor-pointer select-none transition-all duration-200 flex flex-col justify-between h-32.5 border-border hover:border-border/80 hover:bg-muted/10",
            selected.includes("editor") && "border-primary bg-primary/3 shadow-sm hover:border-primary"
          )}
        >
          <div className="flex items-start justify-between w-full">
            <div className="space-y-1 pr-4">
              <p className="font-semibold text-sm text-foreground">Editor Role</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Can create and edit pages, edit databases, and leave comments.
              </p>
            </div>
            <Checkbox
              checked={selected.includes("editor")}
              onCheckedChange={() => toggle("editor")}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        <div
          onClick={() => toggle("admin")}
          className={cn(
            "flex-1 p-5 border rounded-xl cursor-pointer select-none transition-all duration-200 flex flex-col justify-between h-32.5 border-border hover:border-border/80 hover:bg-muted/10",
            selected.includes("admin") && "border-primary bg-primary/3 shadow-sm hover:border-primary"
          )}
        >
          <div className="flex items-start justify-between w-full">
            <div className="space-y-1 pr-4">
              <p className="font-semibold text-sm text-foreground">Admin Role</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Full workspace administrative permissions and member billing.
              </p>
            </div>
            <Checkbox
              checked={selected.includes("admin")}
              onCheckedChange={() => toggle("admin")}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      </div>
    )
  },
}