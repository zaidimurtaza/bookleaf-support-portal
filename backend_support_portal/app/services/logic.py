"""Business logic for tickets and books"""
import uuid
from app.db import query
from app.background import run_in_background

# Fields hidden from authors (admin-only)
AUTHOR_HIDDEN_FIELDS = {"ai_draft", "priority", "category", "assigned_to", "ai_status"}

def _sanitize_for_author(ticket: dict) -> dict:
    """Remove internal/admin-only fields from ticket for author view"""
    return {k: v for k, v in ticket.items() if k not in AUTHOR_HIDDEN_FIELDS}

def _sanitize_tickets_for_author(tickets: list) -> list:
    """Sanitize list of tickets for author view"""
    return [_sanitize_for_author(t) for t in tickets]

def _add_ai_status(tickets: list) -> list:
    """Add ai_status: completed if ai_draft exists, else processing"""
    for t in tickets:
        t["ai_status"] = "completed" if t.get("ai_draft") else "processing"
    return tickets

def get_books(user_id: str, is_admin: bool):
    if is_admin:
        return query("SELECT * FROM bookleaf.books")
    return query("SELECT * FROM bookleaf.books WHERE author_id = %s", (user_id,))

def create_ticket(author_id: str, book_id: str, subject: str, description: str):
    ticket_id = f"TKT{uuid.uuid4().hex[:8].upper()}"
    
    # Create ticket immediately with default values
    query(
        "INSERT INTO bookleaf.tickets (ticket_id, author_id, book_id, subject, description, status, category, priority) VALUES (%s, %s, %s, %s, %s, 'Open', 'General Inquiry', 'Medium')",
        (ticket_id, author_id, book_id, subject, description)
    )
    
    # Process AI in background using thread pool (limited to 5 workers)
    def process_ai():
        from app.services.ai_service import classify_ticket, generate_draft
        
        # AI Classification
        classification = classify_ticket(subject, description)
        
        # Generate AI draft
        ticket_for_draft = {
            "ticket_id": ticket_id,
            "subject": subject,
            "description": description,
            "category": classification["category"],
            "priority": classification["priority"]
        }
        ai_draft = generate_draft(ticket_for_draft)
        
        # Update ticket with AI results
        query(
            "UPDATE bookleaf.tickets SET category = %s, priority = %s, ai_draft = %s WHERE ticket_id = %s",
            (classification["category"], classification["priority"], ai_draft, ticket_id)
        )
    
    # Submit to background thread pool (no thread explosion!)
    run_in_background(process_ai)
    
    # Return immediately
    return {
        "ticket_id": ticket_id, 
        "status": "Open",
        "message": "Ticket created. AI processing in background."
    }

def get_tickets(author_id: str = None, status: str = None, priority: str = None, category: str = None):
    if author_id:
        tickets = query("SELECT * FROM bookleaf.tickets WHERE author_id = %s ORDER BY created_at DESC", (author_id,))
        return _sanitize_tickets_for_author(_add_ai_status(tickets))
    # Admin: apply filters
    sql = "SELECT * FROM bookleaf.tickets WHERE 1=1"
    params = []
    if status:
        sql += " AND status = %s"
        params.append(status)
    if priority:
        sql += " AND priority = %s"
        params.append(priority)
    if category:
        sql += " AND category = %s"
        params.append(category)
    sql += " ORDER BY created_at DESC"
    tickets = query(sql, tuple(params) if params else None)
    return _add_ai_status(tickets)

def get_ticket_detail(ticket_id: str, author_id: str = None):
    ticket = query("SELECT * FROM bookleaf.tickets WHERE ticket_id = %s", (ticket_id,), one=True)
    if not ticket:
        return None
    
    if author_id and ticket["author_id"] != author_id:
        return None
    
    responses = query("SELECT * FROM bookleaf.ticket_responses WHERE ticket_id = %s ORDER BY created_at", (ticket_id,))
    if author_id:
        responses = [r for r in responses if not r["is_internal"]]
    
    result = {**ticket, "responses": responses}
    result["ai_status"] = "completed" if result.get("ai_draft") else "processing"
    if author_id:
        result = _sanitize_for_author(result)
    return result

def update_ticket(ticket_id: str, status: str = None, category: str = None, priority: str = None):
    updates = []
    params = []
    if status:
        updates.append("status = %s")
        params.append(status)
    if category:
        updates.append("category = %s")
        params.append(category)
    if priority:
        updates.append("priority = %s")
        params.append(priority)
    
    if updates:
        params.append(ticket_id)
        query(f"UPDATE bookleaf.tickets SET {', '.join(updates)} WHERE ticket_id = %s", tuple(params))

def _trigger_ai_on_author_reply(ticket_id: str, author_message: str):
    """When author replies, re-run AI with full conversation context"""
    def process():
        ticket = query("SELECT * FROM bookleaf.tickets WHERE ticket_id = %s", (ticket_id,), one=True)
        if not ticket:
            return
        # Fetch full conversation (includes the follow-up we just added)
        responses = query("""
            SELECT tr.message, tr.is_internal, u.role
            FROM bookleaf.ticket_responses tr
            JOIN bookleaf.users u ON tr.responder_id = u.id
            WHERE tr.ticket_id = %s
            ORDER BY tr.created_at
        """, (ticket_id,))
        from app.services.ai_service import generate_draft
        ctx = {**ticket, "responses": responses}
        draft = generate_draft(ctx)
        query("UPDATE bookleaf.tickets SET ai_draft = %s WHERE ticket_id = %s", (draft, ticket_id))
    run_in_background(process)

def get_ticket_stats():
    """Admin dashboard stats"""
    row = query("""
        SELECT 
            COUNT(*) FILTER (WHERE status = 'Open') as open,
            COUNT(*) FILTER (WHERE status = 'In Progress') as in_progress,
            COUNT(*) FILTER (WHERE status = 'Resolved') as resolved,
            COUNT(*) FILTER (WHERE status = 'Closed') as closed,
            COUNT(*) FILTER (WHERE priority = 'High' OR priority = 'Critical') as high_priority
        FROM bookleaf.tickets
    """, one=True)
    return dict(row) if row else {}

def add_response(ticket_id: str, responder_id: int, message: str, is_internal: bool, is_author_reply: bool = False):
    query(
        "INSERT INTO bookleaf.ticket_responses (ticket_id, responder_id, message, is_internal) VALUES (%s, %s, %s, %s)",
        (ticket_id, responder_id, message, is_internal)
    )
    if is_author_reply:
        query("UPDATE bookleaf.tickets SET status = 'Open', ai_draft = NULL WHERE ticket_id = %s", (ticket_id,))
        _trigger_ai_on_author_reply(ticket_id, message)
