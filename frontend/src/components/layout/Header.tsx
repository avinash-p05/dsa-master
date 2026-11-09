import { Link } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { AccountMenu } from "./AccountMenu";
import { MainNav } from "./MainNav";
import { ProgressMenu } from "./ProgressMenu";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <Icon name="logo" />
          </span>
          <span>DSA Master</span>
        </Link>
        {/* Hidden on phones, where the bottom tab bar takes over. */}
        <MainNav variant="header" />
        <div className="topbar-actions">
          <ThemeToggle />
          <ProgressMenu />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
