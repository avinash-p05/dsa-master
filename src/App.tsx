import { HashRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProgressProvider } from "@/context/ProgressProvider";
import { ToastProvider } from "@/context/ToastProvider";
import { GuidePage } from "@/pages/GuidePage";
import { HomePage } from "@/pages/HomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ReviewPage } from "@/pages/ReviewPage";
import { TopicPage } from "@/pages/TopicPage";

/**
 * HashRouter keeps routing fully client-side (URLs look like /#/topic/graphs),
 * so deep links work on static hosts like GitHub Pages with no server rewrites.
 */
export function App() {
  return (
    <ToastProvider>
      <ProgressProvider>
        <HashRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="topic/:slug" element={<TopicPage />} />
              <Route path="topic/:slug/:problemId" element={<TopicPage />} />
              <Route path="review" element={<ReviewPage />} />
              <Route path="guide" element={<GuidePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </HashRouter>
      </ProgressProvider>
    </ToastProvider>
  );
}
