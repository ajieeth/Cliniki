import { useEffect, useRef, useState } from "react"
import {
  AgentState,
  BrowserAudioInterface,
  ConversationAgent,
  InteractionType,
  type ServerTranscriptMsg,
} from "sarvam-conv-ai-sdk/browser"
import { Mic, MicOff, PhoneCall, PhoneOff, Radio } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@workspace/clinic-caller-design-system/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/clinic-caller-design-system/components/ui/card"
import { Alert, AlertDescription } from "@workspace/clinic-caller-design-system/components/ui/alert"
import { cn } from "@workspace/clinic-caller-design-system/lib/utils"

const SARVAM_ORG_ID = "019e90d5-be96-7e52-be4a-8ed82cdebbc2"
const SARVAM_WORKSPACE_ID = "019e90d5-becc-7368-93fb-b4856f7600bb"
const SARVAM_APP_ID = "Conversatio-471ae44b-2867"

type LiveMessage = {
  role: "patient" | "assistant"
  text: string
}

type SarvamLiveAgentProps = {
  patientName: string
  patientPhone: string
}

const activeStates = new Set<AgentState>([
  AgentState.CONNECTING,
  AgentState.CONNECTED,
  AgentState.LISTENING,
  AgentState.SPEAKING,
])

function stateLabel(state: AgentState): string {
  switch (state) {
    case AgentState.SPEAKING:    return "Agent is speaking"
    case AgentState.LISTENING:   return "Listening to you"
    case AgentState.CONNECTING:  return "Connecting securely"
    case AgentState.CONNECTED:   return "Connected"
    default:                     return "Ready for a live session"
  }
}

export function SarvamLiveAgent({
  patientName,
  patientPhone,
}: SarvamLiveAgentProps) {
  const agentRef = useRef<ConversationAgent | null>(null)
  const [state, setState] = useState<AgentState>(AgentState.IDLE)
  const [messages, setMessages] = useState<LiveMessage[]>([])
  const [interactionId, setInteractionId] = useState<string>()
  const [isMuted, setIsMuted] = useState(false)
  const [error, setError] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const isActive = activeStates.has(state)

  useEffect(() => {
    return () => {
      void agentRef.current?.stop()
      agentRef.current = null
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const stopSession = async () => {
    const agent = agentRef.current
    agentRef.current = null
    if (agent) {
      await agent.stop()
    }
    setState(AgentState.IDLE)
    setIsMuted(false)
  }

  const startSession = async () => {
    if (isActive) return

    setError("")
    setMessages([])
    setInteractionId(undefined)
    setIsMuted(false)

    try {
      const audioInterface = new BrowserAudioInterface()
      const identifier = patientPhone.trim() || crypto.randomUUID()
      const agent = new ConversationAgent({
        apiKey: "",
        baseUrl: "/api/sarvam/",
        config: {
          org_id: SARVAM_ORG_ID,
          workspace_id: SARVAM_WORKSPACE_ID,
          app_id: SARVAM_APP_ID,
          user_identifier: identifier,
          user_identifier_type: patientPhone.trim() ? "phone_number" : "custom",
          interaction_type: InteractionType.CALL,
          input_sample_rate: 16000,
          output_sample_rate: 16000,
        },
        audioInterface,
        stateCallback: (nextState) => {
          setState(nextState)
        },
        transcriptCallback: async (message: ServerTranscriptMsg) => {
          setMessages((current) => [
            ...current,
            {
              role: message.role === "user" ? "patient" : "assistant",
              text: message.content,
            },
          ])
        },
        endCallback: async () => {
          agentRef.current = null
          setState(AgentState.IDLE)
          setIsMuted(false)
        },
      })

      agentRef.current = agent
      await agent.start()
      const connected = await agent.waitForConnect(10)
      if (!connected) {
        throw new Error("Sarvam did not connect within 10 seconds")
      }
      setInteractionId(agent.getInteractionId())
    } catch (caught) {
      await agentRef.current?.stop().catch(() => undefined)
      agentRef.current = null
      setState(AgentState.ERROR)
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to start the Sarvam voice session",
      )
    }
  }

  const toggleMute = () => {
    const agent = agentRef.current
    if (!agent || !isActive) return

    if (agent.isMuted()) {
      agent.unmute()
      setIsMuted(false)
    } else {
      agent.mute()
      setIsMuted(true)
    }
  }

  return (
    <Card className="border-primary/20 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Radio className="h-4 w-4 text-primary" />
              Live Sarvam Agent
            </CardTitle>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Speak with the configured clinic agent through your browser.
            </p>
          </div>
          <Badge
            variant={
              state === AgentState.ERROR ? "destructive"
              : isActive ? "success"
              : "secondary"
            }
          >
            {state}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status display */}
        <div className="rounded-lg border bg-muted/40 p-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-300",
                state === AgentState.SPEAKING
                  ? "bg-primary text-primary-foreground"
                  : isActive
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-snug">
                {stateLabel(state)}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {patientName.trim() || "Guest caller"}
                {interactionId ? ` · ${interactionId}` : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Transcript */}
        {messages.length > 0 && (
          <div className="max-h-52 space-y-2 overflow-y-auto rounded-lg border bg-background p-3">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn(
                  "max-w-[88%] rounded-lg px-3 py-2 text-sm leading-snug",
                  message.role === "patient"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "border bg-card text-card-foreground",
                )}
              >
                {message.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Controls */}
        <div className="grid grid-cols-2 gap-2">
          {!isActive ? (
            <Button
              className="col-span-2 h-11"
              onClick={() => void startSession()}
              disabled={state === AgentState.CONNECTING}
              data-testid="btn-start-session"
            >
              <PhoneCall className="h-4 w-4" />
              Start Live Voice Session
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={toggleMute} data-testid="btn-mute">
                {isMuted ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                {isMuted ? "Unmute" : "Mute"}
              </Button>
              <Button
                variant="outline"
                className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => void stopSession()}
                data-testid="btn-end-session"
              >
                <PhoneOff className="h-4 w-4" />
                End
              </Button>
            </>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Your browser will request microphone permission. The API key remains on the server.
        </p>
      </CardContent>
    </Card>
  )
}
