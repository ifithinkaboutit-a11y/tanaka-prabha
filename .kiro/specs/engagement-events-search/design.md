# Design Document: Engagement Events Search

## Overview

This document covers the technical design for five related enhancements to the Tanakprabha app (React Native / Expo) and its Next.js web dashboard:

1. **Filter & Sort UI** — working sort bar and filter panel on `category-listing.tsx` and type-filter chips on `search.tsx`
2. **Event Trainer & GPS Fields** — new optional fields on the events schema and their display in mobile and dashboard UIs
3. **QR Attendance Scanning** — server-side signed QR generation on the dashboard and camera-based scanning on mobile
4. **Duplicate Phone Handling** — inline banner on `phone-input.tsx` instead of a generic Alert when a phone is already registered
5. **Interested Button** — heart-icon interest toggle with live count on scheme and program detail screens

All changes are additive and backward-compatible. No existing API contracts are broken.

---

## Architecture

### System Layers

```
┌─────────────────────────────────────────────────────────────┐
│  React Native (Expo) Mobile App                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Screens     │  │  Hooks       │  │  Services        │  │
│  │  (app/)      │◄─┤  (hooks/)    │◄─┤  (apiService.ts) │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                              │               │
│  ┌──────────────────────────────────────┐   │               │
│  │  AsyncStorage (interest state, auth) │   │               │
│  └──────────────────────────────────────┘   │               │
└─────────────────────────────────────────────┼───────────────┘
                                              │ HTTPS REST
┌─────────────────────────────────────────────▼───────────────┐
│  Backend API (Node.js / Express)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  /events     │  │  /schemes    │  │  /auth           │  │
│  │  /attendance │  │  /interest   │  │  /send-otp       │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────