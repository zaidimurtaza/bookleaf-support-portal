import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getBooks } from "@/services/api";
import SkeletonRow from "@/components/SkeletonRow";

export default function AuthorBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBooks().then(setBooks).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">My Books</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your published books and royalty details</p>
      </div>

      <div className="grid gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
              <div className="h-5 bg-muted rounded w-1/3 mb-3" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          ))
        ) : books.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
            No books found
          </div>
        ) : (
          books.map((book) => (
            <div key={book.book_id} className="bg-card border border-border rounded-xl p-4 sm:p-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground text-base truncate">{book.title}</h3>
                  <p className="text-sm text-muted-foreground">ISBN: {book.isbn} · {book.genre}</p>
                </div>
                <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  book.status === "Published" ? "bg-success-soft text-primary" : "bg-warning-soft text-amber-foreground"
                }`}>
                  {book.status}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">MRP</p>
                  <p className="text-sm font-semibold text-foreground">₹{book.mrp}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Copies Sold</p>
                  <p className="text-sm font-semibold text-foreground">{book.total_copies_sold?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Royalty Paid</p>
                  <p className="text-sm font-semibold text-primary">₹{book.royalty_paid?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Royalty Pending</p>
                  <p className="text-sm font-semibold text-amber-foreground">₹{book.royalty_pending?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
