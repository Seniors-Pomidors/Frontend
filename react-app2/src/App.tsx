// src/App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import { UserProvider } from "./context/UserContext"; // Импортируем новый провайдер
import { AuthForm } from "./components/AuthForm";
import { Dashboard } from "./components/Dashboard";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return !user ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        {" "}
        {/* Добавляем UserProvider */}
        <ChatProvider>
          <Router>
            <Routes>
              <Route
                path="/"
                element={
                  <PublicRoute>
                    <AuthForm />
                  </PublicRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </ChatProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
