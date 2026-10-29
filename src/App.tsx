import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login/login";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard/Dashboard";
import Bookings from "./pages/Bookings/Bookings";
import Offers from "./pages/Offers/Offers";
import Invoices from "./pages/Invoices/Invoices";
import BookingDetails from "./pages/Bookings/BookingDetails";
import Settings from "./pages/Settings/Settings";
import { AuthProvider } from "./context/AuthProvider";
import PublicRoute from "./components/layout/PublicRoute";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import PackagesSettings from "./pages/Settings/PackagesSettings";
import KeyServicesSettings from "./pages/Settings/KeyServicesSettings";
import ProcessStepsSettings from "./pages/Settings/ProcessStepsSettings";
import DetailedStepsSettings from "./pages/Settings/DetailedStepsSettings";
import ReviewsSettings from "./pages/Settings/ReviewsSettings";
import FormOptionsSettings from "./pages/Settings/FormOptionsSettings";
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes — redirect to dashboard if already logged in */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Protected routes — all inside Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/bookings/:id" element={<BookingDetails />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/settings/packages" element={<PackagesSettings />} />
              <Route path="/settings/key-services" element={<KeyServicesSettings />} />
              <Route path="/settings/process-steps" element={<ProcessStepsSettings />} />
              <Route path="/settings/detailed-steps" element={<DetailedStepsSettings />} />
              <Route path="/settings/reviews" element={<ReviewsSettings />} />
              <Route path="/settings/form-options" element={<FormOptionsSettings />} />
            </Route>
          </Route>

          {/* Global fallback — works whether logged in or not */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;