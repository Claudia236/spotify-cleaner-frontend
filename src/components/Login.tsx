import { api } from "../api";

export default function Login() {
  return (
    <div className="card login-card">
      <p>Collega il tuo account Spotify per iniziare a tracciare gli ascolti.</p>
      <a className="button" href={api.loginUrl()}>
        Collega Spotify
      </a>
    </div>
  );
}
