# ScholarshipConnect-BD: Lab Report

**Team:** [Team Name]  
**Project Name:** ScholarshipConnect-BD  
**Date:** May 22, 2024  

---

## 1. Introduction
ScholarshipConnect-BD is a comprehensive platform designed to bridge the gap between Bangladeshi students and international scholarship opportunities. The system leverages AI for personalized matching and SOP assistance, while providing a robust backend for scholarship management and application tracking.

## 2. Core Features & Backend Implementation

### Feature 1: Intelligent Scholarship Matchmaker
This feature uses NLP (Natural Language Processing) to match a student's profile (CGPA, target countries, interests) with available scholarships.

**Core Backend Code (from `scholarships/views.py`):**
```python
@action(detail=False, methods=['get'], url_path='matchmaker')
def matchmaker(self, request):
    user = request.user
    profile, _ = Profile.objects.get_or_create(user=user)
    
    scholarships = Scholarship.objects.filter(status='active', deadline__gte=timezone.now().date())
    results = []
    
    # Vectorizing profile text for TF-IDF Cosine Similarity
    profile_text = f"{profile.target_countries} {profile.major_course} {profile.research_interests}".lower()
    
    # ... (matching logic)
    if SKLEARN_AVAILABLE and profile_text.strip():
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform([profile_text] + scholarship_texts)
        cosine_sims = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
        
        for idx, (s, base_score) in enumerate(valid_scholarships):
            nlp_score = int(cosine_sims[idx] * 50)
            results.append({
                "scholarship": ScholarshipSerializer(s).data,
                "match_score": base_score + nlp_score
            })
    # ...
```
**Explanation:** The backend calculates a `match_score` based on hard criteria (CGPA, Country) and semantic similarity (TF-IDF) between the user's profile and scholarship descriptions.

---

### Feature 2: AI-Powered SOP & CV Assistant
Students can generate and review their Statement of Purpose (SOP) or CV using integrated AI tools. The system uses a multi-provider fallback strategy (Groq & Gemini).

**Core AI Service Logic (from `ai_assistant/services.py`):**
```python
class AIService:
    @classmethod
    def _call_ai(cls, prompt: str) -> str:
        # Tries providers in order: Groq (Primary) → Gemini (Fallback) → Mock
        result = _call_groq(prompt)
        if result: return result
        result = _call_gemini(prompt)
        return result or cls._mock_response(prompt)

    @classmethod
    def write_sop(cls, user_profile, scholarship_details):
        prompt = f"Write a professional SOP for {user_profile.full_name}. Target Scholarship: {scholarship_details['title']}..."
        return cls._call_ai(prompt)

    @classmethod
    def analyze_best_solution(cls, discussion_title, discussion_content, comments):
        # AI analyzes community comments to identify the most helpful answer
        prompt = f"Identify the Comment ID that solved: '{discussion_title}'. Comments: {comments}..."
        response_text = cls._call_ai(prompt)
        # Extract ID from AI response
        return int(match.group()) if (match := re.search(r'\b\d+\b', response_text)) else None
```
**Explanation:** The `AIService` abstracts the complexity of LLM calls, providing a reliable interface for generating documents and moderating community content.

---

### Feature 3: Automated Agency Integration
When a user requests "Agency Processing", the system automatically initiates a communication channel with an administrator.

**Core Backend Code (from `applications/views.py`):**
```python
def perform_create(self, serializer):
    instance = serializer.save(user=self.request.user)
    
    # Automated Agency Chat Initialization
    if instance.application_type == 'Agency':
        agency_admin = User.objects.filter(is_superuser=True).first()
        if agency_admin and agency_admin != self.request.user:
            welcome_msg = f"Hello {instance.full_name}! We have received your agency processing request for '{instance.scholarship.title}'..."
            ChatMessage.objects.create(
                sender=agency_admin,
                receiver=self.request.user,
                message=welcome_msg
            )
```
**Explanation:** This code links the `ScholarshipApplication` model to the `Community` chat system, ensuring immediate engagement for premium services.

---

### Feature 4: Points-Based Gamification System
To encourage community contribution, users earn "ScholarPoints" for submitting valid scholarships.

**Core Backend Code (from `scholarships/views.py`):**
```python
@action(detail=True, methods=['post'])
def approve(self, request, pk=None):
    # ...
    if previous_status == 'pending' and scholarship.status == 'active':
        profile = Profile.objects.get(user=scholarship.submitted_by)
        profile.scholar_points += 200 # Reward for valid submission
        profile.save()
        
        send_notification(user=scholarship.submitted_by, title="Points Awarded!")
    # ...
```
**Explanation:** This connects the admin approval workflow to the user profile's reward system, incentivizing data accuracy.

---

### Feature 5: Peer Mentorship System
Students can request mentorship sessions from experienced mentors (e.g., students already studying abroad).

**Core Backend Code (from `community/views.py`):**
```python
class MentorshipSessionViewSet(generics.ListCreateAPIView):
    # ...
    def perform_create(self, serializer):
        instance = serializer.save(mentee=self.request.user)
        # Notify mentor about new request
        send_notification(
            user=instance.mentor,
            title="New Mentorship Request",
            message=f"Student {self.request.user.username} has requested a session regarding: {instance.topic}."
        )
```
**Explanation:** This feature facilitates knowledge sharing by allowing mentees to book sessions, with automatic notification triggers for mentors.

---

### Feature 6: Smart Community Discussion Hub
A forum where students help each other. It includes an AI-driven "Best Answer" reward system.

**Core Backend Code (from `community/views.py`):**
```python
def distribute_points(self, discussion):
    # Call AI to find the best answer among comments
    best_comment_id = AIService.analyze_best_solution(discussion.title, discussion.content, comment_data)
    if best_comment_id:
        best_comment = discussion.comments.filter(id=best_comment_id).first()
        # Award 50 ScholarPoints to the solver
        profile = best_comment.user.profile
        profile.scholar_points += 50
        profile.save()
        send_notification(user=best_comment.user, title="ScholarPoints Awarded! 🌟", message="Your answer was chosen as the best solution.")
```
**Explanation:** The system uses AI to analyze which peer provided the most helpful answer to a discussion, automatically awarding them points.

---

### Feature 7: Secure Document Vault & Expiry Reminders
Users can securely store academic documents, and the system alerts them before documents (like passports or IELTS) expire.

**Core Backend Code (from `applications/views.py`):**
```python
def get_queryset(self):
    docs = UserDocument.objects.filter(user=self.request.user)
    # Check for documents expiring in the next 30 days
    today = timezone.now().date()
    soon = today + datetime.timedelta(days=30)
    expiring = docs.filter(expiry_date__lte=soon, reminder_sent=False)
    
    for doc in expiring:
        Notification.objects.create(user=self.request.user, title="Document Expiring Soon", message=f"Your document '{doc.name}' is set to expire on {doc.expiry_date}.")
        doc.reminder_sent = True
        doc.save()
    return docs
```
**Explanation:** This ensures students never miss scholarship deadlines due to expired documents by providing proactive notifications.

---

### Feature 8: Dynamic Student Profile & CV Data
Students maintain a detailed profile including CGPA, target countries, and research interests, which powers the AI Matchmaker.

**Core Backend Code (from `accounts/views.py`):**
```python
class ProfileView(generics.RetrieveUpdateAPIView):
    def get_object(self):
        # Auto-creates a profile if one doesn't exist for the user
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return profile
```
**Explanation:** The profile acts as a central data repository for the student's academic history, ensuring personalized experiences across the app.

---

### Feature 9: Mobile Admin Portal & Stats Dashboard
Administrators have access to a dedicated mobile dashboard to manage scholarships and view platform growth statistics.

**Core Backend Code (from `scholarships/views.py`):**
```python
@action(detail=False, methods=['get'], url_path='admin-stats')
def admin_stats(self, _request):
    total_scholarships = Scholarship.objects.count()
    total_users = User.objects.count()
    total_applications = ScholarshipApplication.objects.count()
    
    # Analyze popular countries for scholarship data
    countries = list(Scholarship.objects.values_list('country', flat=True))
    # ... statistics logic ...
    return Response({
        "total_scholarships": total_scholarships,
        "total_users": total_users,
        "total_applications": total_applications,
        "popular_countries": popular_countries
    })
```
**Explanation:** This provides real-time insights into platform performance and user engagement directly from the mobile app.

---

### Feature 10: Integrated Payment Gateway (Stripe & bKash)
The platform supports secure payments for premium services like Agency Processing through multiple gateways.

**Core Backend Code (from `payments/views.py`):**
```python
class StripePaymentIntentView(views.APIView):
    def post(self, request):
        # Create a PaymentIntent with a specific amount
        intent = stripe.PaymentIntent.create(
            amount=50000, # 500 BDT
            currency='bdt',
        )
        # Log the pending transaction in the database
        Payment.objects.create(user=request.user, transaction_id=intent['id'], amount=500.00)
        return Response({'clientSecret': intent['client_secret']})
```
**Explanation:** Secure payment integration allows students to upgrade to agency services safely within the app.

---

### Feature 11: Secure Admin Profile Switching
Admins can switch between a student view and an administrative view with a secondary security layer.

**Core Backend Code (from `accounts/views.py`):**
```python
class AdminLoginView(TokenObtainPairView):
    serializer_class = AdminTokenObtainPairSerializer
    # Secondary login layer for administrative actions
    throttle_classes = [SensitiveActionThrottle, AnonSensitiveActionThrottle]
```
**Explanation:** This ensures that administrative tools are protected by an extra layer of security beyond standard user authentication.

---

### Feature 12: Real-time Messaging & Media Sharing
A modern communication suite with teal gradients, reactions (Like, Celebrate, etc.), and media support.

**Core Backend Code (from `community/models.py`):**
```python
class ChatMessage(models.Model):
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_messages', on_delete=models.CASCADE)
    message = models.TextField()
    reaction = models.CharField(max_length=20, blank=True)
    is_read = models.BooleanField(default=False)
    image = models.ImageField(upload_to='chat_images/', null=True, blank=True)
```
**Explanation:** This model supports a rich messaging experience, including read receipts, professional reactions, and secure image sharing.

---

### Feature 13: Scholarship Success Blog
A dedicated space for success stories, application guides, and academic articles to inspire students.

**Core Backend Code (from `blog/views.py`):**
```python
class BlogPostListCreateView(generics.ListCreateAPIView):
    queryset = BlogPost.objects.filter(status='published')
    serializer_class = BlogPostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
```
**Explanation:** Provides curated content to help students understand the application process through real-world examples.

---

### Feature 14: Stories & Interactive Polls
Users can share their academic journey through visual stories and participate in community-driven polls.

**Core Backend Code (from `community/models.py`):**
```python
class Story(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='stories/')
    caption = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

class PollOption(models.Model):
    discussion = models.ForeignKey(Discussion, related_name='poll_options', on_delete=models.CASCADE)
    text = models.CharField(max_length=100)
```
**Explanation:** Enhances community engagement by allowing visual sharing and data-driven discussions through polls.

---

### Feature 15: Global Broadcast System
Admins can send instant notifications and alerts to all registered users simultaneously.

**Core Backend Code (from `notifications/utils.py`):**
```python
def broadcast_notification(title, message, data=None):
    users = User.objects.all()
    for user in users:
        send_notification(user, title, message, data=data)
```
**Explanation:** Enables administrators to push critical updates, such as major scholarship deadlines or system announcements, to the entire student body.

---

### Feature 16: Admin Moderation Center
A dedicated system to protect community standards by managing reported posts and comments.

**Core Backend Code (from `community/views.py`):**
```python
class ReportActionView(generics.UpdateAPIView):
    def perform_update(self, serializer):
        instance = self.get_object()
        if self.request.data.get('status') == 'resolved':
            # Notify user about removal
            Notification.objects.create(user=instance.reported_user, title="Content Removed")
            # Delete offending content
            if instance.content_type == 'Discussion':
                Discussion.objects.filter(id=instance.content_id).delete()
```
**Explanation:** This provides administrators with the tools to review reports and take action against spam or offensive content, maintaining a safe academic environment.

---

### Feature 17: Leaderboard & Contribution Rankings
A gamified social feed that ranks users based on their contributions to the scholarship database.

**Core Backend Code (from `accounts/views.py`):**
```python
class LeaderboardView(APIView):
    def get(self, request):
        # Fetch profiles and sort by points in memory for high performance
        profiles = list(Profile.objects.all())
        data = sorted(profiles, key=lambda p: p.scholar_points, reverse=True)
        # ... serialization ...
        return Response(results[:10])
```
**Explanation:** Encourages healthy competition and contribution by publicly recognizing the most active scholars in the community.

---

## 3. Connectivity: Backend to Mobile App
The system uses a **RESTful API** architecture with a specialized security and real-time notification layer.

### 3.1 Firebase Authentication & User Mapping
Instead of standard sessions, the mobile app sends a **Firebase ID Token**. The backend verifies this token and maps it to a Django user.

**Core Auth Code (from `accounts/authentication.py`):**
```python
class FirebaseAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        # ... token extraction ...
        try:
            decoded_token = auth.verify_id_token(id_token)
            uid = decoded_token.get('uid')
            user, created = User.objects.get_or_create(username=uid, defaults={'email': email})
            # Promotion to staff if email is in ADMIN_EMAILS
            if email and email.lower() in admin_emails:
                user.is_staff = True
                user.is_superuser = True
                user.save()
            return (user, None)
        except Exception as e:
            raise exceptions.AuthenticationFailed(f"Auth failed: {str(e)}")
```

### 3.2 Real-time Updates via Firebase Cloud Messaging (FCM)
When important events occur (like an application status update or a new mentorship request), the backend triggers a push notification.

**Push Notification Service (from `notifications/fcm_service.py`):**
```python
def send_push_notification(user, title, body, data=None):
    token = user.profile.fcm_token
    if not token: return False

    message = messaging.Message(
        notification=messaging.Notification(title=title, body=body),
        data=data or {},
        token=token,
    )
    response = messaging.send(message)
    return True
```

### 3.3 Data Flow
1. **Request:** Mobile app (React Native) calls an endpoint (e.g., `/api/scholarships/matchmaker/`) with a `Bearer <Firebase_Token>`.
2. **Verification:** Django's `FirebaseAuthentication` verifies the token and identifies the `request.user`.
3. **Processing:** The ViewSet processes the business logic (e.g., TF-IDF NLP matching).
4. **Response:** Data is returned as JSON via Django REST Framework serializers.

---

## 4. Mobile App Screenshots

| Feature | Screenshot |
|---------|------------|
| **Home Screen & Matchmaker** | ![Home Screen Placeholder](https://via.placeholder.com/200x400?text=Matchmaker+UI) |
| **AI SOP Assistant** | ![AI Tools Placeholder](https://via.placeholder.com/200x400?text=AI+SOP+Generator) |
| **Scholarship Discovery** | ![Discovery Placeholder](https://via.placeholder.com/200x400?text=Scholarship+List) |
| **Application Tracking** | ![Tracking Placeholder](https://via.placeholder.com/200x400?text=Application+Status) |
| **Community Discussion** | ![Community Placeholder](https://via.placeholder.com/200x400?text=Discussion+Forum) |
| **Mentor Booking** | ![Mentorship Placeholder](https://via.placeholder.com/200x400?text=Mentor+Sessions) |
| **Document Vault** | ![Vault Placeholder](https://via.placeholder.com/200x400?text=Document+Vault) |
| **User Profile** | ![Profile Placeholder](https://via.placeholder.com/200x400?text=Student+Profile) |
| **Admin Dashboard** | ![Admin Placeholder](https://via.placeholder.com/200x400?text=Admin+Portal) |
| **Payment Gateway** | ![Payment Placeholder](https://via.placeholder.com/200x400?text=Payment+Screen) |
| **Success Blog** | ![Blog Placeholder](https://via.placeholder.com/200x400?text=Scholarship+Blog) |
| **Stories & Polls** | ![Stories Placeholder](https://via.placeholder.com/200x400?text=Visual+Stories) |
| **Chat & Reactions** | ![Chat Placeholder](https://via.placeholder.com/200x400?text=Messaging+UI) |
| **Moderation Center** | ![Moderation Placeholder](https://via.placeholder.com/200x400?text=Admin+Moderation) |
| **Leaderboard** | ![Leaderboard Placeholder](https://via.placeholder.com/200x400?text=Scholar+Rankings) |

*(Note: Replace placeholders with actual screenshots from the mobile device.)*

---

## 5. Conclusion
ScholarshipConnect-BD successfully integrates advanced backend logic (NLP matching, AI generation, automated workflows) with a user-friendly mobile interface. The connection between the Python/Django backend and the React Native frontend ensures a seamless and scalable experience for students.
