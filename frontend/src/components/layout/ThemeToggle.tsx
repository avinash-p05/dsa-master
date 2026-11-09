import { useProgress } from "@/hooks/useProgress";
import { Icon } from "@/components/ui/Icon";

const prefersDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

export function ThemeToggle() {
  const { state, setTheme } = useProgress();
  const isDark = state.theme ? state.theme === "dark" : prefersDark();

  return (
    <button
      type="button"
      className="icon-btn"
      title="Toggle theme"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Icon name="sun" className="i-sun" />
      <Icon name="moon" className="i-moon" />
    </button>
  );
}
