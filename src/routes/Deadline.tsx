import React from "react";
import { Skeleton } from "../ui/Skeleton";
import type { Task, TaskStatus } from "../lib/deadline";
import { createTask, deleteTask, listTasks, updateTask } from "../lib/deadline";

const LANES: { key: TaskStatus; label: string }[] = [
  { key: "TODAY", label: "TODAY" },
  { key: "THIS_WEEK", label: "THIS WEEK" },
  { key: "DUMPING_GROUND", label: "DUMPING GROUND" },
  { key: "DONE", label: "DONE" },
];

function laneTitle(status: TaskStatus) {
  return LANES.find((l) => l.key === status)?.label ?? status;
}

function isOverdue(dueDate: string | null) {
  if (!dueDate) return false;
  // Compare as local date
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;
  return dueDate < todayStr;
}

export function Deadline() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  const [title, setTitle] = React.useState("");
  const [status, setStatus] = React.useState<TaskStatus>("TODAY");
  const [due, setDue] = React.useState<string>("");

  async function refresh() {
    setErr(null);
    const res = await listTasks();
    if (res.error) {
      setErr("FAILED TO LOAD TASKS.");
      setTasks([]);
      return;
    }
    setTasks(res.data as Task[]);
  }

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      await refresh();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    try {
      const res = await createTask({
        title,
        status,
        due_date: due.trim() ? due.trim() : null,
      });
      if (res.error) throw res.error;

      setTitle("");
      setDue("");
      setStatus("TODAY");
      await refresh();
    } catch {
      setErr("FAILED TO CREATE TASK.");
    }
  }

  async function onMove(t: Task, next: TaskStatus) {
    setErr(null);
    const res = await updateTask(t.id, { status: next });
    if (res.error) setErr("FAILED TO UPDATE.");
    await refresh();
  }

  async function onToggleDone(t: Task) {
    const next: TaskStatus = t.status === "DONE" ? "TODAY" : "DONE";
    await onMove(t, next);
  }

  async function onDelete(t: Task) {
    setErr(null);
    const res = await deleteTask(t.id);
    if (res.error) setErr("FAILED TO DELETE.");
    await refresh();
  }

  const byLane = React.useMemo(() => {
    const map = new Map<TaskStatus, Task[]>();
    for (const l of LANES) map.set(l.key, []);
    for (const t of tasks) map.get(t.status)?.push(t);
    return map;
  }, [tasks]);

  return (
    <div className="page">
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div className="kicker">MODULE</div>
          <h1 className="h2">DEADLINE BRUTAL</h1>
        </div>

        <button className="btn btn-ghost" type="button" onClick={refresh}>
          REFRESH
        </button>
      </div>

      <div className="note" style={{ marginTop: 12 }}>
        HARD LANES. LOUD STATUS. ZERO EXCUSES.
      </div>

      <div className="card" style={{ marginTop: 14, minHeight: 0 }}>
        <div className="cardtitle">ADD TASK</div>

        <form onSubmit={onAdd} className="form" style={{ marginTop: 10 }}>
          <label className="label">
            TITLE
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="WRITE THE TASK."
              required
            />
          </label>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <label className="label" style={{ flex: "1 1 220px" }}>
              LANE
              <select
                className="input"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                {LANES.filter((l) => l.key !== "DONE").map((l) => (
                  <option key={l.key} value={l.key}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="label" style={{ flex: "1 1 220px" }}>
              DUE DATE (OPTIONAL)
              <input
                className="input"
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
              />
            </label>
          </div>

          <button className="btn" type="submit">
            ADD
          </button>

          {err ? <div className="error">{err}</div> : null}
        </form>
      </div>

      {loading ? (
        <div className="board" style={{ marginTop: 14 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <section key={i} className="lane">
              <div className="lanehead">
                <Skeleton h={18} w={120} />
                <Skeleton h={18} w={42} />
              </div>
              <div className="lanebody">
                <Skeleton h={74} />
                <Skeleton h={74} />
                <Skeleton h={74} />
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="board" style={{ marginTop: 14 }}>
          {LANES.map((lane) => {
            const items = byLane.get(lane.key) ?? [];
            return (
              <section key={lane.key} className="lane">
                <div className="lanehead">
                  <div className="lanetitle">{lane.label}</div>
                  <div className="lanecount">{items.length}</div>
                </div>

                <div className="lanebody">
                  {items.length === 0 ? (
                    <div className="empty">EMPTY.</div>
                  ) : null}

                  {items.map((t) => {
                    const overdue = isOverdue(t.due_date);
                    return (
                      <div
                        key={t.id}
                        className={overdue ? "task task-overdue" : "task"}
                      >
                        <div className="tasktitle">{t.title}</div>

                        <div className="taskmeta">
                          <span className="tag">{laneTitle(t.status)}</span>
                          {t.due_date ? (
                            <span className={overdue ? "tag tag-warn" : "tag"}>
                              DUE {t.due_date}
                            </span>
                          ) : null}
                        </div>

                        <div className="taskactions">
                          <label
                            className="label"
                            style={{ margin: 0, flex: 1 }}
                          >
                            MOVE
                            <select
                              className="input"
                              value={t.status}
                              onChange={(e) =>
                                onMove(t, e.target.value as TaskStatus)
                              }
                            >
                              {LANES.map((l) => (
                                <option key={l.key} value={l.key}>
                                  {l.label}
                                </option>
                              ))}
                            </select>
                          </label>

                          <button
                            className="btn btn-ghost"
                            type="button"
                            onClick={() => onToggleDone(t)}
                          >
                            {t.status === "DONE" ? "UNDO" : "DONE"}
                          </button>

                          <button
                            className="btn btn-ghost"
                            type="button"
                            onClick={() => onDelete(t)}
                          >
                            DELETE
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
