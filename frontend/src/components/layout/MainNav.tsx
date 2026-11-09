import { NavLink, useLocation } from "react-router-dom";
import { useProgress } from "@/hooks/useProgress";
import { Icon, type IconName } from "@/components/ui/Icon";

interface NavItem {
  to: string;
  label: string;
  /** Shorter label for the phone tab bar. */
  shortLabel: string;
  icon: IconName;
}

const NAV_ITEMS: readonly NavItem[] = [
  { to: "/", label: "Roadmap", shortLabel: "Roadmap", icon: "map" },
  { to: "/review", label: "Review", shortLabel: "Review", icon: "redo" },
  { to: "/guide", label: "How to use", shortLabel: "Guide", icon: "book" },
];

/**
 * Main navigation, rendered twice by the layout: inline in the header on wide
 * screens, and as a fixed bottom tab bar on phones (CSS decides which is visible).
 */
export function MainNav({ variant }: { variant: "header" | "tabbar" }) {
  const { dueProblems } = useProgress();
  const { pathname } = useLocation();

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" || pathname.startsWith("/topic/") : pathname.startsWith(to);

  return (
    <nav className={variant === "header" ? "nav" : "tabbar"} aria-label={variant === "header" ? "Main" : "Main (mobile)"}>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          className={isActive(item.to) ? "active" : undefined}
          aria-current={isActive(item.to) ? "page" : undefined}
        >
          {variant === "tabbar" && <Icon name={item.icon} className="tab-icon" />}
          <span>{variant === "tabbar" ? item.shortLabel : item.label}</span>
          {item.to === "/review" && dueProblems.length > 0 && <span className="badge">{dueProblems.length}</span>}
        </NavLink>
      ))}
    </nav>
  );
}
