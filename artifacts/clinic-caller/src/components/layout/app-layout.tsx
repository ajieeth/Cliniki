import { Link, useLocation } from "wouter"
import { useState } from "react"
import { cn } from "@workspace/clinic-caller-design-system/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/clinic-caller-design-system/components/ui/tooltip"
import { Button } from "@workspace/clinic-caller-design-system/components/ui/button"
import {
  LayoutDashboard,
  Calendar,
  CalendarCheck,
  Headset,
  MessageSquare,
  Settings,
  Stethoscope,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react"
import { useTheme } from "next-themes"

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Availability", icon: Calendar },
  { href: "/appointments", label: "Appointments", icon: CalendarCheck },
  { href: "/call-center", label: "AI Voice Agent", icon: Headset },
  { href: "/enquiries", label: "Enquiries", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  const toggleTheme = () => setTheme(isDark ? "light" : "dark")

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-background text-foreground md:flex-row">
      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex h-14 w-full shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur md:hidden">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-foreground"
          onClick={() => setIsMobileNavOpen(false)}
        >
          <div className="rounded-lg bg-primary p-1.5 text-primary-foreground">
            <Stethoscope className="h-4 w-4" />
          </div>
          <span className="text-sm">Clinic Caller</span>
        </Link>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={toggleTheme}
            data-testid="button-theme-toggle-mobile"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={isMobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileNavOpen}
            onClick={() => setIsMobileNavOpen((open) => !open)}
          >
            {isMobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile overlay */}
      {isMobileNavOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 flex w-60 flex-shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200 md:static md:z-auto md:translate-x-0",
          isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Stethoscope className="h-4 w-4" />
          </div>
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-sidebar-foreground"
            onClick={() => setIsMobileNavOpen(false)}
          >
            Clinic Caller
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex flex-1 flex-col gap-0.5 py-4 px-3" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href
            return (
              <Tooltip key={item.href} delayDuration={600}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-100",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                    )}
                    onClick={() => setIsMobileNavOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    data-testid={`nav-${item.href.replace("/", "") || "dashboard"}`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="md:hidden">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-md px-2 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground text-xs font-semibold shrink-0">
              FD
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-sidebar-foreground leading-none">Front Desk</p>
              <p className="mt-0.5 text-xs text-sidebar-foreground/60">Admin Access</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="mt-1 w-full justify-start gap-3 px-2 text-sidebar-foreground/75 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            data-testid="button-theme-toggle"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span>{isDark ? "Light mode" : "Dark mode"}</span>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
