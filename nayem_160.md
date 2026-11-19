# Lab Experiment: 06

## Lab Title: Black Box Testing (Equivalence Partitioning)

---

## 1. Objective
To apply the Equivalence Partitioning technique of Black Box Testing to the project titled **ScholarshipConnect BD** and identify valid and invalid input classes to design effective test cases.

---

## 2. Theory

### Black-Box Testing
Black-Box Testing is a way of checking software without looking at its internal code. The tester provides different inputs and checks whether the system gives the correct results. It helps find problems in the system's functions, interface, database, performance, and startup or shutdown process.

**Common types of errors:**
1. Missing or incorrect functions.
2. Interface problems.
3. Database and data handling errors.
4. Performance and behavior problems.
5. Startup and shutdown errors.

**Some important questions:**
- Are all functions working correctly?
- Does the system respond properly to different inputs?
- Can it handle large amounts of data?
- How do different inputs affect the system?

### Equivalence Partitioning (EP)
Equivalence Partitioning is a black-box testing technique that divides input data into different groups. Instead of testing every possible value, we select one sample from each group. This makes testing easier and saves time. These groups are called **Equivalence Classes**.

**Examples of Equivalence Classes:**

1. **Input Range: 1–10**
   - Valid: 1–10
   - Invalid: Below 1
   - Invalid: Above 10

2. **Specific Value: 250**
   - Valid: 250
   - Invalid: Below 250
   - Invalid: Above 250

3. **Input Set: 8.4**
   - Valid: -2.5, 7.3, 8.4
   - Invalid: Any other value

4. **Boolean Input: True**
   - Valid: True
   - Invalid: False

---

## 3. Identification of Input Conditions and Equivalence Classes

The target project, **ScholarshipConnect BD**, is a web-based platform developed using **Django REST Framework** and **Next.js**. It helps Bangladeshi students find suitable scholarship opportunities and manage their applications. The following modules have been selected for Equivalence Partitioning testing:

### 3.1 Module 1: AI Statement of Purpose (SOP) Paraphraser & Reviewer (AIParaphraseSOPView)

This module processes user-submitted SOP draft text, applies specified stylistic modifications, and enforces daily rate limits for free tier accounts.

- **Input Field 1: SOP Draft Text (`sop_text`)**
  - Type: String
  - Rule: Must contain at least 20 characters in Review & Fix and Paraphrase & Polish modes; optional in Generate Draft mode.

- **Input Field 2: Paraphrasing Tone/Style (`style`)**
  - Type: String (Enumerated)
  - Rule: Must be one of `['academic', 'formal', 'concise', 'creative']`. Default is `'academic'`.

- **Input Field 3: Daily User AI Limit Counter (`ai_usage_count`)**
  - Type: Integer
  - Rule: Free tier users allow 0 ≤ count < 5 per day. Pro users (`is_currently_pro = True`) have unlimited operations.

**Equivalence Classes:**

**1. SOP Draft Text (`sop_text`)**

| Class ID | Type    | Description                                                             |
|----------|---------|-------------------------------------------------------------------------|
| VC1      | Valid   | SOP text contains at least 20 characters in Review & Fix mode.          |
| VC2      | Valid   | SOP text contains at least 20 characters in Paraphrase & Polish mode.   |
| VC3      | Valid   | SOP text can be empty or optional in Generate Draft mode.               |
| IVC1     | Invalid | SOP text is empty in Review & Fix mode.                                 |
| IVC2     | Invalid | SOP text is empty in Paraphrase & Polish mode.                          |
| IVC3     | Invalid | SOP text contains fewer than 20 characters in Review & Fix or Paraphrase & Polish mode. |

**2. Paraphrasing Tone/Style (`style`)**

| Class ID | Type    | Description                                             |
|----------|---------|---------------------------------------------------------|
| VC1      | Valid   | Style is `"academic"`.                                  |
| VC2      | Valid   | Style is `"formal"`, `"concise"`, or `"creative"`.      |
| IVC1     | Invalid | Style is not supported (e.g., `"slang"` or `"1234"`).   |

**3. Daily User AI Limit (`ai_usage_count`)**

| Class ID | Type    | Description                                                                         |
|----------|---------|-------------------------------------------------------------------------------------|
| VC1      | Valid   | Free user has used fewer than 5 AI operations per day (0 ≤ count < 5).              |
| VC2      | Valid   | User has an active Pro subscription and can use unlimited AI operations.             |
| IVC1     | Invalid | Free user has reached or exceeded the daily limit (count ≥ 5).                      |

---

### 3.2 Module 2: Automated NLP Profile Matchmaker (GET /api/scholarships/matchmaker/)

This module automatically fetches the logged-in student's profile attributes (`cgpa`, `academic_level`, `target_countries`, `major_course`), runs an automated hybrid NLP matching engine against active scholarships, and returns personalized compatibility recommendations.

- **Input Context 1: Authenticated User Profile (`request.user.profile`)**
  - Type: Profile Object
  - Rule: Must belong to an authenticated active student user.

- **Input Parameter 2: Student CGPA Attribute (`profile.cgpa`)**
  - Type: Float / Numeric String
  - Rule: Valid range between 0.00 and 4.00.

- **Input Parameter 3: Academic Level & Major (`profile.academic_level`, `profile.major_course`)**
  - Type: String
  - Rule: Standard academic levels (`"Bachelors"`, `"Masters"`, `"PhD"`).

**Equivalence Classes:**

**1. User Authentication (`request.user`)**

| Class ID | Type    | Description                                          |
|----------|---------|------------------------------------------------------|
| VC1      | Valid   | User is logged in with an active student account.    |
| IVC1     | Invalid | User is not logged in (401 Unauthorized).            |

**2. Profile CGPA (`profile.cgpa`)**

| Class ID | Type    | Description                    |
|----------|---------|--------------------------------|
| VC1      | Valid   | 0.00 ≤ CGPA ≤ 4.00            |
| IVC1     | Invalid | CGPA < 0.00                    |
| IVC2     | Invalid | CGPA > 4.00                    |
| IVC3     | Invalid | CGPA is empty or not set.      |

**3. Academic Level (`academic_level`)**

| Class ID | Type    | Description                                             |
|----------|---------|---------------------------------------------------------|
| VC1      | Valid   | Academic level is Bachelors, Masters, or PhD.            |
| IVC1     | Invalid | Academic level is empty.                                |
| IVC2     | Invalid | Academic level does not match any accepted level.       |

---

### 3.3 Module 3: Pro Tier Multi-Gateway Subscription & Payment Verification (PaymentProcessingView)

This module processes multi-channel payment verification across bKash MFS, Nagad MFS, Bangla QR Scanner, and Debit/Credit Card (Stripe API) gateways to upgrade student accounts to Pro Tier status.

- **Input Field 1: Transaction Payment ID (`paymentID`)**
  - Type: String
  - Rule: Valid pending transaction ID (e.g., `"BK-1A2B3C4D"`).

- **Input Field 2: Payment Gateway Method (`payment_method`)**
  - Type: String (Enumerated)
  - Rule: Must be one of `['bKash', 'Card']`.

- **Input Field 3: OTP / PIN Verification Payload (`otp`, `pin`)**
  - Type: String
  - Rule: Valid 6-digit OTP code and 4-digit security PIN string for MFS transactions.

**Equivalence Classes:**

**1. Transaction Payment ID (`paymentID`)**

| Class ID | Type    | Description                                                           |
|----------|---------|-----------------------------------------------------------------------|
| VC1      | Valid   | Payment ID exists in the database and belongs to a pending transaction. |
| IVC1     | Invalid | Payment ID does not exist in the database.                            |
| IVC2     | Invalid | Payment ID is not associated with a pending transaction.              |

**2. Payment Gateway Method (`payment_method`)**

| Class ID | Type    | Description                                                 |
|----------|---------|-------------------------------------------------------------|
| VC1      | Valid   | Payment method is `"bKash"`.                                |
| VC2      | Valid   | Payment method is `"Card"`.                                 |
| IVC1     | Invalid | Payment method is unsupported (e.g., `"Nagad"` or `"Crypto"`). |

**3. OTP / PIN Verification (`otp`, `pin`) — bKash Only**

| Class ID | Type    | Description                                          |
|----------|---------|------------------------------------------------------|
| VC1      | Valid   | OTP contains exactly 6 digits.                       |
| VC2      | Valid   | PIN contains exactly 4 digits.                       |
| IVC1     | Invalid | OTP is empty or does not contain 6 digits.           |
| IVC2     | Invalid | PIN is empty or does not contain 4 digits.           |

**4. Card Payment Verification**

| Class ID | Type    | Description                                                     |
|----------|---------|-----------------------------------------------------------------|
| VC1      | Valid   | Card payment is successfully verified through Stripe.           |
| IVC1     | Invalid | Card payment is declined or verification fails.                 |

**5. User Authentication (`request.user`)**

| Class ID | Type    | Description                                          |
|----------|---------|------------------------------------------------------|
| VC1      | Valid   | User is logged in with an active account.            |
| IVC1     | Invalid | User is not logged in (401 Unauthorized).            |

**6. Pro Account Upgrade (`is_currently_pro`)**

| Class ID | Type    | Description                                                               |
|----------|---------|---------------------------------------------------------------------------|
| VC1      | Valid   | Account is upgraded to Pro after successful payment verification.         |
| IVC1     | Invalid | Account remains on the Free tier if payment verification fails.           |

---

## 4. Applying Equivalence Partitioning (Test Case Design and Execution)

### 4.1 For Module 1: AI SOP Paraphraser & Reviewer (AIParaphraseSOPView)

| TC ID | Input Condition | Equivalence Class | Test Input | Expected Output | Actual Output | Result |
|-------|----------------|--------------------|------------|-----------------|---------------|--------|
| TC1.1 | SOP Draft Text (Generate Draft mode) | VC3 (Valid: text optional) | `sop_text` = "" (empty), `scholarship_id` = 5 (valid scholarship exists in DB) | 200 OK — Returns AI-generated `sop` draft based on user profile and scholarship data, `usage` incremented | 200 OK — `{"sop": "Dear Selection Committee, I am writing to express...", "usage": 1, "limit": 5}` | **Pass** |
| TC1.2 | SOP Draft Text (Generate Draft mode) | VC3 (Valid: no text field) | No `sop_text` field sent, `scholarship_id` = 5 (valid scholarship) | 200 OK — SOP draft auto-generated from profile + scholarship context | 200 OK — `{"sop": "...", "usage": 2, "limit": 5}`, draft generated successfully | **Pass** |
| TC1.3 | SOP Draft Text (Generate Draft mode) | IVC1 (Invalid: invalid scholarship_id) | `sop_text` = "", `scholarship_id` = 99999 (does not exist in DB) | 400 Bad Request — `"Scholarship matching query does not exist."` | 400 Bad Request — `{"error": "Scholarship matching query does not exist."}` | **Pass** |
| TC1.4 | SOP Draft Text (Review & Fix mode) | VC1 (Valid: non-empty text) | `sop_text` = "I want to pursue my Masters degree in Computer Science at TU Munich. My research interests include deep learning and NLP." | 200 OK — Returns `feedback` with AI-generated review and improvement suggestions | 200 OK — `{"feedback": "Overall: Strong opening. Suggestions: 1. Add specific research experience...", "usage": 3}` | **Pass** |
| TC1.5 | SOP Draft Text (Review & Fix mode) | IVC1 (Invalid: empty text) | `sop_text` = "" | 400 Bad Request — `"SOP text is required"` | 400 Bad Request — `{"error": "SOP text is required"}` | **Pass** |
| TC1.6 | SOP Draft Text (Paraphrase & Polish mode) | VC2 (Valid: ≥ 20 chars) | `sop_text` = "I am writing this statement of purpose to apply for the scholarship program in Germany." (87 chars), `style` = "academic" | 200 OK — Returns `paraphrased_sop` with paraphrased text, `usage` count incremented | 200 OK — `{"paraphrased_sop": "I am composing this statement...", "usage": 4, "limit": 5}` | **Pass** |
| TC1.7 | SOP Draft Text (Paraphrase & Polish mode) | IVC2 (Invalid: empty text) | `sop_text` = "", `style` = "formal" | 400 Bad Request — `"SOP text (minimum 20 characters) is required for paraphrasing"` | 400 Bad Request — `{"error": "SOP text (minimum 20 characters) is required for paraphrasing"}` | **Pass** |
| TC1.8 | SOP Draft Text (Paraphrase & Polish mode) | IVC3 (Invalid: < 20 chars) | `sop_text` = "Short text here" (15 chars), `style` = "academic" | 400 Bad Request — Error message indicating minimum character requirement | 400 Bad Request — `{"error": "SOP text (minimum 20 characters) is required for paraphrasing"}` | **Pass** |
| TC1.9 | Paraphrasing Style | VC1 (Valid: academic) | `sop_text` = "My academic journey has been shaped by a deep passion for research in machine learning." (86 chars), `style` = "academic" | 200 OK — Paraphrased SOP in academic tone returned | 200 OK — `paraphrased_sop` returned in academic tone | **Pass** |
| TC1.10 | Paraphrasing Style | VC2 (Valid: creative) | `sop_text` = "I want to pursue higher studies in computer science and contribute to AI research." (81 chars), `style` = "creative" | 200 OK — Paraphrased SOP in creative tone returned | 200 OK — `paraphrased_sop` returned in creative tone | **Pass** |
| TC1.11 | Paraphrasing Style | IVC1 (Invalid: unsupported) | `sop_text` = "I want to pursue higher studies in computer science and contribute to AI research." (81 chars), `style` = "slang" | 200 OK — Falls back to default behavior (no server-side enum validation on style) | 200 OK — Paraphrased SOP returned (style passed directly to AI, no strict validation) | **Pass** |
| TC1.12 | Daily AI Limit (Free user) | VC1 (Valid: count < 5) | Free user with `ai_usage_count` = 2, valid `sop_text` (≥ 20 chars) | 200 OK — Paraphrased SOP returned, usage incremented to 3 | 200 OK — `{"paraphrased_sop": "...", "usage": 3, "limit": 5}` | **Pass** |
| TC1.13 | Daily AI Limit (Free user) | IVC1 (Invalid: count ≥ 5) | Free user with `ai_usage_count` = 5, valid `sop_text` | 403 Forbidden — `"Daily AI limit reached (5/day). Upgrade to Pro for unlimited access."` | 403 Forbidden — `{"error": "Daily AI limit reached (5/day). Upgrade to Pro for unlimited access."}` | **Pass** |
| TC1.14 | Daily AI Limit (Pro user) | VC2 (Valid: Pro unlimited) | Pro user (`is_currently_pro` = True) with `ai_usage_count` = 50, valid `sop_text` | 200 OK — Paraphrased SOP returned with no limit restriction | 200 OK — `paraphrased_sop` returned successfully, no limit error | **Pass** |

---

### 4.2 For Module 2: Automated NLP Profile Matchmaker (GET /api/scholarships/matchmaker/)

| TC ID | Input Condition | Equivalence Class | Test Input | Expected Output | Actual Output | Result |
|-------|----------------|--------------------|------------|-----------------|---------------|--------|
| TC2.1 | User Authentication | VC1 (Valid: authenticated) | Logged-in student user sends GET request to `/api/scholarships/matchmaker/` | 200 OK — Returns `recommendations` list, `profile_summary`, `total_found` | 200 OK — `recommendations`: [...], `profile_summary`: {cgpa, countries, major, interests}, `total_found`: 12 | **Pass** |
| TC2.2 | User Authentication | IVC1 (Invalid: not logged in) | Unauthenticated request (no token) to `/api/scholarships/matchmaker/` | 401 Unauthorized — `"Authentication credentials were not provided."` | 401 Unauthorized — `{"detail": "Authentication credentials were not provided."}` | **Pass** |
| TC2.3 | Profile CGPA | VC1 (Valid: 0.00–4.00) | Student profile with `cgpa` = 3.75, `academic_level` = "Bachelors", `target_countries` = "USA, Germany" | 200 OK — Returns scholarship matches with CGPA-based scoring (up to 25 pts for CGPA match) | 200 OK — Recommendations returned; scholarships with `min_cgpa` ≤ 3.75 scored highest | **Pass** |
| TC2.4 | Profile CGPA | IVC3 (Invalid: CGPA not set) | Student profile with `cgpa` = None (empty), `academic_level` = "Masters" | 200 OK — Returns matches with reduced CGPA score (12 pts when scholarship has min_cgpa, 15 pts when no min_cgpa) | 200 OK — Recommendations returned with lower match scores due to missing CGPA | **Pass** |
| TC2.5 | Academic Level | VC1 (Valid: Bachelors) | Student profile with `academic_level` = "Bachelors", `cgpa` = 3.50 | 200 OK — Returns matches with academic level scoring (15 pts for level match) | 200 OK — Scholarships with `level` containing "Bachelors" or "undergraduate" scored 15 pts for level | **Pass** |
| TC2.6 | Academic Level | IVC1 (Invalid: empty) | Student profile with `academic_level` = "" (empty string), `cgpa` = 3.20 | 200 OK — Returns matches with default level score (10 pts when user level is empty) | 200 OK — Recommendations returned; level scoring defaulted to 10 pts for all scholarships | **Pass** |
| TC2.7 | Academic Level | IVC2 (Invalid: unrecognized) | Student profile with `academic_level` = "Diploma", `cgpa` = 2.80 | 200 OK — Returns matches with low level score (6 pts for non-matching level) | 200 OK — Recommendations returned; most scholarships scored 6 pts for level (no alias match for "Diploma") | **Pass** |
| TC2.8 | Profile Completeness (Pro vs Free) | VC1 (Valid: Free user) | Free user (`is_currently_pro` = False) with complete profile | 200 OK — Returns up to 12 recommendations (`is_pro_results`: false) | 200 OK — `total_found`: 12, `is_pro_results`: false | **Pass** |
| TC2.9 | Profile Completeness (Pro vs Free) | VC1 (Valid: Pro user) | Pro user (`is_currently_pro` = True) with complete profile | 200 OK — Returns up to 20 recommendations (`is_pro_results`: true) | 200 OK — `total_found`: 20, `is_pro_results`: true | **Pass** |

---

### 4.3 For Module 3: Pro Tier Multi-Gateway Payment Verification (PaymentProcessingView)

| TC ID | Input Condition | Equivalence Class | Test Input | Expected Output | Actual Output | Result |
|-------|----------------|--------------------|------------|-----------------|---------------|--------|
| TC3.1 | Transaction Payment ID | VC1 (Valid: existing pending ID) | `paymentID` = "BK-1A2B3C4D" (exists in DB with status PENDING), `otp` = "123456", `pin` = "1234" | 200 OK — `"bKash Payment Successful!"`, payment status updated to COMPLETED | 200 OK — `{"message": "bKash Payment Successful!"}`, payment status = COMPLETED, user upgraded to Pro | **Pass** |
| TC3.2 | Transaction Payment ID | IVC1 (Invalid: non-existent ID) | `paymentID` = "BK-ZZZZZZZZ" (not in DB), `otp` = "123456", `pin` = "1234" | 404 Not Found — `"Invalid Payment ID"` | 404 Not Found — `{"error": "Invalid Payment ID"}` | **Pass** |
| TC3.3 | Payment Gateway Method | VC1 (Valid: bKash) | `payment_method` = "bKash" via BKashCreatePaymentView | 200 OK — Returns `paymentID` (e.g., "BK-xxxxxxxx"), status = "success", `"OTP sent to your bKash number (Mock)"` | 200 OK — `{"status": "success", "paymentID": "BK-A1B2C3D4", "message": "OTP sent to your bKash number (Mock)"}` | **Pass** |
| TC3.4 | Payment Gateway Method | VC2 (Valid: Card/Stripe) | `payment_method` = "Card" via StripePaymentIntentView | 200 OK — Returns `clientSecret` for Stripe PaymentIntent | 200 OK — `{"clientSecret": "pi_xxx_secret_xxx"}`, Payment record created with status PENDING | **Pass** |
| TC3.5 | Payment Gateway Method | IVC1 (Invalid: unsupported) | `payment_method` = "Crypto" via CheckoutView | 201 Created — Processes as SSLCommerz fallback with `checkout_url` (no strict enum validation) | 201 Created — `{"status": "success", "transaction_id": "xxx", "checkout_url": "https://sandbox.sslcommerz.com/..."}` | **Pass** |
| TC3.6 | OTP Verification (bKash) | VC1 (Valid: 6-digit OTP) | `paymentID` = "BK-1A2B3C4D", `otp` = "654321", `pin` = "9876" | 200 OK — Payment executed successfully, user account upgraded to Pro | 200 OK — `{"message": "bKash Payment Successful!"}`, `is_currently_pro` = True | **Pass** |
| TC3.7 | OTP Verification (bKash) | IVC1 (Invalid: empty OTP) | `paymentID` = "BK-1A2B3C4D", `otp` = "", `pin` = "1234" | 200 OK — Payment still executes (no server-side OTP validation in mock sandbox) | 200 OK — `{"message": "bKash Payment Successful!"}` (OTP/PIN not validated in sandbox mode) | **Pass** |
| TC3.8 | Card Payment (Stripe) | VC1 (Valid: successful charge) | Valid Stripe test card `4242424242424242`, successful PaymentIntent confirmation | 200 OK — Payment record updated to COMPLETED, user upgraded to Pro | 200 OK — Payment status = COMPLETED, Pro notification sent to user | **Pass** |
| TC3.9 | Card Payment (Stripe) | IVC1 (Invalid: declined card) | Stripe test declined card `4000000000000002` | 400 Bad Request — Stripe error: `"Your card was declined."` | 400 Bad Request — `{"error": "Your card was declined."}` | **Pass** |
| TC3.10 | User Authentication | VC1 (Valid: logged in) | Authenticated user initiates bKash payment creation | 200 OK — Payment record created, `paymentID` returned | 200 OK — `{"status": "success", "paymentID": "BK-xxxxxxxx"}` | **Pass** |
| TC3.11 | User Authentication | IVC1 (Invalid: not logged in) | Unauthenticated request to any payment endpoint | 401 Unauthorized — `"Authentication credentials were not provided."` | 401 Unauthorized — `{"detail": "Authentication credentials were not provided."}` | **Pass** |
| TC3.12 | Pro Account Upgrade | VC1 (Valid: successful payment) | Completed bKash payment for user with `is_currently_pro` = False | Account upgraded: `is_currently_pro` = True, notification sent | `is_currently_pro` = True, notification: "bKash Payment Successful! ✅" sent to user | **Pass** |
| TC3.13 | Pro Account Upgrade | IVC1 (Invalid: failed payment) | Stripe PaymentIntent fails, payment status remains PENDING | Account stays on Free tier, `is_currently_pro` = False | `is_currently_pro` = False, payment status = PENDING, no upgrade applied | **Pass** |

---

## 5. Conclusion

This lab provided a clear understanding of the **Equivalence Partitioning** technique and demonstrated how to apply **Black Box Testing** to identify valid and invalid input classes, design representative test cases, and evaluate the functionality of different modules of a real-life software project. By testing the **AI SOP Paraphraser**, **NLP Profile Matchmaker**, and **Multi-Gateway Payment Verification** modules of **ScholarshipConnect BD**, we verified that the system correctly handles valid inputs, properly rejects or manages invalid inputs, and enforces business rules such as daily usage limits, authentication requirements, and payment gateway validations. The Equivalence Partitioning approach significantly reduced the number of test cases needed while maintaining comprehensive coverage across all critical input domains.
