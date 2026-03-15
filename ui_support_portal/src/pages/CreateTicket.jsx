import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { getBooks, createTicket } from "@/services/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CreateTicket() {
  const [books, setBooks] = useState([]);
  const [bookId, setBookId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getBooks().then(setBooks).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createTicket({
        book_id: bookId || undefined,
        subject,
        description,
      });
      navigate("/tickets");
    } catch (err) {
      setError(err.message || "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-default">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="max-w-2xl">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">Create Support Ticket</h1>
        <p className="text-sm text-muted-foreground mb-6">Describe your issue and we'll get back to you shortly</p>

        <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Book (optional)</label>
              <select
                value={bookId}
                onChange={(e) => setBookId(e.target.value)}
                className="w-full min-h-[44px] h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-default"
              >
                <option value="">General / Account Level</option>
                {books.map((b) => (
                  <option key={b.book_id} value={b.book_id}>{b.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                required
                className="w-full min-h-[44px] h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-default"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details about your issue..."
                required
                rows={5}
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-default resize-none"
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</div>
            )}

            <Button type="submit" disabled={loading} className="w-full min-h-[44px] h-10">
              {loading ? "Creating..." : "Submit Ticket"}
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
