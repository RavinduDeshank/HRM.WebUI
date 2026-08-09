import { useState } from "react";
import ChatWindow from "./ChatWindow";
import DocumentUploader from "./DocumentUploader";
import "./App.css";
import { useAuth } from "./Auth";
import Login from "./Login";

type Tab = "chat" | "documents";

function App() {
  const [tab, setTab] = useState<Tab>("chat");
  const { employeeId, login, logout, isAuthenticated } = useAuth();
  const [loginInput, setLoginInput] = useState("");

  const KNOWN_EMPLOYEES = ["EMP001", "EMP002"];

  if (!isAuthenticated) {
    return (
      <div className="app-shell">
        <header className="app-header">
          <h1>HR AI Agent</h1>
        </header>
        <main className="app-main">
          <Login />
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-top">
          <h1>HR AI Agent</h1>
          <div className="auth-controls">
            <span className="auth-text">Signed in as {employeeId}</span>
            <button className="btn-ghost" onClick={() => logout()}>Sign out</button>
          </div>
        </div>
        <nav className="app-nav">
          <button
            type="button"
            className={`app-nav-item ${tab === "chat" ? "active" : ""}`}
            onClick={() => setTab("chat")}
          >
            Chat
          </button>
          <button
            type="button"
            className={`app-nav-item ${tab === "documents" ? "active" : ""}`}
            onClick={() => setTab("documents")}
          >
            Document Upload
          </button>
        </nav>
      </header>

      <main className="app-main">
        {tab === "chat" && (
          <section className="panel chat-panel">
            <ChatWindow key={employeeId ?? ""} employeeId={employeeId ?? ""} />
          </section>
        )}

        {tab === "documents" && (
          <section className="panel uploader-panel">
            <DocumentUploader />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
