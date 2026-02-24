# NexSpark Coding Standards

## Architectural Philosophy (MUST READ FIRST)
- Before any implementation, you must perform a "Pattern Check":
- Challenge the Request: Is the requested change an ad-hoc fix or a structural improvement?
- Pattern Alignment: Does this fit into an existing Service, Utility, or Class?
- Refactor First: If the current file is near its line limit or contains duplication, refactor before adding new features.
- Consistency > Speed: It is better to create a new shared module than to write a "quick" helper function inside a component.

## Core Principles

### DRY (Don't Repeat Yourself)
- Extract code that appears 2+ times into shared modules
- Single source of truth for all logic

### Size Limits
| Type           | Max Lines |
|----------------|-----------|
| Backend files  | 400       |
| Frontend HTML  | 300       |
| Functions      | 30        |
| Classes        | 200       |

### Function Rules
- Single responsibility per function
- Max 5 parameters (use objects for more)
- Max 3 nesting levels
- Use early returns/guard clauses

---

## Project Structure

### Backend (`src/`)
```
src/
├── config/       # Constants, endpoints, timeouts
├── utils/        # Helpers, formatters, validators
├── services/     # Business logic, AI clients
├── routes/       # API route handlers
├── types/        # TypeScript definitions
└── index.tsx     # Entry point
```

### Frontend (`public/static/`)
```
public/static/
├── shared/       # ALWAYS use these shared modules:
│   ├── storage.js         # localStorage wrapper
│   ├── constants.js       # App constants
│   ├── api-client.js      # API wrappers
│   ├── ui-templates.js    # UI components
│   ├── star-field.js      # Background animation
│   ├── voice-recorder.js  # Audio recording
│   └── interview-manager.js
├── *.html        # Page files
└── style.css     # Global styles
```

---

## Key Standards

### TypeScript/Backend
- **No `any` types** - always use explicit types
- **Descriptive errors** - include context (IDs, values)
- **Async/await** - no callbacks
- **Naming**: files `kebab-case`, vars `camelCase`, constants `UPPER_SNAKE_CASE`, classes `PascalCase`

### JavaScript/Frontend
- **Use shared modules** - never direct `localStorage` or `fetch`
- **No global variables** - encapsulate in modules/classes
- **addEventListener** - no inline `onclick`
- **const/let only** - never `var`
- **Template literals** - no string concatenation

### Authentication
- **Frontend**: Always use `Storage.getSession()` for auth token, include as `Authorization: Bearer` header
- **Backend**: Always use `requireAuth()` middleware and `extractUserId(c)` to get user identity
- **Never pass userId in request body** - backend extracts it from the session token
- **New API clients**: Copy auth pattern from `api-client.js`, not raw fetch
- **Reference**: See `api-client.js` and `gtm-agent-client.js` for correct patterns

### Design Patterns
- **Use classes** for stateful components (recorders, managers, API clients)
- **Use factory functions** when object creation needs configuration
- **Use composition** over inheritance when possible
- **Use dependency injection** for testability (pass dependencies, don't hardcode)
- **Encapsulate state** - no loose variables, group related data in objects/classes

### Avoid
- Magic numbers/strings (use named constants)
- Inline styles (use CSS classes)
- God functions (split by responsibility)
- Duplicated code across files
- Procedural scripts with global state (use classes/modules instead)
- NEVER use any Emoji
- DON't add any fallbacks unless explicitly asked to
- NEVER add reference to the old version when asked to update code or doc.

---

## Error Handling Pattern

### Principle: Let Errors Bubble Up
Errors propagate from lower layers to routes where they are caught centrally.

| Layer            | Error Handling                                          |
|------------------|--------------------------------------------------------|
| **Repositories** | NO try-catch. Let errors propagate.                    |
| **Services**     | Catch only for transformation/recovery.                |
| **Routes**       | Catch ALL errors. Log with context. Return HTTP response. |

### Rules
- Do NOT return `null` to hide errors in repositories
- Do NOT log errors at multiple layers (log once at route level)
- Do NOT catch errors just to re-throw them unchanged

---

## Mandatory Review Process

### Architecture Review (REQUIRED)
**When**: After generating any implementation plan

**Process**:
1. Complete your implementation plan
2. Use the Task tool with `subagent_type: "architect-reviewer"` to review the plan
3. Provide the plan content and context to the architect-reviewer
4. Address ALL concerns raised by the architect-reviewer before proceeding
5. Update the plan to resolve architectural issues, inconsistencies, or violations of patterns
6. Only proceed to implementation after architectural concerns are resolved

**What the architect-reviewer checks**:
- Adherence to existing architectural patterns
- Service/module organization and boundaries
- System consistency and maintainability
- Pattern violations or anti-patterns

### Code Review (REQUIRED)
**When**: Immediately after writing or modifying any code

**Process**:
1. Complete your code changes (write/edit files)
2. Use the Task tool with `subagent_type: "code-reviewer-pro"` to review the changes
3. Provide file paths and context about what was changed
4. Address ALL issues raised by the code-reviewer-pro
5. Fix problems related to quality, security, maintainability, and best practices
6. Re-review if significant changes were made during fixes

**What the code-reviewer-pro checks**:
- Code quality and readability
- Security vulnerabilities (XSS, SQL injection, etc.)
- Adherence to project standards and best practices
- Performance issues
- Error handling and edge cases

**IMPORTANT**: These reviews are NOT optional. They must be completed as part of every planning and implementation workflow.

---

## Quick Checklist

- [ ] No duplicated code
- [ ] File within size limits
- [ ] Functions < 30 lines, single purpose
- [ ] Using shared modules for common operations
- [ ] No `any` types, no magic values
- [ ] Auth checks on protected routes
- [ ] No API keys in frontend
- [ ] Plan reviewed by architect-reviewer (concerns addressed)
- [ ] Code reviewed by code-reviewer-pro (issues fixed)
