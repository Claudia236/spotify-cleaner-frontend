import { useEffect, useState } from "react";
import { api } from "../api";

export default function SettingsPanel({ onSaved }: { onSaved: () => void }) {
  const [longListenThreshold, setLongListenThreshold] = useState(5);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getSettings().then((s) => {
      setLongListenThreshold(s.long_listen_threshold);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.updateSettings({ longListenThreshold });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <button className="link-button" onClick={() => setOpen((o) => !o)}>
        {open ? "Nascondi soglie" : "Modifica soglie"}
      </button>
      {open && (
        <div className="settings-form">
          <label>
            Ascolti prolungati minimi
            <input
              type="number"
              min={1}
              value={longListenThreshold}
              onChange={(e) => setLongListenThreshold(Number(e.target.value))}
            />
          </label>
          <button className="button" disabled={saving} onClick={save}>
            {saving ? "Salvataggio…" : "Salva"}
          </button>
        </div>
      )}
    </div>
  );
}
