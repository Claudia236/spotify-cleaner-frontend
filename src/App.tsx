import { useEffect, useState } from "react";
import { api, AuthStatus } from "./api";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [auth, setAuth] = useState<AuthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const params = new URLSearchParams(window.location.search);
  const authError = params.get("auth_error");

  useEffect(() => {
    api
      .authStatus()
      .then(setAuth)
      .catch(() => setAuth({ connected: false, spotifyUserId: null }))
      .finally(() => setLoading(false));

    if (params.get("connected") || authError) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Spotify Cleaner</h1>
        <p className="subtitle">
          Trova i brani skippati spesso o non ascoltati da tempo e spostali in un'altra playlist.
        </p>
      </header>

      {authError && (
        <div className="banner banner-error">Errore durante il login con Spotify: {authError}</div>
      )}

      {loading && <p>Caricamento…</p>}

      {!loading && auth && !auth.connected && <Login />}
      {!loading && auth && auth.connected && <Dashboard />}
    </div>
  );
}
