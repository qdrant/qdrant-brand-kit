import { CircleCheck, CircleX, Info, TriangleAlert } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@qdrant/design-system/components/ui/alert"

import { Example, ExampleWrapper } from "@/components/example"

const states = [
  { variant: "success", title: "Success", Icon: CircleCheck, text: "Something went as planned." },
  { variant: "destructive", title: "Error", Icon: CircleX, text: "Something failed and needs a fix." },
  { variant: "warning", title: "Warning", Icon: TriangleAlert, text: "Something needs attention before it becomes a problem." },
  { variant: "info", title: "Info", Icon: Info, text: "Something worth knowing, with nothing to fix." },
] as const

// Qdrant's status variants (design-system/styles/components/alert.css), in dark and in light.
export default function AlertStatus() {
  return (
    <ExampleWrapper>
      {(["dark", "light"] as const).map((mode) => (
        <Example key={mode} title={mode === "dark" ? "Status, dark" : "Status, light"} data-theme={mode}>
          <div className="flex w-full flex-col gap-3">
            {states.map(({ variant, title, Icon, text }) => (
              <Alert key={variant} variant={variant}>
                <Icon />
                <AlertTitle>{title}</AlertTitle>
                <AlertDescription>{text}</AlertDescription>
              </Alert>
            ))}
          </div>
        </Example>
      ))}
    </ExampleWrapper>
  )
}
