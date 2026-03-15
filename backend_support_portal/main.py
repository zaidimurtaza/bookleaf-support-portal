"""Main FastAPI app"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from app.routes import author, admin
from app import auth
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s :-: %(name)s :-: %(levelname)s :-: %(message)s'
)

logger = logging.getLogger(__name__)

app = FastAPI(title="BookLeaf API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error = exc.errors()[0]["msg"]

    return JSONResponse(
        status_code=422,
        content={
            "status": False,
            "data": [],
            "message": error
        }
    )

class Login(BaseModel):
    email: EmailStr
    password: str

@app.post("/login")
def login(data: Login):
    return auth.login(data.email, data.password)

@app.get("/")
def root():
    return {"message": "BookLeaf API", "docs": "/docs"}

# Admin first so /tickets/stats matches before /tickets/{ticket_id}
app.include_router(admin.router, tags=["Admin"])
app.include_router(author.router, tags=["Author"])

