import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import AppLayout from "./shared/components/layout/AppLayout";
import { ProtectedRoute } from "./shared/components/ProtectedRoute";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import DashboardPage from "./features/dashboard/pages/DashboardPage";
import IssuesPage from "./features/issues/pages/IssuesPage";
import IssueDetailPage from "./features/issues/pages/IssueDetailPage";
import WorkflowConfigPage from "./features/workflow/pages/WorkflowConfigPage";
import UsersPage from "./features/users/pages/UsersPage";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="issues" element={<IssuesPage />} />
          <Route path="issues/:id" element={<IssueDetailPage />} />
          <Route
            path="workflow"
            element={
              <ProtectedRoute roles={["Admin"]}>
                <WorkflowConfigPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="users"
            element={
              <ProtectedRoute roles={["Admin", "Manager"]}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
