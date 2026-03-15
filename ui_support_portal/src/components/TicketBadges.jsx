import React from "react";

const statusStyles = {
  Open: "bg-info-soft text-info",
  "In Progress": "bg-warning-soft text-amber-foreground",
  Resolved: "bg-success-soft text-primary",
  Closed: "bg-secondary text-muted-foreground",
};

const priorityStyles = {
  Critical: "bg-destructive/10 text-destructive",
  High: "bg-warning-soft text-amber-foreground",
  Medium: "bg-info-soft text-info",
  Low: "bg-secondary text-muted-foreground",
};

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyles[status] || "bg-secondary text-muted-foreground"}`}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${priorityStyles[priority] || "bg-secondary text-muted-foreground"}`}>
      {priority}
    </span>
  );
}
