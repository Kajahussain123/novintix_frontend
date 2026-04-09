import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import AppLayout from "./shared/components/layout/AppLayout";
import { ProtectedRoute } from "./shared/components/ProtectedRoute";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import DashboardPage from "./features/dashboard/pages/DashboardPage";
import ProjectsPage from "./features/projects/pages/ProjectsPage";
import ProjectDetailPage from "./features/projects/pages/ProjectDetailPage";
import TasksPage from "./features/tasks/pages/TasksPage";
import TaskDetailPage from "./features/tasks/pages/TaskDetailPage";
import WorkflowConfigPage from "./features/workflow/pages/WorkflowConfigPage";
import UsersPage from "./features/users/pages/UsersPage";
import ApiTesterPage from "./features/tester/pages/ApiTesterPage";

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
            <Route
            path="projects"
            element={
              <ProtectedRoute roles={["ADMIN", "MANAGER", "DEVELOPER", "DESIGNER", "TESTER"]}>
                <ProjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="projects/:id"
            element={
              <ProtectedRoute roles={["ADMIN", "MANAGER", "DEVELOPER", "DESIGNER", "TESTER"]}>
                <ProjectDetailPage />
              </ProtectedRoute>
            }
          />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="tasks/:id" element={<TaskDetailPage />} />
          <Route
            path="workflow"
            element={
              <ProtectedRoute roles={["ADMIN", "MANAGER"]}>
                <WorkflowConfigPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="users"
            element={
              <ProtectedRoute roles={["ADMIN", "MANAGER"]}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="api-lab"
            element={
              <ProtectedRoute roles={["ADMIN", "MANAGER", "DEVELOPER"]}>
                <ApiTesterPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
