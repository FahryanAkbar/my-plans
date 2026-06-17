import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Button } from "./button"
import { ArrowRight, Settings } from "lucide-react"

const meta: Meta<typeof Button> = {
  title: "Atoms/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: [
        "default",
        "outline",
        "secondary",
        "ghost",
        "destructive",
        "link",
        "unstyled",
        "multiline",
      ],
    },
    size: {
      control: { type: "select" },
      options: [
        "default",
        "xs",
        "sm",
        "lg",
        "icon",
        "icon-xs",
        "icon-sm",
        "icon-lg",
        "none",
      ],
    },
    disabled: {
      control: { type: "boolean" },
    },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    children: "Primary Button",
    variant: "default",
  },
}

export const Outline: Story = {
  args: {
    children: "Outline Button",
    variant: "outline",
  },
}

export const Unstyled: Story = {
  args: {
    children: "Unstyled Button (Reset all styles)",
    variant: "unstyled",
  },
}

export const Multiline: Story = {
  render: (args) => (
    <Button
      {...args}
      variant="multiline"
      className="w-80 p-4 border border-border bg-card hover:bg-accent/50 text-foreground transition-all duration-200 rounded-xl shadow-sm flex items-start gap-4"
    >
      <div className="flex-1 space-y-1">
        <p className="font-semibold text-sm text-foreground">Multiline Button Title</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          This is a description text that wraps onto multiple lines inside the button. It is neat, legible, and fits perfectly.
        </p>
      </div>
      <ArrowRight className="size-4 text-muted-foreground shrink-0 mt-0.5" />
    </Button>
  ),
}

export const WithIcon: Story = {
  render: (args) => (
    <Button {...args}>
      With Icon
      <ArrowRight className="ml-2 size-4" />
    </Button>
  ),
}

export const IconOnly: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Button {...args} size="icon-xs">
        <Settings className="size-3" />
      </Button>
      <Button {...args} size="icon-sm">
        <Settings className="size-3.5" />
      </Button>
      <Button {...args} size="icon">
        <Settings className="size-4" />
      </Button>
      <Button {...args} size="icon-lg">
        <Settings className="size-5" />
      </Button>
    </div>
  ),
  args: {
    variant: "outline",
  },
}

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
      <Button {...args} size="xs">XS</Button>
      <Button {...args} size="sm">SM</Button>
      <Button {...args} size="default">MD / Default</Button>
      <Button {...args} size="lg">LG</Button>
      <Button {...args} size="none" className="p-1 border border-dashed">Size None</Button>
    </div>
  ),
  args: {
    variant: "default",
  },
}