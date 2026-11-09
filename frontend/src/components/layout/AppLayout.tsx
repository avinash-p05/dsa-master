import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function AppLayout() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main className="container" id="main">
        <Outlet />
      </main>
      <footer className="footer container">
        <p>Your progress is saved in this browser only. Export it to back it up or move it to another device.</p>
      </footer>
    </>
  );
}
