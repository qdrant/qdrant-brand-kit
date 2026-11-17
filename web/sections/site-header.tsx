import { Button } from "@qdrant/design-system/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@qdrant/design-system/components/ui/navigation-menu"
import { cn } from "@qdrant/design-system/lib/utils"

// The site's top menu (Figma: Qdrant Web Design, "Main-Menu", node 19452:25125): the logo, the page links and
// the sign-up actions, full width with 40px sides. The Figma gives no hrefs for the links or the buttons, so
// they have none here. Below lg the page links are hidden; below sm, "Log in" too.
const links = [
  "Products",
  "Solutions",
  "Developers",
  "Resources",
  "Company",
  "Pricing",
]

export function SiteHeader() {
  return (
    <header className="flex items-center gap-6 bg-background px-6 py-6 text-foreground lg:px-10 lg:py-8">
      <div className="flex flex-1 items-center">
        <img
          src="/repo/brand-assets/logo/qdrant-logo-dark.svg"
          alt="Qdrant"
          width={135}
          height={36}
          className="h-9 w-auto light:hidden"
        />
        <img
          src="/repo/brand-assets/logo/qdrant-logo-light.svg"
          alt="Qdrant"
          width={135}
          height={36}
          className="hidden h-9 w-auto light:block"
        />
      </div>

      <NavigationMenu className="hidden lg:flex">
        <NavigationMenuList className="gap-2">
          {links.map((label) => (
            <NavigationMenuItem key={label}>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                {label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      <div className="flex flex-1 items-center justify-end gap-2">
        <a
          className={cn(navigationMenuTriggerStyle(), "hidden sm:inline-flex")}
        >
          Log in
        </a>
        <Button>Start Free</Button>
      </div>
    </header>
  )
}
