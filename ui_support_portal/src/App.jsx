import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginPage from "@/pages/LoginPage";
import AuthorDashboard from "@/pages/AuthorDashboard";
import AuthorTickets from "@/pages/AuthorTickets";
import AuthorBooks from "@/pages/AuthorBooks";
import CreateTicket from "@/pages/CreateTicket";
import TicketDetail from "@/pages/TicketDetail";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminTickets from "@/pages/AdminTickets";
import NotFound from "@/pages/NotFound";

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AuthRedirect() {
  const { isAuthenticated, isAdmin } = useAuth();
  if (isAuthenticated) return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;
  return <Navigate to="/login" replace />;
}

const App = () => (
  <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthRedirect />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Author routes */}
          <Route path="/dashboard" element={<ProtectedRoute><AuthorDashboard /></ProtectedRoute>} />
          <Route path="/tickets" element={<ProtectedRoute><AuthorTickets /></ProtectedRoute>} />
          <Route path="/tickets/new" element={<ProtectedRoute><CreateTicket /></ProtectedRoute>} />
          <Route path="/tickets/:ticketId" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
          <Route path="/books" element={<ProtectedRoute><AuthorBooks /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/tickets" element={<ProtectedRoute adminOnly><AdminTickets /></ProtectedRoute>} />
          <Route path="/admin/tickets/:ticketId" element={<ProtectedRoute adminOnly><TicketDetail /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
);

export default App;
