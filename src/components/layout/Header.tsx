import { Link, NavLink, useLocation } from "react-router-dom";
import { useProgress } from "@/hooks/useProgress";
import { Icon } from "@/components/ui/Icon";
import { ProgressMenu } from "./ProgressMenu";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const { dueProblems } = useProgress();
  const { pathname } = useLocation();
  // Topic pages belong to the "Roadmap" section.
  const roadmapActive = pathname === "/" || pathname.startsWith("/topic/");

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <Icon name="logo" />
          </span>
          <span>DSA Master</span>
        </Link>
        <nav className="nav" aria-label="Main">
          <NavLink to="/" className={roadmapActive ? "active" : undefined} end>
            Roadmap
          </NavLink>
          <NavLink to="/review">
            Review
            {dueProblems.length > 0 && <span className="badge">{dueProblems.length}</span>}
          </NavLink>
          <NavLink to="/guide">How to use</NavLink>
        </nav>
        <div className="topbar-actions">
          <ThemeToggle />
          <ProgressMenu />
        </div>
      </div>
    </header>
  );
}
