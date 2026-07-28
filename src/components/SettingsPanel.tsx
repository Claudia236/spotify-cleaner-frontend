import { useEffect, useState } from "react";
import { api } from "../api";

export default function SettingsPanel({ onSaved }: { onSaved: () => void }) {
  const [skipThreshold, setSkipThreshold] = useState(7);
  const [daysThreshold, setDaysThreshold] = useState(60);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getSettings().then((s) => {
      setSkipThreshold(s.skip_threshold);
      setDaysThreshold(s.days_threshold);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.updateSettings({ skipThreshold, daysThreshold });
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
            Skip minimi
            <input
              type="number"
              min={1}
              value={skipThreshold}
              onChange={(e) => setSkipThreshold(Number(e.target.value))}
            />
          </label>
          <label>
            Giorni senza ascolto
            <input
              type="number"
              min={1}
              value={daysThreshold}
              onChange={(e) => setDaysThreshold(Number(e.target.value))}
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
