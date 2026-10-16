# AI Tools Documentation (AI টুলস গাইড)

ScholarshipConnectBD অ্যাপে কৃত্রিম বুদ্ধিমত্তা (AI) ব্যবহার করে শিক্ষার্থীদের আবেদনের প্রক্রিয়াকে সহজ করার জন্য বেশ কিছু ফিচার যোগ করা হয়েছে। এই ফাইলটি ডেভেলপারদের এই টুলগুলোর লজিক বুঝতে সাহায্য করবে।

---

## ১. AI SOP Assistant
**Path:** `mobile/app/ai-tools/sop-helper.js`

### Overview
এটি শিক্ষার্থীদের **Statement of Purpose (SOP)** বা মোটিভেশন লেটার লিখতে এবং আগের লেখাটি উন্নত করতে সাহায্য করে।

### Component Logic (Bangla Explanation)
*   **Dual Mode Functionality:** এই স্ক্রিনটিতে দুইটি মোড আছে:
    *   **Write Draft:** কোনো নির্দিষ্ট স্কলারশিপের তথ্যের ওপর ভিত্তি করে AI একদম নতুন একটি ড্রাফট তৈরি করে দেয়।
    *   **Review & Fix:** ইউজারের নিজের লেখা SOP পেস্ট করলে AI সেটি চেক করে ফিডব্যাক দেয়।
*   **Context Integration:** যখন ইউজার কোনো স্কলারশিপ পেজ থেকে এখানে আসে, তখন `scholarshipId` ব্যবহার করে AI ওই স্কলারশিপের প্রয়োজনীয়তা অনুযায়ী ড্রাফট লেখে।
*   **One-click Apply:** ড্রাফট জেনারেট হওয়ার পর "Use this in Application" বাটনে ক্লিক করলে ড্রাফটটি সরাসরি এপ্লিকেশন ফর্মে চলে যায়।

---

## ২. AI CV Reviewer
**Path:** `mobile/app/ai-tools/cv-reviewer.js`

### Overview
ইউজারের সিভি (CV/Resume) গ্লোবাল স্ট্যান্ডার্ড অনুযায়ী হয়েছে কি না, তা যাচাই করার টুল।

### Component Logic (Bangla Explanation)
*   **Text Analysis:** ইউজার তার সিভির টেক্সট এখানে পেস্ট করে "Analyze My CV" বাটনে ক্লিক করলে AI এটি বিশ্লেষণ করে।
*   **Feedback Mechanism:** AI মূলত স্কিল গ্যাপ, ফরমেটিং সমস্যা এবং সিভিতে কোন কোন তথ্য যোগ করলে ভালো হবে সে বিষয়ে একটি বিস্তারিত ফিডব্যাক দেয় (Alert-এর মাধ্যমে দেখানো হয়)।
*   **Minimalistic UI:** এখানে একটি হিরো সেকশন এবং বড় টেক্সট ইনপুট এরিয়া ব্যবহার করা হয়েছে যাতে বড় সিভি সহজে পড়া যায়।

---

## ৩. AI Live Support
**Path:** `mobile/app/ai-tools/support-bot.js`

### Overview
ইউজারদের যেকোনো জিজ্ঞাসার তাৎক্ষণিক উত্তর দেওয়ার জন্য একটি রিয়েল-টাইম চ্যাটবট।

### Component Logic (Bangla Explanation)
*   **Conversational Interface:** এটি একটি চ্যাট বাবল ইন্টারফেস ব্যবহার করে যেখানে ইউজার মেসেজ পাঠাতে পারে।
*   **Contextual History:** চ্যাট করার সময় আগের কয়েকটা মেসেজের কন্টেক্সট AI-কে পাঠানো হয় যাতে সে প্রাসঙ্গিক উত্তর দিতে পারে।
*   **Auto-scroll:** নতুন মেসেজ আসলে চ্যাট লিস্ট অটোমেটিক নিচে স্ক্রল হয়ে যায়।

---

## Technical Details (AI Integration)

### API Communication
সব AI ফিচার `mobile/services/api.js` এর মাধ্যমে ব্যাকএন্ডের সাথে যোগাযোগ করে:
*   `apiService.aiWriteSOP(scholarshipId)`
*   `apiService.aiReviewSOP(text)`
*   `apiService.aiReviewCV(text)`
*   `apiService.aiLiveSupport(message, history)`

### AI Engine & Multi-Provider Architecture (এআই ইঞ্জিন)
আমাদের অ্যাপের এআই সিস্টেম একাধিক প্রোভাইডারের ফেইলওভার ও চেইনিং প্রক্রিয়ায় কাজ করে:
*   **Primary Engine:** **xAI (Grok)** এবং **Groq** (LLaMA মডেল ভিত্তিক হাই-স্পিড ইনফারেন্স)।
*   **Google Gemini:** **Gemini 2.0 Flash / Pro** (REST API এবং ক্লাউড এসডিকে)।
*   **Free Fallback:** **Pollinations AI** (ওপেন এআই ফলব্যাক, যা কোনো কি ব্যর্থ হলেও নিরবচ্ছিন্ন সার্ভিস দেয়)।
*   **Backend Path:** `backend/ai_assistant/services.py`.
*   **Key Features:**
    *   **Auto API Key Rotation:** একাধিক কি ও মডেল অটো-সুইচ হয়।
    *   **Smart Scholarship Matchmaker:** TF-IDF এবং Cosine Similarity-র সাহায্যে প্রোফাইলের সাথে স্কলারশিপের স্মার্ট ম্যাচিং (বিস্তারিত দেখুন [SMART_MATCHMAKER.md](../../../SMART_MATCHMAKER.md))।
    *   **Optimized Config:** Temperature: 0.6 - 1.0 ব্যবহার করা হয়েছে যাতে উত্তরগুলো প্রাসঙ্গিক ও সঠিক হয়।
*   **Fallback:** যদি সমস্ত অনলাইন API ব্যর্থ হয়, তবে সিস্টেম অটোমেটিক ব্যাকআপ রেসপন্স প্রদান করে।

### Styling Tokens
এই পেজগুলোতে আমাদের থিম ফাইল (`theme.js`) থেকে নিচের টোকেনগুলো ব্যবহার করা হয়েছে:
*   `theme.colors.tealCard`: ইনফো বক্সের জন্য।
*   `theme.shadows.teal`: একশন বাটনের প্রিমিয়াম এফেক্টের জন্য।
*   `theme.borderRadius.xl`: কার্ড ডিজাইনের জন্য।

---

### How to add a new AI Tool?
১. `mobile/app/ai-tools/` ফোল্ডারে নতুন একটি `.js` ফাইল তৈরি করুন।
২. `api.js`-এ প্রক্সি মেথড যোগ করুন।
৩. `Sidebar.js` অথবা `Home` স্ক্রিনে লিংকটি যুক্ত করুন।
