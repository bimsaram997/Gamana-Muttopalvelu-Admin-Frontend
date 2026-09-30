import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import Login from "./pages/Login/login"
import Layout from "./components/layout/Layout"
import Dashboard from "./pages/Dashboard/Dashboard"
import Bookings from "./pages/Bookings/Bookings"
import Offers from "./pages/Offers/Offers"
import Invoices from "./pages/Invoices/Invoices"
import Settings from "./pages/Settings/Settings"

function App() {
  return (
   <BrowserRouter>
    <Routes>
       {/* Public route */}
        <Route path="/login" element={<Login />} />
        {/* Protected routes — all inside Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/settings" element={<Settings />} />
          {/* Default redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
    </Routes>
   </BrowserRouter>
  )
}

export default App