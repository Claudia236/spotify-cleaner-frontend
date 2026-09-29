const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8888";

export interface Playlist {
  id: string;
  name: string;
  trackCount: number;
}

export interface Candidate {
  id: string;
  uri: string;
  name: string;
  artist: string;
  album: string | null;
  addedAt: string;
  longListenCount: number;
  lastPlayedAt: string | null;
}

export interface CandidatesResponse {
  longListenThreshold: number;
  trackingStartedAt: string;
  candidates: Candidate[];
}

export interface AuthStatus {
  connected: boolean;
  spotifyUserId: string | null;
}

export interface TrackingStatus {
  connected: boolean;
  trackingStartedAt: string;
  trackedTrackCount: number;
}

export interface TrackedTrack {
  id: string;
  name: string;
  artist: string | null;
  longListenCount: number;
  playCount: number;
  lastPlayedAt: string | null;
}

export interface Settings {
  id: number;
  destination_playlist_id: string | null;
  long_listen_threshold: number;
  tracking_started_at: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Richiesta a ${path} fallita (${res.status}): ${body}`);
  }
  return (await res.json()) as T;
}

export const api = {
  authStatus: () => request<AuthStatus>("/auth/status"),
  loginUrl: () => `${API_URL}/auth/login`,
  trackingStatus: () => request<TrackingStatus>("/api/tracking-status"),
  trackedTracks: () => request<TrackedTrack[]>("/api/tracked-tracks"),
  playlists: () => request<Playlist[]>("/api/playlists"),
  candidates: (playlistId: string) => request<CandidatesResponse>(`/api/playlists/${playlistId}/candidates`),
  copyToFavorites: (playlistId: string, trackUris: string[]) =>
    request<{ copiedCount: number; destinationPlaylistId: string }>(
      `/api/playlists/${playlistId}/copy-to-favorites`,
      {
        method: "POST",
        body: JSON.stringify({ trackUris }),
      }
    ),
  getSettings: () => request<Settings>("/api/settings"),
  updateSettings: (patch: Partial<{ longListenThreshold: number }>) =>
    request<Settings>("/api/settings", { method: "PUT", body: JSON.stringify(patch) }),
};
