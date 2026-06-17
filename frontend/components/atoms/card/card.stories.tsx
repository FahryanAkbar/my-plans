import Image from "next/image"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  CardAction
} from "./card"
import { Button } from "../button"
import { Badge } from "../badge"
import { Switch } from "../switch"
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage, 
  AvatarGroup 
} from "../avatar"
import { 
  Calendar, 
  CheckSquare, 
  Heart, 
  MessageSquare, 
  MoreVertical, 
  Settings,
  Folder,
  User
} from "lucide-react"

const meta: Meta<typeof Card> = {
  title: "Atoms/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
}

export default meta
type Story = StoryObj<typeof Card>

export const Default: Story = {
  render: () => (
    <Card className="w-95 border border-border bg-card text-card-foreground shadow-sm rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <CardTitle>Quick Start Guide</CardTitle>
        <CardDescription>Learn the basics of using your new editor.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Welcome to your new workspace! Here you can create pages, organize databases, share them with team members, and automate tasks.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center mt-4">
        <span className="text-xs text-muted-foreground">5 min read</span>
        <Button size="sm">Get Started</Button>
      </CardFooter>
    </Card>
  ),
}

export const WithHeaderAction: Story = {
  render: () => (
    <Card className="w-95 shadow-sm border border-border rounded-xl">
      <CardHeader>
        <div className="flex flex-col gap-1">
          <CardTitle>Analytics Report</CardTitle>
          <CardDescription>Weekly visitor and traffic statistics</CardDescription>
        </div>
        <CardAction>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight">12,458</span>
            <span className="text-sm font-medium text-emerald-500">+18.2%</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Unique visitors increased by 2,342 compared to last week.
          </p>
        </div>
      </CardContent>
      <CardFooter className="justify-between mt-4">
        <Button variant="outline" size="sm">View details</Button>
        <Button size="sm">Export data</Button>
      </CardFooter>
    </Card>
  ),
}

export const ProjectTask: Story = {
  render: () => (
    <Card className="w-85 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 border border-border rounded-xl bg-card overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between w-full">
          <Badge variant="secondary">In Progress</Badge>
          <CardAction>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground">
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </CardAction>
        </div>
        <CardTitle className="mt-2.5 text-base font-semibold leading-snug">
          Design System v2 Rebranding & Tokens
        </CardTitle>
        <CardDescription className="line-clamp-2 text-xs">
          Refactor CSS variables, establish Tailwind theme configuration, and implement dark mode classes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pb-4">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span>May 25, 2026</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckSquare className="h-3.5 w-3.5 text-muted-foreground" />
            <span>8/12 Subtasks</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
            <span>Progress</span>
            <span>66%</span>
          </div>
          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: "66%" }} />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-border/40 bg-muted/10 px-6 py-3 mt-4">
        <AvatarGroup>
          <Avatar size="sm">
            <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&auto=format" alt="User 1" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <Avatar size="sm">
            <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&auto=format" alt="User 2" />
            <AvatarFallback>AM</AvatarFallback>
          </Avatar>
          <Avatar size="sm">
            <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&fit=crop&auto=format" alt="User 3" />
            <AvatarFallback>SL</AvatarFallback>
          </Avatar>
        </AvatarGroup>
        <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground">
          View task
        </Button>
      </CardFooter>
    </Card>
  ),
}

export const SettingsToggle: Story = {
  render: () => (
    <Card className="w-105 shadow-sm border border-border rounded-xl">
      <CardHeader>
        <CardTitle>Notifications Settings</CardTitle>
        <CardDescription>Choose how you want to be notified about updates.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 pb-3">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">Email Notifications</p>
            <p className="text-xs text-muted-foreground">Receive weekly summary and comments.</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">Push Notifications</p>
            <p className="text-xs text-muted-foreground">Get instant desktop alerts for mentions.</p>
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 pt-3">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">Marketing emails</p>
            <p className="text-xs text-muted-foreground">Receive occasional tips, guides and deals.</p>
          </div>
          <Switch />
        </div>
      </CardContent>
      <CardFooter className="justify-between mt-4">
        <Button variant="ghost" size="sm">Reset</Button>
        <Button size="sm">Save preferences</Button>
      </CardFooter>
    </Card>
  ),
}

export const ImageCover: Story = {
  render: () => (
    <Card className="w-90 overflow-hidden border border-border shadow-md rounded-xl hover:shadow-lg transition-all duration-200 group">
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        <Image
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80" 
          alt="Abstract design artwork" 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
          width={200}
          height={200}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <Badge className="bg-white/20 text-white backdrop-blur-md border-0 hover:bg-white/30">Art & Design</Badge>
          <span className="text-xs text-white/80 font-medium">May 2026</span>
        </div>
      </div>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold">The Future of Generative UI</CardTitle>
        <CardDescription>How agentic systems are changing interface composition.</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Explore the paradigms of dynamic components compiled and rendered in real-time, tailored exactly to user context and layout needs.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t border-border/40 bg-muted/10 mt-4">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10">
            <Heart className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10">
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm">Read Article</Button>
      </CardFooter>
    </Card>
  ),
}

export const CardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl p-4">
      <Card className="border border-border bg-card rounded-xl hover:border-primary/40 transition-all">
        <CardHeader>
          <div className="p-2 w-fit rounded-lg bg-primary/10 text-primary mb-2">
            <Folder className="h-5 w-5" />
          </div>
          <CardTitle className="text-base font-semibold">Templates</CardTitle>
          <CardDescription>Start from a pre-made workspace template.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Quickly spin up databases, task boards, docs, or custom wikis with optimized configurations.
          </p>
        </CardContent>
        <CardFooter className="mt-4">
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs font-semibold">
            Browse templates →
          </Button>
        </CardFooter>
      </Card>

      <Card className="border border-border bg-card rounded-xl hover:border-primary/40 transition-all">
        <CardHeader>
          <div className="p-2 w-fit rounded-lg bg-primary/10 text-primary mb-2">
            <User className="h-5 w-5" />
          </div>
          <CardTitle className="text-base font-semibold">Members</CardTitle>
          <CardDescription>Collaborate and manage team permissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Invite guest editors, set read-only permissions, or add full admin roles for workspace scaling.
          </p>
        </CardContent>
        <CardFooter className="mt-4">
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs font-semibold">
            Manage members →
          </Button>
        </CardFooter>
      </Card>

      <Card className="border border-border bg-card rounded-xl hover:border-primary/40 transition-all">
        <CardHeader>
          <div className="p-2 w-fit rounded-lg bg-primary/10 text-primary mb-2">
            <Settings className="h-5 w-5" />
          </div>
          <CardTitle className="text-base font-semibold">Integrations</CardTitle>
          <CardDescription>Connect with external workflow APIs.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Sync database entries with GitHub issues, Slack channels, Jira boards, or custom webhooks.
          </p>
        </CardContent>
        <CardFooter className="mt-4">
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs font-semibold">
            Configure settings →
          </Button>
        </CardFooter>
      </Card>
    </div>
  ),
}