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
We use a 3-step pipeline to calculate the final match percentage.

### Step 1: Pre-Filtering (Hard Logic)
First, we apply "Hard Rules" using Python `if/else` logic:
- **CGPA Match**: If your CGPA < Requirement, the scholarship is removed.
- **Academic Level**: We check if you are looking for "Masters" and the scholarship is for "Masters".

### Step 2: Semantic Matching (NLP Logic)
We combine your **Bio + Skills + Preferred Fields** into one long string. We do the same for the scholarship's **Description + Eligibility**.
- We run the **TF-IDF + Cosine** logic described above.
- This produces a score between 0.0 and 1.0.
- We multiply this by **50** to give it weight.

### Step 3: Weighted Sum (The Final Score)
We add points based on structured data matches:
- **Country Match**: +20 points.
- **Field Match**: +20 points.
- **NLP Score**: Up to 50 points.
- **Academic Level Match**: +10 points.

**Final Rank = Base Points + NLP Points.**

---

## Step-by-Step Backend Process
This is exactly what happens when you click "Match" in the app:

1.  **Collect Data**: The system fetches your profile and all active scholarships from MongoDB.
2.  **Clean Text**: All text is converted to lowercase to ensure "Engineering" and "engineering" are seen as the same word.
3.  **Vectorize**: `TfidfVectorizer` creates a map of all unique words across the entire database.
4.  **Calculate Similarity**: Your "Profile Arrow" is compared against every "Scholarship Arrow" in one high-speed calculation.
5.  **Sort & Slice**: The results are sorted from highest to lowest score, and the Top 10 are sent to your mobile screen.

---

## Code Structure & Locations

If you need to modify or update the algorithm, here are the key files:

### 1. Backend (Logic)
- **View Layer**: `backend/ai_assistant/views.py` → Look for `class AIMatchmakerView`. This is where the scoring logic lives.
- **URL Routing**: `backend/ai_assistant/urls.py` → Mapped to `/api/ai/matchmaker/`.
- **Data Models**:
    - `backend/accounts/models.py` → `Profile` (User's bio, skills, CGPA).
    - `backend/scholarships/models.py` → `Scholarship` (Requirements, description).

### 2. Frontend (UI)
- **Screen**: `mobile/app/scholarships/matchmaker.js` → This page displays the results to the user.
- **Service**: `mobile/services/api.js` → `getScholarshipMatches()` handles the API communication.

---

## Why this is better than "Search"
1.  **Synonym Awareness**: Because TF-IDF looks at the importance of words across the whole dataset, it can often find connections that simple keyword search misses.
2.  **Personalized**: It looks at your **Bio** (who you are) and **Skills** (what you know), not just what you typed in a search box.
3.  **Ranking**: Instead of showing you 100 scholarships in random order, it tells you which one is *most* relevant to your life story.

---
*Created for the ScholarshipConnectBD Team. Happy Learning!*
