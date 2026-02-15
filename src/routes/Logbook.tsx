import React from "react";
import { Skeleton } from "../ui/Skeleton";
import type { Entry } from "../lib/logbook";
import {
  createEntry,
  softDeleteEntry,
  listEntries,
  updateEntry,
} from "../lib/logbook";

function todayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function snippet(s: string, n = 140) {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length <= n ? t : `${t.slice(0, n)}…`;
}

export function Logbook() {
  const [entries, setEntries] = React.useState<Entry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  // composer
  const [date, setDate] = React.useState(todayStr());
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");

  // editor (selected entry)
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const selected = React.useMemo(
    () => entries.find((e) => e.id === selectedId) ?? null,
    [entries, selectedId],
  );

  const [editDate, setEditDate] = React.useState("");
  const [editTitle, setEditTitle] = React.useState("");
  const [editBody, setEditBody] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function refresh() {
    setErr(null);
    const res = await listEntries();
    if (res.error) {
      setErr("FAILED TO LOAD ENTRIES.");
      setEntries([]);
      return;
    }
    setEntries(res.data as Entry[]);
  }

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      await refresh();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!selected) return;
    setEditDate(selected.entry_date);
    setEditTitle(selected.title ?? "");
    setEditBody(selected.body);
  }, [selected]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setErr(null);
    setBusy(true);

    try {
      const res = await createEntry({
        entry_date: date,
        title: title.trim() || null,
        body,
      });
      if (res.error) throw res.error;

      setTitle("");
      setBody("");
      setDate(todayStr());
      await refresh();
      setSelectedId(res.data.id);
    } catch {
      setErr("FAILED TO CREATE ENTRY.");
    } finally {
      setBusy(false);
    }
  }

  async function onSaveEdit() {
    if (!selected || busy) return;
    setErr(null);
    setBusy(true);

    try {
      const res = await updateEntry(selected.id, {
        entry_date: editDate,
        title: editTitle,
        body: editBody,
      });
      if (res.error) throw res.error;

      await refresh();
      setSelectedId(res.data.id);
    } catch {
      setErr("FAILED TO SAVE.");
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteSelected() {
    if (!selected || busy) return;
    setErr(null);
    setBusy(true);

    try {
      const res = await softDeleteEntry(selected.id);
      if (res.error) throw res.error;

      setSelectedId(null);
      await refresh();
    } catch {
      setErr("FAILED TO DELETE.");
    } finally {
      setBusy(false);
    }
  }

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
          <h1 className="h2">BRUTAL LOGBOOK</h1>
        </div>

        <button className="btn btn-ghost" type="button" onClick={refresh}>
          REFRESH
        </button>
      </div>

      <div className="note" style={{ marginTop: 12 }}>
        WRITE IT. SAVE IT. MOVE ON.
      </div>

      {err ? (
        <div className="error" style={{ marginTop: 12 }}>
          {err}
        </div>
      ) : null}
      {loading ? (
        <div className="loggrid" style={{ marginTop: 14 }}>
          <section className="card logpanel" style={{ minHeight: 0 }}>
            <div className="cardtitle">NEW ENTRY</div>
            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              <Skeleton h={48} />
              <Skeleton h={48} />
              <Skeleton h={160} />
              <Skeleton h={44} w={180} />
            </div>
          </section>

          <section className="card logpanel" style={{ minHeight: 0 }}>
            <div className="cardtitle">ENTRIES</div>
            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              <Skeleton h={74} />
              <Skeleton h={74} />
              <Skeleton h={74} />
              <Skeleton h={74} />
            </div>
          </section>

          <section
            className="card logpanel logpanel-wide"
            style={{ minHeight: 0 }}
          >
            <div className="cardtitle">EDITOR</div>
            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              <Skeleton h={48} />
              <Skeleton h={48} />
              <Skeleton h={320} />
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Skeleton h={44} w={180} />
                <Skeleton h={44} w={140} />
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {!loading ? (
        <div className="loggrid" style={{ marginTop: 14 }}>
          {/* COMPOSER */}
          <section className="card logpanel" style={{ minHeight: 0 }}>
            <div className="cardtitle">NEW ENTRY</div>

            <form
              onSubmit={onCreate}
              className="form"
              style={{ marginTop: 10 }}
            >
              <label className="label">
                DATE
                <input
                  className="input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>

              <label className="label">
                TITLE (OPTIONAL)
                <input
                  className="input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="SHORT LABEL."
                />
              </label>

              <label className="label">
                BODY
                <textarea
                  className="input textarea"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="NO FILTER. FULL TEXT."
                  required
                />
              </label>

              <button className="btn" type="submit" disabled={busy}>
                {busy ? "WORKING…" : "SAVE ENTRY"}
              </button>
            </form>
          </section>

          {/* LIST */}
          <section className="card logpanel" style={{ minHeight: 0 }}>
            <div className="cardtitle">ENTRIES</div>

            <div className="loglist" style={{ marginTop: 10 }}>
              {entries.length === 0 ? (
                <div className="empty">EMPTY.</div>
              ) : null}

              {entries.map((e) => {
                const active = e.id === selectedId;
                return (
                  <button
                    key={e.id}
                    type="button"
                    className={active ? "logitem active" : "logitem"}
                    onClick={() => setSelectedId(e.id)}
                  >
                    <div className="logitemTop">
                      <span className="tag">{e.entry_date}</span>
                      {e.title ? (
                        <span className="tag">{e.title.toUpperCase()}</span>
                      ) : null}
                    </div>
                    <div className="logitemBody">{snippet(e.body)}</div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* EDITOR */}
          <section
            className="card logpanel logpanel-wide"
            style={{ minHeight: 0 }}
          >
            <div className="cardtitle">EDITOR</div>

            {!selected ? (
              <div className="note" style={{ marginTop: 10 }}>
                SELECT AN ENTRY TO EDIT.
              </div>
            ) : (
              <div style={{ marginTop: 10, display: "grid", gap: 12 }}>
                <div className="logmetaRow">
                  <label
                    className="label"
                    style={{ margin: 0, flex: "1 1 200px" }}
                  >
                    DATE
                    <input
                      className="input"
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                    />
                  </label>

                  <label
                    className="label"
                    style={{ margin: 0, flex: "2 1 260px" }}
                  >
                    TITLE
                    <input
                      className="input"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="OPTIONAL."
                    />
                  </label>
                </div>

                <label className="label">
                  BODY
                  <textarea
                    className="input textarea textarea-tall"
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                  />
                </label>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    className="btn"
                    type="button"
                    onClick={onSaveEdit}
                    disabled={busy}
                  >
                    {busy ? "WORKING…" : "SAVE CHANGES"}
                  </button>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={onDeleteSelected}
                    disabled={busy}
                  >
                    DELETE
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
