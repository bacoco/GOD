# Product Planning Workflow Example

This document demonstrates how the Product Planning workflow (PM → PO → SM) operates in practice.

## Workflow Overview

The Product Planning workflow transforms a high-level product vision into sprint-ready, AI-optimized user stories through three specialist agents:

1. **Prometheus (PM)**: Creates PRD and roadmap from vision
2. **Athena (PO)**: Generates and validates user stories
3. **Hermes (SM)**: Prepares AI-ready stories and sprint plan

## Example Execution

### Initial Input
```
Product Vision: "AI-powered personal finance assistant that helps users track expenses, create budgets, and receive intelligent savings recommendations"

Market Research: 
- 73% of millennials struggle with budgeting
- Existing apps lack personalized insights
- Users want proactive financial advice

Team Capacity: 40 story points per sprint
```

### Step-by-Step Execution

#### Step 1: Prometheus Creates PRD

**Input Context**:
- Product vision
- Market research data
- Business objectives

**Prometheus's Process**:
```markdown
# Product Requirements Document: AI Personal Finance Assistant

## Executive Summary
An intelligent personal finance application that combines expense tracking with AI-driven insights to help users achieve their financial goals.

## Problem Statement
- Manual expense tracking is tedious and error-prone
- Generic budgeting advice doesn't fit individual situations
- Users lack proactive guidance on saving opportunities

## Target Users
1. **Primary**: Young professionals (25-35) starting their financial journey
2. **Secondary**: Families managing household budgets
3. **Tertiary**: Students learning financial responsibility

## Core Features
1. **Automated Expense Tracking**
   - Bank account integration
   - Receipt scanning with OCR
   - Automatic categorization

2. **Intelligent Budgeting**
   - AI-powered budget recommendations
   - Dynamic adjustments based on spending patterns
   - Goal-based budget allocation

3. **Proactive Insights**
   - Spending anomaly detection
   - Savings opportunity identification
   - Personalized financial tips

## Success Metrics
- User retention: 60% at 3 months
- Daily active usage: 40%
- Average savings increase: 15%
```

**Output**: `docs/product/prd.md`

#### Step 2: Prometheus Creates Roadmap

**Input Context**:
- Completed PRD
- Market urgency
- Team capacity

**Prometheus's Process**:
```markdown
# Product Roadmap: AI Personal Finance Assistant

## Q1 2024: Foundation (MVP)
### Sprint 1-2: Core Infrastructure
- User authentication and security
- Bank connection framework
- Basic expense tracking

### Sprint 3-4: Essential Features
- Manual expense entry
- Basic categorization
- Simple budget creation

## Q2 2024: Intelligence Layer
### Sprint 5-6: AI Integration
- Automated categorization
- Spending pattern analysis
- First insights engine

### Sprint 7-8: Enhanced UX
- Mobile app development
- Receipt scanning
- Push notifications

## Q3 2024: Advanced Features
### Sprint 9-10: Proactive Assistance
- Savings recommendations
- Anomaly detection
- Financial goal tracking

### Sprint 11-12: Social & Gamification
- Achievement system
- Social comparisons
- Financial challenges
```

**Output**: `docs/product/roadmap.md`

#### Step 3: Athena Creates User Stories

**Input Context**:
- PRD from Prometheus
- Roadmap priorities
- First sprint focus

**Athena's Process**:
```markdown
# User Story: Secure User Registration

**As a** new user
**I want to** create a secure account with my email
**So that** I can safely store my financial information

## Acceptance Criteria
- Email validation with confirmation
- Strong password requirements (8+ chars, mixed case, numbers, symbols)
- Two-factor authentication option
- GDPR-compliant data consent
- Account recovery mechanism

## Technical Notes
- Use OAuth 2.0 for third-party auth
- Implement rate limiting
- Store passwords with bcrypt
```

*Athena creates 8 user stories for Sprint 1*

**Outputs**: 
- `docs/stories/user-registration.md`
- `docs/stories/bank-connection.md`
- `docs/stories/expense-entry.md`
- `docs/stories/expense-list.md`
- `docs/stories/basic-categories.md`
- `docs/stories/simple-dashboard.md`
- `docs/stories/data-export.md`
- `docs/stories/account-settings.md`

#### Step 4: Athena Validates Stories

**Validation Report**:
```markdown
# Story Validation Report

## Validation Summary
- Total Stories: 8
- Validated: 8
- Issues Found: 2
- Issues Resolved: 2

## Validation Checks
✅ All stories follow INVEST principles
✅ Acceptance criteria are testable
✅ No dependencies outside sprint
✅ Total points within capacity (38/40)
✅ Security considerations included
✅ UI/UX guidelines referenced

## Adjustments Made
1. Split "Bank Connection" into two stories (OAuth setup, Account linking)
2. Added security criteria to all data-handling stories
```

**Output**: `docs/validation/sprint-1-validation.md`

#### Step 5: Hermes Creates AI-Ready Stories

**Input Context**:
- Validated stories from Athena
- Technical architecture
- AI implementation patterns

**Hermes's Process for Each Story**:
```markdown
# AI-Ready Story: Secure User Registration

## Context for AI Implementation
This story implements secure user registration with modern authentication patterns. The system must handle both traditional email/password and OAuth providers while maintaining high security standards.

## Technical Implementation Guide

### Architecture Overview
- Frontend: React with React Hook Form
- Backend: Node.js/Express with Passport.js
- Database: PostgreSQL with user table
- Security: bcrypt, JWT tokens, rate limiting

### Implementation Steps
1. Create user model with required fields
2. Implement validation middleware
3. Set up authentication routes
4. Create registration UI components
5. Implement email verification flow
6. Add OAuth provider integration
7. Create comprehensive tests

### Code Examples
```typescript
// User model schema
interface User {
  id: string;
  email: string;
  passwordHash: string;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Registration endpoint
app.post('/api/auth/register', 
  rateLimiter,
  validateRegistration,
  async (req, res) => {
    // Implementation details...
  }
);
```

### Security Considerations
- Password hashing with bcrypt (rounds: 12)
- JWT tokens with short expiration
- Rate limiting: 5 attempts per IP per hour
- Email verification required
- Optional 2FA with TOTP

### Testing Requirements
- Unit tests for validation logic
- Integration tests for auth flow
- Security tests for common vulnerabilities
- E2E tests for complete registration flow

### Estimated Effort
- Backend implementation: 4 hours
- Frontend implementation: 3 hours
- Testing: 2 hours
- Documentation: 1 hour
Total: 10 hours (5 story points)
```

**Outputs**: 8 AI-ready stories in `docs/stories/ai-ready/`

#### Step 6: Hermes Creates Sprint Plan

**Final Sprint Plan**:
```markdown
# Sprint 1 Planning Document

**Sprint Name**: Foundation - Secure User Platform
**Sprint Duration**: Jan 15-26, 2024
**Sprint Goal**: Establish secure user authentication and basic expense tracking
**Team Capacity**: 40 story points

## Committed Stories
| Story | Points | Assignee | Priority |
|-------|--------|----------|----------|
| Secure User Registration | 5 | Dev1 | Must |
| Email Verification | 3 | Dev1 | Must |
| OAuth Integration | 5 | Dev2 | Must |
| Bank OAuth Setup | 8 | Dev2 | Must |
| Manual Expense Entry | 5 | Dev3 | Must |
| Expense List View | 3 | Dev3 | Must |
| Basic Categories | 3 | Dev4 | Must |
| Simple Dashboard | 5 | Dev4 | Should |
| **Total** | **37** | | |

## Daily Schedule
- Days 1-2: Authentication setup
- Days 3-4: OAuth implementation
- Days 5-6: Expense features
- Days 7-8: Integration & testing
- Days 9-10: Bug fixes & review prep

## Definition of Done
- Code reviewed and approved
- Unit tests >80% coverage
- Integration tests passing
- Security scan passed
- Documentation updated
- Deployed to staging
```

**Output**: `docs/sprints/sprint-1-plan.md`

## Workflow Benefits Demonstrated

1. **Context Preservation**: Each agent builds on previous work
2. **Specialization**: Each agent applies their expertise
3. **Progressive Refinement**: From vision to implementation-ready stories
4. **Quality Gates**: Validation ensures story quality
5. **AI Optimization**: Stories prepared for efficient AI implementation

## Handoff Examples

### Prometheus → Athena Handoff
```
Prometheus has completed the PRD and Roadmap.

Key Points for Athena:
- Focus on Sprint 1: Authentication & Basic Tracking
- Security is paramount for financial data
- Keep MVP scope tight - save AI features for Q2
- Total capacity is 40 points

Artifacts available:
- PRD with detailed requirements
- Roadmap showing sprint priorities
```

### Athena → Hermes Handoff
```
Athena has created and validated 8 user stories.

Key Points for Hermes:
- All stories validated and INVEST-compliant
- Security considerations added to each story
- Total points: 38 (within capacity)
- No external dependencies

Ready for AI optimization and sprint planning.
```

## Metrics and Outcomes

- **Time to Complete**: 35 minutes
- **Artifacts Created**: 20
- **Story Points Planned**: 37/40 (92.5% capacity)
- **Quality Checks Passed**: 100%
- **Ready for Development**: Yes

This example demonstrates how the Product Planning workflow efficiently transforms a product vision into actionable, AI-ready development tasks through specialized agent collaboration.