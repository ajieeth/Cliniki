import { useListEnquiries } from "@workspace/api-client-react"
import { Card, CardContent } from "@workspace/clinic-caller-design-system/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/clinic-caller-design-system/components/ui/table"
import { Skeleton } from "@workspace/clinic-caller-design-system/components/ui/skeleton"
import { Alert, AlertTitle, AlertDescription } from "@workspace/clinic-caller-design-system/components/ui/alert"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@workspace/clinic-caller-design-system/components/ui/empty"
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/clinic-caller-design-system/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Phone, Clock, User, Link as LinkIcon, AlertCircle, Inbox } from "lucide-react"

export default function EnquiriesPage() {
  const { data: enquiries = [], isLoading, isError } = useListEnquiries()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Enquiries</h1>
        <p className="mt-1 text-sm text-muted-foreground">Review incoming queries from the AI agent and website.</p>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load enquiries</AlertTitle>
          <AlertDescription>Check your connection and try again.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[760px]">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead className="w-[40%]">Enquiry Summary</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Outcome</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : enquiries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Empty className="border-0 py-10">
                        <EmptyHeader>
                          <EmptyMedia variant="icon"><Inbox className="h-5 w-5" /></EmptyMedia>
                          <EmptyTitle className="text-sm">No enquiries yet</EmptyTitle>
                          <EmptyDescription>Patient queries from AI calls and the website will appear here.</EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    </TableCell>
                  </TableRow>
                ) : (
                  enquiries.map(enq => (
                    <TableRow key={enq.id} data-testid={`enquiry-row-${enq.id}`}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 font-medium text-sm">
                            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            {enq.patientName}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3 shrink-0" />
                            {enq.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-2 max-w-md">
                          <MessageSquare className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                          <p className="text-sm text-foreground/90 leading-relaxed">{enq.summary}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-default">
                              <Clock className="h-3 w-3 shrink-0" />
                              {new Date(enq.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {new Date(enq.createdAt).toLocaleString("en-IN")}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {enq.source.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            enq.status === "new" ? "default"
                            : enq.status === "in_progress" ? "warning"
                            : enq.status === "booked" ? "success"
                            : "secondary"
                          }
                        >
                          {enq.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {enq.appointmentId ? (
                          <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                            <LinkIcon className="h-3 w-3" />
                            Apt #{enq.appointmentId}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
