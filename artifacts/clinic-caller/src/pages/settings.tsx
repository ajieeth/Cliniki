import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/clinic-caller-design-system/components/ui/card"
import { Input } from "@workspace/clinic-caller-design-system/components/ui/input"
import { Button } from "@workspace/clinic-caller-design-system/components/ui/button"
import { Switch } from "@workspace/clinic-caller-design-system/components/ui/switch"
import { Separator } from "@workspace/clinic-caller-design-system/components/ui/separator"
import { Field, FieldLabel, FieldDescription, FieldGroup } from "@workspace/clinic-caller-design-system/components/ui/field"
import { Badge } from "@/components/ui/badge"
import { Settings2, Mic, Globe, ShieldCheck, CheckCircle2, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Configure clinic preferences and AI agent behavior.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_240px]">
        {/* Left column */}
        <div className="space-y-6">

          {/* AI Voice Agent */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Mic className="h-4 w-4 text-primary" />
                AI Voice Agent
              </CardTitle>
              <CardDescription>Manage how the AI receptionist behaves and answers calls.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Agent active toggle */}
              <Field orientation="horizontal">
                <div className="flex-1 space-y-0.5">
                  <FieldLabel className="text-sm font-medium">Agent Active Status</FieldLabel>
                  <FieldDescription>Allow AI to answer incoming calls.</FieldDescription>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="success">Online</Badge>
                  <Switch checked={true} aria-label="Toggle agent active" data-testid="switch-agent-active" />
                </div>
              </Field>

              <Separator />

              {/* Auto-booking toggle */}
              <Field orientation="horizontal">
                <div className="flex-1 space-y-0.5">
                  <FieldLabel className="text-sm font-medium">Auto-Booking</FieldLabel>
                  <FieldDescription>AI can book slots directly without manual approval.</FieldDescription>
                </div>
                <Switch checked={true} aria-label="Toggle auto-booking" data-testid="switch-auto-booking" />
              </Field>

              <Separator />

              {/* Agent persona */}
              <div className="space-y-3">
                <FieldLabel className="text-sm font-medium">Agent Persona</FieldLabel>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-4">
                    <div>
                      <p className="text-sm font-medium">Professional &amp; Calm</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">Ideal for healthcare settings.</p>
                    </div>
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4 opacity-60">
                    <div>
                      <p className="text-sm font-medium">Warm &amp; Friendly</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">More conversational approach.</p>
                    </div>
                    <div className="h-5 w-5 rounded-full border border-border" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                {isDark ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-primary" />}
                Appearance
              </CardTitle>
              <CardDescription>Choose the color mode for the entire clinic workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              <Field orientation="horizontal">
                <div className="flex-1 space-y-0.5">
                  <FieldLabel className="text-sm font-medium">Dark mode</FieldLabel>
                  <FieldDescription>
                    {isDark ? "Use the light theme when the workspace is brighter." : "Use a darker theme for low-light work."}
                  </FieldDescription>
                </div>
                <Switch
                  checked={isDark}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  aria-label="Toggle dark mode"
                  data-testid="switch-dark-mode"
                />
              </Field>
            </CardContent>
          </Card>

          {/* Clinic Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-4 w-4 text-primary" />
                Clinic Details
              </CardTitle>
              <CardDescription>General information about the clinic.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>Clinic Name</FieldLabel>
                    <Input defaultValue="Clinic Caller Medical Center" data-testid="input-clinic-name" />
                  </Field>
                  <Field>
                    <FieldLabel>Support Phone</FieldLabel>
                    <Input defaultValue="+91 98765 43210" data-testid="input-support-phone" />
                  </Field>
                  <Field>
                    <FieldLabel>Timezone</FieldLabel>
                    <Input defaultValue="Asia/Kolkata (IST)" disabled data-testid="input-timezone" />
                  </Field>
                  <Field>
                    <FieldLabel>Language</FieldLabel>
                    <Input defaultValue="Hindi, English" disabled />
                  </Field>
                </div>
                <Button className="mt-2 w-full sm:w-auto" data-testid="btn-save-settings">
                  Save Changes
                </Button>
              </FieldGroup>
            </CardContent>
          </Card>

        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* HIPAA / compliance card */}
          <Card className="bg-sidebar border-sidebar-border text-sidebar-foreground">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-sidebar-foreground">
                <ShieldCheck className="h-4 w-4" />
                Compliance Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-sidebar-foreground/80 text-xs leading-relaxed">
                Your instance is configured with HIPAA-compliant data handling for all AI interactions.
              </p>
              <ul className="space-y-2">
                {[
                  "End-to-end encryption",
                  "PHI redacting enabled",
                  "Access logging active",
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* System health */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Settings2 className="h-4 w-4 text-muted-foreground" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: "API Server", status: "Operational" as const },
                  { label: "Voice Engine", status: "Operational" as const },
                  { label: "Database", status: "Operational" as const },
                ].map(({ label, status }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <Badge variant="success">{status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
