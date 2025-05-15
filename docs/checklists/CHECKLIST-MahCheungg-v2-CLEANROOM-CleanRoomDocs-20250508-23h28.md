# WBS & Checklist: Clean-Room Implementation Documentation for MahCheungg

**Date Created:** 2025-05-08T23:28:00-04:00
**Status:** To Do
**Goal:** To produce comprehensive documentation enabling a developer to perform a clean-room implementation of the MahCheungg project, with a special focus on the Jami-based decentralized game state multicasting innovation.
**Associated hKG UUID:** mahcheungg_wbs_cleanroomdocs_hkg_20250508_232800

## Phase 1: Core Setup & Project Overview

### 1.1. `DEV_SETUP.md` (or enhance `mahcheungg-app/README.md`)
    - [ ] Define Prerequisites (Node.js, npm/yarn, Git versions)
    - [ ] Detail Jami Client/SDK Setup
        - [ ] Specify recommended Jami client/SDK (name, version, source/library)
        - [ ] Provide Jami installation and local configuration steps (daemon, etc.)
        - [ ] Explain Jami account creation/management for development & testing
        - [ ] Document application-to-Jami daemon/network connection process
    - [ ] Document Project Dependency Installation (`npm install` / `yarn install`)
    - [ ] Specify Environment Variable Setup (`.env` files, required variables for Jami, dev APIs)
    - [ ] Document Development Server Execution (`npm run dev`) & port info
    - [ ] Document Production Build Process (`npm run build`)
    - [ ] Outline Basic Testing Execution (once test strategy is defined)

## Phase 2: Jami Integration & Decentralized Multicasting (High Priority)

### 2.1. `JAMI_INTEGRATION_GUIDE.md`
    - [ ] **Section 1: Introduction & Core Innovation**
        - [ ] Briefly recap the Jami-based multicasting architecture and its importance.
        - [ ] Goals of this guide: enabling implementation of Jami transport.
    - [ ] **Section 2: Jami SDK Deep Dive (Replacing Mocks)**
        - [ ] Specify the *actual* Jami SDK/library to be used (e.g., `jami-libclient-qt`, a Node.js wrapper, WebAssembly version if applicable).
        - [ ] Detailed steps for installing and importing the chosen Jami SDK into the project.
        - [ ] Strategy for interfacing with the SDK (e.g., from `jami-worker.ts`, native modules).
        - [ ] Comprehensive mapping of placeholder `JamiSDK` interface methods (from current `JamiService.ts`) to *actual* functions/calls in the chosen Jami SDK for:
            - Account login, logout, and current user status.
            - Creating, naming, and configuring group conversations.
            - Managing group conversation metadata (e.g., game type, open/closed).
            - Inviting Jami contacts/URIs to a group.
            - Sending messages (text, and potentially structured data if supported).
            - Receiving messages and identifying sender Jami URI.
            - Handling presence status of contacts and group members.
            - Retrieving contact lists and group member lists (Jami URIs, display names).
            - Securely leaving/disbanding group conversations.
        - [ ] Robust error handling for all Jami SDK interactions (connection errors, API call failures, timeouts).
    - [ ] **Section 3: Peer & Game Discovery on Jami Network**
        - [ ] Strategy for discovering other MahCheungg players/game hosts on the Jami network.
            - [ ] Leveraging Jami presence.
            - [ ] Advertising game availability (e.g., via Jami status messages, specific Jami groups).
            - [ ] How to represent/query for games supported/interest by other players.
        - [ ] Flow for a client to find and list available game sessions.
        - [ ] Flow for a client to host a new game session and make it discoverable.
        - [ ] Handling invitations and join requests.
    - [ ] **Section 4: Game State Transport Over Jami**
        - [ ] Confirm use of `GameActions.ts` for message payloads.
        - [ ] Detailed specification for `vectorClock` serialization (e.g., JSON string of `[player_id, count][]`).
        - [ ] If "hiding game messages" is still a goal: explain the markup/mechanism and how it interacts with Jami clients.
        - [ ] Recommended practices for message batching or frequency to avoid Jami network flooding.
    - [ ] **Section 5: Advanced Multicasting Features (Conceptual from Checklist)**
        - [ ] Elaborate on conflict resolution logic (if vector clocks show concurrency).
        - [ ] How `EmergencyHandoffAction` and `AutoPassAction` are communicated and processed via Jami.
        - [ ] (If pursued) Outline strategy for delta updates over Jami.
        - [ ] (If pursued) Outline strategy for ensuring ordered message delivery if Jami itself doesn't guarantee it for the use case.
    - [ ] **Section 6: Security for Jami Game Sessions**
        - [ ] Recommendations for securing game sessions (e.g., private Jami groups, invite-only).
        - [ ] Discussion on end-to-end encryption provided by Jami.
        - [ ] (If needed) Application-level checks for message authenticity or player identity.
    - [ ] **Section 7: Debugging & Troubleshooting Jami Integration**
        - [ ] Common Jami SDK issues and how to resolve them.
        - [ ] Recommended logging practices for Jami interactions.
        - [ ] Tools or techniques for monitoring Jami network traffic (if possible/relevant).

## Phase 3: Data Models & Core Application Logic

### 3.1. `DATA_MODELS_REFERENCE.md`
    - [ ] Provide complete definitions for `TileInfo` (from `Tile.ts`), `TileSet`.
    - [ ] Detail the `Player` interface (from `docs/ARCHITECTURE.md`) and its properties.
    - [ ] Explain `VectorClock` internal structure and its defined serialized form.
    - [ ] Document all Enums: `ChowPosition`, `TileSuit`, `TileSetType`, etc., with their values and meanings.
    - [ ] Illustrate relationships between different game state objects with examples.

## Phase 4: Billing Platform Integration

### 4.1. `BILLING_INTEGRATION_GUIDE.md`
    - [ ] Overview of how subscription tiers affect Jami-based features (e.g., hosting premium games).
    - [ ] Document interaction with the centralized Auth/Payment REST API (confirm `API-DOCUMENTATION-20apr2025-06h35.md` is canonical and up-to-date).
        - [ ] Endpoints for checking subscription status.
        - [ ] Endpoints/flow for initiating subscription purchases (Stripe, RevenueCat, WebLN).
        - [ ] Handling callbacks/webhooks from payment providers.
    - [ ] Frontend logic for displaying subscription options and restricting features.
    - [ ] Securely handling API keys for payment services (Stripe, RevenueCat).

## Phase 5: Testing Strategy (Iterative)

### 5.1. `TESTING_STRATEGY_OVERVIEW.md`
    - [ ] Outline Unit Testing approach (game logic, Jami service abstractions).
    - [ ] Outline Integration Testing for Jami P2P features.
        - [ ] Strategy for mocking/simulating multiple Jami clients for automated tests.
    - [ ] Outline End-to-End testing scenarios for game flow and Jami communication.
    - [ ] Suggested tools for testing.

## Phase 6: Final Review & Indexing
    - [ ] Review all created documents for clarity, consistency, and completeness.
    - [ ] Validate instructions by attempting a partial clean-room setup based on the docs.
    - [ ] Create a top-level `DOCUMENTATION_INDEX.md` linking to all key guides.
