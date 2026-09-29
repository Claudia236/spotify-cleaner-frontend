import { useState } from "react";
import { api, Candidate, CandidatesResponse } from "../api";

function formatLastPlayed(candidate: Candidate): string {
  if (!candidate.lastPlayedAt) return "mai osservato";
  const days = Math.floor((Date.now() - new Date(candidate.lastPlayedAt).getTime()) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "oggi";
  if (days === 1) return "1 giorno fa";
  return `${days} giorni fa`;
}

export default function CandidatesList({
  playlistId,
  data,
  onCopied,
}: {
  playlistId: string;
  data: CandidatesResponse;
  onCopied: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [copying, setCopying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const toggle = (uri: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(uri)) next.delete(uri);
      else next.add(uri);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === data.candidates.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(data.candidates.map((c) => c.uri)));
    }
  };

  const copySelected = async () => {
    if (selected.size === 0) return;
    setCopying(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const result = await api.copyToFavorites(playlistId, Array.from(selected));
      setSuccessMessage(`Copiati ${result.copiedCount} brani nei preferiti.`);
      setSelected(new Set());
      onCopied();
    } catch (e) {
      setError(String(e));
    } finally {
      setCopying(false);
    }
  };

  if (data.candidates.length === 0) {
    return (
      <div className="card">
        Nessun brano candidato al momento (ascolti prolungati ≥ {data.longListenThreshold}).
      </div>
    );
  }

  return (
    <div className="card">
      <div className="candidates-header">
        <label>
          <input
            type="checkbox"
            checked={selected.size === data.candidates.length}
            onChange={toggleAll}
          />
          Seleziona tutti ({data.candidates.length})
        </label>
        <button className="button" disabled={selected.size === 0 || copying} onClick={copySelected}>
          {copying ? "Copia in corso…" : `Copia selezionati nei preferiti (${selected.size})`}
        </button>
      </div>

      {error && <div className="banner banner-error">{error}</div>}
      {successMessage && <div className="banner banner-success">{successMessage}</div>}

      <table className="candidates-table">
        <thead>
          <tr>
            <th></th>
            <th>Brano</th>
            <th>Ascolti prolungati</th>
            <th>Ultimo ascolto</th>
          </tr>
        </thead>
        <tbody>
          {data.candidates.map((c) => (
            <tr key={c.id}>
              <td>
                <input type="checkbox" checked={selected.has(c.uri)} onChange={() => toggle(c.uri)} />
              </td>
              <td>
                <div className="track-name">{c.name}</div>
                <div className="track-artist">{c.artist}</div>
              </td>
              <td>{c.longListenCount}</td>
              <td>{formatLastPlayed(c)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
