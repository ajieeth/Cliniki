import { useListDoctors, useCreateDoctor, useListSlots, useCreateSlot, getListSlotsQueryKey, getListDoctorsQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Card, CardContent, CardHeader } from "@workspace/clinic-caller-design-system/components/ui/card"
import { Button } from "@workspace/clinic-caller-design-system/components/ui/button"
import { Input } from "@workspace/clinic-caller-design-system/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/clinic-caller-design-system/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/clinic-caller-design-system/components/ui/dialog"
import { Skeleton } from "@workspace/clinic-caller-design-system/components/ui/skeleton"
import { Alert, AlertTitle, AlertDescription } from "@workspace/clinic-caller-design-system/components/ui/alert"
import { Field, FieldLabel, FieldGroup } from "@workspace/clinic-caller-design-system/components/ui/field"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@workspace/clinic-caller-design-system/components/ui/empty"
import { Badge } from "@/components/ui/badge"
import { Plus, UserPlus, Clock, AlertCircle, CalendarDays } from "lucide-react"
import { formatTime } from "@/lib/utils"

export default function CalendarPage() {
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | undefined>(undefined)

  const { data: doctors = [], isLoading: doctorsLoading } = useListDoctors()
  const { data: slots = [], isLoading: slotsLoading, isError: slotsError } = useListSlots({ date: selectedDate, doctorId: selectedDoctorId })

  const createDoctor = useCreateDoctor()
  const createSlot = useCreateSlot()

  const [newDoctorName, setNewDoctorName] = useState("")
  const [newDoctorSpecialty, setNewDoctorSpecialty] = useState("")
  const [isDoctorOpen, setIsDoctorOpen] = useState(false)

  const handleCreateDoctor = () => {
    if (!newDoctorName.trim() || !newDoctorSpecialty.trim()) return
    createDoctor.mutate({ data: { name: newDoctorName, specialty: newDoctorSpecialty } }, {
      onSuccess: () => {
        setIsDoctorOpen(false)
        setNewDoctorName("")
        setNewDoctorSpecialty("")
        queryClient.invalidateQueries({ queryKey: getListDoctorsQueryKey() })
      }
    })
  }

  const [newSlotTime, setNewSlotTime] = useState("09:00")
  const [newSlotDoctor, setNewSlotDoctor] = useState<string>("")
  const [isSlotOpen, setIsSlotOpen] = useState(false)

  const handleCreateSlot = () => {
    if (!newSlotDoctor || !newSlotTime) return
    createSlot.mutate({
      data: {
        doctorId: parseInt(newSlotDoctor, 10),
        date: selectedDate,
        time: newSlotTime,
        durationMinutes: 30
      }
    }, {
      onSuccess: () => {
        setIsSlotOpen(false)
        queryClient.invalidateQueries({ queryKey: getListSlotsQueryKey({ date: selectedDate, doctorId: selectedDoctorId }) })
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Availability</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage doctor schedules and open slots.</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {/* Add Doctor */}
          <Dialog open={isDoctorOpen} onOpenChange={setIsDoctorOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full gap-2 sm:w-auto" data-testid="btn-add-doctor">
                <UserPlus className="h-4 w-4" /> Add Doctor
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-2rem)] max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Doctor</DialogTitle>
              </DialogHeader>
              <FieldGroup className="py-4">
                <Field>
                  <FieldLabel>Name</FieldLabel>
                  <Input
                    value={newDoctorName}
                    onChange={e => setNewDoctorName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    data-testid="input-doctor-name"
                  />
                </Field>
                <Field>
                  <FieldLabel>Specialty</FieldLabel>
                  <Input
                    value={newDoctorSpecialty}
                    onChange={e => setNewDoctorSpecialty(e.target.value)}
                    placeholder="e.g. General Practice"
                    data-testid="input-doctor-specialty"
                  />
                </Field>
                <Button
                  onClick={handleCreateDoctor}
                  disabled={createDoctor.isPending || !newDoctorName.trim() || !newDoctorSpecialty.trim()}
                  className="w-full"
                  data-testid="btn-save-doctor"
                >
                  {createDoctor.isPending ? "Saving..." : "Save Doctor"}
                </Button>
              </FieldGroup>
            </DialogContent>
          </Dialog>

          {/* Add Slot */}
          <Dialog open={isSlotOpen} onOpenChange={setIsSlotOpen}>
            <DialogTrigger asChild>
              <Button className="w-full gap-2 sm:w-auto" data-testid="btn-add-slot">
                <Plus className="h-4 w-4" /> Add Slot
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-2rem)] max-w-md">
              <DialogHeader>
                <DialogTitle>Create Availability Slot</DialogTitle>
              </DialogHeader>
              <FieldGroup className="py-4">
                <Field>
                  <FieldLabel>Date</FieldLabel>
                  <Input type="date" value={selectedDate} disabled />
                </Field>
                <Field>
                  <FieldLabel>Doctor</FieldLabel>
                  <Select value={newSlotDoctor} onValueChange={setNewSlotDoctor}>
                    <SelectTrigger data-testid="select-slot-doctor">
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map(d => (
                        <SelectItem key={d.id} value={d.id.toString()}>Dr. {d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Time</FieldLabel>
                  <Input type="time" value={newSlotTime} onChange={e => setNewSlotTime(e.target.value)} data-testid="input-slot-time" />
                </Field>
                <Button
                  onClick={handleCreateSlot}
                  disabled={createSlot.isPending || !newSlotDoctor}
                  className="w-full"
                  data-testid="btn-save-slot"
                >
                  {createSlot.isPending ? "Creating..." : "Create Slot"}
                </Button>
              </FieldGroup>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-auto"
                data-testid="input-date-filter"
              />
            </div>
            <div className="w-full sm:w-56">
              <Select
                value={selectedDoctorId?.toString() || "all"}
                onValueChange={v => setSelectedDoctorId(v === "all" ? undefined : parseInt(v, 10))}
              >
                <SelectTrigger data-testid="select-doctor-filter">
                  <SelectValue placeholder="Filter by Doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  {doctors.map(d => (
                    <SelectItem key={d.id} value={d.id.toString()}>Dr. {d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {slotsError ? (
            <Alert variant="destructive" className="m-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Failed to load slots</AlertTitle>
              <AlertDescription>Please try again or change your filters.</AlertDescription>
            </Alert>
          ) : slotsLoading || doctorsLoading ? (
            <div className="grid gap-px bg-muted grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : slots.length === 0 ? (
            <Empty className="border-0 my-4">
              <EmptyHeader>
                <EmptyMedia variant="icon"><CalendarDays className="h-5 w-5" /></EmptyMedia>
                <EmptyTitle className="text-sm">No slots found</EmptyTitle>
                <EmptyDescription>No availability slots for this date. Add one to get started.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div
              className="grid gap-px bg-muted grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              data-testid="slots-grid"
            >
              {slots.map(slot => (
                <div
                  key={slot.id}
                  className="flex flex-col gap-3 bg-card p-4 transition-colors duration-100 hover:bg-accent/30"
                  data-testid={`slot-card-${slot.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-mono text-base font-semibold">{formatTime(slot.time)}</span>
                    </div>
                    <Badge
                      variant={
                        slot.status === "available" ? "success"
                        : slot.status === "booked" ? "info"
                        : "secondary"
                      }
                    >
                      {slot.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Dr. {slot.doctorName}</p>
                    <p className="text-xs text-muted-foreground">{slot.durationMinutes} mins</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
