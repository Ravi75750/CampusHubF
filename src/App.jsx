import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import FeedPage from "./Pages/FeedPage.jsx";
import EventsPage from "./Pages/EventsPage.jsx";
import QuestionListPage from "./Pages/QuestionListPage.jsx";
import QuestionDetailPage from "./Pages/QuestionDetailPage.jsx";
import LoginPage from "./Pages/LoginPage.jsx";
import RegisterPage from "./Pages/RegisterPage.jsx";
import AskQuestionPage from "./Pages/AskQuestionPage.jsx";
import ProfilePage from "./Pages/ProfilePage.jsx";
import LandingPage from "./Pages/LandingPage.jsx";
import AdminPanelPage from "./Pages/AdminPanelPage.jsx";
import AdminLoginPage from "./Pages/AdminLoginPage.jsx";
import ChatPage from "./Pages/ChatPage.jsx";
import PostPage from "./Pages/PostPage.jsx";
import NoticeBanner from "./components/NoticeBanner.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

import BackgroundPattern from "./components/BackgroundPattern.jsx";

/* -------------------- PRIVATE ROUTE -------------------- */
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-4 text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

/* -------------------- APP CONTENT -------------------- */
function AppContent() {
  const location = useLocation();

  // Detect landing page
  const isLandingPage = location.pathname === "/";
  const { user, loading } = useAuth(); // Get user from context

  if (loading) return null; // Or a spinner

  if (user && (location.pathname === "/" || location.pathname === "/login")) {
    if (user.role === 'Admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/feed" replace />;
  }

  return (
    <div className="min-h-screen text-slate-200">
      <BackgroundPattern />

      {/* SINGLE Navbar (transparent only on landing page) */}
      <Navbar transparent={isLandingPage} />

      {/* Optional: hide notice banner on landing page */}
      {!isLandingPage && <NoticeBanner />}

      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/feed"
          element={
            <PrivateRoute>
              <FeedPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/events"
          element={
            <PrivateRoute>
              <EventsPage />
            </PrivateRoute>
          }
        />

        <Route path="/questions" element={<QuestionListPage />} />
        <Route path="/questions/:id" element={<QuestionDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/ask"
          element={
            <PrivateRoute>
              <AskQuestionPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <ChatPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/post/:id"
          element={
            <PrivateRoute>
              <PostPage />
            </PrivateRoute>
          }
        />

        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPanelPage />
            </AdminRoute>
          }
        />
      </Routes>
    </div>
  );
}

/* -------------------- ROOT APP -------------------- */
export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
