import { useEffect, useState } from "react";
import { api, CandidatesResponse, Playlist, TrackingStatus } from "../api";
import CandidatesList from "./CandidatesList";
import SettingsPanel from "./SettingsPanel";
import TrackedTracksPanel from "./TrackedTracksPanel";

function formatTrackingSince(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "oggi";
  if (days === 1) return "da 1 giorno";
  return `da ${days} giorni`;
}

export default function Dashboard() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>("");
  const [tracking, setTracking] = useState<TrackingStatus | null>(null);
  const [candidates, setCandidates] = useState<CandidatesResponse | null>(null);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    api.playlists().then(setPlaylists).catch((e) => setError(String(e)));
    api.trackingStatus().then(setTracking).catch(() => {});
  }, [refreshKey]);

  useEffect(() => {
    if (!selectedPlaylistId) {
      setCandidates(null);
      return;
    }
    setLoadingCandidates(true);
    setError(null);
    api
      .candidates(selectedPlaylistId)
      .then(setCandidates)
      .catch((e) => setError(String(e)))
      .finally(() => setLoadingCandidates(false));
  }, [selectedPlaylistId, refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="dashboard">
      {tracking && (
        <TrackedTracksPanel
          trackedTrackCount={tracking.trackedTrackCount}
          trackingSinceLabel={formatTrackingSince(tracking.trackingStartedAt)}
        />
      )}

      <SettingsPanel onSaved={refresh} />

      <div className="card">
        <label htmlFor="playlist-select">Playlist sorgente</label>
        <select
          id="playlist-select"
          value={selectedPlaylistId}
          onChange={(e) => setSelectedPlaylistId(e.target.value)}
        >
          <option value="">Seleziona una playlist…</option>
          {playlists.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.trackCount} brani)
            </option>
          ))}
        </select>
      </div>

      {error && <div className="banner banner-error">{error}</div>}
      {loadingCandidates && <p>Analisi della playlist in corso…</p>}

      {candidates && !loadingCandidates && (
        <CandidatesList
          playlistId={selectedPlaylistId}
          data={candidates}
          onMoved={() => {
            refresh();
          }}
        />
      )}
    </div>
  );
}
