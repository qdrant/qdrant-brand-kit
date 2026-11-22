import { PricingCalculator, type PricingCalculatorProps } from "../sections/pricing-calculator"
import { sizing } from "../content/conversion"
import { defineSection } from "./types"

const header = { title: sizing.title, description: sizing.description, action: sizing.action }

export const pricingCalculator = defineSection<PricingCalculatorProps>({
  id: "pricing-calculator",
  name: "Sizing calculator",
  category: "pricing",
  summary: "An interactive estimate of a cluster's RAM and disk from Qdrant's capacity planning formula, without prices.",
  file: "pricing-calculator",
  component: PricingCalculator,
  variants: [
    {
      id: "aside",
      name: "Heading beside",
      description: "The heading on the left, the inputs and the estimate on the right (the guide's example: 1M vectors, 768 dimensions, 2 replicas).",
      props: { layout: "aside", header, source: sizing.source, pattern: ["grid"] },
    },
    {
      id: "stacked",
      name: "Heading above",
      description: "The heading above, the inputs beside the estimate, starting with 4-bit TurboQuant on.",
      props: { layout: "stacked", header, source: sizing.source, defaults: { quantization: "turbo4" } },
    },
  ],
  docs: {
    use: [
      "On the pricing page or a deployment page, so people can size a cluster before they talk to sales. Prices stay in Qdrant Cloud's calculator, which the button opens.",
    ],
    rules: [
      "The formula is the capacity planning guide's (qdrant.tech/documentation/capacity-planning/): base = number_of_points * replication_factor; dense_size = base * dimensions * bytes_per_dim; quantized_size = base * dimensions * quant_bytes; hnsw_size = base * m * 2 * 4 bytes * 1.2 with m = 16; id_tracker_size = base * 52 bytes.",
      "RAM is the dense vectors (or, with quantization, the quantized copy with the originals moved to cold), the HNSW index and the ID tracker. Disk is all of these. Both add the guide's ~20% headroom.",
      "It sizes one dense vector per point and leaves payloads out (the guide sizes them from their average size, which this doesn't ask for). Change the formula only with the guide.",
      "Bytes per dimension: float32 4, float16 2, uint8 1. Quantized: scalar 1 (the Cloud FAQ's 4x), 4-bit TurboQuant 0.5 (the guide's example).",
      "Figures are mono. Never show a price here.",
    ],
    anatomy: [
      { part: "Heading", note: "Title, line and the button to Qdrant Cloud's calculator." },
      { part: "Inputs", note: "Vectors, dimensions, replication factor, datatype and quantization, on a plate." },
      { part: "Estimate", note: "RAM in large mono, its parts, disk, and a link to the guide." },
    ],
    props: [
      { name: "layout", type: '"aside" | "stacked"', note: "Where the heading goes." },
      { name: "header", type: "{ kicker?, title, description?, action? }", note: "The heading block." },
      { name: "source", type: "{ label, href }", note: "The guide the formula comes from." },
      { name: "defaults", type: "{ vectors?, dimensions?, replicas?, datatype?, quantization? }", note: "Starting values." },
    ],
  },
  fields: [{ prop: "layout", label: "Layout", kind: "select", options: [{ value: "aside", label: "Heading beside" }, { value: "stacked", label: "Heading above" }] }],
})
