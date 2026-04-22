# Bugfix Requirements Document

## Introduction

This document captures all pending bugs and feature gaps across three surfaces of the platform:

1. **Farmer-Facing Mobile App** (`Client/` — React Native / Expo) — localization failures and keyboard UX issues
2. **Web Admin Dashboard (CMS)** — data visualization, professional management, scheme creation, event creation, and custom reporting gaps
3. **Mobile Admin App** — event attendance walk-in flow, data entry UX, and audit logging gaps
4. **System-Wide** — keyboard avoiding view regression, dynamic "Other" input rendering, and multilingual data toggle failure

Each section follows the bug condition methodology: Current Behavior (Defect) → Expected Behavior (Correct) → Unchanged Behavior (Regression Prevention).

---

## Bug Analysis

---

### Section A — Farmer-Facing Mobile App: Localization (i18n)

#### Current Behavior (Defect)

1.1 WHEN the app language is set to Hindi AND a crop name is rendered (e.g. in the land details onboarding screen, profile summary, or crop selector) THEN the system displays the English crop label instead of the Hindi `labelHi` value from `onboardingOptions.ts`

1.2 WHEN the app language is set to Hindi AND the "My Schedule" screen (`my-schedule.tsx`) is displayed THEN the system renders the section title and tab/content strings in English rather than their Hindi equivalents from `hi.json`

#### Expected Behavior (Correct)

2.1 WHEN the app language is set to Hindi AND a crop name is rendered THEN the system SHALL display the corresponding `labelHi` value (e.g. "गेहूं" for Wheat, "चावल" for Rice) by correctly passing `currentLanguage` to `getLocalizedOptions`

2.2 WHEN the app language is set to Hindi AND the "My Schedule" screen is displayed THEN the system SHALL render the screen title, tab labels ("आगामी" / "पिछला"), status labels, empty-state messages, and action button labels using the Hindi strings already present in `hi.json` under the `schedule` namespace

#### Unchanged Behavior (Regression Prevention)

3.1 WHEN the app language is set to English THEN the system SHALL CONTINUE TO display all crop names in English

3.2 WHEN the app language is set to English THEN the system SHALL CONTINUE TO display the "My Schedule" screen title and all content in English

3.3 WHEN the user switches language at runtime THEN the system SHALL CONTINUE TO re-render all translated strings reactively without requiring an app restart

---

### Section B — System-Wide: Keyboard Avoiding View

#### Current Behavior (Defect)

1.3 WHEN a user focuses a text input near the bottom of any form screen on Android THEN the system leaves insufficient bottom margin, causing the software keyboard to overlap the focused input field and obscure the user's typed content

1.4 WHEN a user focuses a text input near the bottom of any form screen on iOS THEN the system applies an incorrect or zero `keyboardVerticalOffset` to `KeyboardAvoidingView`, causing the keyboard to partially cover the input

#### Expected Behavior (Correct)

2.3 WHEN a user focuses a text input near the bottom of any form screen on Android THEN the system SHALL scroll the view so the focused input is fully visible above the keyboard with at least 24 px of breathing room

2.4 WHEN a user focuses a text input near the bottom of any form screen on iOS THEN the system SHALL apply the correct `keyboardVerticalOffset` (accounting for the custom header height) so the input is fully visible above the keyboard

#### Unchanged Behavior (Regression Prevention)

3.4 WHEN a user focuses a text input that is already fully visible above the keyboard THEN the system SHALL CONTINUE TO leave the scroll position unchanged

3.5 WHEN the keyboard is dismissed THEN the system SHALL CONTINUE TO allow the scroll position to remain where the user left it (no forced snap-back)

---

### Section C — System-Wide: Dynamic "Other" Input

#### Current Behavior (Defect)

1.5 WHEN a user selects "Other" from any dropdown or multi-select in any form (e.g. crop type, animal type, gender) THEN the system does not render a follow-up text input, leaving the "Other" value unspecified and unvalidated

#### Expected Behavior (Correct)

2.5 WHEN a user selects "Other" from any dropdown or multi-select in any form THEN the system SHALL dynamically render a required text area/input immediately below the selector, prompting the user to specify the value, and SHALL prevent form submission if the field is left empty

#### Unchanged Behavior (Regression Prevention)

3.6 WHEN a user selects any option other than "Other" THEN the system SHALL CONTINUE TO hide the dynamic text input and not require its value for form submission

---

### Section D — System-Wide: Multilingual Data Toggle

#### Current Behavior (Defect)

1.6 WHEN a user has entered data (e.g. profile fields, scheme eligibility text) in one language AND toggles the app language to the other language THEN the system fails to switch the displayed data to the corresponding translated version, showing stale or mismatched content

#### Expected Behavior (Correct)

2.6 WHEN a user toggles the app language THEN the system SHALL re-fetch or re-derive the localized version of all displayed data fields (using the appropriate `_hi` / `_en` field variants from the API response or local store) and render them in the newly selected language

#### Unchanged Behavior (Regression Prevention)

3.7 WHEN the app language has not changed THEN the system SHALL CONTINUE TO display data in the currently active language without re-fetching

---

### Section E — Web Admin Dashboard: Landholding Heatmap

#### Current Behavior (Defect)

1.7 WHEN an admin views the map visualization for landholding data THEN the system renders individual point markers or a generic layer instead of a density heatmap, making it impossible to identify high-density landholding areas at a glance

#### Expected Behavior (Correct)

2.7 WHEN an admin views the map visualization for landholding data THEN the system SHALL render a density heatmap layer where color intensity corresponds to the concentration of landholding records in a geographic area

#### Unchanged Behavior (Regression Prevention)

3.8 WHEN an admin views map visualizations for non-landholding data (crop categories, etc.) THEN the system SHALL CONTINUE TO render those as point/pin-based markers, unaffected by the heatmap layer

---

### Section F — Web Admin Dashboard: Point-Based Data Maps with Filtering

#### Current Behavior (Defect)

1.8 WHEN an admin views map visualizations for non-landholding data points (crop categories, farmer locations, etc.) THEN the system renders them without robust filtering controls, making it difficult to isolate specific data subsets on the map

#### Expected Behavior (Correct)

2.8 WHEN an admin views map visualizations for non-landholding data points THEN the system SHALL render each data point as a precise pin/marker on the map AND SHALL provide filter controls (by crop category, district, date range, or other relevant parameters) that dynamically update the visible pins without a full page reload

#### Unchanged Behavior (Regression Prevention)

3.9 WHEN no filters are applied THEN the system SHALL CONTINUE TO display all available data points on the map

---

### Section G — Web Admin Dashboard: Professional Management

#### Current Behavior (Defect)

1.9 WHEN an admin creates a new Professional record THEN the system does not link State and District data to the professional, leaving those fields empty or unassociated

1.10 WHEN an admin views the Professional cards listing THEN the system displays fields beyond "Name" and "Description" (e.g. phone, email, role details), creating visual clutter

1.11 WHEN an admin clicks "Manage Professionals" in the navigation THEN the system routes to a general professionals page rather than directly to the "Experts" tab

#### Expected Behavior (Correct)

2.9 WHEN an admin creates a new Professional record THEN the system SHALL require and persist State and District selections, linking them to the professional's record in the database

2.10 WHEN an admin views the Professional cards listing THEN the system SHALL display only the "Name" and "Description" fields on each card, hiding all other fields from the card view

2.11 WHEN an admin clicks "Manage Professionals" in the navigation THEN the system SHALL route directly to the "Experts" tab, bypassing any intermediate landing page

#### Unchanged Behavior (Regression Prevention)

3.10 WHEN an admin opens an individual Professional's detail/edit view THEN the system SHALL CONTINUE TO display all professional fields (phone, email, role, state, district, etc.) for editing

---

### Section H — Web Admin Dashboard: Multilingual Scheme Creation

#### Current Behavior (Defect)

1.12 WHEN an admin creates or edits a Scheme THEN the system does not provide input fields for Hindi eligibility criteria alongside English, and does not provide a category dropdown for eligibility, forcing admins to enter eligibility as unstructured free text in a single language

#### Expected Behavior (Correct)

2.12 WHEN an admin creates or edits a Scheme THEN the system SHALL provide paired eligibility criteria input fields — one for English and one for Hindi — AND SHALL provide a category dropdown (e.g. "Land Ownership", "Income", "Caste", "Age") to classify each eligibility criterion

#### Unchanged Behavior (Regression Prevention)

3.11 WHEN an admin saves a Scheme with only English eligibility criteria filled THEN the system SHALL CONTINUE TO save the scheme successfully without requiring Hindi input

---

### Section I — Web Admin Dashboard: Event Perks Field

#### Current Behavior (Defect)

1.13 WHEN an admin creates or edits an Event THEN the system does not provide a field to capture "Perks/Benefits" (e.g. free seeds, subsidies, equipment) offered to attendees, so this information cannot be stored or displayed to farmers

#### Expected Behavior (Correct)

2.13 WHEN an admin creates or edits an Event THEN the system SHALL provide a "Perks / Benefits" input field (supporting both English and Hindi text) that is saved to the event record and displayed to farmers on the event detail screen

#### Unchanged Behavior (Regression Prevention)

3.12 WHEN an admin saves an Event without filling the Perks field THEN the system SHALL CONTINUE TO save the event successfully, treating the Perks field as optional

---

### Section J — Web Admin Dashboard: Custom Farmer Profile Reporting

#### Current Behavior (Defect)

1.14 WHEN an admin needs to generate a report of farmer profiles filtered by specific parameters (e.g. district, crop type, land area, livestock count) THEN the system provides no reporting tool, requiring manual data extraction

#### Expected Behavior (Correct)

2.14 WHEN an admin uses the Custom Reporting tool THEN the system SHALL allow selection of one or more filter parameters (district, crop type, land area range, livestock type, scheme enrollment status, etc.), generate a filtered list of matching farmer profiles, and export the result as a downloadable file (CSV or PDF)

#### Unchanged Behavior (Regression Prevention)

3.13 WHEN an admin views the standard farmer profiles list THEN the system SHALL CONTINUE TO display all farmers without any filters applied by default

---

### Section K — Mobile Admin App: Walk-in Attendee Segregation

#### Current Behavior (Defect)

1.15 WHEN an admin views the attendance list for an event THEN the system displays walk-in attendees and pre-registered attendees in a single undifferentiated list, making it impossible to distinguish between the two groups visually

#### Expected Behavior (Correct)

2.15 WHEN an admin views the attendance list for an event THEN the system SHALL visually separate walk-in attendees from pre-registered attendees using distinct section headers, background colors, or badges, making the two groups immediately distinguishable

#### Unchanged Behavior (Regression Prevention)

3.14 WHEN an admin marks a pre-registered attendee as present THEN the system SHALL CONTINUE TO record their attendance without reclassifying them as a walk-in

---

### Section L — Mobile Admin App: Unregistered Walk-in Flow & Conversion Tracking

#### Current Behavior (Defect)

1.16 WHEN an admin marks an unregistered walk-in attendee as present THEN the system does not automatically send a WhatsApp invite link to that attendee, missing the opportunity to convert them to a registered user

1.17 WHEN an unregistered walk-in has been marked present AND has not yet converted to a registered user THEN the system provides no mechanism to resend the invite link or track their conversion status

#### Expected Behavior (Correct)

2.16 WHEN an admin marks an unregistered walk-in attendee as present THEN the system SHALL automatically trigger a WhatsApp message containing the app registration invite link to the walk-in's phone number

2.17 WHEN an admin views the walk-in attendee list THEN the system SHALL display a conversion status indicator for each walk-in (e.g. "Registered" / "Pending") AND SHALL display a "Resend Link" button for walk-ins whose conversion status is still "Pending"

#### Unchanged Behavior (Regression Prevention)

3.15 WHEN an admin marks a pre-registered attendee as present THEN the system SHALL CONTINUE TO record attendance without sending any WhatsApp invite

3.16 WHEN a walk-in has already converted to a registered user THEN the system SHALL CONTINUE TO show their "Registered" status and SHALL NOT display the "Resend Link" button

---

### Section M — Mobile Admin App: Livestock UI Differentiation

#### Current Behavior (Defect)

1.18 WHEN an admin enters livestock data for a farmer THEN the system renders all livestock type entries with identical visual styling, making it difficult to distinguish between different animal types at a glance

#### Expected Behavior (Correct)

2.18 WHEN an admin enters livestock data for a farmer THEN the system SHALL visually differentiate each livestock type using distinct accent colors and/or type-specific icons or labels, so each animal category is immediately identifiable

#### Unchanged Behavior (Regression Prevention)

3.17 WHEN an admin saves livestock data THEN the system SHALL CONTINUE TO persist the correct animal type and count regardless of the visual styling applied

---

### Section N — Mobile Admin App / Backend: Audit Logging

#### Current Behavior (Defect)

1.19 WHEN a farmer views a Scheme detail page THEN the system does not record a backend audit log entry for that view event, making it impossible to track scheme engagement

1.20 WHEN a farmer or admin triggers the SOS button THEN the system does not record a backend audit log entry for that SOS trigger event, making it impossible to audit emergency usage

#### Expected Behavior (Correct)

2.19 WHEN a farmer views a Scheme detail page THEN the system SHALL record a backend audit log entry containing at minimum: user ID, scheme ID, timestamp, and event type ("scheme_view")

2.20 WHEN the SOS button is triggered THEN the system SHALL record a backend audit log entry containing at minimum: user ID, timestamp, event type ("sos_trigger"), and any reason text provided

#### Unchanged Behavior (Regression Prevention)

3.18 WHEN a farmer navigates away from a Scheme detail page without viewing it (e.g. back-navigation before the page loads) THEN the system SHALL CONTINUE TO not record a spurious audit log entry

---

## Bug Condition Summary

### Bug Condition Functions

```pascal
FUNCTION isBugCondition_CropLocalization(X)
  INPUT: X = { language: string, renderContext: string }
  OUTPUT: boolean
  RETURN X.language = "hi" AND X.renderContext IN ["crop_selector", "land_summary", "profile_crop_display"]
END FUNCTION

FUNCTION isBugCondition_ScheduleLocalization(X)
  INPUT: X = { language: string, screen: string }
  OUTPUT: boolean
  RETURN X.language = "hi" AND X.screen = "my-schedule"
END FUNCTION

FUNCTION isBugCondition_KeyboardOverlap(X)
  INPUT: X = { platform: string, inputPosition: "bottom_of_form" | "other" }
  OUTPUT: boolean
  RETURN X.inputPosition = "bottom_of_form"
END FUNCTION

FUNCTION isBugCondition_OtherInput(X)
  INPUT: X = { selectedValue: string }
  OUTPUT: boolean
  RETURN X.selectedValue = "other"
END FUNCTION

FUNCTION isBugCondition_LanguageToggle(X)
  INPUT: X = { previousLanguage: string, newLanguage: string }
  OUTPUT: boolean
  RETURN X.previousLanguage ≠ X.newLanguage
END FUNCTION
```

### Preservation Properties

```pascal
// For all bug conditions above:
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT F(X) = F'(X)   // Fixed function behaves identically to original for non-buggy inputs
END FOR
```
