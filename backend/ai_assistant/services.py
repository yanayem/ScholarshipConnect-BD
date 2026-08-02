import os

class AIService:
    @staticmethod
    def _get_model():
        try:
            import google.generativeai as genai
            api_key = os.getenv('GEMINI_API_KEY')
            if not api_key:
                return None
            genai.configure(api_key=api_key)
            return genai.GenerativeModel('gemini-pro')
        except ImportError:
            return None

    @classmethod
    def write_sop(cls, profile, scholarship_data):
        model = cls._get_model()
        if not model: return "AI Service Unavailable (Please install google-generativeai)"
        
        prompt = f"Write a professional Statement of Purpose for {profile.user.username} for the {scholarship_data['title']} in {scholarship_data['country']}. Major: {profile.academic_level}."
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            return str(e)

    @classmethod
    def review_sop(cls, sop_text):
        model = cls._get_model()
        if not model: return "AI Service Unavailable"
        try:
            response = model.generate_content(f"Review this SOP and provide improvements:\n\n{sop_text}")
            return response.text
        except Exception as e:
            return str(e)

    @classmethod
    def review_cv(cls, cv_text):
        model = cls._get_model()
        if not model: return "AI Service Unavailable"
        try:
            response = model.generate_content(f"Review this CV/Resume and provide suggestions:\n\n{cv_text}")
            return response.text
        except Exception as e:
            return str(e)

    @classmethod
    def check_eligibility(cls, profile, scholarship_data):
        model = cls._get_model()
        if not model: return "AI Service Unavailable"
        prompt = f"Analyze if a student with CGPA {profile.cgpa} is eligible for this scholarship: {scholarship_data['eligibility']}"
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            return str(e)

    @classmethod
    def improve_post(cls, content, title):
        model = cls._get_model()
        if not model: return content
        try:
            response = model.generate_content(f"Improve this community post titled '{title}':\n\n{content}")
            return response.text
        except Exception as e:
            return content

    @classmethod
    def live_support(cls, message, history=[]):
        model = cls._get_model()
        if not model: return "I'm currently offline."
        try:
            response = model.generate_content(message)
            return response.text
        except Exception as e:
            return "Error: " + str(e)

    @classmethod
    def generate_bio(cls, profile):
        model = cls._get_model()
        if not model: return "Student at ScholarshipConnect"
        prompt = f"Generate a 2-sentence professional bio for a {profile.academic_level} student interested in {profile.preferred_fields}."
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            return "Student at ScholarshipConnect"
