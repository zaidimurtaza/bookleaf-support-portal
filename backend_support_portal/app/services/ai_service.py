"""AI service for classification and draft generation"""
import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

GEMINI_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_KEY:
    client = genai.Client(api_key=GEMINI_KEY)

 # BookLeaf Knowledge Base (from assignment PDF)
knowledge_base = """
BOOKLEAF KNOWLEDGE BASE:

Royalty Policy:
- 80/20 split: 80% of net profit to author, 20% to BookLeaf
- Net profit = MRP minus printing cost, platform commission (Amazon/Flipkart), and shipping
- Calculated quarterly, paid within 45 days of quarter end
- Minimum payout threshold: ₹1,000 (rolls over if below)
- Paid via bank transfer to linked account

ISBN Policy:
- Every book gets unique ISBN from BookLeaf
- Registered under BookLeaf's imprint
- ISBN errors are high-priority, escalated to production team immediately

Printing & Quality:
- In-house printing in Delhi, partners: Repro India, Epitome Books
- Standard turnaround: 5-7 business days
- Quality issues: Free reprint after verification (author shares photos)

Distribution:
- Listed on: Amazon India, Flipkart, Amazon US, Amazon UK, BookLeaf Store
- New listings live in 7-10 business days
- "Unavailable" = stock sync issue, re-sync within 24-48 hours

Production Stages:
Manuscript → Editing → Cover Design → Typesetting → Proofreading → ISBN → Printing → Distribution → Published

Communication Tone:
- Empathetic and professional - authors are partners
- Acknowledge concern before solutions
- Be specific with numbers, dates, statuses
- Own mistakes directly, no deflection
- Give clear timelines (e.g., "48 hours") not vague promises
- Always end with clear next step
"""
        

def classify_ticket(subject: str, description: str):
    """Classify ticket into category and priority using AI"""
    if not GEMINI_KEY:
        print("GEMINI_KEY not found")
        return {"category": "General Inquiry", "priority": "Medium"}
    
    try:
        prompt = f"""Classify this BookLeaf support ticket.

CATEGORIES:
1. Royalty & Payments - Payment delays, royalty amounts, payout issues
2. ISBN & Metadata Issues - ISBN errors, duplicate ISBNs, wrong book data
3. Printing & Quality - Print defects, binding issues, color problems
4. Distribution & Availability - Book unavailable, platform listing issues
5. Book Status & Production Updates - Production delays, status inquiries
6. General Inquiry - Other questions

PRIORITY RULES:
- Critical: Missing royalties 6+ months, ISBN errors, severe quality defects
- High: Payment delays, availability issues, production delays beyond normal
- Medium: Status questions, metadata updates, timeline inquiries
- Low: General info requests, minor updates

Ticket:
Subject: {subject}
Description: {description}

Respond with JSON only: {{"category": "...", "priority": "..."}}"""

        
        result = client.models.generate_content(model='gemini-2.5-flash-lite', contents=prompt,
                                            config=types.GenerateContentConfig(
                                                response_mime_type="application/json"))
        
        text = result.text.strip()
        
        # Clean JSON response
        if text.startswith('```json'):
            text = text[7:-3].strip()
        elif text.startswith('```'):
            text = text[3:-3].strip()
        
        ai_result = json.loads(text)
        return {
            "category": ai_result.get("category", "General Inquiry"),
            "priority": ai_result.get("priority", "Medium")
        }
    except Exception as e:
        # Graceful fallback
        print(f"Error: ", e)
        return {"category": "General Inquiry", "priority": "Medium"}

def generate_draft(ticket: dict):
    """Generate AI draft response using BookLeaf Knowledge Base"""
    if not GEMINI_KEY:
        return "AI not configured"
    
    try:
       
        # Build conversation context if follow-up (has responses)
        conversation = ""
        if ticket.get('responses'):
            for r in ticket['responses'][:-5]:
                role = "Admin (internal)" if r.get('is_internal') else ("Author" if r.get('role') == 'author' else "Admin")
                conversation += f"\n{role}: {r['message']}\n"
        
        regenrate_draft = ticket.get('ai_draft', '')
        prompt = f"""{knowledge_base}

You are a BookLeaf support representative. Generate a professional, empathetic response (150-200 words) the more short and concise the better.

Ticket:
Subject: {ticket['subject']}
Description: {ticket['description']}
Category: {ticket.get('category', 'General Inquiry')}
Priority: {ticket.get('priority', 'Medium')}

 
"""
        
        if regenrate_draft:
            prompt += f"""
Previous response to regenerate: make a better version than it with more context and information. short and concise.
You need to generate more better polished versionthan pevious response. |
``
{regenrate_draft}
``
"""
        if conversation:
            prompt += f"""
Full conversation history:
{conversation}

Generate a response that addresses the author's latest message and continues the conversation appropriately.
"""
        else:
            prompt += """
Instructions:
1. Acknowledge the author's concern first
2. Use the knowledge base to provide accurate information
3. Be specific with timelines and next steps
4. Match BookLeaf's professional yet warm tone
5. End with a clear action item

Generate the response:
"""
        
        result = client.models.generate_content(model='gemini-2.5-flash', 
                                            contents=prompt
                                            )
        return result.text.strip()
    except Exception as e:
        return f"Error generating draft: {str(e)}"


if __name__ == "__main__":
    print(classify_ticket("I haven't received my royalty payment", "I have not received my royalty payment for the last quarter. I have checked my bank account and it shows that the payment has not been made.")) # expected output: {"category": "Royalty & Payments", "priority": "Critical"}
    # print(generate_draft({"subject": "I haven't received my royalty payment", "description": "I have not received my royalty payment for the last quarter. I have checked my bank account and it shows that the payment has not been made."}))