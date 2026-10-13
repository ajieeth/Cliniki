import { useGetDashboardSummary } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/clinic-caller-design-system/components/ui/card"
import { Button } from "@workspace/clinic-caller-design-system/components/ui/button"
import { Skeleton } from "@workspace/clinic-caller-design-system/components/ui/skeleton"
import { Separator } from "@workspace/clinic-caller-design-system/components/ui/separator"
import { Progress } from "@workspace/clinic-caller-design-system/components/ui/progress"
import { Alert, AlertTitle, AlertDescription } from "@workspace/clinic-caller-design-system/components/ui/alert"
import { Item, ItemContent, ItemGroup, ItemMedia, ItemSeparator, ItemTitle, ItemDescription, ItemActions } from "@workspace/clinic-caller-design-system/components/ui/item"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@workspace/clinic-caller-design-system/components/ui/empty"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Users,
  PhoneCall,
  TrendingUp,
  IndianRupee,
  Clock,
  Mic,
  AlertCircle,
  CalendarCheck,
  BookOpen,
  PhoneIncoming,
  LayoutGrid,
} from "lucide-react"
import { formatTime } from "@/lib/utils"
import type { ActivityType } from "@workspace/api-client-react"
import { Link } from "wouter"

// ─── Activity icon map ────────────────────────────────────────────────────────
function ActivityIcon({ type }: { type: ActivityType }) {
  const cls = "w-3.5 h-3.5"
  switch (type) {
    case "booking":  return <CalendarCheck className={cls} />
    case "call":     return <PhoneIncoming className={cls} />
    case "enquiry":  return <BookOpen className={cls} />
    case "slot":     return <LayoutGrid className={cls} />
    default:         return <Clock className={cls} />
  }
}

// ─── Stat card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: string | number
  sub: string
  icon: React.ReactNode
  accent?: boolean
}

function StatCard({ label, value, sub, icon, accent }: StatCardProps) {
  return (
    <Card
      className={`relative overflow-hidden transition-shadow duration-200 hover:shadow-md ${
        accent ? "border-primary/20 bg-primary/5" : ""
      }`}
      data-testid="stat-card"
    >
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start gap-x-2 gap-y-3">
          <div className="min-w-0 flex-1 basis-[calc(100%-2.75rem)]">
            <p className="break-words text-xs font-medium uppercase leading-snug tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 text-3xl font-bold leading-none tracking-tight text-foreground">
              {value}
            </p>
            <p className="mt-1.5 break-words text-xs text-muted-foreground">{sub}</p>
          </div>
          <div
            className={`ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              accent
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Skeleton loading state ───────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8" aria-busy="true" aria-label="Loading dashboard">
      <div className="space-y-2">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { data: summary, isLoading, isError } = useGetDashboardSummary()

  if (isLoading) return <DashboardSkeleton />

  if (isError || !summary) {
    return (
      <Alert variant="destructive" className="max-w-lg" data-testid="dashboard-error">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Failed to load dashboard</AlertTitle>
        <AlertDescription>Check your connection and refresh the page.</AlertDescription>
      </Alert>
    )
  }

  const sarvam = summary.sarvamVoiceUsage
  const sarvamAvailable = sarvam.status === "available"

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            data-testid="dashboard-heading"
          >
            Today's Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live operational summary for your clinic.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:pb-1">
          <p className="text-xs font-medium text-muted-foreground" aria-label="Current date">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <Button asChild variant="outline" size="sm" data-testid="button-view-appointments">
            <Link href="/appointments">
              <CalendarCheck className="h-3.5 w-3.5" />
              View appointments
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-testid="primary-stats">
        <StatCard
          label="Appointments"
          value={summary.appointmentsToday}
          sub={`${summary.availableSlots} slots still open`}
          icon={<Calendar className="h-4 w-4" />}
          accent
        />
        <StatCard
          label="Active Doctors"
          value={summary.activeDoctors}
          sub="On duty today"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="AI Calls"
          value={summary.aiCallsToday}
          sub="Handled in last 24 h"
          icon={<PhoneCall className="h-4 w-4" />}
        />
        <StatCard
          label="Booking Rate"
          value={`${Math.round(summary.bookingRate)}%`}
          sub="From incoming AI calls"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      {/* Booking-rate progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">
            AI call-to-booking conversion
          </p>
          <p className="text-xs font-semibold text-foreground">
            {Math.round(summary.bookingRate)}%
          </p>
        </div>
        <Progress
          value={Math.round(summary.bookingRate)}
          aria-label={`Booking rate ${Math.round(summary.bookingRate)}%`}
        />
      </div>

      {/* Sarvam voice panel */}
      <Card className="overflow-hidden" data-testid="sarvam-panel">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <Mic className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Sarvam Voice</CardTitle>
                <CardDescription className="text-xs">Today's usage and estimated spend</CardDescription>
              </div>
            </div>
            <Badge variant={sarvamAvailable ? "success" : "secondary"} className="shrink-0">
              {sarvamAvailable ? "Live" : "Unavailable"}
            </Badge>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-4">
          {sarvamAvailable ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-0.5" data-testid="sarvam-calls">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Calls</p>
                <p className="text-2xl font-bold tracking-tight">{sarvam.calls ?? 0}</p>
              </div>
              <div className="space-y-0.5" data-testid="sarvam-minutes">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Minutes used</p>
                <p className="text-2xl font-bold tracking-tight">{(sarvam.minutes ?? 0).toFixed(1)}</p>
              </div>
              <div className="space-y-0.5" data-testid="sarvam-cost">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Est. cost</p>
                <p className="flex items-baseline gap-0.5 text-2xl font-bold tracking-tight">
                  <IndianRupee className="h-4 w-4 self-center text-muted-foreground" aria-hidden />
                  {(sarvam.estimatedCostInr ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-muted-foreground">at {sarvam.ratePerMinuteInr.toFixed(2)}/min</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sarvam analytics could not be loaded for today.</p>
          )}
        </CardContent>
      </Card>

      {/* Appointments + Activity */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">

        {/* Upcoming appointments */}
        <Card className="flex flex-col" data-testid="appointments-panel">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Upcoming Appointments</CardTitle>
                <CardDescription className="text-xs">Next visits scheduled for today</CardDescription>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="flex-1 p-0">
            {summary.upcomingAppointments.length === 0 ? (
              <Empty className="border-0 py-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon"><Calendar className="h-5 w-5" /></EmptyMedia>
                  <EmptyTitle className="text-sm">No upcoming appointments</EmptyTitle>
                  <EmptyDescription>All clear for now.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ItemGroup aria-label="Upcoming appointments">
                {summary.upcomingAppointments.map((apt, i) => (
                  <div key={apt.id}>
                    {i > 0 && <ItemSeparator />}
                    <Item size="sm" data-testid={`appointment-row-${apt.id}`}>
                      {/* Time chip */}
                      <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-md bg-muted px-2 py-1.5">
                        <span className="font-mono text-xs font-semibold leading-none text-foreground">
                          {formatTime(apt.time)}
                        </span>
                      </div>
                      <ItemContent>
                        <ItemTitle className="text-sm font-semibold truncate">{apt.patientName}</ItemTitle>
                        <ItemDescription className="line-clamp-1">
                          Dr. {apt.doctorName}{apt.reason ? ` · ${apt.reason}` : " · General checkup"}
                        </ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        <Badge
                          variant={
                            apt.status === "confirmed" ? "success"
                            : apt.status === "booked" ? "info"
                            : "secondary"
                          }
                          className="capitalize"
                        >
                          {apt.status}
                        </Badge>
                      </ItemActions>
                    </Item>
                  </div>
                ))}
              </ItemGroup>
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="flex flex-col" data-testid="activity-panel">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
                <CardDescription className="text-xs">Latest clinic updates</CardDescription>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="flex-1 p-0">
            {summary.recentActivity.length === 0 ? (
              <Empty className="border-0 py-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon"><Clock className="h-5 w-5" /></EmptyMedia>
                  <EmptyTitle className="text-sm">No recent activity</EmptyTitle>
                  <EmptyDescription>Things will show up here as they happen.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ItemGroup aria-label="Recent activity">
                {summary.recentActivity.map((activity, i) => (
                  <div key={activity.id}>
                    {i > 0 && <ItemSeparator />}
                    <Item size="sm" data-testid={`activity-row-${activity.id}`}>
                      <ItemMedia>
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <ActivityIcon type={activity.type} />
                        </div>
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle className="text-sm font-medium">{activity.title}</ItemTitle>
                        <ItemDescription>{activity.detail}</ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        <time
                          className="font-mono text-xs text-muted-foreground"
                          aria-label={`At ${formatTime(activity.time)}`}
                        >
                          {formatTime(activity.time)}
                        </time>
                      </ItemActions>
                    </Item>
                  </div>
                ))}
              </ItemGroup>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
