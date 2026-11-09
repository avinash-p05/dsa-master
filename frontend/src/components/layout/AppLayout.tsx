import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "./Header";
import { MainNav } from "./MainNav";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function AppLayout() {
  const { status } = useAuth();
  return (
    <>
      <ScrollToTop />
      <Header />
      <main className="container" id="main">
        <Outlet />
      </main>
      <footer className="footer container">
        <p>
          {status === "authenticated"
            ? "Your progress is saved to your account and syncs across devices."
            : "Your progress is saved in this browser. Sign in to keep it across devices."}
        </p>
      </footer>
      {/* Phones only: fixed bottom navigation (outside the header so it can be position: fixed). */}
      <MainNav variant="tabbar" />
    </>
  );
}
