# CHECKLIST-DevBuildWBS-06May2025-05h37.md

**Theme:** MahCheungg Full Development Build - Work Breakdown Structure
**Date:** 2025-05-06
**Note:** Task statuses are based on available documentation (`ROADMAP.md`). All statuses, particularly those marked as complete ([✅] or [x]), require verification against the actual codebase and current project state.

## WP1: Project Setup & Core Infrastructure
- [✅] Initial project setup and repository structure (as per Roadmap Q2 2025)
- [✅] Define and document overall system architecture (as per Roadmap Q2 2025)
- [ ] Establish CI/CD pipeline (if not already covered by 'Initial deployment')
- [ ] Setup centralized logging and monitoring solution
- [ ] Define and document hKG conventions and ensure initial population

## WP2: Frontend Development (`mahcheungg-app`)
- [✅] Basic UI components and styling (as per Roadmap Q2 2025)
- [✅] Game hub interface implementation (as per Roadmap Q2 2025)
- [ ] Implement main application router
- [ ] Develop Game Controller UI (Board, Players, Actions, In-Game Chat)
- [ ] Develop Learning Center UI components (Lessons, AI Chatbot integration, Pronunciation)
- [ ] Develop Authentication UI components (Login, Register, Profile)
- [ ] Ensure mobile-responsive design (Roadmap Q4 2025)
- [ ] Implement React Contexts for state management (ThemeContext, LanguageContext, etc.)
- [ ] Develop shared UI component library

## WP3: Backend Services (`mahcheungg-server`, `routes`)
- [ ] Design and implement API layer
- [ ] Develop User Management service (part of Authentication)
- [ ] Develop Session Management service (part of Authentication)
- [ ] Implement backend for Payment Processing (integrating with Stripe, RevenueCat, WebLN, Lemonsqueezy)
- [ ] Implement backend for Matchmaking service
- [ ] Implement backend support for Learning System (Content Management, LLM interface if needed)
- [ ] Develop `server.js` and associated routes

## WP4: Core Game Logic & Mechanics
- [ ] Define and implement unified `Player` interface (Human & AI) (as per docs/ARCHITECTURE.md)
- [ ] Implement core game rules engine
- [ ] Implement turn management system
- [ ] Implement tile distribution and management
- [ ] Implement logic for special actions (Chow, Pung, Kong, Mahjong)
- [ ] Implement scoring system
- [ ] Develop single-player mode against basic AI (Roadmap Q3 2025)
- [ ] Core game mechanics implementation (Roadmap Q3 2025)

## WP5: AI System (Opponents & Learning Assistant)
- [✅] Basic AI Chatbot for Learning Center (as per Roadmap Q2 2025, needs verification)
- [ ] Implement Basic AI opponent (Roadmap Q3 2025)
- [ ] Design AI Player (`AIPlayer` class implementing `Player` interface)
- [ ] Implement AI decision-making logic (discard, action)
- [ ] Develop different AI difficulty levels
- [ ] Develop AI personality traits
- [ ] Integrate AI with game logic via `Player` interface
- [ ] Develop Advanced AI opponents (Roadmap Q4 2025)
- [ ] AI coaching and personalized learning (Roadmap Q1 2027)

## WP6: Networking & Communication (Jami Integration)
- [ ] Integrate Jami for P2P communication
- [ ] Implement Jami multicast messaging for game state transport
- [ ] Implement LAN discovery for local play
- [ ] Embed game state updates within Jami conversation messages
- [ ] Implement conflict resolution for game state sync (e.g., timestamps)
- [ ] Implement timeout fallbacks for disconnected players
- [ ] Isolate Jami integration as a dedicated service module
- [ ] Implement text, voice, and video chat features via Jami

## WP7: User Management & Authentication
- [ ] Implement secure user registration
- [ ] Implement secure user login (JWT-based or similar)
- [ ] Implement user profile management
- [ ] Implement session management
- [ ] User authentication system (Roadmap Q3 2025)

## WP8: Subscription & Payment Systems
- [✅] Bitcoin Lightning Network (WebLN) integration (as per Roadmap Q2 2025, needs verification)
- [ ] Implement RevenueCat integration (service and MCP if applicable)
- [ ] Implement Stripe integration (service and MCP if applicable)
- [ ] Implement Lemonsqueezy integration (MCP if applicable, based on file system)
- [ ] Develop subscription tier management logic
- [ ] Implement feature gating based on subscription level
- [ ] Basic subscription management system (Roadmap Q3 2025)
- [ ] Develop UI for subscription management and payments
- [ ] Advanced subscription features (Roadmap Q1 2026)

## WP9: Learning & Teaching Module
- [✅] Learning center with AI chatbot (as per Roadmap Q2 2025, needs verification)
- [ ] Develop structured lessons (rules, strategy, terminology)
- [ ] Implement audio pronunciation for Cantonese terms (TTS integration)
- [ ] Implement voice interaction (Speech Recognition)
- [ ] Develop progression system for skill levels
- [ ] Develop interactive exercises
- [ ] Implement progress tracking for learning modules
- [ ] Implement achievement system for learning
- [ ] Enhanced learning content (Roadmap Q4 2025)

## WP10: UI/UX Design & Theming
- [✅] Basic UI components and styling (as per Roadmap Q2 2025, needs verification)
- [ ] Design and implement DeepSite theme (Default)
- [ ] Design and implement Brutalist theme
- [ ] Design and implement Skeuomorphic theme
- [ ] Design and implement Retro theme
- [ ] Implement light/dark variants for themes
- [ ] Ensure consistent UX across the application
- [ ] Additional theme options (Roadmap Q1 2026)

## WP11: Internationalization (i18n) & Localization (l10n)
- [✅] Internationalization support structure (as per Roadmap Q2 2025, needs verification)
- [ ] Implement translation loading and management
- [ ] Provide translations for English (en)
- [ ] Provide translations for Cantonese (zh-HK)
- [ ] Provide translations for Simplified Chinese (zh-CN)
- [ ] Provide translations for Japanese (ja)
- [ ] Localization for additional languages (Roadmap Q1 2027)

## WP12: Documentation
- [ ] Update/Create `ARCHITECTURE.md` to reflect final build
- [ ] Update/Create `PLAYER_INTERFACE.md`
- [ ] Update/Create `SUBSCRIPTION_ANALYSIS.md`
- [ ] Update/Create `TEACHING_MODULES.md`
- [ ] Create API documentation (if applicable)
- [ ] Create User Guides
- [ ] Document hKG structure and usage for the project
- [ ] Review and update all `docs/` and root-level `.md` files for consistency and accuracy.

## WP13: Testing & QA
- [ ] Develop unit tests for all major components
- [ ] Develop integration tests
- [ ] Perform end-to-end testing
- [ ] Implement automated testing in CI/CD pipeline
- [ ] Conduct User Acceptance Testing (UAT)
- [ ] Performance testing and optimization (Roadmap Q1 2026)
- [ ] Security testing and hardening (Roadmap Q1 2026)

## WP14: Deployment & Operations
- [ ] Define deployment strategy for frontend and backend
- [ ] Initial deployment to a staging/production environment (Roadmap Q3 2025)
- [ ] Setup database schema and migrations (if applicable)
- [ ] Configure environment variables and secrets management
- [ ] Monitor application performance and errors post-deployment
