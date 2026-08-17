import os
import re
import time
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Provider: Groq  (Primary — free tier, generous limits)
# Models: llama-3.3-70b-versatile > llama-3.1-8b-instant > mixtral-8x7b-32768
# ---------------------------------------------------------------------------
def _call_groq(prompt: str) -> str | None:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None

    try:
        from groq import Groq
    except ImportError:
        logger.warning("[AIService] groq package not installed.")
        return None

    groq_models = [
        "qwen/qwen3.6-27b",
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "mixtral-8x7b-32768",
        "gemma2-9b-it",
    ]

    client = Groq(api_key=api_key)

    for model in groq_models:
        for attempt in range(3):
            try:
                response = client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=2048,
                    temperature=0.7,
                )
                return response.choices[0].message.content
            except Exception as e:
                err = str(e)
                # 429 rate limit → backoff then try next model
                if "429" in err or "rate_limit" in err.lower() or "quota" in err.lower():
                    if attempt < 2:
                        wait = 5 * (3 ** attempt)  # 5s, 15s
                        logger.warning(f"[Groq] Rate limit on {model} (attempt {attempt+1}). Waiting {wait}s...")
                        time.sleep(wait)
                    else:
                        logger.warning(f"[Groq] Giving up on {model}. Trying next model.")
                    break
                else:
                    logger.error(f"[Groq] Non-quota error on {model}: {err}")
                    break

    logger.error("[Groq] All models exhausted.")
    return None


# ---------------------------------------------------------------------------
# Provider: Google Gemini  (Fallback)
# ---------------------------------------------------------------------------
def _call_gemini(prompt: str) -> str | None:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    try:
        from google import genai
    except ImportError:
        logger.warning("[AIService] google-genai package not installed.")
        return None

    gemini_models = [
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-1.5-flash",
        "gemini-1.5-flash-8b",
    ]

    client = genai.Client(api_key=api_key)

    for model in gemini_models:
        for attempt in range(2):
            try:
                response = client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config={"temperature": 0.7, "max_output_tokens": 2048},
                )
                return response.text
            except Exception as e:
                err = str(e)
                if "429" in err or "RESOURCE_EXHAUSTED" in err or "quota" in err.lower():
                    if attempt < 1:
                        logger.warning(f"[Gemini] Quota hit on {model}. Waiting 10s...")
                        time.sleep(10)
                    else:
                        logger.warning(f"[Gemini] Giving up on {model}.")
                    break
                else:
                    logger.error(f"[Gemini] Non-quota error on {model}: {err}")
                    break

    logger.error("[Gemini] All models exhausted.")
    return None


# ---------------------------------------------------------------------------
# Main AIService class
# ---------------------------------------------------------------------------
class AIService:

    @classmethod
    def _call_ai(cls, prompt: str) -> str:
        """
        Tries providers in order: Groq → Gemini → Mock.
        Never surfaces raw API error strings to the user.
        """
        # 1. Try Groq (primary, free)
        result = _call_groq(prompt)
        if result:
            # Strip <think> blocks if present (common in reasoning models)
            result = re.sub(r'<think>.*?</think>', '', result, flags=re.DOTALL).strip()
            return result

        # 2. Try Gemini (fallback)
        result = _call_gemini(prompt)
        if result:
            result = re.sub(r'<think>.*?</think>', '', result, flags=re.DOTALL).strip()
            return result

        # 3. Offline mock response
        logger.error("[AIService] All AI providers failed. Returning mock response.")
        return cls._mock_response(prompt)

    @staticmethod
    def _mock_response(prompt: str) -> str:
        prompt_lower = prompt.lower()
        if "sop" in prompt_lower:
            return (
                "Based on your profile, here is a professional SOP draft: [SOP Content Generated]. "
                "Please ensure you mention your academic achievements in more detail.\n\n"
                "Note: AI service is temporarily unavailable. Please try again later."
            )
        if "cv" in prompt_lower or "resume" in prompt_lower:
            return (
                "I have reviewed your CV.\n"
                "Suggestion 1: Use more action verbs.\n"
                "Suggestion 2: Quantify your results.\n\n"
                "Note: AI service is temporarily unavailable. Please try again later."
            )
        return (
            "I am the ScholarshipConnectBD AI Assistant. "
            "The AI service is temporarily unavailable. Please try again in a few minutes."
        )

    # ------------------------------------------------------------------
    # Public methods (unchanged signatures)
    # ------------------------------------------------------------------

    @classmethod
    def write_sop(cls, user_profile, scholarship_details):
        prompt = (
            f"Write a professional and compelling Statement of Purpose (SOP) for a student named {user_profile.full_name}. "
            f"Target Scholarship: {scholarship_details['title']}. "
            f"Field of Study: {scholarship_details['field']}. "
            f"Target Country: {scholarship_details['country']}. "
            f"Student Credentials: CGPA {user_profile.cgpa}, University: {user_profile.university}. "
            f"The SOP should be tailored to the specific requirements of this scholarship."
        )
        return cls._call_ai(prompt)

    @classmethod
    def review_sop(cls, sop_text):
        prompt = (
            f"Act as an expert scholarship consultant. Review the following Statement of Purpose (SOP) "
            f"and provide detailed feedback to make it world-class:\n\n{sop_text}"
        )
        return cls._call_ai(prompt)

    @classmethod
    def review_cv(cls, cv_text):
        prompt = (
            f"Critically analyze this CV/Resume for international scholarship applications. "
            f"Identify gaps and suggest improvements:\n\n{cv_text}"
        )
        return cls._call_ai(prompt)

    @classmethod
    def check_eligibility(cls, user_profile, scholarship_details):
        prompt = (
            f"Compare this student's profile with the scholarship requirements. "
            f"Student: CGPA {user_profile.cgpa}, Level {user_profile.academic_level}. "
            f"Scholarship Requirements: {scholarship_details['eligibility']}. "
            f"Respond with a breakdown of eligibility and a percentage match."
        )
        return cls._call_ai(prompt)

    @classmethod
    def improve_post(cls, content, title):
        prompt = (
            f"Polish this community post titled '{title}'. Refine the grammar and tone to be professional yet engaging. "
            f"Keep the original meaning intact.\n\nCONTENT: {content}"
        )
        return cls._call_ai(prompt)

    @classmethod
    def generate_bio(cls, user_profile):
        prompt = (
            f"Write a professional, concise, and engaging short bio (max 300 characters) for a student's scholarship profile. "
            f"Name: {user_profile.full_name or 'a scholar'}. "
            f"University: {user_profile.university or 'Unknown'}. "
            f"Department/Field: {user_profile.department or 'Unknown'}. "
            f"Skills: {user_profile.skills or 'Unknown'}. "
            f"Goals: {user_profile.target_countries or 'global studies'}. "
            f"Key achievements: {user_profile.achievements or 'N/A'}. "
            f"The bio should sound ambitious, focused, and ready for international opportunities. "
            f"Respond ONLY with the bio text."
        )
        return cls._call_ai(prompt)

    @classmethod
    def live_support(cls, message, chat_history=None):
        """
        Provides real-time support for students.
        """
        history_str = ""
        if chat_history:
            history_str = "\n".join(
                [f"{'User' if i % 2 == 0 else 'Assistant'}: {msg}" for i, msg in enumerate(chat_history)]
            )

        prompt = (
            "You are the ScholarshipConnectBD Live Support Assistant. Help the student with their queries about "
            "scholarships, the application process, or how to use this app. Keep your answers helpful, concise, "
            "and encouraging. If they ask about a specific scholarship, advise them to check the Scholarships tab.\n"
            f"{history_str}\nUser: {message}"
        )
        return cls._call_ai(prompt)

    @classmethod
    def analyze_best_solution(cls, discussion_title, discussion_content, comments):
        """
        Analyzes comments to find which one solved the problem.
        'comments' should be a list of dicts with 'id', 'user_id', and 'text'.
        """
        if not comments:
            return None

        comments_str = "\n".join(
            [f"Comment ID {c['id']} (User {c['user_id']}): {c['text']}" for c in comments]
        )

        prompt = (
            f"You are an AI Moderator. A discussion titled '{discussion_title}' was posted with the following content:\n"
            f"'{discussion_content}'\n\n"
            "Here are the comments provided by the community:\n"
            f"{comments_str}\n\n"
            "Task: Identify the Comment ID that most effectively solved the problem or answered the question. "
            "If multiple comments helped, pick the one that is most comprehensive. "
            "Respond ONLY with the Comment ID number. If no comment is helpful, respond with 'NONE'."
        )

        response_text = cls._call_ai(prompt)
        match = re.search(r'\b\d+\b', response_text)
        if match:
            try:
                return int(match.group())
            except ValueError:
                return None
        return None
