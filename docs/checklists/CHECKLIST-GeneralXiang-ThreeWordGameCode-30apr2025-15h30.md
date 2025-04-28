# CHECKLIST: General Zhang Chinese Chess - Implementation Plan

*Generated: April 30, 2025 15:30*

## Three-Word Game Code Implementation

### Phase 1: Code Integration
- [ ] Review existing `gameCodeGenerator.ts` implementation with word list
- [ ] Update `InteractiveBoard.tsx` to use `generateWordGameCode()` instead of `generateGameCode()`
- [ ] Update `GoogleGeminiInteractiveBoard.tsx` to use `generateWordGameCode()` instead of `generateRandomCode()`
- [ ] Update `OldInteractiveBoard.tsx` to use `generateWordGameCode()` instead of `generateGameCode()`
- [ ] Ensure localStorage keys remain consistent for backward compatibility

### Phase 2: UI Updates
- [ ] Modify host game dialog to display three-word codes properly
- [ ] Update copy-to-clipboard functionality for longer word-based codes
- [ ] Adjust UI spacing to accommodate longer game codes
- [ ] Add visual separator between words for better readability (e.g., "dog-tree-blue")
- [ ] Update game code input field to handle word-based format

### Phase 3: Validation & Formatting
- [ ] Implement input formatting to handle various user inputs (spaces, commas, etc.)
- [ ] Update validation logic to verify word-based codes
- [ ] Add auto-correction for common input errors
- [ ] Ensure case-insensitive matching for word codes
- [ ] Add visual feedback for valid/invalid codes

### Phase 4: Migration
- [ ] Add migration logic to handle existing numeric codes in localStorage
- [ ] Create fallback mechanism for legacy code support during transition
- [ ] Add user notification for code format change
- [ ] Update any documentation or help text referencing game codes

### Phase 5: Testing
- [ ] Test code generation for uniqueness and collision avoidance
- [ ] Test code validation with various input formats
- [ ] Test migration from numeric to word-based codes
- [ ] Test copy/paste functionality across different devices
- [ ] Test game joining with both code formats during transition period

## Jami Integration Strategy

### Phase 1: Architecture Design
- [ ] Design LGPL-compliant architecture with clear separation
- [ ] Create interface definitions for communication between main app and Jami component
- [ ] Design protocol for IPC (Inter-Process Communication)
- [ ] Document architecture with clear boundaries for LGPL code

### Phase 2: Component Structure
- [ ] Create separate project for Jami integration component
- [ ] Set up build process for standalone component
- [ ] Implement API endpoints for communication
- [ ] Ensure proper LGPL licensing for the component

### Phase 3: Main Application Integration
- [ ] Implement connector in main application
- [ ] Create detection mechanism for installed/not-installed state
- [ ] Implement download trigger for first multiplayer/AI attempt
- [ ] Add fallback for tutorials and exercises without Jami component

### Phase 4: Installation Experience
- [ ] Design "Decentralization Package" installation UI
- [ ] Create educational/gamified installation flow
- [ ] Implement progress tracking and animation system
- [ ] Add strategic messaging about decentralization benefits

### Phase 5: Testing & Deployment
- [ ] Test component download and installation process
- [ ] Verify LGPL compliance with legal team
- [ ] Test communication between main app and Jami component
- [ ] Ensure seamless user experience despite the separation

## Tutorial & Pro Tips Implementation

### Phase 1: Tutorial Framework
- [ ] Complete the tutorial walkthrough framework
- [ ] Implement tutorial state management
- [ ] Add progress tracking for tutorials
- [ ] Create tutorial navigation controls

### Phase 2: Tutorial Content
- [ ] Complete basic rules tutorial content
- [ ] Develop opening strategies tutorial content
- [ ] Create advanced tactics tutorial content
- [ ] Add interactive exercises for each tutorial type

### Phase 3: Pro Tips Framework
- [ ] Design Pro Tips component structure
- [ ] Implement Pro Tips state management
- [ ] Create Pro Tips display mechanism
- [ ] Add Pro Tips navigation

### Phase 4: Pro Tips Content
- [ ] Create beginner Pro Tips content
- [ ] Develop intermediate Pro Tips content
- [ ] Add advanced Pro Tips content
- [ ] Implement contextual Pro Tips based on gameplay

## General Tasks

### Documentation
- [ ] Update technical documentation for word-based game codes
- [ ] Document Jami integration architecture with LGPL considerations
- [ ] Create content guidelines for tutorials and Pro Tips
- [ ] Update user-facing help documentation

### Quality Assurance
- [ ] Perform cross-browser testing
- [ ] Test on various screen sizes and devices
- [ ] Verify accessibility compliance
- [ ] Conduct user testing for tutorial effectiveness
- [ ] Validate Pro Tips relevance and helpfulness

### Performance
- [ ] Ensure Jami component doesn't impact main app performance
- [ ] Optimize three-word code generation and validation
- [ ] Measure and optimize tutorial rendering performance
- [ ] Ensure smooth transitions between states
