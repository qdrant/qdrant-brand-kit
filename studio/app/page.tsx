import { Alert, AlertDescription, AlertTitle } from "@qdrant/design-system/components/ui/alert"
import { Badge } from "@qdrant/design-system/components/ui/badge"
import { Button } from "@qdrant/design-system/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@qdrant/design-system/components/ui/card"
import { Checkbox } from "@qdrant/design-system/components/ui/checkbox"
import { Input } from "@qdrant/design-system/components/ui/input"
import { Label } from "@qdrant/design-system/components/ui/label"
import { Switch } from "@qdrant/design-system/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@qdrant/design-system/components/ui/tabs"

// Preview of stock components on the Qdrant tokens, dark and light side by side.
// The full studio (every component, sections, live controls) replaces this page in Step 8.
function Preview({ theme }: { theme: "dark" | "light" }) {
  const id = (name: string) => `${theme}-${name}`
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button>Start Free</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Delete</Button>
        <Button variant="link">Read the docs</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge>New</Badge>
        <Badge variant="secondary">Beta</Badge>
        <Badge variant="outline">Cloud</Badge>
        <Badge variant="destructive">Error</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Create a collection</CardTitle>
          <CardDescription>Collections hold the points you search.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor={id("name")}>Collection name</Label>
            <Input id={id("name")} placeholder="my-collection" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id={id("disk")} defaultChecked />
            <Label htmlFor={id("disk")}>Store payload on disk</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id={id("quantization")} defaultChecked />
            <Label htmlFor={id("quantization")}>Quantization</Label>
          </div>
        </CardContent>
        <CardFooter className="gap-2">
          <Button>Create</Button>
          <Button variant="outline">Cancel</Button>
        </CardFooter>
      </Card>
      <Alert>
        <AlertTitle>Snapshot ready</AlertTitle>
        <AlertDescription>The snapshot finished and is ready to download.</AlertDescription>
      </Alert>
      <Tabs defaultValue="dense">
        <TabsList>
          <TabsTrigger value="dense">Dense</TabsTrigger>
          <TabsTrigger value="sparse">Sparse</TabsTrigger>
          <TabsTrigger value="hybrid">Hybrid</TabsTrigger>
        </TabsList>
        <TabsContent value="dense" className="text-muted-foreground pt-2">
          Dense vectors from an embedding model.
        </TabsContent>
        <TabsContent value="sparse" className="text-muted-foreground pt-2">
          Sparse vectors for keyword-style matching.
        </TabsContent>
        <TabsContent value="hybrid" className="text-muted-foreground pt-2">
          Both, fused into one ranking.
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function Page() {
  return (
    <main className="grid min-h-svh md:grid-cols-2">
      {(["dark", "light"] as const).map((theme) => (
        <section key={theme} data-theme={theme} className="bg-background text-foreground flex flex-col gap-6 p-8">
          <p className="text-muted-foreground font-mono text-xs uppercase">{theme}</p>
          <Preview theme={theme} />
        </section>
      ))}
    </main>
  )
}
