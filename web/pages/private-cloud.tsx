import {
  privateAbout,
  privateContact,
  privateCustomers,
  privateHero,
} from "../content/private-cloud"
import { customers } from "../content/sections"
import { footer, menus, navActions } from "../content/site"
import { Cta } from "../sections/cta"
import { FeatureRows } from "../sections/feature-rows"
import { Footer } from "../sections/footer"
import { Hero } from "../sections/hero"
import { LogoCloud } from "../sections/logo-cloud"
import { Navbar } from "../sections/navbar"
import { DataPrivacyDiagram, PrivateCloudHero } from "../visuals/private-cloud"

// The Qdrant Private Cloud page of qdrant.tech (/private-cloud/, read 2026-11-26), built from the section library like
// the home page (design lead, 2026-11-26): its copy from content/private-cloud.ts, word for word, and its image redrawn
// (web/visuals/private-cloud.tsx). The logo grid ends in the home page's "See more customers" cell, so its rows are
// full.
export function PrivateCloudPage() {
  return (
    <main
      data-web
      data-context="marketing"
      className="bg-background text-foreground"
    >
      <Navbar variant="full" menus={menus} {...navActions} />
      <Hero
        layout="centered"
        {...privateHero}
        visual={<PrivateCloudHero />}
        visualFrame="none"
      />
      <FeatureRows
        rows={[{ ...privateAbout, visual: <DataPrivacyDiagram /> }]}
      />
      <LogoCloud
        layout="grid"
        logos={privateCustomers}
        action={customers.action}
      />
      <Cta layout="band" {...privateContact} />
      <Footer variant="full" {...footer} />
    </main>
  )
}
