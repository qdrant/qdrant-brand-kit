import { BenchmarkChart, type BenchmarkChartProps } from "../sections/benchmark-chart"
import { benchmark } from "../content/platform"
import { defineSection } from "./types"

export const benchmarkChart = defineSection<BenchmarkChartProps>({
  id: "benchmark-chart",
  name: "Benchmark chart",
  category: "developers",
  summary: "An interactive benchmark: dataset tabs, a metric and precision switch, and one bar per engine.",
  file: "benchmark-chart",
  component: BenchmarkChart,
  variants: [
    {
      id: "bars",
      name: "Bars",
      description:
        "Qdrant's single node benchmarks (January/June 2024), from the page's raw data at three precision stops, with the method and the data linked.",
      props: {
        layout: "bars",
        header: benchmark.header,
        data: benchmark.data,
        methodology: benchmark.methodology,
        rawData: benchmark.rawData,
        defaultPrecision: "0.95",
        pattern: ["grid"],
      },
    },
  ],
  docs: {
    use: [
      "On the benchmarks page, or wherever a performance claim needs its numbers beside it.",
      "For a single figure, use Stats instead.",
    ],
    rules: [
      "Only published figures, from the benchmark's own data, with a link to how they were measured.",
      "Compare engines only at the same precision: the precision switch sets the floor every bar meets.",
      "Qdrant's bar is indigo and every other bar neutral. Never the accent, never a color per engine.",
      "Bars are sorted best first: highest for RPS, lowest for latency and index time. The footer says which.",
    ],
    anatomy: [
      { part: "Heading", note: "Kicker, title and a line." },
      { part: "Dataset tabs", note: "One tab per dataset, in mono, the active one marked in indigo." },
      { part: "Facts and switches", note: "The dataset's size, dimensions and distance; the metric and precision switches." },
      { part: "Bars", note: "One row per engine: rank, name, bar and value with its unit." },
      { part: "Footer", note: "Which way is better, the search threads, the date, and the method and data links." },
    ],
    props: [
      { name: "header", type: "{ kicker?, title, description? }", note: "The heading block." },
      { name: "data", type: "BenchmarkData", note: "Engines, metrics, precision stops, datasets and results (content/platform.ts)." },
      { name: "highlight", type: "engine id", note: "The engine drawn in indigo. Qdrant by default." },
      { name: "methodology, rawData", type: "{ label, href }", note: "Links in the footer." },
      { name: "defaultPrecision", type: "string", note: "The precision stop shown first." },
    ],
  },
  fields: [
    {
      prop: "defaultPrecision",
      label: "Precision",
      kind: "select",
      options: benchmark.data.precisions.map((p) => ({ value: p, label: `${p} or higher` })),
    },
  ],
})
