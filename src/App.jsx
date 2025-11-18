// App.jsx - Updated with published website route
import { useSelector, useDispatch } from "react-redux";
import { Navigate, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { ToastContainer } from 'react-toastify';
import { setTheme } from "./slice/themeSlice";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import LandingPage from "./pages/LandingPage";
import { getCurrentUser } from "./slice/authSlice";
import LoaderPage from "./components/LoaderPage";
import LayOut from "./components/Layout";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import TemplatesPage from "./pages/TemplatesPage";
import UserWebsitesPage from "./pages/UserWebsitesPage";
import DomainManagementPage from "./pages/DomainManagementPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import WebsiteEditorPage from "./pages/WebsiteEditorPage";
import TemplatePreview from "./components/TemplatePreview";
import HTMLToJSONConverter from "./pages/HTMLToJSONConverter";
import PublishedWebsitePage from "./pages/PublishedWebsitePage"; // NEW

function App() {
  const { theme } = useSelector((state) => state.theme);
  const { user, globalLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const savedTheme = localStorage.getItem("webgen-theme") || "forest";
    document.documentElement.setAttribute('data-theme', savedTheme);
    dispatch(setTheme(savedTheme));
  }, [dispatch]);

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  const isAuthenticated = Boolean(user);

  if (globalLoading) {
    return <LoaderPage />;
  }

  return (
    <div className="h-screen" data-theme={theme}>
      <Routes>
        {/* ==================== PUBLIC ROUTES ==================== */}
        
        {/* Published Website - PUBLIC (no auth required) */}
        <Route path="/site/:slug" element={<PublishedWebsitePage />} />

        <Route
          path="/landing"
          element={
            isAuthenticated ? <LandingPage /> : <Navigate to="/login"/>
          }
        />

        {/* ==================== AUTH ROUTES ==================== */}
        
        <Route
          path="/signup"
          element={
            !isAuthenticated ? (
              <SignupPage/>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <LoginPage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* ==================== PROTECTED ROUTES ==================== */}
        
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <LayOut showSidebar={true}>
                <TemplatesPage/> 
              </LayOut>
            ) : (
              <Navigate to="/login"/>
            )
          } 
        />

        <Route 
          path="/user-websites" 
          element={
            isAuthenticated ? (
              <LayOut showSidebar={true}>
                <UserWebsitesPage />
              </LayOut>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        <Route 
          path="/domain/:websiteId" 
          element={
            isAuthenticated ? (
              <LayOut showSidebar={true}>
                <DomainManagementPage />
              </LayOut>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        <Route 
          path="/subscription/:websiteId" 
          element={
            isAuthenticated ? (
              <SubscriptionPage />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        <Route 
          path="/editor/:websiteId" 
          element={
            isAuthenticated ? (
              <WebsiteEditorPage />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        <Route 
          path="/preview/:templateId" 
          element={
            isAuthenticated ? (
              <TemplatePreview />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        <Route 
          path="/json-converter" 
          element={
            isAuthenticated ? (
              <HTMLToJSONConverter />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* ==================== 404 ROUTE ==================== */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">Page not found</p>
                <a
                  href="/"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Go Home
                </a>
              </div>
            </div>
          }
        />
      </Routes>

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}

export default App;