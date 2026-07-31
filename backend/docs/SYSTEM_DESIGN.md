# ScholarshipConnectBD - System Design & Architecture

Welcome to the System Design documentation for **ScholarshipConnectBD**. This document outlines the software development lifecycle, system architecture, data flows, and structural diagrams used to build this highly scalable mobile platform.

---

## 1. SDLC Model Selection: Agile (Scrum Framework)

For the development of ScholarshipConnectBD, the **Agile Development Model utilizing the Scrum Framework** was selected. This model is ideal for our project due to the complex feature set (AI Matchmaker, Secure Vault, SSLCommerz integration) and the necessity for continuous iteration based on testing and stakeholder feedback.

### Agile (Scrum) SDLC Workflow Diagram

![Agile Scrum SDLC Workflow](./diagrams/01_sdlc_agile.png)
*(Figure: Agile Scrum SDLC Workflow of ScholarshipConnectBD)*

### Workflow Phases Detailed:

**1. Product Backlog**
A prioritized list of features, user stories, and requirements. For our project, this included features like the JWT Authentication, ScholarPoints System, AI SOP Generator, and Real-time Chat.

**2. Sprint Planning**
The team (Frontend, Backend, and QA) selects and plans the work from the product backlog for the upcoming sprint. We determined which APIs and React Native screens to build in sync.

**3. Sprint Backlog**
The selected work items are broken down into granular technical tasks (e.g., "Design MongoDB Schema for Mentorship", "Implement NativeWind UI for Dashboard") for the sprint.

**4. Sprint Execution (1 - 4 Weeks)**
The team works on the sprint backlog to build the product increment.
*   **Daily Scrum:** A 15-minute daily synchronization meeting among team members to discuss progress, blockers, and alignment between the Django backend and Expo frontend.

**5. Testing / QA**
The increment is rigorously tested to ensure quality and meet acceptance criteria. This involved Postman API testing, manual UI testing on Android emulators, and checking Firebase authentication flows.

**6. Potentially Shippable Product**
A high-quality, bug-free product increment is ready. For instance, the successful release of the "Material 3 Admin Console" module.

**7. Sprint Review / Retrospective**
The team reviews the completed work with stakeholders and reflects on the development process. 
*   **Continuous Improvement:** Feedback and lessons learned (e.g., optimizing API load times, fixing UI layout shifts) are added back to the product backlog for future sprints.

---
## 2. Data Flow Diagram (DFD)

The Data Flow Diagram maps out the flow of information for any process or system. Below is the **Level-1 DFD** for ScholarshipConnectBD, which provides a detailed breakdown of the main system processes, external entities, data stores, and how data moves between them.

### DFD Level-1 Diagram

![DFD Level-1](./diagrams/02_dfd_level_1.png)
*(Figure: Data Flow Diagram Level-1 of ScholarshipConnectBD)*

### Component Breakdown:

#### External Entities (Sources/Sinks)
*   **Student (E1):** The primary user who searches for scholarships, uploads documents, requests mentorships, and applies for programs.
*   **Mentor (E2):** Verified users who provide guidance, manage their availability, and interact via chat.
*   **Admin (E3):** System managers who approve scholarships, moderate the community, and monitor analytics.
*   **External APIs (E4):** Third-party integrations handling secure authentication (Firebase) and payment processing (SSLCommerz).

#### Core Processes
*   **1.1 User Authentication & Profile Management:** Processes login requests via Firebase, handles session tokens, and updates user profiles.
*   **1.2 Scholarship Discovery & AI Matchmaker:** Takes student criteria (CGPA, Level) and runs the NLP matchmaking algorithm against the scholarship database.
*   **1.3 Application & Document Vault Management:** Securely tokenizes and stores uploaded PDFs/Images into the Vault and tracks application status.
*   **1.4 Community Forum & Mentorship Booking:** Manages the routing of forum posts, polls, chat messages, and mentorship scheduling.
*   **1.5 Admin Moderation & System Monitoring:** An overarching process that allows admins to read/write across all data stores for approval, moderation, and analytics.

#### Data Stores
*   **D1 - User Profile Store:** Stores student/mentor metadata, points, and Pro-tier status.
*   **D2 - Scholarship Store:** Contains all active, pending, and rejected scholarship data.
*   **D3 - Document Vault Store:** Secure repository for academic documents (SOPs, Transcripts).
*   **D4 - Application Store:** Tracks the state (Submitted/Reviewed/Decision) of each student's application.
*   **D5 - Community & Logs Store:** Houses forum discussions, chat history, mentorship sessions, and system audit logs.

---
*(Note: Additional diagrams like DFD, ERD, Use Case, Sequence, and Class diagrams will be added below in subsequent phases).*
