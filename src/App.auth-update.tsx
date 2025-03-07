import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { SimplifiedAuthProvider } from "./context/SimplifiedAuthProvider";

// Import your routes and components
import { PrivateRoute } from "./components/PrivateRoute";
// Import other components as needed

function App() {
  return (
    <SimplifiedAuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<RememberMeLogin />} />

          {/* Protected routes */}
          <Route
            path="/admin/*"
            element={
              <PrivateRoute>
                <AdminRoutes />
              </PrivateRoute>
            }
          />

          {/* Add other routes as needed */}
        </Routes>
      </Router>
    </SimplifiedAuthProvider>
  );
}

export default App;
