# 📐 ScholarshipConnectBD - System Design & Architecture

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
*(Note: Additional diagrams like DFD, ERD, Use Case, Sequence, and Class diagrams will be added below in subsequent phases).*
