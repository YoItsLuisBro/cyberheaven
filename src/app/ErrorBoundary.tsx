import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err: unknown) {
    // eslint-disable-next-line no-console
    console.error("SYSTEM FAULT:", err);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="page">
        <div className="kicker">SYSTEM</div>
        <h1 className="h2">FAULT</h1>
        <div className="note" style={{ marginTop: 12 }}>
          SOMETHING BROKE. RELOAD OR RETURN HOME
        </div>

        <div
          style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}
        >
          <button className="btn" onClick={() => window.location.reload()}>
            RELOAD
          </button>
          <a href="/" className="btn btn-ghost">
            HOME
          </a>
        </div>
      </div>
    );
  }
}
