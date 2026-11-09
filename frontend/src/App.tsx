import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/context/AuthProvider";
import { ProgressProvider } from "@/context/ProgressProvider";
import { ToastProvider } from "@/context/ToastProvider";
import { GuidePage } from "@/pages/GuidePage";
import { HomePage } from "@/pages/HomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { ReviewPage } from "@/pages/ReviewPage";
import { VerifyEmailPage } from "@/pages/VerifyEmailPage";
import { TopicPage } from "@/pages/TopicPage";

/**
 * Clean URLs (/topic/graphs). The Spring Boot app forwards these routes to
 * index.html (see SpaController), so refreshes and shared links work.
 */
export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ProgressProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route index element={<HomePage />} />
                <Route path="topic/:slug" element={<TopicPage />} />
                <Route path="topic/:slug/:problemId" element={<TopicPage />} />
                <Route path="review" element={<ReviewPage />} />
                <Route path="guide" element={<GuidePage />} />
                <Route path="verify-email" element={<VerifyEmailPage />} />
                <Route path="reset-password" element={<ResetPasswordPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ProgressProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
