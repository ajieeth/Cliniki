import { useState } from "react"
import { PhoneCall, User } from "lucide-react"
import { SarvamLiveAgent } from "@/components/sarvam-live-agent"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/clinic-caller-design-system/components/ui/card"
import { Field, FieldLabel, FieldGroup } from "@workspace/clinic-caller-design-system/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@workspace/clinic-caller-design-system/components/ui/input-group"

export default function CallCenterPage() {
  const [patientName, setPatientName] = useState("")
  const [patientPhone, setPatientPhone] = useState("")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">AI Voice Workspace</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Start and monitor live Sarvam voice-agent calls.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Caller Details</CardTitle>
            <CardDescription>
              Add an identifier for the live voice session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="patient-name">Patient name</FieldLabel>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <User className="h-4 w-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="patient-name"
                    placeholder="e.g. Aarav Kumar"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    data-testid="input-caller-name"
                  />
                </InputGroup>
              </Field>
              <Field>
                <FieldLabel htmlFor="patient-phone">Phone number</FieldLabel>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <PhoneCall className="h-4 w-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="patient-phone"
                    placeholder="+91 98765 43210"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    data-testid="input-caller-phone"
                  />
                </InputGroup>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <SarvamLiveAgent
          patientName={patientName}
          patientPhone={patientPhone}
        />
      </div>
    </div>
  )
}
