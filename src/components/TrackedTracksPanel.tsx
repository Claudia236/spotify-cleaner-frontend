import { useState } from "react";
import { api, TrackedTrack } from "../api";

function formatLastPlayed(track: TrackedTrack): string {
  if (!track.lastPlayedAt) return "mai osservato";
  const days = Math.floor((Date.now() - new Date(track.lastPlayedAt).getTime()) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "oggi";
  if (days === 1) return "1 giorno fa";
  return `${days} giorni fa`;
}

export default function TrackedTracksPanel({
  trackedTrackCount,
  trackingSinceLabel,
}: {
  trackedTrackCount: number;
  trackingSinceLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [tracks, setTracks] = useState<TrackedTrack[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && tracks === null) {
      setLoading(true);
      setError(null);
      api
        .trackedTracks()
        .then(setTracks)
        .catch((e) => setError(String(e)))
        .finally(() => setLoading(false));
    }
  };

  return (
    <div className="card">
      <button className="link-button" onClick={toggle}>
        {open ? "Nascondi" : "Mostra"} brani tracciati — Tracciamento attivo {trackingSinceLabel} —{" "}
        {trackedTrackCount} brani osservati finora.
      </button>

      {open && (
        <div className="tracked-tracks-body">
          {loading && <p>Caricamento…</p>}
          {error && <div className="banner banner-error">{error}</div>}
          {tracks && tracks.length === 0 && <p>Nessun brano osservato finora.</p>}
          {tracks && tracks.length > 0 && (
            <table className="candidates-table">
              <thead>
                <tr>
                  <th>Brano</th>
                  <th>Skip</th>
                  <th>Ultimo ascolto</th>
                </tr>
              </thead>
              <tbody>
                {tracks.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div className="track-name">{t.name}</div>
                      {t.artist && <div className="track-artist">{t.artist}</div>}
                    </td>
                    <td>{t.skipCount}</td>
                    <td>{formatLastPlayed(t)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
