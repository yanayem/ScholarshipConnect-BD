# ScholarshipConnect-BD — Risk Management Strategy

> **Comprehensive Technical & Business Risk Analysis Framework featuring Proactive Mitigation and Reactive Incident Response Strategies.**

---

## 📋 Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Risk Evaluation Methodology](#2-risk-evaluation-methodology)
   - [Likelihood & Impact Scales](#likelihood--impact-scales)
   - [Risk Matrix & Score Calculation](#risk-matrix--score-calculation)
3. [Master Risk Register (Technical vs. Business Taxonomy)](#3-master-risk-register-technical-vs-business-taxonomy)
4. [Technical Risks: Proactive & Reactive Strategies](#4-technical-risks-proactive--reactive-strategies)
   - [T-01: Multi-Provider LLM API Outage & Rate Limiting](#t-01-multi-provider-llm-api-outage--rate-limiting)
   - [T-02: Firebase Service Account Key Leak & Auth Bypass](#t-02-firebase-service-account-key-leak--auth-bypass)
   - [T-03: Document Vault Authorization Failure & PII Data Leakage](#t-03-document-vault-authorization-failure--pii-data-leakage)
   - [T-04: Database Degradation & High Latency During Deadline Spikes](#t-04-database-degradation--high-latency-during-deadline-spikes)
   - [T-05: TF-IDF Cosine Similarity Engine Computation Overhead](#t-05-tf-idf-cosine-similarity-engine-computation-overhead)
   - [T-06: Firebase Cloud Messaging (FCM) Push Delivery Failure](#t-06-firebase-cloud-messaging-fcm-push-delivery-failure)
   - [T-07: Cross-Platform UI/UX Layout Shift (Expo Native vs. Web)](#t-07-cross-platform-uiux-layout-shift-expo-native-vs-web)
   - [T-08: Djongo ORM Translation & MongoDB Aggregation Constraints](#t-08-djongo-orm-translation--mongodb-aggregation-constraints)
   - [T-09: Native Mobile OS Backward Compatibility & SDK Version Drift](#t-09-native-mobile-os-backward-compatibility--sdk-version-drift)
5. [Business & Operational Risks: Proactive & Reactive Strategies](#5-business--operational-risks-proactive--reactive-strategies)
   - [B-01: Payment Gateway Webhook Failure & Pro Upgrade Disruption](#b-01-payment-gateway-webhook-failure--pro-upgrade-disruption)
   - [B-02: Fraudulent Scholarship Submissions & Point Farming](#b-02-fraudulent-scholarship-submissions--point-farming)
   - [B-03: Forum & Real-Time Chat Spam, Harassment & Phishing](#b-03-forum--real-time-chat-spam-harassment--phishing)
   - [B-04: Mentorship Marketplace Disruption & Session Abandonment](#b-04-mentorship-marketplace-disruption--session-abandonment)
   - [B-05: Regulatory Non-Compliance & Misleading Opportunity Listings](#b-05-regulatory-non-compliance--misleading-opportunity-listings)
   - [B-06: Mentor Impersonation & Alumni Identity Fraud](#b-06-mentor-impersonation--alumni-identity-fraud)
   - [B-07: AI Hallucination & Plagiarism / Inaccurate SOP Advisory](#b-07-ai-hallucination--plagiarism--inaccurate-sop-advisory)
   - [B-08: Timezone Discrepancy (BST vs. Target Country JST/GMT/EST)](#b-08-timezone-discrepancy-bst-vs-target-country-jstgmtest)
6. [Incident Response & Disaster Recovery Workflow](#6-incident-response--disaster-recovery-workflow)
7. [Continuous Risk Monitoring & Audit Protocol](#7-continuous-risk-monitoring--audit-protocol)

---

## 1. Executive Summary

**ScholarshipConnectBD** is a cross-platform academic portal designed for Bangladeshi students pursuing international scholarships. The ecosystem combines **React Native (Expo SDK 56)**, **Next.js 16**, **Django REST Framework**, **MongoDB Atlas (via Djongo)**, **Firebase Auth/FCM**, **SSLCommerz payments**, and **Multi-Provider AI Engines (Groq, Gemini, xAI, Pollinations)**.

To ensure long-term sustainability, user trust, and system stability, this document categorizes potential threats into **Technical Risks** and **Business/Operational Risks**, establishing both **Proactive Strategies** (preventive measures taken *before* occurrence) and **Reactive Strategies** (contingency and remediation actions taken *when* triggered).

---

## 2. Risk Evaluation Methodology

Risk prioritization uses a standard **5x5 Evaluation Matrix** where:
$$\text{Risk Score} = \text{Likelihood (1–5)} \times \text{Impact (1–5)}$$

### Likelihood & Impact Scales

| Scale | Likelihood Definition | Impact Definition (Technical / Financial / Operational) |
| :---: | :--- | :--- |
| **5** | **Almost Certain** (>80% probability) | **Critical**: Total system downtime, major security breach, severe financial loss. |
| **4** | **Likely** (51%–80% probability) | **Major**: Core feature outage (Payments down, AI suite offline), compliance breach. |
| **3** | **Possible** (21%–50% probability) | **Moderate**: Non-critical feature degradation, minor financial leak, user friction. |
| **2** | **Unlikely** (6%–20% probability) | **Minor**: Isolated UI glitch, localized performance delay, minor spam issue. |
| **1** | **Rare** (<5% probability) | **Negligible**: Imperceptible system lag, self-healing background glitch. |

### Risk Matrix & Priority Ranking

```text
               LIKELIHOOD (Probability)
          1 (Rare)  2 (Unlikely) 3 (Possible) 4 (Likely) 5 (Almost Certain)
        +---------+------------+------------+----------+-------------------+
  5 (Cr)|    5    |     10     |     15     |    20    |        25         |
I 4 (Mj)|    4    |      8     |     12     |    16    |        20         |
M 3 (Mo)|    3    |      6     |      9     |    12    |        15         |
P 2 (Mn)|    2    |      4     |      6     |     8    |        10         |
  1 (Ng)|    1    |      2     |      3     |     4    |         5         |
        +---------+------------+------------+----------+-------------------+
```

- 🔴 **CRITICAL (15–25)**: Mandatory real-time alerts. Requires immediate mitigation.
- 🟠 **HIGH (10–14)**: Priority sprint resolution and active automated monitoring.
- 🟡 **MEDIUM (5–9)**: Standard maintenance mitigation with fallback workarounds.
- 🟢 **LOW (1–4)**: Passive monitoring with basic defensive coding practices.

---

## 3. Master Risk Register (Technical vs. Business Taxonomy)

### 🛠️ Technical Risks (T-Series)

| Rank | Risk ID | Technical Category | Risk Title | Likelihood | Impact | Score | Risk Level |
| :---: | :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 🥇 **1** | **T-01** | AI & External APIs | Multi-Provider LLM Outage & Rate Limiting | 4 | 5 | **20** | 🔴 **CRITICAL** |
| 🥉 **3** | **T-02** | Security & Auth | Firebase Key Exposure & Admin Gate Leak | 3 | 5 | **15** | 🔴 **CRITICAL** |
| **5** | **T-03** | Data Privacy | Document Vault Authorization & PII Leak | 2 | 5 | **10** | 🟠 **HIGH** |
| **6** | **T-04** | Infrastructure | DB Bottleneck During Deadline Spikes | 3 | 4 | **12** | 🟠 **HIGH** |
| **8** | **T-05** | Algorithms | TF-IDF Cosine Similarity CPU Lag | 2 | 4 | **8** | 🟡 **MEDIUM** |
| **9** | **T-06** | Infrastructure | FCM Push Notification Delivery Failure | 2 | 2 | **4** | 🟢 **LOW** |
| **10**| **T-07** | Frontend / Web | Expo Native vs. Web Layout Inconsistency | 3 | 2 | **6** | 🟡 **MEDIUM** |
| **13**| **T-08** | Database ORM | Djongo ORM SQL-to-NoSQL Query Errors | 2 | 4 | **8** | 🟡 **MEDIUM** |
| **14**| **T-09** | Mobile Compatibility| Expo SDK 56 & Legacy Android Crashes | 2 | 3 | **6** | 🟡 **MEDIUM** |

### 💼 Business & Operational Risks (B-Series)

| Rank | Risk ID | Business Category | Risk Title | Likelihood | Impact | Score | Risk Level |
| :---: | :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 🥈 **2** | **B-01** | Monetization & Finance | Payment Gateway Webhook Verification Failure | 3 | 5 | **15** | 🔴 **CRITICAL** |
| **4** | **B-02** | Fraud & Operations | Fake Submissions & Gamification Point Farming | 3 | 4 | **12** | 🟠 **HIGH** |
| **7** | **B-03** | Moderation & Safety | Forum & Chat Spam, Harassment, Phishing | 3 | 3 | **9** | 🟡 **MEDIUM** |
| **11**| **B-04** | Marketplace Quality | Mentor Session Abandonment & Absence | 2 | 3 | **6** | 🟡 **MEDIUM** |
| **12**| **B-05** | Legal & Reputation | Unverified Foreign University Ad Listings | 1 | 4 | **4** | 🟢 **LOW** |
| **15**| **B-06** | Identity Trust | Mentor Identity Fraud & Fake Alumni Profile | 2 | 4 | **8** | 🟡 **MEDIUM** |
| **16**| **B-07** | Product Quality | AI Hallucination & Plagiarized SOP Advisory | 3 | 3 | **9** | 🟡 **MEDIUM** |
| **17**| **B-08** | Timezone Operations | Timezone Discrepancy (BST vs JST/GMT/EST) | 3 | 2 | **6** | 🟡 **MEDIUM** |

---

## 4. Technical Risks: Proactive & Reactive Strategies

---

### T-01: Multi-Provider LLM API Outage & Rate Limiting
- **Category:** Technical — AI Engine & External APIs
- **Evaluation:** Likelihood: **4** | Impact: **5** | **Score: 20 (🔴 CRITICAL)** | **Rank: 1**
- **Description:** SOP Generator, CV Reviewer, and Discussion Solution Analyzer rely on external LLM APIs (Groq, Gemini, xAI, Pollinations AI). Provider rate limits (RPM/TPM) or outages break core user flows.
- **Proactive Strategy (Preventive):**
  1. **Multi-Provider Fallback Chain:** System executes LLM requests in sequence: `Groq (Primary) → Gemini (Secondary) → xAI Grok → Pollinations AI (Fallback)`.
  2. **API Key Rotation & Usage Budgeting:** Maintain key pools per provider in Django; track request logs in `AI_REQUEST_LOG` to prevent quota exhaustion.
  3. **Response & Embedding Caching:** Cache generated SOP templates and vector embeddings for recurring prompt signatures.
- **Reactive Strategy (Incident Response):**
  1. **Automatic Failover Routing:** On HTTP 429/503 from primary vendor, silently route request to secondary vendor within the same request lifecycle.
  2. **Offline Local Template Degradation:** If all APIs fail, switch to local rule-based template generation and notify user to retry in 60 seconds without throwing 500 errors.

---

### T-02: Firebase Service Account Key Leak & Auth Bypass
- **Category:** Technical — Security & Authentication
- **Evaluation:** Likelihood: **3** | Impact: **5** | **Score: 15 (🔴 CRITICAL)** | **Rank: 3**
- **Description:** Accidental committing of `FIREBASE_SERVICE_ACCOUNT_KEY` or privilege elevation allows attackers to bypass backend checks or manipulate user profiles.
- **Proactive Strategy (Preventive):**
  1. **Git Secret Scanning & Strict Guarding:** Keep credentials strictly inside `.env`, ignored by `.gitignore`; execute automated pre-commit hook scanning (`git-secrets`).
  2. **Dual-Gate Admin Verification:** Admin access requires BOTH a valid Firebase token AND a secondary Django Admin credential check (`AdminTokenObtainPairView`).
  3. **Email White-listing Enforcement:** Backend limits auto-staff privileges to exact emails matched in the `ADMIN_EMAILS` environment variable.
- **Reactive Strategy (Incident Response):**
  1. **Instant Key Revocation:** Revoke compromised keys immediately via Firebase Console and issue new credentials.
  2. **Automated Server Secret Cycle:** Trigger zero-downtime secret rotation on production environment (Vercel / Cloud Host) and audit recent admin activity logs (`ActivityLog`).

---

### T-03: Document Vault Authorization Failure & PII Data Leakage
- **Category:** Technical — Data Privacy & Security
- **Evaluation:** Likelihood: **2** | Impact: **5** | **Score: 10 (🟠 HIGH)** | **Rank: 5**
- **Description:** Passports, academic transcripts, and LORs stored in Document Vault accessed by unauthorized third parties due to misconfigured API permissions.
- **Proactive Strategy (Preventive):**
  1. **Strict QuerySet Scoping:** Force user-level scoping inside Django ViewSets:
     ```python
     def get_queryset(self):
         return UserDocument.objects.filter(user=self.request.user)
     ```
  2. **Obfuscated UUID Storage:** Save files on disk with non-predictable UUID hashes (`/media/user_docs/<uuid>.pdf`) to block directory traversal.
  3. **Tokenized Private Media Access:** Restrict static media serving through Django view validation rather than exposed public URLs.
- **Reactive Strategy (Incident Response):**
  1. **Emergency Media Link Revocation:** Block media endpoint access globally upon detecting unauthorized access patterns.
  2. **User Notification & Audit Trail:** Notify impacted users within 24 hours and supply logs to privacy regulators.

---

### T-04: Database Degradation & High Latency During Deadline Spikes
- **Category:** Technical — Infrastructure & Performance
- **Evaluation:** Likelihood: **3** | Impact: **4** | **Score: 12 (🟠 HIGH)** | **Rank: 4**
- **Description:** Peak application periods (e.g., MEXT, Chevening deadlines) create request spikes, slowing MongoDB Atlas / Djongo ORM response times.
- **Proactive Strategy (Preventive):**
  1. **MongoDB Atlas Compound Indexing:** Index frequent query fields: `(status, deadline, country)`.
  2. **Client-Side Caching Layer:** Utilize `AsyncStorage` (Mobile) and `localStorage` (Web) via `cache.js` to serve cached listings offline or under slow networks.
  3. **API Pagination & Selective Fields:** Enforce strict DRF pagination limits (max 20 records) with payload field filtering.
- **Reactive Strategy (Incident Response):**
  1. **Static JSON Fallback Mode:** Dynamically switch the public discovery feed to read-only cached CDN JSON during peak load spikes (>90% CPU usage).
  2. **Database Auto-Scaling:** Trigger MongoDB Atlas tier scale-up via cloud webhook alerts.

---

### T-05: TF-IDF Cosine Similarity Engine Computation Overhead
- **Category:** Technical — Recommendation Engine
- **Evaluation:** Likelihood: **2** | Impact: **4** | **Score: 8 (🟡 MEDIUM)** | **Rank: 8**
- **Description:** Recalculating TF-IDF matrices on-the-fly for thousands of users and scholarships causing high CPU utilization on Django servers.
- **Proactive Strategy (Preventive):**
  1. **Two-Stage Matchmaking Pipeline:** Filter by hard criteria (CGPA, Country, Degree) *before* running scikit-learn vector calculations on the remaining subset.
  2. **Pre-Vectorized Corpus Caching:** Periodically pre-compute and store vector matrices in memory instead of building them per request.
- **Reactive Strategy (Incident Response):**
  1. **Heuristic Hard-Criteria Fallback:** Temporarily disable NLP similarity and return hard-matching criteria if vector calculation execution time exceeds 500ms.

---

### T-06: Firebase Cloud Messaging (FCM) Push Delivery Failure
- **Category:** Technical — Infrastructure & Communication
- **Evaluation:** Likelihood: **2** | Impact: **2** | **Score: 4 (🟢 LOW)** | **Rank: 9**
- **Description:** Push notifications fail due to expired FCM tokens or OS background throttling.
- **Proactive Strategy (Preventive):**
  1. **Automatic Token Lifecycle Refresh:** Auto-renew FCM tokens on every app launch and sync with Django backend.
  2. **Dual Notification Storage:** Save all push alerts into the database `Notification` model alongside FCM transmission.
- **Reactive Strategy (Incident Response):**
  1. **In-App Notification Inbox Fallback:** Guarantee user visibility via the persistent in-app bell notification hub even if push messages fail to deliver.

---

### T-07: Cross-Platform UI/UX Layout Shift (Expo Native vs. Web)
- **Category:** Technical — Frontend & Web Integration
- **Evaluation:** Likelihood: **3** | Impact: **2** | **Score: 6 (🟡 MEDIUM)** | **Rank: 10**
- **Description:** Display inconsistencies or broken components when rendering screens across varied Android devices or Next.js desktop web browsers.
- **Proactive Strategy (Preventive):**
  1. **Unified Design System:** Shared theme constants (`theme.js` & Tailwind CSS) enforcing consistent spacing, colors, and typography.
  2. **Safe Area & Flexbox Constraints:** Wrap layouts inside `SafeAreaView` with flex dimensions to prevent overflow across different screen ratios.
- **Reactive Strategy (Incident Response):**
  1. **Over-the-Air (OTA) Hotfixes:** Deploy layout hotfixes instantly via Expo EAS Update for mobile and Vercel automated triggers for web.

---

### T-08: Djongo ORM Translation & MongoDB Aggregation Constraints
- **Category:** Technical — Database ORM Architecture
- **Evaluation:** Likelihood: **2** | Impact: **4** | **Score: 8 (🟡 MEDIUM)** | **Rank: 13**
- **Description:** Djongo acts as a SQL-to-NoSQL translator. Complex Django ORM `annotate()`, `aggregate()`, or nested `select_related()` queries can fail or produce unexpected MongoDB query errors.
- **Proactive Strategy (Preventive):**
  1. **Avoid Complex SQL Joins in Djongo:** Keep ORM queries simple; handle complex data transformations using native Python data structures or raw PyMongo queries where necessary.
  2. **Comprehensive Integration Testing:** Test all custom DRF filtering and search endpoints against Djongo in staging environment.
- **Reactive Strategy (Incident Response):**
  1. **PyMongo Native Query Fallback:** Fallback to direct PyMongo collection queries if Djongo fails to translate complex SQL clauses during runtime.

---

### T-09: Native Mobile OS Backward Compatibility & SDK Version Drift
- **Category:** Technical — Mobile OS & Expo Compatibility
- **Evaluation:** Likelihood: **2** | Impact: **3** | **Score: 6 (🟡 MEDIUM)** | **Rank: 14**
- **Description:** Using Expo SDK 56 with newer React Native libraries may cause unexpected crashes on legacy Android versions (e.g., Android 8.0/9.0) or low-spec devices.
- **Proactive Strategy (Preventive):**
  1. **Explicit Target Device Testing:** Test standalone APK builds on older Android API levels (API 26+) via Android Studio emulators and BrowserStack.
  2. **Polyfill & Fallback Guards:** Enforce defensive JavaScript null-checks and polyfills for modern ES features.
- **Reactive Strategy (Incident Response):**
  1. **Targeted OTA Rollback:** Roll back unstable native builds via EAS Update channels to previous stable release versions.

---

## 5. Business & Operational Risks: Proactive & Reactive Strategies

---

### B-01: Payment Gateway Webhook Failure & Pro Upgrade Disruption
- **Category:** Business — Monetization & Financial Management
- **Evaluation:** Likelihood: **3** | Impact: **5** | **Score: 15 (🔴 CRITICAL)** | **Rank: 2**
- **Description:** Unstable mobile internet connections (bKash/Nagad/Rocket) or dropped SSLCommerz IPN webhooks lead to unpaid upgrades or double-charging.
- **Proactive Strategy (Preventive):**
  1. **Server-to-Server IPN Verification:** Validate every transaction against SSLCommerz Validation API server-side before updating status to `Pro`.
  2. **Atomic DB Transactions:** Wrap payment handling in Django atomic transactions with unique constraint checks on `transaction_id`.
  3. **Clear Transaction Status Messaging:** Inform users during checkout about verification status and provide immediate support routing.
- **Reactive Strategy (Incident Response):**
  1. **Automated Cron Re-verification:** Background cron job re-queries SSLCommerz API every 15 minutes for `Pending` transactions.
  2. **Manual Admin Override Portal:** Provide admins with an audit console to manually verify payment proofs and grant Pro access instantly.

---

### B-02: Fraudulent Scholarship Submissions & Point Farming
- **Category:** Business — Operational Fraud & Ecosystem Trust
- **Evaluation:** Likelihood: **3** | Impact: **4** | **Score: 12 (🟠 HIGH)** | **Rank: 4**
- **Description:** Users submit fake or duplicate scholarship entries to illegally farm **200 ScholarPoints** and bypass paying 500 BDT for `ScholarConnect Pro`.
- **Proactive Strategy (Preventive):**
  1. **Mandatory Admin Review Gate:** User submissions default to `Pending` status and are *never* live or rewarded until manually approved by an Admin.
  2. **Submission Throttling:** Throttle submission endpoints to max 3 entries per user per 24 hours (`SensitiveActionThrottle`).
  3. **50-Point Rejection Penalty:** Automatically deduct **50 ScholarPoints** from a user profile if their submission is rejected as fake or spam.
- **Reactive Strategy (Incident Response):**
  1. **Point Revocation & Account Freeze:** Revoke illegally obtained Pro status and deduct farmed points upon discovering fraud.
  2. **User Account Ban:** Blacklist users exhibiting automated submission spam.

---

### B-03: Forum & Real-Time Chat Spam, Harassment & Phishing
- **Category:** Business — Community Safety & Brand Reputation
- **Evaluation:** Likelihood: **3** | Impact: **3** | **Score: 9 (🟡 MEDIUM)** | **Rank: 7**
- **Description:** Malicious links, offensive posts, or scholarship scam messages in public forums, visual stories, or direct chat.
- **Proactive Strategy (Preventive):**
  1. **AI Automated Content Screening:** Use LLM filters to analyze text for scam URLs, inappropriate language, and contact info leakage before posting.
  2. **User Reporting Tools:** Embed direct "Report" buttons on posts, comments, and chat messages.
- **Reactive Strategy (Incident Response):**
  1. **Admin Moderation Center Action:** Admins review reported items in `moderation.js` and execute soft-deletions or account warnings.
  2. **Instant Link Redirection Shield:** Warn users via modal when opening external URLs outside verified scholarship domains.

---

### B-04: Mentorship Marketplace Disruption & Session Abandonment
- **Category:** Business — Marketplace Quality & Customer Satisfaction
- **Evaluation:** Likelihood: **2** | Impact: **3** | **Score: 6 (🟡 MEDIUM)** | **Rank: 11**
- **Description:** Verified mentors accept 1-on-1 guidance sessions but fail to attend or respond, leading to student dissatisfaction.
- **Proactive Strategy (Preventive):**
  1. **Strict Mentor Vetting:** Admins manually verify mentor credentials and university admission proofs before approval.
  2. **Automated Reminders:** Send push notifications and email reminders 24 hours and 1 hour before scheduled sessions.
- **Reactive Strategy (Incident Response):**
  1. **Session Rescheduling & Rating Adjustment:** Allow mentees to report no-shows, automatically re-crediting session tokens and lowering mentor responsiveness ratings.
  2. **Mentor Badge Revocation:** Delist non-responsive mentors after two unexcused absences.

---

### B-05: Regulatory Non-Compliance & Misleading Opportunity Listings
- **Category:** Business — Legal & Regulatory Compliance
- **Evaluation:** Likelihood: **1** | Impact: **4** | **Score: 4 (🟢 LOW)** | **Rank: 12**
- **Description:** Inadvertently listing unauthorized education agencies or fraudulent overseas scholarship programs violating Bangladeshi education policies.
- **Proactive Strategy (Preventive):**
  1. **Official Provider Whitelisting:** Cross-reference university opportunities against official government scholarship portals (MEXT, Chevening, DAAD, Fulbright).
  2. **Legal Disclaimer Footer:** Display explicit disclaimers stating ScholarshipConnectBD provides informational matching and is not a visa agency.
- **Reactive Strategy (Incident Response):**
  1. **Immediate Listing Delisting:** Takedown questioned listings within 1 hour of regulatory notice.

---

### B-06: Mentor Impersonation & Alumni Identity Fraud
- **Category:** Business — Identity Trust & Student Safety
- **Evaluation:** Likelihood: **2** | Impact: **4** | **Score: 8 (🟡 MEDIUM)** | **Rank: 15**
- **Description:** Fraudulent actors create fake mentor profiles claiming to be MEXT or Chevening scholars to solicit fees or personal student information outside the platform.
- **Proactive Strategy (Preventive):**
  1. **Mandatory Credential Verification:** Require admission offer letters or official university email (`.edu`/`.ac.uk`) verification before issuing a verified Mentor badge.
  2. **In-App Safety Warnings:** Warn students never to transfer money or personal documents directly outside the ScholarshipConnectBD platform.
- **Reactive Strategy (Incident Response):**
  1. **Instant Profile Suspension & Public Warning:** Suspend fraudulent mentor accounts and issue security alerts if phishing occurred.

---

### B-07: AI Hallucination & Plagiarism / Inaccurate SOP Advisory
- **Category:** Business & Product Quality — User Risk
- **Evaluation:** Likelihood: **3** | Impact: **3** | **Score: 9 (🟡 MEDIUM)** | **Rank: 16**
- **Description:** AI SOP generator creates generic, inaccurate, or hallucinated academic details, leading to rejected university applications if students submit without editing.
- **Proactive Strategy (Preventive):**
  1. **Explicit AI Disclaimer Banner:** Display clear notice that AI-generated SOPs are structural drafts requiring human customization.
  2. **Plagiarism & Generic Phrase Warning:** Guide users to personalize specific personal achievements and research interests.
- **Reactive Strategy (Incident Response):**
  1. **Prompt Template Tuning:** Dynamically refine system prompts in `ai_assistant/services.py` to enforce academic factual integrity and discourage generic fluff.

---

### B-08: Timezone Discrepancy (BST vs. Target Country JST/GMT/EST)
- **Category:** Business & Operations — User Experience
- **Evaluation:** Likelihood: **3** | Impact: **2** | **Score: 6 (🟡 MEDIUM)** | **Rank: 17**
- **Description:** Scholarship deadlines expressed in foreign timezones (e.g., JST for MEXT Japan, GMT for UK, EST for US) misalign with Bangladesh Standard Time (BST, UTC+6), causing missed applications.
- **Proactive Strategy (Preventive):**
  1. **Timezone Normalization Engine:** Convert and display all scholarship deadlines strictly in Bangladesh Standard Time (BST, UTC+6) alongside local target timezone.
  2. **24-Hour Final Warning Push:** Trigger push alerts 24 hours prior to deadline based on BST calculations.
- **Reactive Strategy (Incident Response):**
  1. **Urgent Deadline Alert Banner:** Flag scholarships closing within 12 hours with an amber "Expiring Today" urgency banner in the mobile feed.

---

## 6. Incident Response & Disaster Recovery Workflow

```text
+-----------------------------------------------------------------------------------+
|                        INCIDENT RESPONSE LIFECYCLE                                |
+-----------------------------------------------------------------------------------+
| 1. IDENTIFY     -> Error logging (Sentry/Django logs), Admin alert triggers       |
| 2. CONTAIN      -> Enable graceful degradation (Read-Only / Static JSON fallback) |
| 3. ERADICATE    -> Deploy bug fix (EAS OTA / Vercel), rotate compromised secrets  |
| 4. RECOVER      -> Restore database state from MongoDB Atlas PITR snapshot        |
| 5. AUDIT        -> Document root cause analysis and update Risk Register          |
+-----------------------------------------------------------------------------------+
```

### Data Backup & Snapshot Matrix

| System Component | Backup Strategy | Frequency | Retention Period | Recovery Time Objective (RTO) |
| :--- | :--- | :---: | :---: | :---: |
| **MongoDB Atlas DB** | Continuous Point-in-Time (PITR) | Real-time | 30 Days | < 15 Minutes |
| **User Document Vault** | Cloud Storage Cross-Region Sync | Daily | 90 Days | < 30 Minutes |
| **Environment Secrets** | Encrypted Secret Vault | Weekly | Perpetual | < 5 Minutes |

---

## 7. Continuous Risk Monitoring & Audit Protocol

To ensure continuous risk oversight, the development and management team adheres to the following review schedule:

```text
+-----------------------------------------------------------------------------------+
|                       CONTINUOUS AUDIT TIMELINE                                   |
+-----------------------------------------------------------------------------------+
| Daily (1x/day)   -> Inspect AI_REQUEST_LOG, payment errors & reported posts.      |
| Bi-Weekly (Sprint)-> Review risk impact of new code additions during sprint.     |
| Monthly (1x/mo)  -> Run pip-audit, vulnerability scans & Firebase access audit.   |
| Pre-Season       -> Conduct stress testing prior to peak application cycles.      |
+-----------------------------------------------------------------------------------+
```

---

*Document Version: 2.1 (Expanded Technical & Business Risk Analysis)*
*Maintained by: Team ScholarshipConnectBD (BUBT)*
