"use client"

import {
  CheckCircle2,
  Info,
  Loader2,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        [data-sonner-toaster] {
          margin-top: 40px !important;
        }

        [data-sonner-toast] {
          background: var(--background) !important;
          backdrop-filter: blur(8px) !important;
          border: 1px solid var(--border) !important;
          border-radius: 10px !important;
          padding: 10px 14px !important;
          width: 320px !important;
          font-family: var(--font-sans) !important;
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
          overflow: hidden !important;
          position: relative !important;
          transition: all 0.2s ease !important;
        }

        .dark [data-sonner-toast] {
          background: rgba(18, 18, 20, 0.85) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3) !important;
        }

        /* Subtle Left Accent */
        [data-sonner-toast]::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--accent-color, var(--primary));
          opacity: 0.8;
        }

        [data-sonner-toast][data-type="success"] { --accent-color: var(--success); }
        [data-sonner-toast][data-type="error"] { --accent-color: var(--danger); }
        [data-sonner-toast][data-type="info"] { --accent-color: var(--info); }
        [data-sonner-toast][data-type="warning"] { --accent-color: var(--warning); }
        
        [data-sonner-toast] [data-title] {
          font-family: var(--font-heading) !important;
          font-weight: 600 !important;
          font-size: 13.5px !important;
          color: var(--foreground) !important;
          margin-bottom: 1px !important;
          line-height: 1.2 !important;
        }
        
        [data-sonner-toast] [data-description] {
          font-weight: 400 !important;
          font-size: 12.5px !important;
          color: var(--muted-foreground) !important;
          line-height: 1.3 !important;
        }

        [data-sonner-toast] [data-icon] {
          margin-top: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex-shrink: 0 !important;
          opacity: 0.9;
        }

        /* Hover effect */
        [data-sonner-toast]:hover {
          border-color: var(--accent-color, var(--primary)) !important;
          transform: translateY(-1px);
        }
      `}} />
      <Sonner
        theme={theme as ToasterProps["theme"]}
        className="toaster group"
        icons={{
          success: (
            <div className="text-success">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
          ),
          info: (
            <div className="text-info">
              <Info className="h-4.5 w-4.5" />
            </div>
          ),
          warning: (
            <div className="text-warning">
              <AlertTriangle className="h-4.5 w-4.5" />
            </div>
          ),
          error: (
            <div className="text-danger">
              <XCircle className="h-4.5 w-4.5" />
            </div>
          ),
          loading: (
            <div className="text-primary">
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            </div>
          ),
        }}
        toastOptions={{
          classNames: {
            toast: "toast",
            content: "content",
            description: "description",
            title: "title",
          },
        }}
        {...props}
      />
    </>
  )
}

export { Toaster }

