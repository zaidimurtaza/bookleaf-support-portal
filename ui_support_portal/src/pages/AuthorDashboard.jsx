import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/TicketBadges";
import SkeletonRow from "@/components/SkeletonRow";
import { getBooks, getTickets } from "@/services/api";
import { BookOpen, Ticket, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthorDashboard() {
  const [books, setBooks] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const [b, t] = await Promise.all([getBooks(), getTickets()]);
      setBooks(b);
      setTickets(t);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchData(false);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Overview of your books and support tickets</p>
        </div>
        <Button onClick={() => navigate("/tickets/new")} className="gap-2 w-full sm:w-auto min-h-11">
          <Plus className="w-4 h-4" /> New Ticket
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-success-soft flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{books.length}</p>
              <p className="text-sm text-muted-foreground">Books</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-info-soft flex items-center justify-center">
              <Ticket className="w-4 h-4 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{tickets.length}</p>
              <p className="text-sm text-muted-foreground">Tickets</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Recent Tickets</h2>
          <button onClick={() => navigate("/tickets")} className="text-sm text-primary hover:underline font-medium">
            View all
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[400px]">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 sm:px-5 py-3 font-medium">Subject</th>
                <th className="px-4 sm:px-5 py-3 font-medium">Status</th>
                <th className="px-4 sm:px-5 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={3} />)
              ) : tickets.length === 0 ? (
                <tr><td colSpan={3} className="px-4 sm:px-5 py-8 text-center text-muted-foreground">No tickets yet</td></tr>
              ) : (
                tickets.slice(0, 5).map((t) => (
                  <tr
                    key={t.ticket_id}
                    onClick={() => navigate(`/tickets/${t.ticket_id}`)}
                    className="border-b border-border last:border-0 hover:bg-secondary/50 active:bg-secondary/70 cursor-pointer transition-default"
                  >
                    <td className="px-4 sm:px-5 py-4 font-medium text-foreground">{t.subject}</td>
                    <td className="px-4 sm:px-5 py-4"><StatusBadge status={t.status} /></td>
                    <td className="px-4 sm:px-5 py-4 text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
