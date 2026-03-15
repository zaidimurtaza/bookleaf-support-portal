import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import ChatListSidebar from "@/components/ChatListSidebar";
import MessageBubble from "@/components/MessageBubble";
import { StatusBadge, PriorityBadge } from "@/components/TicketBadges";
import { getTicketDetail, addResponse, getAiDraft, updateTicket } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Send, Sparkles, RefreshCw, ChevronDown } from "lucide-react";

export default function TicketDetail() {
  const { ticketId } = useParams();
  const { isAdmin, user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [draftRefreshing, setDraftRefreshing] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [metaUpdating, setMetaUpdating] = useState(false);
  const [draftExpanded, setDraftExpanded] = useState(false);

  const CATEGORIES = ["Royalty & Payments", "ISBN & Metadata Issues", "Printing & Quality", "Distribution & Availability", "Book Status & Production Updates", "General Inquiry"];
  const PRIORITIES = ["Critical", "High", "Medium", "Low"];
  const [useTextarea, setUseTextarea] = useState(false);
  const [isInternal, setIsInternal] = useState(false);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const prevResponseCountRef = useRef(0);

  const fetchTicket = async () => {
    if (!ticketId) return;
    try {
      const data = await getTicketDetail(ticketId);
      setTicket(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    prevResponseCountRef.current = 0;
    fetchTicket();
  }, [ticketId]);

  useEffect(() => {
    const count = ticket?.responses?.length ?? 0;
    if (count > prevResponseCountRef.current) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      prevResponseCountRef.current = count;
    } else {
      prevResponseCountRef.current = count;
    }
  }, [ticket?.responses]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchTicket();
    }, 10000);
    return () => clearInterval(interval);
  }, [ticketId]);

  const handleSend = async () => {
    if (!message.trim() || !ticketId) return;
    setSending(true);
    try {
      await addResponse(ticketId, message, isAdmin ? isInternal : false);
      setMessage("");
      setIsInternal(false);
      setUseTextarea(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      await fetchTicket();
    } catch {
    } finally {
      setSending(false);
    }
  };

  const handleRefreshDraft = async () => {
    if (!ticketId || !isAdmin) return;
    setDraftRefreshing(true);
    try {
      await getAiDraft(ticketId);
      await fetchTicket();
    } catch {
    } finally {
      setDraftRefreshing(false);
    }
  };

  const handleUseAiDraft = () => {
    setMessage(ticket?.ai_draft || "");
    setUseTextarea(true);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        textareaRef.current.focus();
      }
    }, 50);
  };

  const handleTextareaInput = (e) => {
    setMessage(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const handleStatusChange = async (newStatus) => {
    if (!ticketId) return;
    setStatusUpdating(true);
    try {
      await updateTicket(ticketId, { status: newStatus });
      await fetchTicket();
    } catch {
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleCategoryChange = async (e) => {
    const category = e.target.value;
    if (!ticketId || !category) return;
    setMetaUpdating(true);
    try {
      await updateTicket(ticketId, { category });
      await fetchTicket();
    } catch {
    } finally {
      setMetaUpdating(false);
    }
  };

  const handlePriorityChange = async (e) => {
    const priority = e.target.value;
    if (!ticketId || !priority) return;
    setMetaUpdating(true);
    try {
      await updateTicket(ticketId, { priority });
      await fetchTicket();
    } catch {
    } finally {
      setMetaUpdating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <ChatListSidebar isAdmin={isAdmin} />
        <div className="lg:mr-64 animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </DashboardLayout>
    );
  }

  if (!ticket) {
    return (
      <DashboardLayout>
        <ChatListSidebar isAdmin={isAdmin} />
        <div className="lg:mr-64">
          <p className="text-muted-foreground">Ticket not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const messages = [
    {
      message: ticket.description,
      sender: "author",
      date: ticket.created_at,
      isInternal: false,
      isMe: !isAdmin,
    },
    ...(ticket.responses || []).map((r) => {
      const fromCurrentUser = user?.id && r.responder_id === user.id;
      return {
        message: r.message,
        sender: fromCurrentUser ? (isAdmin ? "admin" : "author") : isAdmin ? "author" : "admin",
        date: r.created_at,
        isInternal: r.is_internal ?? false,
        isMe: fromCurrentUser ?? false,
      };
    }),
  ];

  return (
    <DashboardLayout>
      <ChatListSidebar isAdmin={isAdmin} />
      <div className="lg:mr-64 flex flex-col min-h-[calc(100vh-12rem)] md:min-h-[calc(100vh-4rem)]">
        <div className="bg-card border border-border rounded-xl p-4 mb-3 animate-fade-in shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg font-bold text-foreground truncate">{ticket.subject}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {ticket.ticket_id} · Created {new Date(ticket.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <StatusBadge status={ticket.status} />
              {ticket.priority && <PriorityBadge priority={ticket.priority} />}
              {ticket.category && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground">
                  {ticket.category}
                </span>
              )}
            </div>
          </div>

          {isAdmin && (
            <div className="flex flex-col gap-3 mt-3 pt-3 border-t border-border">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground mr-2 w-full sm:w-auto">Update status:</span>
                {["Open", "In Progress", "Resolved", "Closed"].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={statusUpdating || ticket.status === s}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-default ${
                      ticket.status === s
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/40 ring-offset-2 ring-offset-card"
                        : "bg-secondary text-secondary-foreground hover:bg-muted"
                    } ${statusUpdating && ticket.status !== s ? "opacity-50" : ""}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground shrink-0">Category:</label>
                  <select
                    value={CATEGORIES.includes(ticket.category) ? ticket.category : "General Inquiry"}
                    onChange={handleCategoryChange}
                    disabled={metaUpdating}
                    className="text-xs h-8 px-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground shrink-0">Priority:</label>
                  <select
                    value={PRIORITIES.includes(ticket.priority) ? ticket.priority : "Medium"}
                    onChange={handlePriorityChange}
                    disabled={metaUpdating}
                    className="text-xs h-8 px-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 min-h-0">
            <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((m, i) => (
              <MessageBubble
                key={i}
                message={m.message}
                sender={m.sender}
                date={m.date}
                isInternal={m.isInternal}
                isMe={m.isMe}
              />
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>
        <div className="border-t border-border shrink-0">
          {isAdmin && (
            <div className="px-4 pt-2.5 pb-1">
              <div className="max-w-3xl mx-auto">
                <button
                  onClick={() => setDraftExpanded(!draftExpanded)}
                  className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-accent/10 hover:bg-accent/20 transition-default"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-foreground" />
                    <span className="text-xs font-semibold text-amber-foreground">AI Suggested Reply</span>
                    {ticket.ai_status === "processing" && !ticket.ai_draft && (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground ml-1">
                        <RefreshCw className="w-3 h-3 animate-spin" /> AI is generating…
                      </span>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${draftExpanded ? "rotate-180" : ""}`} />
                </button>

                {draftExpanded && (
                  <div className="mt-2 bg-warning-soft border border-dashed border-accent rounded-xl p-4 animate-fade-in">
                    <div className="flex items-center justify-end gap-2 mb-2">
                      <button
                        onClick={handleRefreshDraft}
                        disabled={draftRefreshing}
                        className="text-xs text-muted-foreground hover:text-foreground transition-default flex items-center gap-1 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${draftRefreshing ? "animate-spin" : ""}`} /> Refresh
                      </button>
                      <button
                        onClick={handleUseAiDraft}
                        disabled={!ticket.ai_draft}
                        className="text-xs font-medium text-primary hover:underline transition-default disabled:opacity-40"
                      >
                        Use this draft ↓
                      </button>
                    </div>
                    {draftRefreshing ? (
                      <div className="space-y-2">
                        <div className="h-3 bg-accent/20 rounded animate-pulse w-full" />
                        <div className="h-3 bg-accent/20 rounded animate-pulse w-3/4" />
                        <div className="h-3 bg-accent/20 rounded animate-pulse w-1/2" />
                      </div>
                    ) : ticket.ai_status === "processing" && !ticket.ai_draft ? (
                      <div className="flex items-center gap-2 py-3 justify-center">
                        <RefreshCw className="w-4 h-4 text-muted-foreground animate-spin" />
                        <span className="text-sm text-muted-foreground">AI is processing your draft response…</span>
                      </div>
                    ) : ticket.ai_draft ? (
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{ticket.ai_draft}</p>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="p-3">
            {isAdmin && (
              <div className="max-w-3xl mx-auto mb-2">
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded border-input"
                  />
                  <span className="text-xs text-muted-foreground">Internal note (visible only to admins)</span>
                </label>
              </div>
            )}
            <div className="max-w-3xl mx-auto flex gap-2 sm:gap-3 items-end">
              {useTextarea ? (
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={handleTextareaInput}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type your reply..."
                  rows={2}
                  className="flex-1 min-h-[40px] max-h-[200px] px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-default resize-none overflow-y-auto"
                />
              ) : (
                <input
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (e.target.value.includes("\n")) setUseTextarea(true);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Type your reply..."
                  className="flex-1 h-10 px-4 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-default"
                />
              )}
              <Button onClick={handleSend} disabled={sending || !message.trim()} className="gap-2 px-4 sm:px-5 min-h-[44px] h-10 shrink-0">
                <Send className="w-4 h-4" />
                {sending ? "Sending" : "Send"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
