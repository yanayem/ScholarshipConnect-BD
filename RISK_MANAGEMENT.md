# ScholarshipConnect-BD — Risk Management & Impact Analysis Strategy

> **Comprehensive Risk Assessment, Threat Modeling, Impact Ranking, and Mitigation Framework for ScholarshipConnectBD.**

---

## 📋 Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Risk Evaluation Methodology](#2-risk-evaluation-methodology)
   - [Likelihood Scale](#likelihood-scale)
   - [Impact Scale](#impact-scale)
   - [Risk Matrix & Priority Ranking](#risk-matrix--priority-ranking)
3. [Master Risk Register (Ranked Overview)](#3-master-risk-register-ranked-overview)
4. [Detailed Risk Analysis by Category](#4-detailed-risk-analysis-by-category)
   - [Category A: AI Engine & Third-Party Integration Risks](#category-a-ai-engine--third-party-integration-risks)
   - [Category B: Security & Authentication Risks](#category-b-security--authentication-risks)
   - [Category C: Financial & Monetization Risks](#category-c-financial--monetization-risks)
   - [Category D: Data Privacy & Document Storage Risks](#category-d-data-privacy--document-storage-risks)
   - [Category E: Infrastructure & Performance Risks](#category-e-infrastructure--performance-risks)
   - [Category F: Operational & Community Content Risks](#category-f-operational--community-content-risks)
5. [Contingency & Disaster Recovery Plan](#5-contingency--disaster-recovery-plan)
6. [Continuous Risk Monitoring & Audit Protocol](#6-continuous-risk-monitoring--audit-protocol)

---

## 1. Executive Summary

**ScholarshipConnectBD** is an AI-powered cross-platform mobile and web application designed to connect Bangladeshi students with international scholarship opportunities. Operating a complex architecture comprising React Native (Expo SDK 56), Next.js 16, Django REST Framework, MongoDB Atlas, Firebase Auth/FCM, SSLCommerz payments, and multi-provider LLM integrations introduces varied technical, operational, financial, and security risks.

This document establishes a structured **Risk Management Strategy** to identify, analyze, rank, and mitigate risks that could affect system availability, data integrity, user safety, legal compliance, or financial sustainability.

---

## 2. Risk Evaluation Methodology

Risk evaluation uses a standard **5x5 Matrix** measuring **Likelihood** (the probability of occurrence) against **Impact** (the severity of consequences).

### Likelihood Scale

| Rating | Level | Description | Probability |
| :---: | :--- | :--- | :---: |
| **5** | Almost Certain | Expected to occur frequently under normal operating conditions. | > 80% |
| **4** | Likely | High probability of occurrence during the project lifecycle. | 51% - 80% |
| **3** | Possible | Might occur at some point during deployment or scaling. | 21% - 50% |
| **2** | Unlikely | Unlikely but conceivable under specific edge cases. | 6% - 20% |
| **1** | Rare | Highly unexpected; exceptional circumstances only. | < 5% |

### Impact Scale

| Rating | Level | Technical / Financial / Operational Consequence |
| :---: | :--- | :--- |
| **5** | Critical | Complete system outage, major data breach, financial loss, or critical API failure. |
| **4** | Major | Key feature failure (e.g., payment, AI suite down), core user flow disrupted. |
| **3** | Moderate | Partial degradation of service, non-critical feature impacted, manageable delay. |
| **2** | Minor | Cosmetically flawed UI, minor performance lag, isolated user inconvenience. |
| **1** | Negligible | Imperceptible impact on general operations, quickly self-healing. |

---

### Risk Matrix & Priority Ranking

The **Risk Score** is calculated as:
$$\text{Risk Score} = \text{Likelihood (1–5)} \times \text{Impact (1–5)}$$

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

| Risk Level | Score Range | Action Required | Escalation & Response Window |
| :--- | :---: | :--- | :--- |
| 🔴 **CRITICAL** | **15 – 25** | Immediate mitigation mandatory. Real-time alert required. | Within 1 Hour |
| 🟠 **HIGH** | **10 – 14** | Active monitoring & mitigation plan in current sprint. | Within 24 Hours |
| 🟡 **MEDIUM** | **5 – 9** | Mitigate during routine maintenance. Document workarounds. | Next Sprint |
| 🟢 **LOW** | **1 – 4** | Monitor passively. Accept risk with basic safeguards. | Periodic Review |

---

## 3. Master Risk Register (Ranked Overview)

Below is the prioritized list of identified risks across the ScholarshipConnectBD ecosystem, ordered by **Risk Score (Highest to Lowest)**:

| Rank | Risk ID | Category | Risk Title | Likelihood | Impact | Score | Risk Level |
| :---: | :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| 🥇 **1** | **R-01** | AI Engine | Multi-Provider LLM Outage & Rate Limiting | 4 | 5 | **20** | 🔴 **CRITICAL** |
| 🥈 **2** | **R-02** | Payments | SSLCommerz Gateway / Webhook Verification Failure | 3 | 5 | **15** | 🔴 **CRITICAL** |
| 🥉 **3** | **R-03** | Security | Firebase Service Key Exposure & Admin Access Leak | 3 | 5 | **15** | 🔴 **CRITICAL** |
| **4** | **R-04** | Operations | Fake Scholarship Submissions & Point Farming | 3 | 4 | **12** | 🟠 **HIGH** |
| **5** | **R-05** | Infrastructure | DB Bottleneck / High Latency During Deadline Spikes | 3 | 4 | **12** | 🟠 **HIGH** |
| **6** | **R-06** | Data Privacy | Document Vault Authorization Failure & PII Exposure | 2 | 5 | **10** | 🟠 **HIGH** |
| **7** | **R-07** | Moderation | Spam, Abuse & Phishing in Forum & Real-Time Chat | 3 | 3 | **9** | 🟡 **MEDIUM** |
| **8** | **R-08** | Technical | TF-IDF Cosine Similarity Failure on Heavy Profile Load | 2 | 4 | **8** | 🟡 **MEDIUM** |
| **9** | **R-09** | UI / Frontend | Expo Cross-Platform Layout Inconsistencies | 3 | 2 | **6** | 🟡 **MEDIUM** |
| **10**| **R-10** | Infrastructure | FCM Push Notification Delivery Failure | 2 | 2 | **4** | 🟢 **LOW** |

---

## 4. Detailed Risk Analysis by Category

---

### Category A: AI Engine & Third-Party Integration Risks

#### Risk R-01: Multi-Provider LLM Outage & Rate Limiting
- **Category:** AI Engine & External APIs
- **Description:** The SOP Writer, CV Reviewer, and Community Answer Analyzer depend on external LLMs (xAI Grok, Groq, Google Gemini, Pollinations AI). Rate limits (RPM/TPM quotas) or vendor outages will break core features.
- **Likelihood:** 4 (Likely) | **Impact:** 5 (Critical) | **Score:** 20 (🔴 CRITICAL) | **Rank:** 1
- **Root Cause:** Strict rate limits on free/starter tiers of AI providers; cloud outages of LLM vendors.
- **Mitigation Strategy:**
  1. **Resilient Multi-Provider Fallback Chain:** System attempts providers in sequence: `Groq (Primary) → Gemini (Secondary) → xAI Grok → Pollinations AI (Fallback) → Local Template Engine`.
  2. **Rate Limit Tracking & Rotation:** Multi-API key rotation and request logging via `AI_REQUEST_LOG` in Django.
  3. **Response Caching:** Cache generated SOP drafts and similarity vectors for identical inputs.
- **Contingency Plan:** Automatically fallback to offline structured templates and prompt users to retry in 60 seconds without throwing 500 errors.

---

### Category B: Security & Authentication Risks

#### Risk R-02: Payment Gateway & Webhook Verification Failure
- **Category:** Financial & Monetization
- **Description:** Failures during SSLCommerz / bKash transactions (IPN webhook dropped, network timeout in Bangladesh mobile networks) leading to unverified Pro tier upgrades or double charging.
- **Likelihood:** 3 (Possible) | **Impact:** 5 (Critical) | **Score:** 15 (🔴 CRITICAL) | **Rank:** 2
- **Root Cause:** Unstable mobile internet connections; unhandled edge cases in IPN webhook verification.
- **Mitigation Strategy:**
  1. **Dual-Server Verification:** Verify all IPNs against SSLCommerz Validation API server-side before updating user status to `Pro`.
  2. **Idempotent Database Transactions:** Wrap payment operations in Django atomic transactions with unique transaction ID constraints (`Payment` model).
  3. **Manual Override Portal:** Admin dashboard tool to audit pending payment logs and manually grant access upon verification.
- **Contingency Plan:** Payment status remains `Pending` with auto-recheck cron job running every 15 minutes.

#### Risk R-03: Firebase Service Key Leakage & Admin Gate Compromise
- **Category:** Security & Authentication
- **Description:** Accidental leakage of `FIREBASE_SERVICE_ACCOUNT_KEY` or unauthorized elevation of regular user accounts to `is_staff` / `is_superuser`.
- **Likelihood:** 3 (Possible) | **Impact:** 5 (Critical) | **Score:** 15 (🔴 CRITICAL) | **Rank:** 3
- **Root Cause:** Key committed to git repo; weak secondary authentication checks.
- **Mitigation Strategy:**
  1. **Environment Variable Guarding:** Store credentials strictly in `.env` files protected by `.gitignore` and platform secret managers (Vercel / Cloud).
  2. **Dual-Layer Admin Gate:** Mobile Admin Portal requires both valid Firebase Auth AND secondary Django Admin token check (`AdminTokenObtainPairView`).
  3. **Strict Email White-listing:** Automatic staff elevation applies *only* to emails strictly matching the `ADMIN_EMAILS` list.
- **Contingency Plan:** Instant key revocation via Firebase Console; automated server restart with rotated secrets.

---

### Category C: Financial & Monetization Risks

#### Risk R-04: Fraudulent Scholarship Submissions & Point Farming
- **Category:** Operational & Business Model
- **Description:** Malicious or lazy users submit fake or duplicate scholarship entries to farm **200 ScholarPoints** and unlock `ScholarConnect Pro` without paying 500 BDT.
- **Likelihood:** 3 (Possible) | **Impact:** 4 (Major) | **Score:** 12 (🟠 HIGH) | **Rank:** 4
- **Root Cause:** Open crowdsourcing incentive mechanism.
- **Mitigation Strategy:**
  1. **Mandatory Admin Review Gate:** Submissions default to `Pending` status and are *never* live or point-rewarded until verified by an Admin.
  2. **Point Penalty System:** Rejecting an invalid or spam submission deducts **50 ScholarPoints** from the submitter's profile.
  3. **Submission Throttling:** Limit users to 3 scholarship submissions per 24 hours (`SensitiveActionThrottle`).
- **Contingency Plan:** Permanent ban of users attempting automated submission spam via rate-limit throttles.

---

### Category D: Data Privacy & Document Storage Risks

#### Risk R-06: Document Vault Authorization Failure & PII Exposure
- **Category:** Data Privacy & Security
- **Description:** Users upload sensitive document files (Passports, Academic Transcripts, LORs, Certificates). Unauthorized users or insecure endpoints might access another user's document vault.
- **Likelihood:** 2 (Unlikely) | **Impact:** 5 (Critical) | **Score:** 10 (🟠 HIGH) | **Rank:** 6
- **Root Cause:** Missing or misconfigured Django ViewSet permission checks on media endpoints.
- **Mitigation Strategy:**
  1. **User Object Level Filtering:** `UserDocumentViewSet.get_queryset()` strictly filters by `request.user`:
     ```python
     def get_queryset(self):
         return UserDocument.objects.filter(user=self.request.user)
     ```
  2. **Obfuscated File Naming:** Media files stored with UUID-hashed filenames in `/media/user_docs/` to prevent directory traversal attacks.
  3. **Tokenized File Serving:** Restrict static media serving through Django view validation rather than exposed public directory links.
- **Contingency Plan:** Revoke exposed static URLs and notify affected users within compliance requirements.

---

### Category E: Infrastructure & Performance Risks

#### Risk R-05: Database Degradation & High Latency During Deadline Spikes
- **Category:** Infrastructure & Scalability
- **Description:** Spike in concurrent requests during major scholarship application deadlines (e.g., MEXT / Chevening closing dates) overloads MongoDB Atlas / Djongo ORM.
- **Likelihood:** 3 (Possible) | **Impact:** 4 (Major) | **Score:** 12 (🟠 HIGH) | **Rank:** 5
- **Root Cause:** Heavy database queries, un-indexed filtering on deadline/country fields, lack of response caching.
- **Mitigation Strategy:**
  1. **MongoDB Atlas Indexing:** Ensure compound indexes on `(status, deadline, country)` in MongoDB collections.
  2. **Client-Side Caching:** Utilize `AsyncStorage` (Mobile) and `localStorage` (Web) via `cache.js` to serve cached scholarship lists during offline/slow network states.
  3. **API Pagination & Field Selection:** Strict pagination limit (max 20 per page) on list endpoints.
- **Contingency Plan:** Enable read-only fallback mode serving static JSON cache for discovery features during peak loads.

#### Risk R-08: TF-IDF Cosine Similarity Performance Lag
- **Category:** Technical Engine
- **Description:** Smart Matchmaker recalculating TF-IDF matrices on every single user request could cause server CPU spikes when scholarship count exceeds thousands.
- **Likelihood:** 2 (Unlikely) | **Impact:** 4 (Major) | **Score:** 8 (🟡 MEDIUM) | **Rank:** 8
- **Root Cause:** In-memory vector calculation on un-cached dataset.
- **Mitigation Strategy:**
  1. **Pre-Vectorized Corpus:** Pre-compute and cache TF-IDF vectors for active scholarships periodically.
  2. **Hard Criteria Filtering First:** Filter scholarships by CGPA, Country, and Degree level *before* running Cosine Similarity on the subset.
- **Contingency Plan:** Soft-degrade matchmaker to hard-criteria rules if vector calculation time exceeds 500ms.

---

### Category F: Operational & Community Content Risks

#### Risk R-07: Spam, Abuse & Phishing in Forum & Real-Time Messaging
- **Category:** Community & Content Safety
- **Description:** User-generated discussions, stories, comments, or direct messaging contain inappropriate content, harassment, or scholarship scam links.
- **Likelihood:** 3 (Possible) | **Impact:** 3 (Moderate) | **Score:** 9 (🟡 MEDIUM) | **Rank:** 7
- **Root Cause:** Real-time interactive messaging and open forum features.
- **Mitigation Strategy:**
  1. **Admin Moderation Center:** Dedicated moderation UI (`moderation.js`) for reviewing flagged posts, comments, and users.
  2. **AI Content Analysis:** Utilize LLM to analyze flagged reported posts and automatically assign severity tags.
  3. **User Reporting System:** Allow users to report discussions or chat messages directly with pre-filled context.
- **Contingency Plan:** Instant soft-deletion of reported content pending admin review.

#### Risk R-09: Cross-Platform UI Inconsistencies (Mobile vs Expo Web)
- **Category:** UI / UX Design
- **Description:** Layout shifts, broken fonts, or modal misalignments on varying Android screen sizes or desktop browsers (Expo Web / Next.js).
- **Likelihood:** 3 (Possible) | **Impact:** 2 (Minor) | **Score:** 6 (🟡 MEDIUM) | **Rank:** 9
- **Root Cause:** Differing screen aspect ratios, web vs native component behavior.
- **Mitigation Strategy:**
  1. **Dual Theme Engine:** Centralized color and typography system (`theme.js` & Tailwind CSS).
  2. **Flexbox & Safe Area Layouts:** Standardized container padding using `SafeAreaView`.
- **Contingency Plan:** Hotfix deployment via Expo OTA updates for mobile and Vercel triggers for web.

#### Risk R-10: FCM Push Notification Delivery Failure
- **Category:** Communication
- **Description:** Push notifications for deadline alerts or mentor requests fail to deliver due to invalid FCM tokens or device background restrictions.
- **Likelihood:** 2 (Unlikely) | **Impact:** 2 (Minor) | **Score:** 4 (🟢 LOW) | **Rank:** 10
- **Root Cause:** Token expiration, OS battery optimizations.
- **Mitigation Strategy:**
  1. **In-App Notification Center:** Maintain a persistent database notifications inbox (`Notification` model) alongside push alerts.
  2. **FCM Token Refresh:** Auto-renew FCM tokens on every app launch.
- **Contingency Plan:** Primary user alert relies on the in-app notification bell icon.

---

## 5. Contingency & Disaster Recovery Plan

In the event of a critical system failure, the following operational recovery protocols take effect:

```text
+-------------------------------------------------------------------------------+
|                       CRITICAL INCIDENT PROTOCOL                              |
+-------------------------------------------------------------------------------+
| 1. DETECTION    -> Real-time Error Monitoring & Admin Alert Trigger            |
| 2. ISOLATION    -> Graceful degradation to Read-Only / Cached Data Mode       |
| 3. FAILOVER     -> Switch to Secondary Providers (e.g. Gemini LLM, Vercel)    |
| 4. RECOVERY     -> Database Restoration / Hotfix Deployment (Expo OTA)         |
| 5. POST-MORTEM  -> Root cause analysis & update to Risk Register              |
+-------------------------------------------------------------------------------+
```

### Data Backup Schedule
- **Database (MongoDB Atlas):** Continuous automated daily snapshots with point-in-time recovery (PITR) retained for 30 days.
- **Media Uploads (Document Vault / Images):** Daily cloud storage backup sync.
- **Environment Configurations:** Encrypted off-site storage of `.env` configurations.

---

## 6. Continuous Risk Monitoring & Audit Protocol

Risk management is an iterative process. The team enforces the following continuous review schedule:

1. **Sprint Risk Review (Bi-Weekly):** Review newly added features against the Risk Register prior to release.
2. **Security Audit (Monthly):** Audit Django dependencies (`pip-audit`), Firebase access logs, and API throttles.
3. **Load Testing (Pre-Season):** Run stress tests on matchmaker and database queries prior to major application seasons (September–November & January–March).
4. **Log Review (Daily):** Admin inspection of `AI_REQUEST_LOG`, failed payment logs, and reported community items in the Moderation Center.

---

*Last Updated: May 2024*  
*Maintained by: Team ScholarshipConnectBD (BUBT)*
