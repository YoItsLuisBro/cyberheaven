import React from "react";

type Phase = "IDLE" | "WORK" | "BREAK";

type FocusStored = {
  phase: Phase;
  running: boolean;

  // When running, we use endAt to calculate remaining precisely.
  endAt: number | null;

  // When paused/idle, remainingSec is the current remaining.
  remainingSec: number;

  // Settings
  workSec: number;
  breakSec: number;
  autoStartNext: boolean;

  // Stats
  cyclesCompleted: number;
};

type FocusDerived = {
  phase: Phase;
  running: boolean;
  remainingSec: number;
  mmss: string;
  label: string;
  progress: number; // 0..1
  workMin: number;
  breakMin: number;
  cyclesCompleted: number;
  autoStartNext: boolean;
};

type FocusApi = {
  derived: FocusDerived;
  start: () => void;
  pause: () => void;
  toggle: () => void;
  reset: () => void;
  skip: () => void;
  setPreset: (workMin: number, breakMin: number) => void;
  setAutoStartNext: (v: boolean) => void;
  setPhase: (p: "WORK" | "BREAK") => void;
};

const STORAGE_KEY = "ch.focus.v1";

function clampInt(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, Math.floor(n)));
}

function fmtMMSS(totalSec: number) {
  const s = clampInt(totalSec, 0, 24 * 60 * 60);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function defaultState(): FocusStored {
  const workSec = 25 * 60;
  const breakSec = 5 * 60;
  return {
    phase: "IDLE",
    running: false,
    endAt: null,
    remainingSec: workSec,
    workSec,
    breakSec,
    autoStartNext: false,
    cyclesCompleted: 0,
  };
}

function readStored(): FocusStored {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<FocusStored>;
    const base = defaultState();

    // Defensive merge
    const merged: FocusStored = {
      ...base,
      ...parsed,
      phase:
        parsed.phase === "WORK" ||
        parsed.phase === "BREAK" ||
        parsed.phase === "IDLE"
          ? parsed.phase
          : base.phase,
      running:
        typeof parsed.running === "boolean" ? parsed.running : base.running,
      endAt: typeof parsed.endAt === "number" ? parsed.endAt : null,
      remainingSec:
        typeof parsed.remainingSec === "number"
          ? parsed.remainingSec
          : base.remainingSec,
      workSec:
        typeof parsed.workSec === "number" ? parsed.workSec : base.workSec,
      breakSec:
        typeof parsed.breakSec === "number" ? parsed.breakSec : base.breakSec,
      autoStartNext:
        typeof parsed.autoStartNext === "boolean"
          ? parsed.autoStartNext
          : base.autoStartNext,
      cyclesCompleted:
        typeof parsed.cyclesCompleted === "number"
          ? parsed.cyclesCompleted
          : base.cyclesCompleted,
    };

    // sanity
    merged.workSec = clampInt(merged.workSec, 60, 6 * 60 * 60);
    merged.breakSec = clampInt(merged.breakSec, 60, 2 * 60 * 60);
    merged.remainingSec = clampInt(merged.remainingSec, 0, 24 * 60 * 60);

    return merged;
  } catch {
    return defaultState();
  }
}

function writeStored(s: FocusStored) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function computeRemainingSec(s: FocusStored, now: number) {
  if (!s.running || !s.endAt) return clampInt(s.remainingSec, 0, 24 * 60 * 60);
  const diff = Math.ceil((s.endAt - now) / 1000);
  return clampInt(diff, 0, 24 * 60 * 60);
}

function phaseDuration(s: FocusStored, phase: Phase) {
  if (phase === "BREAK") return s.breakSec;
  return s.workSec; // IDLE treated like WORK default
}

function nextPhase(p: Phase): "WORK" | "BREAK" {
  return p === "WORK" ? "BREAK" : "WORK";
}

const FocusContext = React.createContext<FocusApi | null>(null);

export function FocusProvider({ children }: { children: React.ReactNode }) {
  const [stored, setStored] = React.useState<FocusStored>(() => readStored());
  const [now, setNow] = React.useState(() => Date.now());

  // Keep time moving for rendering
  React.useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  // Sync across tabs
  React.useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setStored(readStored());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Persist on change
  React.useEffect(() => {
    writeStored(stored);
  }, [stored]);

  // Auto-advance on completion
  React.useEffect(() => {
    const rem = computeRemainingSec(stored, now);
    if (!stored.running || !stored.endAt) return;
    if (rem > 0) return;

    // timer hit 0
    setStored((prev) => {
      const currentPhase: Phase = prev.phase === "IDLE" ? "WORK" : prev.phase;
      const next = nextPhase(currentPhase);
      const nextDur = phaseDuration(prev, next);
      const shouldRun = prev.autoStartNext;

      return {
        ...prev,
        phase: next,
        running: shouldRun,
        endAt: shouldRun ? Date.now() + nextDur * 1000 : null,
        remainingSec: nextDur,
        cyclesCompleted:
          currentPhase === "WORK"
            ? prev.cyclesCompleted + 1
            : prev.cyclesCompleted,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, stored.running, stored.endAt]);

  const derived: FocusDerived = React.useMemo(() => {
    const phase = stored.phase;
    const running = stored.running;
    const remainingSec = computeRemainingSec(stored, now);

    const effectivePhase: Phase = phase === "IDLE" ? "WORK" : phase;
    const dur = phaseDuration(stored, effectivePhase);
    const progress = dur > 0 ? 1 - remainingSec / dur : 0;

    return {
      phase: stored.phase,
      running,
      remainingSec,
      mmss: fmtMMSS(remainingSec),
      label:
        stored.phase === "BREAK"
          ? "BREAK"
          : stored.phase === "WORK"
            ? "FOCUS"
            : "IDLE",
      progress: Math.max(0, Math.min(1, progress)),
      workMin: Math.round(stored.workSec / 60),
      breakMin: Math.round(stored.breakSec / 60),
      cyclesCompleted: stored.cyclesCompleted,
      autoStartNext: stored.autoStartNext,
    };
  }, [stored, now]);

  function start() {
    setStored((prev) => {
      if (prev.running) return prev;
      const p: Phase = prev.phase === "IDLE" ? "WORK" : prev.phase;
      const dur = phaseDuration(prev, p);
      const remaining = prev.remainingSec > 0 ? prev.remainingSec : dur;

      return {
        ...prev,
        phase: p,
        running: true,
        endAt: Date.now() + remaining * 1000,
        remainingSec: remaining,
      };
    });
  }

  function pause() {
    setStored((prev) => {
      if (!prev.running) return prev;
      const rem = computeRemainingSec(prev, Date.now());
      return { ...prev, running: false, endAt: null, remainingSec: rem };
    });
  }

  function toggle() {
    if (stored.running) pause();
    else start();
  }

  function reset() {
    setStored((prev) => ({
      ...prev,
      phase: "IDLE",
      running: false,
      endAt: null,
      remainingSec: prev.workSec,
    }));
  }

  function skip() {
    setStored((prev) => {
      const current: Phase = prev.phase === "IDLE" ? "WORK" : prev.phase;
      const next = nextPhase(current);
      const nextDur = phaseDuration(prev, next);
      return {
        ...prev,
        phase: next,
        running: false,
        endAt: null,
        remainingSec: nextDur,
        cyclesCompleted:
          current === "WORK" ? prev.cyclesCompleted + 1 : prev.cyclesCompleted,
      };
    });
  }

  function setPreset(workMin: number, breakMin: number) {
    setStored((prev) => {
      // keep it simple: don’t mutate timing mid-run
      if (prev.running) return prev;

      const workSec = clampInt(workMin * 60, 60, 6 * 60 * 60);
      const breakSec = clampInt(breakMin * 60, 60, 2 * 60 * 60);

      const next: FocusStored = { ...prev, workSec, breakSec };

      // If idle, reset remaining to new work
      if (next.phase === "IDLE") next.remainingSec = workSec;
      // If paused in WORK/BREAK, keep remaining as-is (user can reset if desired)
      return next;
    });
  }

  function setAutoStartNext(v: boolean) {
    setStored((prev) => ({ ...prev, autoStartNext: v }));
  }

  function setPhase(p: "WORK" | "BREAK") {
    setStored((prev) => {
      if (prev.running) return prev;
      const dur = phaseDuration(prev, p);
      return {
        ...prev,
        phase: p,
        running: false,
        endAt: null,
        remainingSec: dur,
      };
    });
  }

  const api: FocusApi = {
    derived,
    start,
    pause,
    toggle,
    reset,
    skip,
    setPreset,
    setAutoStartNext,
    setPhase,
  };

  return <FocusContext.Provider value={api}>{children}</FocusContext.Provider>;
}

export function useFocus() {
  const ctx = React.useContext(FocusContext);
  if (!ctx) throw new Error("useFocus must be used inside FocusProvider");
  return ctx;
}
