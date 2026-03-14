"""Author routes - books and tickets"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.auth import verify_token
from app.services import logic
from app.db import query

router = APIRouter()

class TicketCreate(BaseModel):
    book_id: Optional[str] = None
    subject: str
    description: str

class ResponseCreate(BaseModel):
    message: str
    is_internal: Optional[bool] = False  # Admin only

@router.get("/books")
def get_books(user = Depends(verify_token)):
    return logic.get_books(user["sub"], user["role"] == "admin")

@router.post("/tickets")
def create_ticket(data: TicketCreate, user = Depends(verify_token)):
    return logic.create_ticket(user["sub"], data.book_id, data.subject, data.description)

@router.get("/tickets")
def get_tickets(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    user = Depends(verify_token)
):
    author_id = None if user["role"] == "admin" else user["sub"]
    # Filters only apply for admin
    if user["role"] != "admin":
        status = priority = category = None
    return logic.get_tickets(author_id, status, priority, category)

@router.get("/tickets/{ticket_id}")
def get_ticket(ticket_id: str, user = Depends(verify_token)):
    author_id = None if user["role"] == "admin" else user["sub"]
    ticket = logic.get_ticket_detail(ticket_id, author_id)
    if not ticket:
        return {"error": "Not found"}, 404
    return ticket

@router.post("/tickets/{ticket_id}/responses")
def add_response(ticket_id: str, data: ResponseCreate, user = Depends(verify_token)):
    if user["role"] == "author":
        ticket = query("SELECT author_id FROM bookleaf.tickets WHERE ticket_id = %s", (ticket_id,), one=True)
        if not ticket or ticket["author_id"] != user["sub"]:
            raise HTTPException(403, "Not authorized")
        is_internal = False
    else:
        is_internal = data.is_internal
    logic.add_response(ticket_id, user["id"], data.message, is_internal=is_internal, is_author_reply=(user["role"] == "author"))
    return {"message": "Response added"}
