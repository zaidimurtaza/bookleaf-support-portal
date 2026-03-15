import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { StatusBadge, PriorityBadge } from "@/components/TicketBadges";
import SkeletonRow from "@/components/SkeletonRow";
import { getTickets } from "@/services/api";
import { Search } from "lucide-react";

const STATUS_OPTIONS = ["All", "Open", "In Progress", "Resolved", "Closed"];
const PRIORITY_OPTIONS = ["All", "Critical", "High", "Medium", "Low"];

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchTickets = async () => {
    setLoading(true);
    const filters = {};
    if (statusFilter !== "All") filters.status = statusFilter;
    if (priorityFilter !== "All") filters.priority = priorityFilter;
    try {
      const data = await getTickets(filters);
      setTickets(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter]);

  const filtered = tickets.filter((t) =>
    !search || t.subject?.toLowerCase().includes(search.toLowerCase()) || t.ticket_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">All Tickets</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage all support tickets</p>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets..."
            className="min-h-[44px] h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-default w-full sm:w-56"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-default"
        >
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>)}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-default"
        >
          {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p === "All" ? "All Priorities" : p}</option>)}
        </select>
      </div>

      <div className="bg-card border border-border rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Subject</th>
                <th className="px-5 py-3 font-medium">Author</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Priority</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">No tickets found</td></tr>
              ) : (
                filtered.map((t) => (
                  <tr
                    key={t.ticket_id}
                    onClick={() => navigate(`/admin/tickets/${t.ticket_id}`)}
                    className="border-b border-border last:border-0 hover:bg-secondary/50 active:bg-secondary/70 cursor-pointer transition-default"
                  >
                    <td className="px-5 py-4 text-muted-foreground font-mono text-xs">{t.ticket_id}</td>
                    <td className="px-5 py-4 font-medium text-foreground">{t.subject}</td>
                    <td className="px-5 py-4 text-muted-foreground">{t.author_id}</td>
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
