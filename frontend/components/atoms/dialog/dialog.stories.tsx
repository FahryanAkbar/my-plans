import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import * as React from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog"
import { Button } from "../button"
import { Input, Label } from "../form"

const meta: Meta<typeof Dialog> = {
  title: "Atoms/Dialog",
  component: Dialog,
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof Dialog>

export const Basic: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              defaultValue="Fahryan Akbar"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              defaultValue="@fahryanakbar"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const CustomCloseButton: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Without Top Close Button</Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Important Notification</DialogTitle>
          <DialogDescription>
            You must agree to the new terms and conditions to continue using this application.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            We have updated our privacy policy and terms of service. Please review them carefully before accepting. If you do not agree, you can close your account.
          </p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Decline</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="submit">Accept Terms</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const Interactive: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)

    return (
      <div className="flex flex-col items-center gap-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Open Controlled Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Controlled Dialog</DialogTitle>
              <DialogDescription>
                This dialog state is controlled externally.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 text-center text-muted-foreground">
              You can control opening and closing via parent state.
            </div>
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>
                Close programmatically
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <span className="text-xs text-muted-foreground">
          State: {open ? "Opened" : "Closed"}
        </span>
      </div>
    )
  },
}
