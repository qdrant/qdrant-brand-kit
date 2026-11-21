import { CardCopy } from "./card-copy"

// Telemetry footer: a row of mono readout chips along the card's bottom edge, each with a tiny status mark:
// nominal (a lit square), idle (a dim one) and live (the accent, blinking). The labels and values are
// placeholders.

const CHIPS = [
  { label: "M1", value: "00.0", mark: "ok" },
  { label: "M2", value: "000", mark: "idle" },
  { label: "M3", value: "0.00", mark: "live" },
] as const

export function Telemetry() {
  return (
    <div className="spsurf spsurf-card">
      <div className="spsurf-body">
        <CardCopy />
      </div>
      <div className="spsurf-telemetry">
        {CHIPS.map(({ label, value, mark }) => (
          <span key={label} className="spsurf-chip sp-readout">
            <span aria-hidden className={`spsurf-chip__mark spsurf-chip__mark--${mark}`} />
            {label}
            <span className="spsurf-chip__value">{value}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
