import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@qdrant/design-system/components/ui/accordion"
import { cn } from "@qdrant/design-system/lib/utils"

import { Section } from "@qdrant/web/lib/section"
import { type } from "@qdrant/web/lib/type"

const categories = [
  "Uptime and SLA",
  "Failover and Zone Behavior",
  "Replication and Requirements",
  "Backups and Recovery",
  "Upgrades",
  "Tiers and Residency",
]

// The Figma has the questions of the first category only, and an answer for the first question only.
const questions: { question: string; answer?: string }[] = [
  {
    question: "What's the uptime SLA?",
    answer:
      "Up to 99.95% uptime on the Premium tier with Multi-AZ enabled. Full SLA terms are in the Qdrant Cloud SLA.",
  },
  {
    question:
      "What's the difference between Standard, Premium, and Premium Multi-AZ SLAs?",
  },
  { question: "How is uptime measured?" },
  { question: "What if I need a higher SLA than 99.95%?" },
]

// "FAQ-Resilience" (Figma 20006:97213): the title and the categories on the left, the questions on the right,
// the first one open. A light section, 80px above and below. On the 12-column grid: 3 columns and 8.
export function ResilienceFaq() {
  return (
    <Section theme="light" className="lg:py-(--qd-layout-section-padding-min)">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-(--qd-layout-column-gap)">
        <div className="flex flex-col gap-12 lg:col-span-3">
          <h2 className={type.h3}>FAQs</h2>
          <ul className="flex flex-col gap-2">
            {categories.map((category, index) => {
              const active = index === 0
              return (
                <li key={category}>
                  <button
                    type="button"
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      type.body,
                      "flex w-full items-center gap-2 text-left",
                      active
                        ? "font-semibold text-foreground"
                        : "hover:text-foreground"
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        active && "bg-primary"
                      )}
                    />
                    {category}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        <Accordion
          defaultValue={["question-0"]}
          className="lg:col-span-8 lg:col-start-5 lg:mt-24"
        >
          {questions.map(({ question, answer }, index) => (
            <AccordionItem key={question} value={`question-${index}`}>
              <AccordionTrigger className="items-center px-10 py-8">
                <span className={type.h6}>{question}</span>
              </AccordionTrigger>
              {answer ? (
                <AccordionContent className="pr-18 pb-10 pl-8">
                  <p className={type.lead}>{answer}</p>
                </AccordionContent>
              ) : null}
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  )
}
