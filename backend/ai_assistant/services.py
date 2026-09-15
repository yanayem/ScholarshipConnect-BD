import os
import re
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

def _call_groq(prompt: str) -> str | None:
    """
    Calls Groq Chat Completions API using the exact implementation 
    from the provided technical documentation.
    """
    keys = [
        os.getenv("GROQ_API_KEY"),
        os.getenv("GROQ_API_KEY_2"),
        os.getenv("GROQ_API_KEY_3")
    ]
    valid_keys = [k for k in keys if k]
    if not valid_keys: return None

    # Models prioritized from your documentation (Production > Preview)
    models = [
        "llama-3.3-70b-versatile", # Production
        "llama-3.1-8b-instant",    # Production
        "qwen/qwen3.6-27b",        # Preview
        "mixtral-8x7b-32768",      # Reliable Fallback
    ]

    try:
        from groq import Groq
    except Exception:
        logger.error("[Groq] Library not found. Install via: pip install groq")
        return None

    for idx, key in enumerate(valid_keys):
        try:
            client = Groq(api_key=key)
            for model in models:
                try:
                    # EXACT implementation from the documentation provided
                    chat_completion = client.chat.completions.create(
                        messages=[
                            {
                                "role": "system",
                                "content": "You are a professional scholarship consultant for Bangladeshi students. Be encouraging and provide accurate info."
                            },
                            {
                                "role": "user",
                                "content": prompt,
                            }
                        ],
                        model=model,
                        temperature=0.6,
                        max_tokens=2048,
                    )
                    
                    response_text = chat_completion.choices[0].message.content
                    if response_text:
                        logger.info(f"[Groq] Key {idx+1} success with {model}")
                        return response_text
                except Exception as model_err:
                    err = str(model_err)
                    # If model is not accessible, move to next model
                    if "404" in err or "model_not_found" in err or "decommissioned" in err:
                        logger.warning(f"[Groq] Model {model} unavailable. Trying next...")
                        continue
                    # If rate limited or quota error, move to NEXT KEY
                    if "429" in err or "quota" in err or "401" in err:
                        logger.warning(f"[Groq] Key {idx+1} reached limit. Switching keys...")
                        break 
                    logger.error(f"[Groq] Unexpected error with model {model}: {err}")
                    continue
        except Exception as key_err:
            logger.error(f"[Groq] Key {idx+1} setup failed: {str(key_err)}")
            
    return None

def _call_gemini(prompt: str) -> str | None:
    """Backup using Google Gemini Flash 1.5/2.0"""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or not api_key.startswith("AIza"): return None
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(model="gemini-1.5-flash", contents=prompt)
        return response.text
    except Exception:
        return None

class AIService:
    @classmethod
    def _call_ai(cls, prompt: str) -> str:
        # Step 1: Force attempt with Groq (3 Keys x 4 Models)
        result = _call_groq(prompt)
        if result:
            # Strip reasoning block for cleaner UI
            return re.sub(r'<think>.*?</think>', '', result, flags=re.DOTALL).strip()

        # Step 2: Gemini fallback
        result = _call_gemini(prompt)
        if result: return result

        return "ScholarAI system is currently refreshing. This happens during high traffic. Please retry your question."

    @classmethod
    def live_support(cls, message, chat_history=None):
        msg_clean = message.lower().strip()
        if msg_clean in ['hi', 'hello', 'hey']:
            return "Hello! I am your ScholarshipConnect Assistant. How can I help you today?"
        
        history_str = ""
        if chat_history:
            history_str = "\n".join(chat_history[-4:])
        
        prompt = f"Previous Context:\n{history_str}\n\nStudent Question: {message}\nAssistant:"
        return cls._call_ai(prompt)

    @classmethod
    def write_sop(cls, user_profile, scholarship_details):
        prompt = (
            f"Generate a professional SOP for {user_profile.full_name}. "
            f"Scholarship: {scholarship_details['title']}. CGPA: {user_profile.cgpa}."
        )
        return cls._call_ai(prompt)
