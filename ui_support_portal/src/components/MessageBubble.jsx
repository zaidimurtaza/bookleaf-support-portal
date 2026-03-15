import React from "react";

export default function MessageBubble({ message, sender, date, isInternal, isMe = false }) {
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fade-in`}>
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 ${
          isInternal
            ? "bg-warning-soft border border-dashed border-accent"
            : isMe
            ? "bg-warning-soft border border-accent/50 text-foreground shadow-sm"
            : "bg-muted/80 border border-border text-foreground"
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-muted-foreground capitalize">{sender}</span>
          {isInternal && (
            <span className="text-[10px] font-semibold text-amber-foreground bg-accent/20 px-1.5 py-0.5 rounded">
              Internal
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          {new Date(date).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
