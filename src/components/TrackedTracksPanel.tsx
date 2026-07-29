import { useState } from "react";
import { api, TrackedTrack } from "../api";

const PAGE_SIZE = 10;

function pageNumbers(current: number, total: number): (number | "...")[] {
  const pages: (number | "...")[] = [];
  for (let i = 0; i < total; i++) {
    if (i === 0 || i === total - 1 || Math.abs(i - current) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }
  return pages;
}

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
  const [page, setPage] = useState(0);

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

  const totalPages = tracks ? Math.max(1, Math.ceil(tracks.length / PAGE_SIZE)) : 1;
  const pageTracks = tracks ? tracks.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE) : [];

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
            <>
              <table className="candidates-table">
                <thead>
                  <tr>
                    <th>Brano</th>
                    <th>Skip</th>
                    <th>Ultimo ascolto</th>
                  </tr>
                </thead>
                <tbody>
                  {pageTracks.map((t) => (
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

              <div className="pagination">
                <button
                  className="button pagination-button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  ‹ Precedente
                </button>
                <span className="pagination-pages">
                  {pageNumbers(page, totalPages).map((p, idx) =>
                    p === "..." ? (
                      <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        className={`pagination-page ${p === page ? "pagination-page-active" : ""}`}
                        onClick={() => setPage(p)}
                      >
                        {p + 1}
                      </button>
                    )
                  )}
                </span>
                <button
                  className="button pagination-button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Successiva ›
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
