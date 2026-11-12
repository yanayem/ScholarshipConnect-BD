import os
import re
import logging
import requests
from typing import Optional, List

logger = logging.getLogger(__name__)

def _call_openrouter(prompt: str) -> Optional[str]:
    """
    Calls OpenRouter AI API with key rotation and free model fallbacks.
    """
    raw_keys = [
        os.getenv("OPENROUTER_API_KEY"),
        os.getenv("OPENROUTER_API_KEY_2"),
    ]
    valid_keys = [k.strip() for k in raw_keys if k and k.strip()]
    if not valid_keys:
        return None

    openrouter_models = [
        "nvidia/nemotron-3.5-lightning:free",
        "baidu/ernie-5.5-flash-preview:free",
        "google/gemma-4-31b-it:free",
        "openrouter/auto",
        "dots-studio/dots-3-note-preview:free",
        "liquid/lfm-2.5-2.6b:free",
    ]

    url = "https://openrouter.ai/api/v1/chat/completions"
    for idx, key in enumerate(valid_keys):
        headers = {
            "Authorization": f"Bearer {key}",
            "HTTP-Referer": "https://scholarshipconnectbd.com",
            "X-Title": "ScholarshipConnect BD",
            "Content-Type": "application/json"
        }
        for model in openrouter_models:
            try:
                payload = {
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are ScholarAI, an expert higher education and scholarship advisor for Bangladeshi students. Write rich, thorough, full-length academic statements of purpose and comprehensive guidance."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "model": model,
                    "temperature": 0.6,
                    "max_tokens": 4096
                }
                res = requests.post(url, json=payload, headers=headers, timeout=15)
                if res.status_code == 200:
                    data = res.json()
                    choices = data.get("choices", [])
                    if choices:
                        content = choices[0].get("message", {}).get("content")
                        if content:
                            logger.info(f"[OpenRouter] Key {idx+1} success with model {model}")
                            return content
                else:
                    logger.warning(f"[OpenRouter] Key {idx+1} model {model} HTTP {res.status_code}: {res.text[:120]}")
                    if res.status_code in [401, 403]:
                        break
            except Exception as e:
                logger.warning(f"[OpenRouter] Key {idx+1} model {model} error: {e}")
                continue

    return None


def _call_xai(prompt: str) -> Optional[str]:
    """
    Calls xAI (Grok) API via REST completions endpoint with key rotation and model fallbacks.
    """
    raw_keys = [
        os.getenv("XAI_API_KEY"),
        os.getenv("XAI_API_KEY_2"),
        os.getenv("XAI_GROK_API_KEY"),
    ]
    valid_keys = [k.strip() for k in raw_keys if k and k.strip()]
    if not valid_keys:
        return None

    xai_models = [
        "grok-2-latest",
        "grok-beta",
        "grok-2-1212",
    ]

    for idx, key in enumerate(valid_keys):
        for model in xai_models:
            try:
                url = "https://api.x.ai/v1/chat/completions"
                headers = {
                    "Authorization": f"Bearer {key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are ScholarAI, an expert higher education and scholarship advisor for Bangladeshi students. Write rich, thorough, full-length academic statements of purpose and comprehensive guidance."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "model": model,
                    "temperature": 0.6,
                    "max_tokens": 4096
                }
                res = requests.post(url, json=payload, headers=headers, timeout=15)
                if res.status_code == 200:
                    data = res.json()
                    choices = data.get("choices", [])
                    if choices:
                        content = choices[0].get("message", {}).get("content")
                        if content:
                            logger.info(f"[xAI Grok] Key {idx+1} success with model {model}")
                            return content
                elif res.status_code in [429, 403, 401]:
                    logger.warning(f"[xAI Grok] Key {idx+1} status {res.status_code}. Trying next key/model.")
                    break
            except Exception as e:
                logger.warning(f"[xAI Grok] Key {idx+1} model {model} error: {e}")
                continue

    return None


def _call_groq(prompt: str) -> Optional[str]:
    """
    Calls Groq Chat Completions API with key rotation, model fallbacks,
    and direct HTTP REST fallback (zero SDK requirement).
    """
    raw_keys = [
        os.getenv("GROQ_API_KEY"),
        os.getenv("GROQ_API_KEY_2"),
        os.getenv("GROQ_API_KEY_3"),
        os.getenv("GROQ_API_KEY_4"),
        os.getenv("GROQ_API_KEY_5"),
    ]
    valid_keys = [k.strip() for k in raw_keys if k and k.strip()]
    if not valid_keys:
        return None

    # Active supported Groq models
    models = [
        "openai/gpt-oss-120b",
        "openai/gpt-oss-20b",
        "qwen/qwen3.8-27b",
        "allam-2-7b",
        "canopylabs/orpheus-v1-english",
    ]

    # Method 1: Direct HTTP REST Request (Fast, no SDK dependency)
    url = "https://api.groq.com/openai/v1/chat/completions"
    for idx, key in enumerate(valid_keys):
        headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json"
        }
        for model in models:
            try:
                payload = {
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are ScholarAI, an expert higher education and scholarship advisor for Bangladeshi students. Write rich, thorough, full-length academic statements of purpose and comprehensive guidance."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "model": model,
                    "temperature": 0.6,
                    "max_tokens": 4096
                }
                res = requests.post(url, json=payload, headers=headers, timeout=12)
                if res.status_code == 200:
                    data = res.json()
                    choices = data.get("choices", [])
                    if choices:
                        content = choices[0].get("message", {}).get("content")
                        if content:
                            logger.info(f"[Groq REST] Key {idx+1} success with model {model}")
                            return content
                else:
                    logger.warning(f"[Groq REST] Key {idx+1} model {model} HTTP {res.status_code}: {res.text[:120]}")
                    if res.status_code in [401, 403]:
                        break
            except Exception as e:
                logger.warning(f"[Groq REST] Key {idx+1} model {model} error: {e}")
                continue

    # Method 2: SDK Fallback (if groq package is installed)
    try:
        from groq import Groq
        for idx, key in enumerate(valid_keys):
            client = Groq(api_key=key)
            for model in models:
                try:
                    chat_completion = client.chat.completions.create(
                        messages=[
                            {
                                "role": "system",
                                "content": "You are ScholarAI, an expert higher education and scholarship advisor for Bangladeshi students. Write rich, thorough, full-length academic statements of purpose and comprehensive guidance."
                            },
                            {
                                "role": "user",
                                "content": prompt,
                            }
                        ],
                        model=model,
                        temperature=0.6,
                        max_tokens=4096,
                    )
                    response_text = chat_completion.choices[0].message.content
                    if response_text:
                        logger.info(f"[Groq SDK] Key {idx+1} success with model {model}")
                        return response_text
                except Exception:
                    continue
    except Exception:
        pass
            
    return None


def _call_gemini(prompt: str) -> Optional[str]:
    """
    Robust Gemini AI caller supporting multiple keys, multiple models,
    and direct REST API calls across v1 & v1beta endpoints.
    """
    raw_keys = [
        os.getenv("GEMINI_API_KEY"),
        os.getenv("GEMINI_API_KEY_2"),
        os.getenv("GEMINI_API_KEY_3"),
        os.getenv("GEMINI_API_KEY_4"),
    ]
    valid_keys = [k.strip() for k in raw_keys if k and k.strip()]
    if not valid_keys:
        return None

    # (API_VERSION, MODEL_NAME) pairs for full compatibility
    gemini_configs = [
        ("v1beta", "gemini-2.5-flash"),
        ("v1beta", "gemini-2.5-flash-lite"),
        ("v1beta", "gemini-flash-latest"),
        ("v1beta", "gemini-pro-latest"),
    ]

    # Method 1: Direct HTTP REST request (Zero SDK dependency, fast, robust)
    for idx, key in enumerate(valid_keys):
        for api_ver, model in gemini_configs:
            try:
                url = f"https://generativelanguage.googleapis.com/{api_ver}/models/{model}:generateContent?key={key}"
                payload = {
                    "contents": [{
                        "parts": [{"text": prompt}]
                    }],
                    "generationConfig": {
                        "temperature": 0.7,
                        "maxOutputTokens": 4096
                    }
                }
                res = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=12)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts and "text" in parts[0]:
                            logger.info(f"[Gemini REST] Key {idx+1} success with model {model} ({api_ver})")
                            return parts[0]["text"]
                else:
                    logger.warning(f"[Gemini REST] Key {idx+1} model {model} ({api_ver}) HTTP {res.status_code}: {res.text[:120]}")
                    if res.status_code in [401, 403]:
                        break
            except Exception as e:
                logger.warning(f"[Gemini REST] Key {idx+1} model {model} ({api_ver}) error: {e}")
                continue

    # Method 2: SDK Fallback (google-genai or google-generativeai)
    for key in valid_keys:
        try:
            from google import genai
            client = genai.Client(api_key=key)
            for _, model in gemini_configs:
                try:
                    response = client.models.generate_content(model=model, contents=prompt)
                    if response and response.text:
                        return response.text
                except Exception:
                    continue
        except Exception:
            pass

        try:
            import google.generativeai as old_genai
            old_genai.configure(api_key=key)
            for _, model in gemini_configs:
                try:
                    m = old_genai.GenerativeModel(model)
                    response = m.generate_content(prompt)
                    if response and response.text:
                        return response.text
                except Exception:
                    continue
        except Exception:
            pass

    return None


def _call_pollinations(prompt: str) -> Optional[str]:
    """
    Free fallback LLM endpoint (Pollinations AI) ensuring zero downtime
    when all API keys reach rate limits.
    """
    try:
        url = "https://text.pollinations.ai/"
        payload = {
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        }
        res = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=15)
        if res.status_code == 200 and res.text:
            cleaned = res.text.strip()
            if cleaned and len(cleaned) > 20:
                logger.info("[Pollinations] Fallback successful.")
                return cleaned
    except Exception as e:
        logger.warning(f"[Pollinations] Fallback error: {e}")

    return None


class AIService:
    @classmethod
    def _call_ai(cls, prompt: str) -> str:
        # Step 1: Groq AI (Multi-key + Multi-model) - Extremely fast & high performance
        result = _call_groq(prompt)
        if result:
            return re.sub(r'<think>.*?</think>', '', result, flags=re.DOTALL).strip()

        # Step 2: Gemini AI (Multi-key + Multi-model + REST)
        result = _call_gemini(prompt)
        if result:
            return re.sub(r'<think>.*?</think>', '', result, flags=re.DOTALL).strip()

        # Step 3: OpenRouter (if OPENROUTER_API_KEY configured)
        result = _call_openrouter(prompt)
        if result:
            return re.sub(r'<think>.*?</think>', '', result, flags=re.DOTALL).strip()

        # Step 4: xAI Grok (if XAI_API_KEY / XAI_GROK_API_KEY configured)
        result = _call_xai(prompt)
        if result:
            return re.sub(r'<think>.*?</think>', '', result, flags=re.DOTALL).strip()

        # Step 5: Public Free Fallback (Pollinations AI - No Key Needed)
        result = _call_pollinations(prompt)
        if result:
            return re.sub(r'<think>.*?</think>', '', result, flags=re.DOTALL).strip()

        return "ScholarAI system is currently experiencing high demand. Please re-send your question in a few seconds."

    @classmethod
    def live_support(cls, message: str, chat_history: Optional[List[str]] = None) -> str:
        msg_clean = message.lower().strip()
        if msg_clean in ['hi', 'hello', 'hey', 'hi there', 'hello there']:
            return "Hello! I am your ScholarshipConnect Assistant. How can I help you today with scholarships, SOPs, or study abroad queries?"

        clean_history = []
        if chat_history:
            error_terms = ['error', 'refreshing', 'unavailable', 'trouble connecting', 'high demand', 'connection issue']
            for msg in chat_history[-6:]:
                if isinstance(msg, str) and not any(term in msg.lower() for term in error_terms):
                    clean_history.append(msg)

        history_str = "\n".join(clean_history[-4:]) if clean_history else ""

        prompt = (
            "System: You are ScholarAI, an expert scholarship advisor for Bangladeshi students studying abroad (USA, UK, Canada, Europe, Japan, Australia, etc.). "
            "Provide clear, practical, human-like, and encouraging guidance regarding scholarship requirements, deadlines, SOP writing, and embassy visas. "
            "Format your text cleanly without raw markdown symbols like ** or * or ### so it looks natural and easy to read.\n\n"
            f"Previous Conversation Context:\n{history_str}\n\n"
            f"Student Query: {message}\n"
            "ScholarAI Response:"
        )
        return cls._call_ai(prompt)

    @classmethod
    def _clean_sop_text(cls, text: str) -> str:
        if not text:
            return ""
        # Remove raw markdown bold/italic stars (***, **, *)
        text = re.sub(r'\*{1,3}(.*?)\*{1,3}', r'\1', text)
        # Remove leading headers (### Title -> Title)
        text = re.sub(r'^\s*#{1,6}\s*', '', text, flags=re.MULTILINE)
        # Remove explicit paragraph/section headers (e.g., "Paragraph 1:", "Section 1:", "Paragraph 1 - ")
        text = re.sub(r'^\s*(Paragraph|Section|Part)\s*\d+\s*[:\-–—]?\s*', '', text, flags=re.MULTILINE | re.IGNORECASE)
        # Remove explicit word count notes (e.g. "Word Count: 750", "(750 words)")
        text = re.sub(r'\(?\s*Word\s*count\s*[:\-–—]?\s*\d+\s*(words)?\s*\)?', '', text, flags=re.IGNORECASE)
        text = re.sub(r'^\s*Word\s*count\s*[:\-–—]?\s*\d+.*$', '', text, flags=re.MULTILINE | re.IGNORECASE)
        return text.strip()

    @classmethod
    def write_sop(cls, user_profile, scholarship_details: dict) -> str:
        user_cgpa = getattr(user_profile, 'cgpa', None)
        cgpa_str = f"{user_cgpa} out of 4.00" if user_cgpa else "N/A"

        prompt = (
            f"Write a full-length, comprehensive, and highly detailed academic Statement of Purpose (SOP) essay (MINIMUM 1200+ WORDS, target 1200–1600 words) for a Bangladeshi student applying for higher education abroad.\n\n"
            f"Applicant Information:\n"
            f"- Full Name: {getattr(user_profile, 'full_name', 'Student')}\n"
            f"- Major/Course: {getattr(user_profile, 'major_course', 'N/A')}\n"
            f"- CGPA: {cgpa_str}\n"
            f"- Research/Academic Interests: {getattr(user_profile, 'research_interests', 'N/A')}\n"
            f"- Target Scholarship/Program: {scholarship_details.get('title', 'Scholarship')}\n"
            f"- Field of Study: {scholarship_details.get('field', 'General')}\n"
            f"- Target Country: {scholarship_details.get('country', 'Abroad')}\n\n"
            "MANDATORY ESSAY LENGTH REQUIREMENT: MINIMUM 1200+ WORDS\n"
            "Do NOT write brief overviews or short essays. Thoroughly elaborate on every single paragraph in deep detail to achieve at least 1,200 words.\n\n"
            "REQUIRED EXTENDED 7-PARAGRAPH ACADEMIC STRUCTURE:\n"
            "1. PARAGRAPH 1 (Purpose & Intellectual Motivation - min 200 words): Hook statement, background context in Bangladesh, academic drive, and clear motivation for graduate study.\n"
            "2. PARAGRAPH 2 (Undergraduate Coursework & Theoretical Rigor - min 250 words): Deep dive into undergraduate education, CGPA context, foundational subjects, laboratory training, analytical tools (e.g. Python, MATLAB, R, SPSS, Stata, GIS), and academic discipline.\n"
            "3. PARAGRAPH 3 (Research Thesis & Capstone Project Analysis - min 250 words): Extensive technical discussion of undergraduate thesis or major research project. Detail problem formulation, research methodologies, data collection, analytical findings, and technical challenges overcome.\n"
            "4. PARAGRAPH 4 (Professional Experience & Co-Curricular Leadership - min 200 words): Industry internships, work experience, teaching assistantships, leadership in university clubs, workshops, or academic competitions.\n"
            "5. PARAGRAPH 5 (Research Motivation & Societal Impact - min 150 words): Fundamental socio-economic or technological challenges facing Bangladesh/global society, and why advanced degree training is necessary to solve them.\n"
            "6. PARAGRAPH 6 (Target University & Faculty Alignment - min 200 words): Specific alignment with the target scholarship, host country, faculty research labs, curriculum electives, and institutional ecosystem.\n"
            "7. PARAGRAPH 7 (Long-Term Career Goals & Return Contribution - min 150 words): Clear 5–10 year career roadmap (academia, industry R&D, or policy leadership), and final vision for contributing to Bangladesh's national development or global science.\n\n"
            "STRICT FORMAL ACADEMIC & TURNITIN ANTI-AI RULES:\n"
            "1. CLEAN ESSAY ONLY: DO NOT include section titles, paragraph numbers, word count labels, meta comments, or word count markers (such as 'Paragraph 1:', 'Word Count:', or '(200 words)'). Output ONLY clean, natural, continuous academic prose ready for submission.\n"
            "2. NO CONTRACTIONS: Maintain formal academic grammar (use 'do not', 'cannot', 'it is' instead of 'don't', 'can't', 'it's').\n"
            "3. REDUCE NOMINALIZATION: Prefer strong active verbs over heavy noun phrases.\n"
            "4. DIRECT SVO OPENINGS: Avoid starting sentences with heavy prepositional phrases or -ing participle phrases.\n"
            "5. HIGH BURSTINESS & PERPLEXITY: Mix short direct simple sentences with longer analytical ones for a natural human academic cadence.\n"
            "6. BAN AI TRANSITIONS & BUZZWORDS: Strictly avoid 'Moreover', 'Furthermore', 'In conclusion', 'Additionally', 'Indeed', 'delve', 'crucial', 'realm', 'tapestry', 'testament', 'beacon', 'paramount', 'pivotal', 'underscore'.\n"
            "7. ACADEMIC HEDGING: Use natural academic hedging ('suggests', 'indicates', 'appears to', 'may contribute to').\n"
            "8. NO MARKDOWN: DO NOT use raw markdown formatting symbols such as **, ***, or ### anywhere in the text."
        )
        raw_sop = cls._call_ai(prompt)
        return cls._clean_sop_text(raw_sop)

    @classmethod
    def review_sop(cls, sop_text: str) -> str:
        prompt = (
            "Review the following Statement of Purpose (SOP) for a graduate program / scholarship application. "
            "Evaluate it against key academic criteria:\n"
            "1. Does it provide context and demonstrate impact rather than just repeating the CV?\n"
            "2. Is the purpose and intellectual motivation clearly articulated?\n"
            "3. Are program/university alignment and career goals well-justified?\n"
            "4. Are tone, structure, burstiness, and academic hedging appropriate?\n\n"
            "Provide key strengths, areas for improvement, an overall score out of 10, and actionable recommendations.\n\n"
            f"SOP Text:\n{sop_text}"
        )
        return cls._call_ai(prompt)

    @classmethod
    def paraphrase_sop(cls, sop_text: str, style: str = "academic") -> str:
        prompt = (
            f"Rewrite and paraphrase the following Statement of Purpose (SOP) text into a full-length, comprehensive {style} academic essay (retaining all facts and elaborating thoroughly for Turnitin compliance).\n\n"
            "STRICT TURNITIN ACADEMIC ANTI-AI RULES:\n"
            "1. RETAIN FULL LENGTH: Do NOT condense or shorten the text. Retain all details, experiences, and academic context.\n"
            "2. NO CONTRACTIONS: Maintain formal academic standards. Do NOT use contractions (e.g., use 'do not', 'cannot', 'it is' instead of 'don't', 'can't', 'it's').\n"
            "3. REDUCE NOMINALIZATION: Use strong active verbs instead of heavy noun phrases.\n"
            "4. DIRECT SVO OPENINGS: Avoid introductory -ing participle phrases or long prepositional fillers.\n"
            "5. HIGH BURSTINESS & PERPLEXITY: Combine short, direct declarative simple sentences with longer analytical ones.\n"
            "6. ZERO AI BUZZWORDS & TRANSITIONS: Strictly avoid 'delve', 'underscore', 'pivotal', 'tapestry', 'realm', 'testament', 'beacon', 'paramount', 'moreover', 'furthermore', 'in conclusion', 'additionally'.\n"
            "7. ACADEMIC HEDGING: Use measured academic verbs ('suggests', 'indicates', 'appears to', 'may contribute to') where appropriate.\n"
            "8. NO MARKDOWN: DO NOT use raw markdown formatting symbols such as **, ***, or ### anywhere in the output.\n\n"
            f"Original SOP Text:\n{sop_text}"
        )
        raw_sop = cls._call_ai(prompt)
        return cls._clean_sop_text(raw_sop)

    @classmethod
    def review_cv(cls, cv_text: str) -> str:
        prompt = (
            "Review the following CV/Resume for higher education and scholarship applications. "
            "Give actionable feedback on formatting, bullet point impacts, leadership highlights, and missing details.\n\n"
            f"CV Content:\n{cv_text}"
        )
        return cls._call_ai(prompt)

    @classmethod
    def check_eligibility(cls, user_profile, scholarship_details: dict) -> str:
        """
        Pure NLP Rule-Based Keyword & Vector Matcher for Scholarship Eligibility Evaluation.
        Does not rely on Generative LLMs.
        """
        try:
            user_cgpa = float(getattr(user_profile, 'cgpa', 0) or 0)
        except (ValueError, TypeError):
            user_cgpa = 0.0

        user_level = (getattr(user_profile, 'academic_level', '') or '').lower().strip()
        user_major = (getattr(user_profile, 'major_course', '') or '').lower().strip()

        s_title = scholarship_details.get('title', 'Scholarship')
        s_field = (scholarship_details.get('field', '') or '').lower().strip()
        s_level = (scholarship_details.get('level', '') or '').lower().strip()
        s_eligibility = scholarship_details.get('eligibility', '') or ''

        # 1. CGPA Extraction via NLP Regex
        match_cgpa = re.search(r'CGPA\s*[:>=]?\s*(\d+(\.\d+)?)', s_eligibility, re.IGNORECASE)
        req_cgpa = float(match_cgpa.group(1)) if match_cgpa else 3.0

        if user_cgpa >= req_cgpa:
            cgpa_score = 35
            cgpa_status = f"Satisfies required threshold ({user_cgpa:.2f} >= {req_cgpa:.2f})"
        else:
            cgpa_score = max(0, int((user_cgpa / req_cgpa) * 35)) if req_cgpa > 0 else 35
            cgpa_status = f"Below target threshold ({user_cgpa:.2f} < {req_cgpa:.2f})"

        # 2. Level Synonym Token Equivalence
        level_map = {
            'bachelors': ['undergraduate', 'bachelor', 'bsc', 'ba', 'bba'],
            'masters': ['graduate', 'postgraduate', 'master', 'msc', 'ma', 'mba'],
            'phd': ['doctorate', 'doctoral', 'phd', 'research']
        }

        level_pass = True
        if s_level and s_level not in ['any', 'all', 'general']:
            level_pass = False
            for key, synonyms in level_map.items():
                if key in user_level or any(s in user_level for s in synonyms):
                    if key in s_level or any(s in s_level for s in synonyms):
                        level_pass = True
                        break

        level_score = 25 if level_pass else 10

        # 3. Major / Field Token Jaccard Set Similarity
        user_tokens = set(re.findall(r'\w+', user_major))
        s_tokens = set(re.findall(r'\w+', s_field))

        field_score = 25
        if s_field and s_field not in ['any', 'general', 'all']:
            if user_tokens and s_tokens:
                intersection = user_tokens.intersection(s_tokens)
                union = user_tokens.union(s_tokens)
                jaccard = len(intersection) / len(union) if union else 0
                if jaccard > 0 or any(t in s_field for t in user_tokens if len(t) > 2):
                    field_score = 25
                else:
                    field_score = 12

        total_score = min(100, cgpa_score + level_score + field_score + 15)
        status_str = "Strong Alignment" if total_score >= 80 else "Moderate Match" if total_score >= 60 else "Potential Criteria Gap"

        return (
            f"NLP Evaluation Report for {s_title}:\n\n"
            f"• Overall Compatibility Score: {total_score}%\n"
            f"• Match Category: {status_str}\n"
            f"• CGPA Analysis: {cgpa_status}\n"
            f"• Academic Level: {user_level.title() if user_level else 'General'} vs Program Level ({s_level.title() if s_level else 'All Levels'}) -> {'Aligned' if level_pass else 'Level Mismatch'}\n"
            f"• Field Alignment: {user_major.title() if user_major else 'General'} -> {'Direct Field Match' if field_score == 25 else 'Partial Field Alignment'}\n\n"
            f"NLP Summary: Your profile meets {total_score}% of the core quantitative criteria. Ensure your application documents (transcripts and recommendation letters) highlight your achievements."
        )

    @classmethod
    def improve_post(cls, content: str, title: str = "Community Discussion") -> str:
        prompt = (
            f"Improve and polish this forum post for a student community platform.\n"
            f"Title: {title}\n"
            f"Content:\n{content}\n\n"
            "Return the enhanced, grammatically correct, and clear version of the post content."
        )
        return cls._call_ai(prompt)

    @classmethod
    def generate_bio(cls, user_profile) -> str:
        prompt = (
            f"Write a crisp, inspiring 2-3 sentence bio for a student profile on a scholarship platform.\n"
            f"Name: {getattr(user_profile, 'full_name', 'Student')}\n"
            f"Major: {getattr(user_profile, 'major_course', 'Student')}\n"
            f"Target Countries: {getattr(user_profile, 'target_countries', 'Abroad')}\n"
            f"Interests: {getattr(user_profile, 'research_interests', 'Higher Education')}"
        )
        return cls._call_ai(prompt)
