import { useListAppointments, useCreateAppointment, useListDoctors, getListAppointmentsQueryKey, useUpdateAppointmentStatus } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/clinic-caller-design-system/components/ui/card"
import { Button } from "@workspace/clinic-caller-design-system/components/ui/button"
import { Input } from "@workspace/clinic-caller-design-system/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/clinic-caller-design-system/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/clinic-caller-design-system/components/ui/select"
import { Skeleton } from "@workspace/clinic-caller-design-system/components/ui/skeleton"
import { Field, FieldLabel, FieldGroup } from "@workspace/clinic-caller-design-system/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@workspace/clinic-caller-design-system/components/ui/input-group"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@workspace/clinic-caller-design-system/components/ui/empty"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Plus, Search, UserRound, Phone, Clock3, Users, CalendarDays } from "lucide-react"
import { formatTime } from "@/lib/utils"

type AppointmentStatus = "booked" | "confirmed" | "completed" | "cancelled"

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  booked: "Booked",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
}

const statusVariant = (status: AppointmentStatus) => (
  status === "confirmed" ? "success" : status === "booked" ? "info" : status === "completed" ? "secondary" : "destructive"
)

const isoDate = (date: Date) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, "0")
  const day = `${date.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1)
const monthLabel = (date: Date) => date.toLocaleDateString("en-US", { month: "long", year: "numeric" })

export default function AppointmentsPage() {
  const queryClient = useQueryClient()
  const { data: appointments = [], isLoading, isError, refetch } = useListAppointments()
  const { data: doctors = [] } = useListDoctors()
  const createAppointment = useCreateAppointment()
  const updateStatus = useUpdateAppointmentStatus()
  const today = useMemo(() => new Date(), [])

  const [selectedDate, setSelectedDate] = useState(isoDate(today))
  const [calendarMonth, setCalendarMonth] = useState(startOfMonth(today))
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    patientName: "", patientPhone: "", doctorId: "", date: isoDate(today), time: "10:00", reason: "",
  })

  const calendarDays = useMemo(() => {
    const first = startOfMonth(calendarMonth)
    const offset = first.getDay()
    const days = []
    for (let i = 0; i < 42; i += 1) days.push(new Date(first.getFullYear(), first.getMonth(), i - offset + 1))
    return days
  }, [calendarMonth])

  const selectedAppointments = useMemo(() => appointments
    .filter((apt) => apt.date === selectedDate)
    .filter((apt) => apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || apt.patientPhone.includes(searchTerm))
    .sort((a, b) => a.time.localeCompare(b.time)), [appointments, selectedDate, searchTerm])

  const appointmentDates = useMemo(() => new Set(appointments.map((apt) => apt.date)), [appointments])
  const selectedDateLabel = new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })

  const changeMonth = (amount: number) => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() + amount, 1))
  const chooseDate = (date: Date) => {
    const next = isoDate(date)
    setSelectedDate(next)
    setCalendarMonth(startOfMonth(date))
    setFormData((form) => ({ ...form, date: next }))
  }

  const handleCreate = () => {
    if (!formData.patientName || !formData.doctorId || !formData.patientPhone) return
    createAppointment.mutate({ data: {
      patientName: formData.patientName, patientPhone: formData.patientPhone, doctorId: parseInt(formData.doctorId, 10),
      date: formData.date, time: formData.time, reason: formData.reason, source: "front_desk",
    } }, {
      onSuccess: () => {
        setIsOpen(false)
        setSelectedDate(formData.date)
        setCalendarMonth(startOfMonth(new Date(`${formData.date}T12:00:00`)))
        setFormData({ patientName: "", patientPhone: "", doctorId: "", date: formData.date, time: "10:00", reason: "" })
        queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() })
      },
    })
  }

  const handleStatusChange = (id: number, status: AppointmentStatus) => {
    updateStatus.mutate({ id, data: { status } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() }),
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Front desk workspace</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Appointments</h1>
          <p className="mt-1 text-sm text-muted-foreground">Plan the day, keep visits moving.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full gap-2 sm:w-auto" data-testid="btn-book-appointment"><Plus className="h-4 w-4" /> Book appointment</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] overflow-y-auto sm:max-w-md">
            <DialogHeader><DialogTitle>Book manual appointment</DialogTitle></DialogHeader>
            <FieldGroup className="py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field><FieldLabel>Patient name</FieldLabel><Input value={formData.patientName} onChange={(e) => setFormData((f) => ({ ...f, patientName: e.target.value }))} placeholder="e.g. Aarav Kumar" data-testid="input-patient-name" /></Field>
                <Field><FieldLabel>Phone</FieldLabel><Input value={formData.patientPhone} onChange={(e) => setFormData((f) => ({ ...f, patientPhone: e.target.value }))} placeholder="+91 98765 43210" data-testid="input-patient-phone" /></Field>
              </div>
              <Field><FieldLabel>Doctor</FieldLabel><Select value={formData.doctorId} onValueChange={(v) => setFormData((f) => ({ ...f, doctorId: v }))}><SelectTrigger data-testid="select-doctor"><SelectValue placeholder="Select doctor" /></SelectTrigger><SelectContent>{doctors.map((doctor) => <SelectItem key={doctor.id} value={doctor.id.toString()}>Dr. {doctor.name}</SelectItem>)}</SelectContent></Select></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field><FieldLabel>Date</FieldLabel><Input type="date" value={formData.date} onChange={(e) => setFormData((f) => ({ ...f, date: e.target.value }))} data-testid="input-date" /></Field>
                <Field><FieldLabel>Time</FieldLabel><Input type="time" value={formData.time} onChange={(e) => setFormData((f) => ({ ...f, time: e.target.value }))} data-testid="input-time" /></Field>
              </div>
              <Field><FieldLabel>Reason <span className="font-normal text-muted-foreground">(optional)</span></FieldLabel><Input value={formData.reason} onChange={(e) => setFormData((f) => ({ ...f, reason: e.target.value }))} placeholder="e.g. Routine checkup" data-testid="input-reason" /></Field>
              <Button onClick={handleCreate} disabled={createAppointment.isPending || !formData.patientName || !formData.doctorId || !formData.patientPhone} className="mt-2 w-full" data-testid="btn-confirm-booking">{createAppointment.isPending ? "Booking..." : "Confirm booking"}</Button>
            </FieldGroup>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-3">
            <CardTitle className="text-sm font-semibold">{monthLabel(calendarMonth)}</CardTitle>
            <div className="flex gap-0.5">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => changeMonth(-1)} aria-label="Previous month" data-testid="button-previous-month"><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => changeMonth(1)} aria-label="Next month" data-testid="button-next-month"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-4">
            <div className="mb-2 grid grid-cols-7 text-center text-[10px] font-medium uppercase text-muted-foreground">{["S", "M", "T", "W", "T", "F", "S"].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
            <div className="grid grid-cols-7 gap-y-1 text-center">
              {calendarDays.map((date) => {
                const dateValue = isoDate(date)
                const isCurrentMonth = date.getMonth() === calendarMonth.getMonth()
                const isSelected = dateValue === selectedDate
                const isToday = dateValue === isoDate(today)
                return <button key={dateValue} type="button" onClick={() => chooseDate(date)} className={`relative mx-auto flex h-7 w-7 items-center justify-center rounded-md text-xs transition-colors ${isSelected ? "bg-primary font-semibold text-primary-foreground" : isToday ? "border border-primary text-primary" : "hover:bg-muted"} ${isCurrentMonth ? "text-foreground" : "text-muted-foreground/40"}`} data-testid={`calendar-date-${dateValue}`}><span>{date.getDate()}</span>{appointmentDates.has(dateValue) && !isSelected && <span className="absolute bottom-0.5 h-0.5 w-0.5 rounded-full bg-primary" />}</button>
              })}
            </div>
            <div className="mt-4 border-t border-border pt-3">
              <Button variant="outline" size="sm" className="w-full" onClick={() => chooseDate(today)} data-testid="button-today">Go to today</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="gap-3 border-b border-border bg-muted/20 px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div><div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /><CardTitle className="text-lg">{selectedDateLabel}</CardTitle></div><p className="mt-1 pl-6 text-xs text-muted-foreground">{selectedAppointments.length} scheduled {selectedAppointments.length === 1 ? "visit" : "visits"}</p></div>
              <InputGroup className="w-full sm:max-w-xs"><InputGroupAddon align="inline-start"><Search className="h-4 w-4" /></InputGroupAddon><InputGroupInput placeholder="Search patients..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} data-testid="input-search" /></InputGroup>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? <div className="space-y-3 p-5">{Array.from({ length: 5 }).map((_, index) => <div className="flex gap-4" key={index}><Skeleton className="h-5 w-14" /><Skeleton className="h-20 flex-1" /></div>)}</div>
              : isError ? <Empty className="border-0 py-14"><EmptyHeader><EmptyMedia variant="icon"><CalendarDays className="h-5 w-5" /></EmptyMedia><EmptyTitle>Schedule unavailable</EmptyTitle><EmptyDescription>We could not load today&apos;s appointments.</EmptyDescription><Button variant="outline" onClick={() => refetch()} data-testid="button-retry-appointments">Try again</Button></EmptyHeader></Empty>
              : selectedAppointments.length === 0 ? <Empty className="border-0 py-14"><EmptyHeader><EmptyMedia variant="icon"><Users className="h-5 w-5" /></EmptyMedia><EmptyTitle>{searchTerm ? "No matching visits" : "No visits scheduled"}</EmptyTitle><EmptyDescription>{searchTerm ? "Try a different patient name or phone number." : "This day is clear. Book an appointment to fill the schedule."}</EmptyDescription></EmptyHeader></Empty>
              : <div className="divide-y divide-border">{selectedAppointments.map((apt) => <div key={apt.id} className="grid grid-cols-[4rem_minmax(0,1fr)] gap-3 px-4 py-4 sm:grid-cols-[5rem_minmax(0,1fr)] sm:px-5" data-testid={`appointment-card-${apt.id}`}><div className="pt-1 text-xs font-medium text-muted-foreground">{formatTime(apt.time)}</div><div className="rounded-md border border-border border-l-4 border-l-primary bg-card p-3 shadow-sm"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex items-center gap-2"><UserRound className="h-4 w-4 shrink-0 text-primary" /><span className="truncate text-sm font-semibold" data-testid={`text-patient-${apt.id}`}>{apt.patientName}</span><Badge variant={statusVariant(apt.status)} className="text-[10px]">{STATUS_LABELS[apt.status]}</Badge></div><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{apt.patientPhone}</span><span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" />{formatTime(apt.time)}</span></div><p className="mt-2 text-xs text-muted-foreground">Dr. {apt.doctorName} <span className="text-border">•</span> {apt.specialty}{apt.reason ? ` · ${apt.reason}` : ""}</p></div><Select value={apt.status} onValueChange={(value: AppointmentStatus) => handleStatusChange(apt.id, value)}><SelectTrigger className="h-8 w-full text-xs sm:w-32" data-testid={`select-status-${apt.id}`}><SelectValue /></SelectTrigger><SelectContent>{Object.entries(STATUS_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div></div></div>)}</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}