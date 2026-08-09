import React from "react";
import { useAuth } from "./Auth";
import userImg from "./assets/user.png";

const KNOWN_EMPLOYEES = ["EMP001", "EMP002"];

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="panel login-panel login-teal">
      <div className="login-card">
        <div className="login-hero">
          <img src={userImg} alt="User avatar" className="avatar" />
          <h2>Member Login</h2>
          <p className="muted">Choose an account to sign in</p>
        </div>

        <div className="known-list" style={{ marginTop: 12 }}>
          {KNOWN_EMPLOYEES.map((e) => (
            <button key={e} className="login-primary" onClick={() => login(e, true)}>
              Sign in as {e}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
