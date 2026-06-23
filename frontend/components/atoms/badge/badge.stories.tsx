import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Badge } from "./badge"
import { AlertCircle, CheckCircle2 } from "lucide-react"

const meta: Meta<typeof Badge> = {
  title: "Atoms/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: [
        "default",
        "secondary",
        "success",
        "warning",
        "destructive",
        "info",
        "outline",
        "neutral",
      ],
    },
  },
}

export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = {
  args: {
    children: "Badge",
    variant: "default",
  },
}

export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
  },
}

export const Success: Story = {
  args: {
    children: "Success",
    variant: "success",
  },
}

export const Warning: Story = {
  args: {
    children: "Warning",
    variant: "warning",
  },
}

export const Destructive: Story = {
  args: {
    children: "Destructive",
    variant: "destructive",
  },
}

export const Info: Story = {
  args: {
    children: "Info",
    variant: "info",
  },
}

export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
  },
}

export const Neutral: Story = {
  args: {
    children: "Neutral",
    variant: "neutral",
  },
}

export const AllVariants: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      <Badge {...args} variant="default">Default</Badge>
      <Badge {...args} variant="secondary">Secondary</Badge>
      <Badge {...args} variant="success">Success</Badge>
      <Badge {...args} variant="warning">Warning</Badge>
      <Badge {...args} variant="destructive">Destructive</Badge>
      <Badge {...args} variant="info">Info</Badge>
      <Badge {...args} variant="outline">Outline</Badge>
      <Badge {...args} variant="neutral">Neutral</Badge>
    </div>
  ),
}

export const WithIcon: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 12 }}>
      <Badge {...args} variant="success" className="gap-1 flex items-center">
        <CheckCircle2 className="size-3" />
        Success
      </Badge>
      <Badge {...args} variant="destructive" className="gap-1 flex items-center">
        <AlertCircle className="size-3" />
        Error
      </Badge>
    </div>
  ),
}

export const Pill: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 12 }}>
      <Badge {...args} variant="default" className="rounded-full">Pill Default</Badge>
      <Badge {...args} variant="outline" className="rounded-full">Pill Outline</Badge>
    </div>
  ),
}
