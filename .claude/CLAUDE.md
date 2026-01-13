# Cosmostation Chrome Extension - Claude Working Instructions

## Project Overview

This is Cosmostation's Chrome extension providing blockchain wallet functionality.

## Core Working Principles

### 1. Active Questioning and Confirmation

When uncertainty arises, you MUST use the AskUserQuestion tool to clarify before proceeding:

- **Implementation approaches**: When multiple valid solutions exist
- **Security-related matters**: Especially for key management, signing processes, or permission handling
- **User intent**: When requirements are ambiguous or incomplete

**DO NOT make assumptions**, especially regarding blockchain/cryptocurrency logic, as incorrect assumptions can lead to critical issues.

**Present options with trade-offs**: When multiple implementation methods exist, explain the pros and cons of each and let the user choose.

### 2. Security First

This is a wallet extension handling user assets - security is the top priority:

- Exercise extreme caution with key management, signing processes, and permission handling
- Clearly explain and get approval for any security-related changes
- Consider potential attack vectors before implementing new features
- Follow security best practices for Chrome extensions and Web3 applications

### 3. Collaborative Approach

Maintain a partnership relationship to solve problems together:

- Explain the reasoning behind your code, not just what it does
- Provide learning opportunities when appropriate, but maintain balance
- Be transparent about limitations or uncertainties

### 4. When to Ask Questions

You MUST ask questions in these situations:

- Adding support for new blockchain networks (specific specs needed)
- UI/UX changes (user experience preferences)
- Choosing between multiple libraries or approaches
- When existing code's intent is unclear
- When changes might introduce breaking changes
- When security implications are significant

## Project Characteristics

- **Tech Stack**: TypeScript, React, Chrome Extension API, WXT
- **Domain**: Blockchain, cryptocurrency wallets, Web3
- **Critical Considerations**: Security, user asset protection, cross-chain compatibility

## User Context

- Users may be unfamiliar with this codebase
- Provide comprehensive context to make explanations easily understandable
- Explain the "why" behind architectural decisions when relevant

## Commit Message Convention

ALL commit messages MUST follow the Conventional Commits specification:

**Format**: `<type>: <description>`

**Types**:

- `feat:` New feature or functionality
- `fix:` Bug fix
- `docs:` Documentation only changes
- `style:` Code style/formatting changes (no logic changes)
- `refactor:` Code refactoring without changing functionality
- `perf:` Performance improvements
- `test:` Adding or updating tests
- `build:` Changes to build system or dependencies
- `ci:` CI/CD configuration changes
- `chore:` Other changes (tooling, configs, etc.)

**Examples**:

- `feat: Add support for Ethereum network`
- `fix: Resolve signing process memory leak`
- `docs: Update API documentation for wallet methods`
- `refactor: Simplify transaction validation logic`

**Restriction**:

DO NOT include any automated attribution lines such as Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>.

Keep the commit message clean and focused only on the changes.
