import { useState } from "react";
import { Candidate, CandidatesResponse } from "../api";

function formatLastPlayed(candidate: Candidate): string {
  if (!candidate.lastPlayedAt) return "mai osservato";
  const days = Math.floor((Date.now() - new Date(candidate.lastPlayedAt).getTime()) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "oggi";
  if (days === 1) return "1 giorno fa";
  return `${days} giorni fa`;
}

function CandidateGroup({
  candidates,
  countLabel,
  countValue,
  actionLabel,
  actionInProgressLabel,
  successTemplate,
  onAction,
}: {
  candidates: Candidate[];
  countLabel: string;
  countValue: (c: Candidate) => number;
  actionLabel: string;
  actionInProgressLabel: string;
  successTemplate: (count: number) => string;
  onAction: (trackUris: string[]) => Promise<void>;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [running, setRunning] = useState(false);
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
    if (selected.size === candidates.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(candidates.map((c) => c.uri)));
    }
  };

  const runAction = async () => {
    if (selected.size === 0) return;
    setRunning(true);
    setError(null);
    setSuccessMessage(null);
    const uris = Array.from(selected);
    try {
      await onAction(uris);
      setSuccessMessage(successTemplate(uris.length));
      setSelected(new Set());
    } catch (e) {
      setError(String(e));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="card">
      <div className="candidates-header">
        <label>
          <input type="checkbox" checked={selected.size === candidates.length} onChange={toggleAll} />
          Seleziona tutti ({candidates.length})
        </label>
        <button className="button" disabled={selected.size === 0 || running} onClick={runAction}>
          {running ? actionInProgressLabel : `${actionLabel} (${selected.size})`}
        </button>
      </div>

      {error && <div className="banner banner-error">{error}</div>}
      {successMessage && <div className="banner banner-success">{successMessage}</div>}

      <table className="candidates-table">
        <thead>
          <tr>
            <th></th>
            <th>Brano</th>
            <th>{countLabel}</th>
            <th>Ultimo ascolto</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c) => (
            <tr key={c.id}>
              <td>
                <input type="checkbox" checked={selected.has(c.uri)} onChange={() => toggle(c.uri)} />
              </td>
              <td>
                <div className="track-name">{c.name}</div>
                <div className="track-artist">{c.artist}</div>
              </td>
              <td>{countValue(c)}</td>
              <td>{formatLastPlayed(c)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CandidatesList({
  data,
  onCopied,
  onMoved,
  copyToFavorites,
  moveToReview,
}: {
  data: CandidatesResponse;
  onCopied: () => void;
  onMoved: () => void;
  copyToFavorites: (trackUris: string[]) => Promise<{ copiedCount: number; destinationPlaylistId: string }>;
  moveToReview: (trackUris: string[]) => Promise<{ movedCount: number; destinationPlaylistId: string }>;
}) {
  const hasLongListen = data.longListenCandidates.length > 0;
  const hasSkip = data.skipCandidates.length > 0;

  if (!hasLongListen && !hasSkip) {
    return (
      <div className="card">
        Nessun brano candidato al momento (ascolti prolungati ≥ {data.longListenThreshold}, skip ≥{" "}
        {data.skipThreshold}).
      </div>
    );
  }

  return (
    <>
      {hasLongListen && (
        <>
          <h3>Ascoltati a lungo e spesso</h3>
          <CandidateGroup
            candidates={data.longListenCandidates}
            countLabel="Ascolti prolungati"
            countValue={(c) => c.longListenCount}
            actionLabel="Copia selezionati nei preferiti"
            actionInProgressLabel="Copia in corso…"
            successTemplate={(n) => `Copiati ${n} brani nei preferiti.`}
            onAction={async (uris) => {
              await copyToFavorites(uris);
              onCopied();
            }}
          />
        </>
      )}

      {hasSkip && (
        <>
          <h3>Skippati spesso</h3>
          <CandidateGroup
            candidates={data.skipCandidates}
            countLabel="Skip"
            countValue={(c) => c.skipCount}
            actionLabel="Sposta selezionati in revisione"
            actionInProgressLabel="Spostamento in corso…"
            successTemplate={(n) => `Spostati ${n} brani nella playlist di revisione.`}
            onAction={async (uris) => {
              await moveToReview(uris);
              onMoved();
            }}
          />
        </>
      )}
    </>
  );
}
