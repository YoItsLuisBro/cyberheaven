import { useFocus } from "../lib/focus";

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

export function Focus() {
  const {
    derived,
    toggle,
    reset,
    skip,
    setPreset,
    setAutoStartNext,
    setPhase,
  } = useFocus();

  return (
    <div className="page">
      <div className="kicker">MODULE</div>
      <h1 className="h2">FOCUS TIMER</h1>

      <div className="note" style={{ marginTop: 12 }}>
        {derived.label}. CYCLES:{" "}
        <span className="mono">{derived.cyclesCompleted}</span>.
      </div>

      <div className="focusWrap" style={{ marginTop: 14 }}>
        <div className="timerSlab">
          <div className="timerTop">
            <div className="timerTag">{derived.label}</div>
            <div className="timerTag mono">
              {derived.workMin}/{derived.breakMin}
            </div>
          </div>

          <div className="timerBig mono">{derived.mmss}</div>

          <div className="timerBar">
            <div
              className="timerBarFill"
              style={{ width: pct(derived.progress) }}
            />
          </div>

          <div className="timerActions">
            <button className="btn" type="button" onClick={toggle}>
              {derived.running ? "PAUSE" : "START"}
            </button>
            <button className="btn btn-ghost" type="button" onClick={reset}>
              RESET
            </button>
            <button className="btn btn-ghost" type="button" onClick={skip}>
              SKIP
            </button>
          </div>

          <div className="timerRow">
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => setPhase("WORK")}
            >
              SET FOCUS
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => setPhase("BREAK")}
            >
              SET BREAK
            </button>

            <label className="toggle">
              <input
                type="checkbox"
                checked={derived.autoStartNext}
                onChange={(e) => setAutoStartNext(e.target.checked)}
              />
              AUTO-START NEXT
            </label>
          </div>
        </div>

        <div className="card" style={{ minHeight: 0 }}>
          <div className="cardtitle">PRESETS</div>
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginTop: 10,
            }}
          >
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => setPreset(25, 5)}
            >
              25 / 5
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => setPreset(50, 10)}
            >
              50 / 10
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => setPreset(90, 15)}
            >
              90 / 15
            </button>
          </div>

          <div className="note" style={{ marginTop: 12 }}>
            PRESETS APPLY WHEN NOT RUNNING. RESET IF YOU WANT A CLEAN START.
          </div>
        </div>
      </div>
    </div>
  );
}
