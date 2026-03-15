import React from "react";

const accentMap = {
  primary: "bg-success-soft text-primary",
  warning: "bg-warning-soft text-amber-foreground",
  info: "bg-info-soft text-info",
  destructive: "bg-destructive/10 text-destructive",
};

export default function StatCard({ label, value, icon, accent = "primary" }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accentMap[accent]}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}
