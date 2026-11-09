import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useProgress } from "@/hooks/useProgress";
import { useToast } from "@/hooks/useToast";
import { todayIso } from "@/lib/format";
import { downloadJson, parseState } from "@/lib/storage";
import { Icon } from "@/components/ui/Icon";

/** The ⋮ menu: export, import and reset progress. */
export function ProgressMenu() {
  const { state, isCloud, importProgress, resetProgress } = useProgress();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleExport = () => {
    downloadJson(state, `dsa-master-progress-${todayIso()}.json`);
    setOpen(false);
  };

  const handleImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    let next;
    try {
      next = parseState(JSON.parse(await file.text()));
    } catch {
      next = null;
    }
    if (!next) {
      toast("That file doesn't look like a DSA Master export.");
      return;
    }
    try {
      await importProgress(next);
      toast(`Imported ${Object.keys(next.solved).length} solved problems${isCloud ? " into your account" : ""}.`);
    } catch {
      toast("Import failed. Please try again.");
    }
  };

  const handleReset = async () => {
    setOpen(false);
    const where = isCloud ? "in your account" : "in this browser";
    if (!window.confirm(`Reset ALL progress, flags and notes ${where}? This can't be undone. Export first if you want a backup.`)) {
      return;
    }
    try {
      await resetProgress();
      toast("Progress reset.");
    } catch {
      toast("Couldn't reset progress. Please try again.");
    }
  };

  return (
    <div className="menu-wrap" ref={wrapRef}>
      <button
        type="button"
        className="icon-btn"
        title="Progress options"
        aria-label="Progress options"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="more" />
      </button>
      {open && (
        <div className="menu" role="menu">
          <button type="button" role="menuitem" onClick={handleExport}>
            Export progress (.json)
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              fileRef.current?.click();
            }}
          >
            Import progress…
          </button>
          <hr />
          <button type="button" role="menuitem" className="danger" onClick={handleReset}>
            Reset all progress
          </button>
        </div>
      )}
      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={handleImport} />
    </div>
  );
}
