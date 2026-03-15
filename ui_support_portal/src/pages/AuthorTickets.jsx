import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/TicketBadges";
import SkeletonRow from "@/components/SkeletonRow";
import { getTickets } from "@/services/api";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthorTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTickets = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const data = await getTickets();
      setTickets(data);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchTickets(false);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">My Tickets</h1>
          <p className="text-sm text-muted-foreground mt-0.5">All your support tickets</p>
        </div>
        <Button onClick={() => navigate("/tickets/new")} className="gap-2 w-full sm:w-auto min-h-11">
          <Plus className="w-4 h-4" /> New Ticket
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl">
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
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={3} />)
              ) : tickets.length === 0 ? (
                <tr><td colSpan={3} className="px-4 sm:px-5 py-8 text-center text-muted-foreground">No tickets yet. Create one!</td></tr>
              ) : (
                tickets.map((t) => (
                  <tr
                    key={t.ticket_id}
                    onClick={() => navigate(`/tickets/${t.ticket_id}`)}
                    className="border-b border-border last:border-0 hover:bg-secondary/50 active:bg-secondary/70 cursor-pointer transition-default min-h-[44px]"
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
