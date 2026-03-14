"""Admin routes - ticket management"""
from fastapi import APIRouter, Depends
from typing import Optional
from app.auth import require_admin
from app.services import logic
from app.services.ai_service import generate_draft
from app.db import query

router = APIRouter()

@router.patch("/tickets/{ticket_id}")
def update_ticket(
    ticket_id: str, 
    status: Optional[str] = None, 
    category: Optional[str] = None, 
    priority: Optional[str] = None,
    user = Depends(require_admin)
):
    logic.update_ticket(ticket_id, status, category, priority)
    return {"message": "Updated"}

@router.get("/tickets/{ticket_id}/ai-draft")
def get_ai_draft(ticket_id: str, user = Depends(require_admin)):
    """Get AI draft - returns stored draft or regenerates if needed"""
    ticket = query("SELECT * FROM bookleaf.tickets WHERE ticket_id = %s", (ticket_id,), one=True)
    if not ticket:
        return {"error": "Not found"}, 404
    
    if ticket.get("ai_draft"):
        return {"draft": ticket["ai_draft"]}
    
    draft = generate_draft(ticket)
    query("UPDATE bookleaf.tickets SET ai_draft = %s WHERE ticket_id = %s", (draft, ticket_id))
    return {"draft": draft}

@router.get("/tickets/stats")
def get_ticket_stats(user = Depends(require_admin)):
    """Admin dashboard: open, in_progress, resolved, closed, high_priority counts"""
    return logic.get_ticket_stats()
