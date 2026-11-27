import { serverless } from "../content/conversion"
import { serverlessFit } from "../content/platform"
import {
  serverlessFaq,
  serverlessHero,
  serverlessWhat,
} from "../content/serverless"
import { footer, menus, navActions } from "../content/site"
import { Faq } from "../sections/faq"
import { Footer } from "../sections/footer"
import { Hero } from "../sections/hero"
import { Navbar } from "../sections/navbar"
import { SignupForm } from "../sections/signup-form"
import { WithWithout } from "../sections/with-without"
import { ServerlessHero } from "../visuals/serverless"

// The Qdrant Serverless page of qdrant.tech (/serverless/, read 2026-11-26), built from the section library like the
// home page (design lead, 2026-11-26): its copy from content/serverless.ts and the Serverless content the library
// already had, word for word. "What Is Qdrant Serverless?" opens the two columns of when to use it and when not; the
// waitlist (id "form", where the hero's button goes) has the site's form and nothing beside it to repeat them.
export function ServerlessPage() {
  return (
    <main
      data-web
      data-context="marketing"
      className="bg-background text-foreground"
    >
      <Navbar variant="full" menus={menus} {...navActions} />
      <Hero
        layout="centered"
        {...serverlessHero}
        visual={<ServerlessHero />}
        visualFrame="none"
      />
      <WithWithout
        header={serverlessWhat}
        use={serverlessFit.use}
        avoid={serverlessFit.avoid}
        note={serverlessFit.note}
      />
      <SignupForm
        id="form"
        layout="waitlist"
        header={{ title: serverless.title }}
        form={serverless.form}
      />
      <Faq
        layout="narrow"
        header={{ title: serverlessFaq.title }}
        items={serverlessFaq.items}
      />
      <Footer variant="full" {...footer} />
    </main>
  )
}
