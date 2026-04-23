# AajExam Subscription Plan Strategy

This document outlines the feature distribution between the **FREE** (Default) and **PRO** plans for the AajExam platform.

## 🧠 1. Quizzes & Tests (Main Product)

| Feature | Plan | Limit / Update | Rationale |
| :--- | :--- | :--- | :--- |
| **Daily Challenges** | **FREE** | 1 per day + streak reward | Daily habit + retention |
| **Topic-wise Practice** | **FREE** | Unlimited (basic level) | Platform quality check |
| **Subject Tests** | **FREE** | 2 per day limit | Engagement control |
| **Full Mock Tests** | **PRO** | 1st Mock Free, then Unlimited PRO | High-value paid content 🔥 |
| **Previous Year (PYQ)** | **PRO** | All PYQs are PRO | High demand feature 🔥 |

## 📊 2. Analytics & Reports (Deep Insights)

| Feature | Plan | Limit / Update | Rationale |
| :--- | :--- | :--- | :--- |
| **Basic Score Card** | **FREE** | After every test | Basic expectation |
| **Leaderboard Rank** | **FREE** | Daily/Weekly ranking | Competition feel |
| **Readiness Score** | **PRO** | Selection probability % | Biggest conversion driver 🔥 |
| **Weakness Analysis** | **PRO** | Topic-level detailed breakdown | Time-saving insight |

## 📚 3. Study Tools

| Feature | Plan | Limit / Update | Rationale |
| :--- | :--- | :--- | :--- |
| **Standard Notes** | **FREE** | Basic notes only | Entry-level content |
| **Premium Shortcuts** | **PRO** | Tricks + exam hacks | Fast learning edge |
| **Revision Queue** | **PRO** | Smart reminders | Retention + smart prep |
| **Study Plan** | **PRO** | Personalized roadmap | Premium value |

## 🌐 4. Community & Experience

| Feature | Plan | Limit / Update | Rationale |
| :--- | :--- | :--- | :--- |
| **Educational Reels** | **FREE** | Unlimited | Marketing + engagement 🚀 |
| **Community Q&A** | **FREE** | Open discussion | Peer learning |
| **Pro Badge** | **PRO** | Profile highlight | Premium feel |
| **Ad-Free Practice** | **PRO** | No ads | Distraction-free study |

---

## 🛠 Technical Implementation Notes

1. **Access Level Key**: Add `accessLevel: { type: String, enum: ['free', 'pro'], default: 'free' }` to all content models.
2. **Usage Tracking**: Update `User` model to track daily usage for Subject Tests.
3. **Middleware**: Implement server-side checks to prevent API access to Pro content for Free users.
4. **UI Indicators**: Show Lock/Crown icons for Pro features in both Web and Mobile apps.
