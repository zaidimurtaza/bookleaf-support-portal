import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { StatusBadge, PriorityBadge } from "@/components/TicketBadges";
import SkeletonRow from "@/components/SkeletonRow";
import { getTickets, getTicketStats } from "@/services/api";
import { Ticket, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const [s, t] = await Promise.all([getTicketStats(), getTickets()]);
      setStats(s);
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Ticket overview and management</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Open"
          value={stats?.open ?? "—"}
          icon={<Ticket className="w-4 h-4" />}
          accent="info"
        />
        <StatCard
          label="In Progress"
          value={stats?.in_progress ?? "—"}
          icon={<Clock className="w-4 h-4" />}
          accent="warning"
        />
        <StatCard
          label="Resolved"
          value={stats?.resolved ?? "—"}
          icon={<CheckCircle className="w-4 h-4" />}
          accent="primary"
        />
        <StatCard
          label="High Priority"
          value={stats?.high_priority ?? "—"}
          icon={<AlertTriangle className="w-4 h-4" />}
          accent="destructive"
        />
      </div>

      <div className="bg-card border border-border rounded-xl">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Recent Tickets</h2>
          <button onClick={() => navigate("/admin/tickets")} className="text-sm text-primary hover:underline font-medium">
            View all
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Subject</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Priority</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
              ) : (
                tickets.slice(0, 8).map((t) => (
                  <tr
                    key={t.ticket_id}
                    onClick={() => navigate(`/admin/tickets/${t.ticket_id}`)}
                    className="border-b border-border last:border-0 hover:bg-secondary/50 cursor-pointer transition-default"
                  >
                    <td className="px-5 py-4 text-muted-foreground font-mono text-xs">{t.ticket_id}</td>
                    <td className="px-5 py-4 font-medium text-foreground">{t.subject}</td>
                    <td className="px-5 py-4 text-muted-foreground">{t.category || "—"}</td>
                    <td className="px-5 py-4">{t.priority ? <PriorityBadge priority={t.priority} /> : "—"}</td>
                    <td className="px-5 py-4"><StatusBadge status={t.status} /></td>
                    <td className="px-5 py-4 text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</td>
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
