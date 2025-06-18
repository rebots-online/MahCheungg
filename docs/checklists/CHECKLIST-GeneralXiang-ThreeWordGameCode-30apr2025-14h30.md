# CHECKLIST: General Zhang Chinese Chess - Three-Word Game Code Implementation

*Generated: April 30, 2025 14:30*

## Overview
This checklist focuses on implementing Docker's MIT-licensed three-word key generator to replace the current six-digit game code system, and addressing the inactive Tutorial and Pro Tips sections in the sidebar.

## Three-Word Game Code Implementation

### Phase 1: Integration
- [ ] Review existing `gameCodeGenerator.ts` implementation with word list
- [ ] Update `InteractiveBoard.tsx` to use `generateWordGameCode()` instead of `generateGameCode()`
- [ ] Update `GoogleGeminiInteractiveBoard.tsx` to use `generateWordGameCode()` instead of `generateRandomCode()`
- [ ] Update `OldInteractiveBoard.tsx` to use `generateWordGameCode()` instead of `generateGameCode()`

### Phase 2: UI Updates
- [ ] Modify host game dialog to display three-word codes properly
- [ ] Update copy-to-clipboard functionality for longer word-based codes
- [ ] Adjust UI spacing to accommodate longer game codes
- [ ] Update game code input field to handle word-based format
- [ ] Add visual separator between words for better readability

### Phase 3: Validation & Formatting
- [ ] Implement input formatting to handle various user inputs (spaces, commas, etc.)
- [ ] Update validation logic to verify word-based codes
- [ ] Add auto-correction for common input errors
- [ ] Ensure case-insensitive matching for word codes

### Phase 4: Migration
- [ ] Add migration logic to handle existing numeric codes in localStorage
- [ ] Create fallback mechanism for legacy code support
- [ ] Add user notification for code format change
- [ ] Update any documentation or help text referencing game codes

### Phase 5: Testing
- [ ] Test code generation for uniqueness and collision avoidance
- [ ] Test code validation with various input formats
- [ ] Test migration from numeric to word-based codes
- [ ] Test copy/paste functionality across different devices
- [ ] Test game joining with both code formats during transition period

## Tutorial System Implementation

### Phase 1: Framework Completion
- [ ] Complete the tutorial walkthrough framework
- [ ] Implement tutorial state management
- [ ] Add progress tracking for tutorials
- [ ] Create tutorial navigation controls

### Phase 2: Content Development
- [ ] Complete basic rules tutorial content
- [ ] Develop opening strategies tutorial content
- [ ] Create advanced tactics tutorial content
- [ ] Add interactive exercises for each tutorial type

### Phase 3: UI Enhancement
- [ ] Improve tutorial card design and interactions
- [ ] Add visual indicators for completed tutorials
- [ ] Implement tutorial search/filter functionality
- [ ] Create tutorial recommendation system

## Pro Tips Implementation

### Phase 1: Framework
- [ ] Design Pro Tips component structure
- [ ] Implement Pro Tips state management
- [ ] Create Pro Tips display mechanism
- [ ] Add Pro Tips navigation

### Phase 2: Content
- [ ] Create beginner Pro Tips content
- [ ] Develop intermediate Pro Tips content
- [ ] Add advanced Pro Tips content
- [ ] Implement contextual Pro Tips based on gameplay

### Phase 3: Integration
- [ ] Connect Pro Tips to gameplay events
- [ ] Add Pro Tips notification system
- [ ] Implement Pro Tips bookmarking
- [ ] Create Pro Tips sharing functionality

## Testing & Quality Assurance
- [ ] Perform cross-browser testing
- [ ] Test on various screen sizes and devices
- [ ] Verify accessibility compliance
- [ ] Conduct user testing for tutorial effectiveness
- [ ] Validate Pro Tips relevance and helpfulness

## Documentation
- [ ] Update technical documentation for word-based game codes
- [ ] Document tutorial system architecture
- [ ] Create content guidelines for future tutorial additions
- [ ] Document Pro Tips implementation and content strategy
