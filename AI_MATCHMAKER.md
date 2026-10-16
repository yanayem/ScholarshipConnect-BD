# AI Matchmaker — Advanced Algorithm Details

Welcome to the technical deep-dive of the **ScholarshipConnectBD AI Matchmaker**. This document explains how we use Machine Learning (ML) and Natural Language Processing (NLP) to connect students with the right opportunities.

---

## The Main Algorithm
The central engine powering this feature is the:
### **Hybrid Content-Based Recommendation Engine**
This is a hybrid method that simultaneously analyzes student bio/skills content and mathematical data like CGPA/Country to ensure the best results.

---

## Algorithm Quick Reference

 Algorithm Name | Full Meaning | Purpose |
 :--- | :--- | :--- |
 **AI Matchmaker** | **Hybrid Content-Based Recommendation Engine** | The core "master algorithm" that finds the best fit between students and scholarships. |
 **NLP** | **Natural Language Processing** | A branch of AI that helps computers understand the meaning of human-written bios or descriptions. |
 **TF-IDF** | **Term Frequency-Inverse Document Frequency** | Converts bio and skills text into mathematical vectors and identifies key terms. |
 **Cosine Similarity** | **Cosine Similarity Calculation** | Measures the mathematical distance or "angle" between profiles and scholarships to calculate match percentage (0-100%). |
 **WSM** | **Weighted Sum Model** | Combines AI scores and other data points (country, subject) to create a final ranking. |
 **Rule-Based Filtering** | **Deterministic Logic Filtering** | Checks hard constraints like CGPA and deadlines to filter out ineligible candidates before the AI starts processing. |

---

## Overview
The Matchmaker is a **Hybrid Recommendation Engine**. It doesn't just look for keywords; it understands the "mathematical similarity" between a student's profile and a scholarship's requirements.

### Why this approach?
We use the **Vector Space Model (VSM)**. In simple terms, we treat pieces of text as points in a high-dimensional graph. The closer two points (Profile and Scholarship) are to each other, the better the match.

---

## The Technical Stack
- **Library**: `scikit-learn` (The industry standard for classic ML in Python).
- **Sub-modules**: `TfidfVectorizer` and `cosine_similarity`.
- **Language**: Python (Backend logic).

---

## The Algorithms in Depth

### 1. TF-IDF Vectorization (The "Importance" Logic)
**TF-IDF** stands for *Term Frequency-Inverse Document Frequency*. It converts text into a mathematical matrix.

#### How it works:
1.  **Tokenization**: The algorithm breaks your bio into individual words (tokens) and removes "Stop Words" (common words like *is, the, and, a* that don't add meaning).
2.  **Term Frequency (TF)**: It counts how many times a word appears in your profile. 
    *   *Math*: $TF(t, d) = \frac{\text{Count of term } t \text{ in document } d}{\text{Total terms in document } d}$
3.  **Inverse Document Frequency (IDF)**: It looks at all scholarships in the database. If a word like "Scholarship" appears in every entry, it gets a low score. If a word like "Biotechnology" appears in only 2 entries, it gets a high score.
    *   *Math*: $IDF(t) = \log\left(\frac{\text{Total Documents}}{\text{Documents containing term } t}\right)$

**Final Result**: Every word gets a weight. Your profile is now a **Numerical Vector** where unique, meaningful words have higher values.

### 2. Cosine Similarity (The "Distance" Logic)
Once your profile and the scholarships are turned into vectors (arrows), we need to see how well they align.

#### Why not measure length?
A student might write a 500-word bio, while a scholarship has a 50-word description. Measuring "Euclidean distance" (straight line between points) would fail because the lengths are different. 

**Cosine Similarity** only cares about the **angle** between the two arrows.
*   **Angle = 0°**: The arrows point in the exact same direction. Score = 1.0 (100% Match).
*   **Angle = 90°**: The arrows are unrelated. Score = 0.0 (No Match).

#### The Math:
$\text{Similarity} = \cos(\theta) = \frac{\vec{A} \cdot \vec{B}}{\|\vec{A}\| \|\vec{B}\|}$
*(It's the dot product of two vectors divided by the product of their magnitudes).*

---

## The Hybrid Scoring Workflow
We use an advanced 5-dimensional scoring model combining rule-based heuristics and vector-space NLP. For the comprehensive workflow and mathematical diagrams, see [SMART_MATCHMAKER.md](./SMART_MATCHMAKER.md).

### Scoring Matrix & Points Distribution (Total 100 Points)

1. **CGPA Scoring (Up to 25 pts)**:
   - **User CGPA $\ge$ Scholarship Min CGPA**: +25 points
   - **User CGPA within 0.3 gap**: +15 points
   - **User CGPA below gap**: +5 points
   - **No minimum requirement specified**: +20 points (or +15 if user CGPA is blank)
   - **User CGPA is unspecified**: +12 points

2. **Country & Region Alignment (Up to 25 pts)**:
   - **Global / Worldwide / International**: +25 points
   - **Target country matched (with canonical aliases like USA/US/America, UK/Britain, Germany/Deutschland)**: +25 points
   - **Target countries specified but no match**: +8 points
   - **Unspecified target countries**: +15 points

3. **Field / Major & Skills Alignment (Up to 25 pts)**:
   - **General / Multidisciplinary / Open / STEM**: +22 points
   - **Field / Major / Research interests match in title, description, or eligibility**: +25 points
   - **User skills match in title, description, or eligibility**: +25 points
   - **Field specified but no match found**: +10 points
   - **No field or skills specified**: +15 points

4. **Academic Level Match (Up to 15 pts)**:
   - **Open to all levels**: +15 points
   - **Level matched with aliases (Bachelors/Undergrad, Masters/Postgrad, PhD/Doctorate)**: +15 points
   - **Level mismatch**: +6 points
   - **Unspecified level**: +10 points

5. **NLP Cosine Similarity Semantic Bonus (Up to 15 pts)**:
   - **TF-IDF + Cosine Similarity**: Angle between full user profile vector (major, department, research, skills, bio, achievements) and full scholarship corpus.
   - Points = $\text{int}(\text{CosineSim} \times 15)$

$$\text{Final Score} = \min(100, \max(15, \text{CGPA} + \text{Country} + \text{Field} + \text{Level} + \text{NLP}))$$

---

## Step-by-Step Backend Process
This is exactly what happens when you click "Match" in the app or web portal:

1. **Collect Data**: The system fetches your profile and all active scholarships from MongoDB Atlas.
2. **Clean Text**: Stop words are removed, and text is normalized to lowercase.
3. **Vectorize**: `TfidfVectorizer` creates a numerical vocabulary space across profile and scholarship descriptions.
4. **Calculate Similarity**: Cosine similarity computes semantic alignment between the student profile and each scholarship.
5. **Score & Blend**: Base heuristic points (CGPA, Country, Field, Level) are added to the NLP semantic score.
6. **Tier-Aware Response**: 
   - Free users receive the **Top 12** ranked matches.
   - **ScholarConnect Pro** members receive the **Top 20** ranked matches.

---

## Code Structure & Locations

If you need to modify or update the algorithm, here are the key files:

### 1. Backend (Logic)
- **View Layer**: [backend/ai_assistant/views.py](file:///d:/ScholarshipConnect-BD/backend/ai_assistant/views.py) → Look for `calculate_hybrid_scholarship_matches` and `class AIMatchmakerView`.
- **URL Routing**: [backend/ai_assistant/urls.py](file:///d:/ScholarshipConnect-BD/backend/ai_assistant/urls.py) → Mapped to `/api/ai/matchmaker/`.
- **Data Models**:
    - [backend/accounts/models.py](file:///d:/ScholarshipConnect-BD/backend/accounts/models.py) → `Profile` (User's bio, skills, CGPA, target countries).
    - [backend/scholarships/models.py](file:///d:/ScholarshipConnect-BD/backend/scholarships/models.py) → `Scholarship` (Requirements, description, eligibility).

### 2. Frontend (Mobile & Web)
- **Mobile Screen**: [mobile/app/scholarships/matchmaker.js](file:///d:/ScholarshipConnect-BD/mobile/app/scholarships/matchmaker.js)
- **Web Pages**: [web/src/app/scholarships/matchmaker/page.tsx](file:///d:/ScholarshipConnect-BD/web/src/app/scholarships/matchmaker/page.tsx) and [web/src/app/ai-tools/matchmaker/page.tsx](file:///d:/ScholarshipConnect-BD/web/src/app/ai-tools/matchmaker/page.tsx)
- **API Services**: `mobile/services/api.js` and `web/src/lib/api.ts` → `getScholarshipMatches()`.

---

## Why this is better than "Search"
1. **Synonym & Alias Awareness**: Maps countries and degrees (e.g. "US" to "USA", "Undergrad" to "Bachelors") automatically.
2. **Personalized**: Factors in your **Bio**, **Research Interests**, and **Skills**, not just static keywords.
3. **Explainable Ranking**: Ranks every scholarship on a clear 0-100% match index.

---
*Created for the ScholarshipConnectBD Team. Refer to [SMART_MATCHMAKER.md](./SMART_MATCHMAKER.md) for full architecture diagrams.*
