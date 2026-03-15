import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTickets } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { StatusBadge } from "@/components/TicketBadges";
import { MessageSquare } from "lucide-react";

function ChatListContent({
  ticketId,
  basePath,
  tickets,
  loading,
  onSelectTicket,
}) {
  return (
    <div className="flex-1 overflow-y-auto py-3 px-2">
      {loading ? (
        <div className="space-y-2 px-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <p className="px-3 py-4 text-sm text-muted-foreground">No tickets yet</p>
      ) : (
        <div className="space-y-0.5">
          {tickets.map((t) => (
            <button
              key={t.ticket_id}
              onClick={() => onSelectTicket(t.ticket_id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-default ${
                ticketId === t.ticket_id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <p className="font-medium truncate">{t.subject}</p>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={t.status} />
                <span className="text-[10px] text-muted-foreground">
                  {new Date(t.created_at).toLocaleDateString()}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChatListSidebar({ isAdmin: isAdminProp }) {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { isAdmin: authIsAdmin } = useAuth();
  const isAdmin = isAdminProp ?? authIsAdmin;
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTickets(isAdmin ? {} : undefined)
      .then((data) => setTickets(data))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, [isAdmin]);

  const basePath = isAdmin ? "/admin/tickets" : "/tickets";

  return (
    <>
      <aside className="hidden lg:flex fixed right-0 top-0 bottom-0 w-64 bg-card border-l border-border flex-col z-20">
        <div className="h-16 flex items-center gap-2 px-4 border-b border-border shrink-0">
          <MessageSquare className="w-5 h-5 text-muted-foreground" />
          <span className="font-semibold text-sm text-foreground">Chats</span>
        </div>
        <ChatListContent
          ticketId={ticketId}
          basePath={basePath}
          tickets={tickets}
          loading={loading}
          onSelectTicket={(id) => navigate(`${basePath}/${id}`)}
        />
      </aside>
    </>
  );
}
