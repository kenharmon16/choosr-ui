# Choosr – Design Document

## 1. Overview

**Choosr** is a mobile-first group decision-making app that helps people quickly and fairly decide as a group — without endless group chats or dominant voices.

Users create a decision, share a link, vote asynchronously, and get a clear winner with an explanation.

**Primary use cases:**

- Where to eat
- What to watch
- When to meet
- What activity to do

---

## 2. Goals & Non-Goals

### Goals

- Make group decisions fast and frictionless
- Work without user accounts initially
- Be mobile-first (React Native + Expo)
- Support async participation
- Provide transparent decision outcomes

### Non-Goals (MVP)

- User profiles / social graph
- Payments or monetization
- AI recommendations
- Push notifications
- Complex permission systems

---

## 3. Target Users

### Primary

- Friend groups (18–40)
- Casual planners
- Social coordinators

### Secondary (Future)

- Small teams
- Event organizers
- Managers

---

## 4. Core User Flows

### Create a Decision

1. Open app
2. Tap "Create Decision"
3. Enter title
4. Add options
5. Set close time (optional)
6. Create

### Vote

1. Open shared link
2. View decision
3. Select option
4. Submit vote

### View Results

1. Decision closes automatically or manually
2. Winner selected
3. Explanation shown

---

## 5. Functional Requirements

### Decision

- Create decision
- Add/remove options
- Set optional close time
- Decision states: OPEN, CLOSED

### Voting

- One vote per device
- Anonymous voting
- Optional vote visibility

### Results

- Determine winner based on rules
- Handle ties
- Provide human-readable explanation

---

## 6. Decision Logic (MVP)

1. Count votes per option
2. Option with highest votes wins
3. Tie-breaker: earliest vote wins
4. If no votes, mark as "No Decision"

---

## 7. Technical Architecture

### Frontend (Mobile)

- React Native
- Expo
- TypeScript
- Expo Router or React Navigation

### Backend

- Spring Boot 3
- Java 17+
- MongoDB
- REST API

---

## 8. API Design (Initial)

### Create Decision

```
POST /decisions
```

Request:

```
{
  "title": "Where should we eat?",
  "options": ["Pizza", "Sushi", "Tacos"],
  "closesAt": "2025-01-01T19:00:00Z"
}
```

### Get Decision

```
GET /decisions/{id}
```

### Vote

```
POST /decisions/{id}/vote
```

Request:

```
{
  "optionId": "abc123"
}
```

---

## 9. Data Model

### Decision

```
Decision {
  id: String
  title: String
  options: List<Option>
  status: OPEN | CLOSED
  closesAt: Instant
  createdAt: Instant
}
```

### Option

```
Option {
  id: String
  label: String
  votes: Int
}
```

---

## 10. Mobile UX Principles

- No login required
- Minimal taps
- Clear call-to-action
- Friendly tone
- Fast feedback (haptics, animations)

---

## 11. Security & Abuse Prevention

- Device-based vote limiting
- Rate limiting on vote endpoint
- Input validation
- CORS configuration

---

## 12. Future Enhancements

### Phase 2

- Deep linking
- Push notifications
- Editable decisions
- Vote visibility toggles

### Phase 3

- AI option suggestions
- Group preference learning
- Accounts & history

---

## 13. Success Metrics

- Time to decision
- Votes per decision
- Repeat usage
- Share rate

---

## 14. Risks & Mitigations

| Risk          | Mitigation               |
| ------------- | ------------------------ |
| Low adoption  | Zero-friction onboarding |
| Vote spam     | Device-based voting      |
| Feature creep | Strict MVP scope         |

---

## 15. Summary

Choosr is designed to be:

- Simple
- Fast
- Fair

The MVP prioritizes shipping a usable product quickly, with a clear path to future expansion without overengineering.
