import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Typography
} from "@/components/atoms"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

type StatCardProps = {
  title: string
  value: string
  change?: number
  description?: string
  trend?: "up" | "down" | "neutral"
  icon?: React.ReactNode
  chart?: React.ReactNode
  className?: string
}

export const StatCard = ({
  title,
  value,
  change,
  description,
  trend,
  icon,
  chart,
  className,
}: StatCardProps) => {
  return (
    <Card className={cn("rounded-2xl shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>

        {icon && (
          <div className="p-2 bg-muted rounded-lg">
            {icon}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Typography variant="h4" className="font-semibold">
            {value}
          </Typography>

          {typeof change === "number" && (
            <div
              className={cn(
                "flex items-center text-xs font-medium px-2 py-1 rounded-md",
                trend === "up"
                  ? "bg-green-100 text-green-600"
                  : trend === "down"
                    ? "bg-red-100 text-red-600"
                    : "bg-slate-100 text-slate-600"
              )}
            >
              {trend === "up" ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : trend === "down" ? (
                <TrendingDown className="w-3 h-3 mr-1" />
              ) : (
                <span className="w-3 h-3 mr-1 inline-block" />
              )}
              {change}%
            </div>
          )}
        </div>

        {chart && (
          <div className="h-12 w-full">
            {chart}
          </div>
        )}

        {description && (
          <Typography variant="p" className="text-muted-foreground">
            {description}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}
