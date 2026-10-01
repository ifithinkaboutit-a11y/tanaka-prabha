# Tanak Prabha — Farmer App User Manual

**Applies to:** the Tanak Prabha mobile application for **Android and iOS**
**App version:** 1.0.1 · **Package / Bundle ID:** `com.tanakprabha.ifi.app`
**Languages:** English and हिंदी (Hindi)

---

## Table of contents

1. [What Tanak Prabha is](#1-what-tanak-prabha-is)
2. [Installing and opening the app for the first time](#2-installing-and-opening-the-app-for-the-first-time)
3. [Choosing your language](#3-choosing-your-language)
4. [The Welcome screen](#4-the-welcome-screen)
5. [Creating a new account (Sign Up)](#5-creating-a-new-account-sign-up)
6. [Completing your profile (onboarding)](#6-completing-your-profile-onboarding)
7. [Logging in to an existing account](#7-logging-in-to-an-existing-account)
8. [Forgot password / no password set](#8-forgot-password--no-password-set)
9. [The five main tabs](#9-the-five-main-tabs)
10. [Home tab](#10-home-tab)
11. [Programs tab (events)](#11-programs-tab-events)
12. [Schemes tab](#12-schemes-tab)
13. [Connect tab](#13-connect-tab)
14. [Profile tab](#14-profile-tab)
15. [Other screens you can reach](#15-other-screens-you-can-reach)
16. [Complete data schema — what the app asks you for](#16-complete-data-schema--what-the-app-asks-you-for)
17. [Maps and location — how Google Maps is used](#17-maps-and-location--how-google-maps-is-used)
18. [Permissions the app requests](#18-permissions-the-app-requests)
19. [Notifications](#19-notifications)
20. [Working with a weak or missing internet connection](#20-working-with-a-weak-or-missing-internet-connection)
21. [Troubleshooting and error messages](#21-troubleshooting-and-error-messages)

---

## 1. What Tanak Prabha is

Tanak Prabha is a mobile application for farmers and rural families. In one place it lets you:

- **Discover government and private agricultural schemes**, read their overview, eligibility and application process, and open the official application link.
- **See training programmes and events** near you, apply to attend them, and mark your attendance at the venue by scanning a QR code.
- **Connect with experts** — agriculture officers, veterinary doctors, market/finance officers and scheme coordinators — by phone, WhatsApp or a booked appointment.
- **Keep your farm records** — personal and family details, address, land area and crops, and livestock counts.
- **Get alerts** about new schemes, events and announcements as push notifications.
- **Use an emergency SOS helpline**.

**Important disclaimer shown inside the app (Profile → About & Disclaimer):**

> Tanak Prabha is an independent, non-government application. It is NOT a government entity, government application, or official government service, and is not affiliated with, endorsed by, sponsored by, or operated on behalf of the Government of India, any state government, ministry, department, agency, or other government organization.

Scheme details in the app are collected from publicly available government sources for information only. Always verify current details on the official website (each scheme carries an **Apply** link) or at your nearest government office before applying.

---

## 2. Installing and opening the app for the first time

1. Install **Tanak Prabha** from the Google Play Store (Android) or the App Store (iOS).
2. Open the app. A green splash screen appears while the app starts.
3. The app decides where to take you:
   - **First ever launch** → the **Language selection** screen.
   - **Launched before, but not logged in** → the **Welcome** screen.
   - **Already logged in, profile complete** → straight to the **Home** tab.
   - **Already logged in, profile incomplete** → back to the onboarding step you stopped at.

You stay logged in between app launches. You do not have to enter your password every time.

---

## 3. Choosing your language

The very first screen is **Choose Your Language**.

1. Two cards are shown side by side: **हिंदी (Hindi)** and **English**.
2. Tap the card you want. The selected card turns green.
3. Tap **Continue**.

Your choice is saved on the device and every screen, button and message switches to that language. Scheme, event and notification content also appears in Hindi wherever the Hindi version has been entered.

**To change your language later:** go to **Profile → Settings → App Language**. Tapping the row switches between English and हिंदी immediately. The current language is shown on the right of the row.

Your language choice also decides the language of the WhatsApp OTP message you receive when signing up.

---

## 4. The Welcome screen

The Welcome screen shows a background video/image, the app name and three actions:

| Action | What it does |
|---|---|
| **Create Account** (green button) | Starts sign-up for a brand-new user |
| **Log In** (outlined button) | For users who already have an account |
| **Admin Portal** (small link at the bottom) | Only for staff accounts — ordinary farmers should ignore this |

---

## 5. Creating a new account (Sign Up)

Sign-up has three steps before your profile begins. A progress bar at the top of each screen shows how far you have come (33% → 66% → 100%).

### Step 1 — Enter your mobile number

1. Tap **Create Account** on the Welcome screen.
2. The country code **+91 🇮🇳** is fixed. Type your **10-digit mobile number**.
3. Rules the app checks:
   - Exactly **10 digits**.
   - The first digit must be **6, 7, 8 or 9**.
   - Non-digits are ignored as you type; the number is displayed as `98765 43210`.
4. A green tick appears at the right when 10 valid digits are entered, and the **Send OTP** button becomes active.
5. Tap **Send OTP**.

**If the number is already registered**, a yellow banner appears: *"This number is already registered. Please log in instead."* with a **Log In** button that takes you straight to the login screen, and a **Dismiss** button.

### Step 2 — Verify the OTP

1. A **6-digit OTP** is sent to your number **on WhatsApp**.
2. The screen shows your number partly masked, e.g. `+91 98765 *****`.
3. Type the 6 digits into the six boxes. The cursor moves to the next box automatically, backspace moves back, and pasting the whole code at once also works.
4. The OTP is **valid for 10 minutes**.
5. A **30-second countdown** runs before **Resend OTP** becomes tappable. Resending restarts the countdown and clears the boxes.
6. Tap **Verify OTP**.
7. **Change Number** at the bottom takes you back to the previous screen.

If the code is wrong, the boxes shake, an error is shown, and the boxes are cleared so you can try again. Common messages: *Invalid OTP*, *OTP has expired*, *This OTP has already been used*.

### Step 3 — Set your password

Setting a password lets you log in later without waiting for an OTP.

1. Enter a **New Password** — minimum **6 characters**.
2. Enter the same password again under **Confirm Password**.
3. Use the eye icon on either field to show/hide what you typed.
4. Tap **Save Password**.

If the two entries do not match, you get *"Passwords Do Not Match"*. If the password is shorter than 6 characters you get *"Use at least 6 characters"*.

After the password is saved you continue automatically into the profile onboarding.

---

## 6. Completing your profile (onboarding)

Onboarding has four screens in this fixed order. Your answers are saved on the device as you go, so if the app is closed midway you resume where you left off. Everything is written to the server when you finish the last screen.

```
Personal Information  →  Location (map)  →  Land & Crop Details  →  Livestock Details  →  Home
```

### 6.1 Personal Information

**Profile photo**

- Tap the circular avatar at the top.
- Choose **Camera** (take a photo) or **Gallery** (pick an existing one).
- The app asks for camera or photo-library permission the first time. If you refuse, an alert offers **Open Settings**.
- You crop the picture to a square. It uploads immediately and is saved to your profile straight away.
- If the upload fails you can still continue and add the photo later from the Profile tab.

**Fields on this screen**

| Field | Required | Rules / options |
|---|---|---|
| Full Name | **Yes** | 2–100 characters; letters and spaces only (English or Devanagari) |
| Age | **Yes** | Whole number between **18 and 120** |
| Gender | **Yes** | Female / Male / Other |
| Aadhaar Number | No | If entered, must be exactly **12 digits** |
| Father's Name | **Yes** | Same rules as Full Name |
| Mother's Name | No | Same rules as Full Name |

**Address block on the same screen**

| Field | Required | Notes |
|---|---|---|
| State | No | Dropdown of all 28 Indian states |
| District | No | Dropdown; the list depends on the State you picked. Until a State is chosen it reads *"Select a state first"* |

What appears next depends on the district:

**(a) If your district is Bhadohi or Mirzapur** — the app has a full village directory for these two districts and shows five linked dropdowns. Each one unlocks only after the one above it is chosen:

```
Tehsil  →  Nyay Panchayat  →  Gram Panchayat  →  Village
                                             →  Post Office
```

Choosing a **Post Office** automatically fills in your **PIN Code** (the PIN is shown in the post-office name, e.g. *Gyanpur S.O. (221304)*). All five dropdowns are shown in Hindi when the app is in Hindi.

**(b) For every other district** — you fill the address manually:

| Field | Notes |
|---|---|
| PIN Code | 6 digits. **When you type the 6th digit the app looks the PIN up automatically** and fills in your State and District, and offers matching **Block** and **Post Office** dropdowns. If only one block or post office matches, it is selected for you. |
| Tehsil / Block | A dropdown if the PIN lookup returned blocks, otherwise a free-text box |
| Village / Gram Panchayat | Free text |
| Post Office | A dropdown if the PIN lookup returned post offices, otherwise a free-text box |

Tap **Next**. If any required field is empty or invalid, the field turns red and an alert names the first problem.

### 6.2 Location (Google Maps)

This screen pins your farming location on a Google map.

1. The app asks for **location permission**. Grant it to continue.
   - If you deny it, you see *"Location Access Needed"* with an **Enable in Settings** button.
2. The map opens on your current GPS position (a blue accuracy circle is shown). If GPS cannot get a fix within 10 seconds, the map opens on a default view of India with the banner *"GPS unavailable. Search or drag the map to your location."*
3. Place your pin in any of three ways:
   - **Search** — type at least 2 letters of a village, city or district in the search box at the top. Suggestions appear as you type; tap one and the map flies there.
   - **Drag the map** — the pin stays fixed at the centre of the screen, so move the map under it.
   - **My location button** — recentres on your GPS position (and re-tries GPS if the first attempt failed).
4. The address under the pin is looked up automatically and shown. If it cannot be resolved you still see *"Address unavailable. You can still confirm your pin."*
5. Tap **Confirm Location**.
   - If your GPS accuracy is worse than about 100 metres you get a warning with **Try Again** and **Confirm Anyway**.

Pressing the phone's Back button here asks *"Change Location? Going back will discard the location you selected."*

### 6.3 Land & Crop Details

1. **"Do you own agricultural land?"** — a Yes/No toggle. It starts as **Yes**.
   - Switch it **off** if you own no land; the form disappears and you can continue straight away.
2. If it is on, fill in the **Total Landholding**:
   - **Land Area** — a number greater than 0.
   - **Unit** — Acre, Bigha or Hectare (Bigha is the default).
3. Tap **Next**.

The area you enter is converted to **Bigha** before it is stored (1 acre ≈ 1.613 bigha, 1 hectare ≈ 3.987 bigha), because Bigha is the unit shown everywhere else in the app.

Errors you may see: *Land area must be greater than 0*, *Land area cannot be negative*, *Land area seems too large. Please verify.*

### 6.4 Livestock Details

1. **"Do you have livestock?"** — a Yes/No toggle, on by default. Switch it off if you own no animals.
2. If it is on, add one entry per animal type:
   - **Animal Type** — Buffalo, Cow, Goat, Horse, Pig, Poultry/Hen, Sheep, or **Other**.
   - Choosing **Other** reveals a text box to type the animal's name.
   - **Count** — a whole number greater than 0.
3. Tap **Add Another Livestock** to add more types, or the remove icon to delete an entry.
4. Tap **Finish**.

On **Finish**, everything you entered across all four onboarding screens is sent to the server in one go — personal details, address, GPS coordinates, land area and crops, and livestock counts. You then land on the **Home** tab.

Animal types that are not one of the standard seven are added together into an **Others** total.

---

## 7. Logging in to an existing account

1. On the Welcome screen tap **Log In**.
2. Enter your **10-digit mobile number** (+91 is fixed).
3. Enter your **password** — the eye icon shows/hides it.
4. Tap **Log In**.

You go straight to the **Home** tab. If your profile was never completed, you are taken to the personal-details screen to finish it.

The link at the bottom, *"Don't have an account? Sign Up"*, switches the same screen into sign-up mode.

---

## 8. Forgot password / no password set

### Forgot password

1. On the login screen, enter your mobile number and tap **Forgot password?**
2. An OTP is sent on WhatsApp. Enter the 6 digits.
3. You are taken to **Reset Password** — enter a new password twice and tap **Reset Password**.
4. You are returned to the login screen; log in with the new password.

### Account with no password yet

If you try to log in with a password on an account that never had one set (for example, an account created for you at a field camp before you set a password), the app shows:

> **Password Not Set** — This account does not have a password yet. Verify with OTP to set one.

Tap **Send OTP**, verify the code, and you are taken to the password screen. After saving, you go straight into the app.

---

## 9. The five main tabs

Once you are logged in, the bar at the bottom of the screen always shows five tabs:

| Icon | Tab | What it is for |
|---|---|---|
| 🏠 | **Home** | Greeting, latest alerts, weather, shortcuts |
| 🔍 | **Programs** | Events and training programmes — upcoming and past |
| 📊 | **Schemes** | Government schemes, browsable by category |
| ⏱ | **Connect** | Experts, SOS helpline, your appointment schedule |
| 👤 | **Profile** | Your details, land, livestock and settings |

---

## 10. Home tab

From top to bottom:

1. **Greeting header** — "Good Morning / Good Afternoon / Good Evening", your name, your profile photo (tap it to open the Profile tab) and a **bell icon**. A dot on the bell means you have unread notifications; tap it to open the full Notifications list.
2. **Notification cards** — up to **3 unread notifications** are shown as a stack. Each card can be dismissed individually with the ✕, or tap **View all** to open the Notifications screen.
3. **Weather widget** — the current temperature and sky condition for your district, with an icon and a refresh button. The card's colour changes with the time of day and weather.
4. **Quick Actions** — a grid of four shortcuts:
   - **Update your profile** → Profile tab
   - **Ongoing Events** → Programs tab
   - **Government Schemes** → Schemes tab
   - **Book an Appointment** → Connect tab

---

## 11. Programs tab (events)

This tab lists training programmes, camps and events.

**Header** shows the number of upcoming events, and a red **LIVE** badge if any event is running right now.

**Search bar** — filters events by title, description or venue name.

**Upcoming Events** — up to 4 cards, ongoing events first, then the soonest upcoming ones. Each card shows the event image, title, date, time and venue, plus a **Participate Now** button.

**Past Events** — up to 3 cards, most recent first, with a **View all** link if there are more (opens the full past-events list).

### Applying to an event

1. Tap **Participate Now** on a card (or open the event and tap **Apply Now**).
2. A sheet slides up showing:
   - The event you are applying for
   - **Your Details** — your name and mobile number, read from your profile
   - A **consent checkbox**: *"I have read and agree to the guidelines and rules. I consent to sharing my details for this application."*
3. Tick the consent box — the **Submit Application** button stays disabled until you do.
4. Tap **Submit Application**.
5. You get *"Application Submitted!"*. If you had already applied, you get *"Already Applied"* instead.

Once you have applied, the button on the event changes to **Registered ✓**. This is read back from the server each time you open the event, so it stays correct even after you close the app.

### Event details screen

Tapping an event card opens the full detail page:

- Hero image and a status badge — **Upcoming**, **Ongoing**, **Completed** or **Cancelled** (calculated live from the event's date, start time and end time)
- Countdown to the start, or a **LIVE** indicator once it has begun
- **Date**, **Time**, **Location** — with **Get Directions / Open on Maps** which opens the venue in your maps app
- **About This Event**
- **Requirements**
- **Guidelines & Rules**
- **Trainer & Contact** — master trainer, trainer and a contact number with a **Call** button
- **Apply Now** (for upcoming/ongoing events) or **Registered ✓**
- **Scan to Attend** — see below

### Scan to Attend (QR attendance)

At the venue, the organiser displays a QR code. To mark yourself present:

1. Open the event and tap **Scan to Attend**.
2. Allow camera access the first time (*"Camera access is required to scan the attendance QR code"*).
3. Point the camera at the QR code — you do not need to press anything.
4. You see *"Attendance Recorded!"*.

Possible outcomes:

| Result | Meaning |
|---|---|
| Attendance Recorded! | Done — your attendance is saved |
| QR Code Expired | The organiser's code is old (codes last 24 hours). Ask for a fresh one. |
| Already Recorded | Your attendance was already marked |
| Invalid QR code | The code scanned is not a Tanak Prabha attendance code |

---

## 12. Schemes tab

**Header** — title, subtitle and a search box (searches scheme title and category).

**Recommended Schemes** — a horizontal row of up to 5 featured schemes.

**Categories** — a list of every category that actually has schemes, each with a count of how many schemes are available. Tapping a category opens the full list for it. **View all** opens every scheme.

Category names you may see include: Agricultural Development, Education & Skill Development, Environmental Sustainability, Financial Inclusion, Health & Sanitation, Infrastructure Development, Social Welfare & Empowerment, Finance & Credit Support, Soil Management, Crop Insurance, Animal Husbandry & Dairy, Training & Skill Development, Irrigation & Water Management, Marketing & Post-Harvest, Farm Mechanization and Fisheries.

### Category listing screen

- **Search** within the category
- **Sort by** — Name (A–Z), Newest First, Most Interested
- **Filters** — narrow down by category; **Clear Filters** resets everything
- A results count is shown; if nothing matches you see *"No results found"*

### Scheme details screen

- Hero image, scheme title (in your language when a Hindi version exists) and category
- An **eligibility badge** — **Eligible** or **Not Eligible**, with small chips showing why it matched: 🌾 Land, 🐄 Livestock, 📍 District
- **Mark as Interested** — tap to register interest; it changes to **Interested ✓** and the count of people interested is shown. Tap again to remove your interest.
- Three tabs:
  - **Overview** — the description of the scheme, plus **Objectives / Benefits** as a bullet list
  - **Eligibility** — the eligibility conditions
  - **Process** — the step-by-step application process
  - Tabs with no content are skipped automatically
- **Apply Now** — opens the official government application website in your browser

---

## 13. Connect tab

### Service categories

A 2×2 grid of the four kinds of help available:

| Category | Typical experts |
|---|---|
| **Training & Guidance** | Agriculture extension officers, trainers |
| **Livestock & Veterinary** | Veterinary doctors, animal husbandry officers |
| **Market & Financial** | Market liaison officers, mandi/price and buyer contacts |
| **Government Schemes** | Scheme coordinators |

Tapping a category opens the **expert list** for it, showing each expert's photo, name, role, department and an **Available / Busy** badge, with a count of how many are available now. If the category is empty you see *"No experts found in this category"*.

### Expert profile

Tapping an expert opens their profile:

- Photo, name, role, department and availability
- **Areas of Expertise** / specializations
- **Service Area** — district, blocks covered, state
- **Contact Information** — phone, email
- Quick actions:
  - **Call Now** — dials the expert
  - **WhatsApp** — opens a WhatsApp chat (falls back to the web link if the app is not installed)
  - **Email Expert**
- A sticky **Book Appointment** button at the bottom

### Booking an appointment

1. Tap **Book Appointment**.
2. **Select a Date** — the next 13 days are offered, starting from tomorrow.
3. **Select a Time** — the app fetches the slots that are actually free for that expert on that day. The standard slots are **09:00 AM, 10:00 AM, 11:00 AM, 02:00 PM, 03:00 PM and 04:00 PM**.
4. An expert can take a maximum of **3 appointments per day**. When that is reached the date shows *"Fully Booked — No more slots on this day. Try another date."*
5. Tap **Confirm Booking**.
6. You get an **Appointment Booked!** confirmation card showing the professional, date and time, with **Back to Connect** and **View My Schedule →**.

If slot information cannot be loaded, the app shows an error with a retry rather than offering times that may not be free.

### SOS emergency helpline

A large red **SOS** button — a 24/7 helpline for urgent agricultural issues.

- **Before 6:00 PM** — tapping it dials the helpline number directly.
- **After 6:00 PM** — a sheet opens explaining that the phone line has closed. You type a short **Reason for Contact** and tap **Send Emergency Email**. Your name, mobile number, farmer ID and location are attached automatically. **Call Anyway** is still available if you prefer to ring.

### My Schedule

The green **My Schedule** card opens your appointments.

- Two tabs: **Upcoming** and **Past**
- Each appointment card shows the professional's name and role, the date and time, and a status: **Pending**, **Confirmed**, **Scheduled**, **Completed**, **Cancelled** or **Missed**
- Actions on upcoming appointments: **Call**, **WhatsApp** and **Cancel**
- When empty: *"No upcoming appointments — Book a session with an expert"* with a **Book an Appointment** button

---

## 14. Profile tab

### Header

- Your photo — **tap it to change it** (Take Photo / Choose from Gallery). An upload progress percentage is shown over the avatar.
- Your name, mobile number and location (village, district, state)
- A strip of four stats: **Age**, **Gender**, **Bigha** (total land area) and **Total Animals**
- **Edit Details** button

Pull down anywhere on the screen to refresh your profile from the server.

### Personal Details card

Shows mobile number, Aadhaar (masked as `XXXX XXXX 1234`), father's name, educational qualification and your full address. If you have set a GPS location, a small map with your pin is shown underneath.

Tap **Edit** to open the full personal-details form, where you can change:

- Name, Age, Gender
- Father's Name, Mother's Name, **Educational Qualification**
- **Family Members** — Sons (Married / Unmarried), Daughters (Married / Unmarried), Other Family Members
- Full address — State, District, and either the Bhadohi/Mirzapur cascading dropdowns or Tehsil / Block / Village / Gram Panchayat / Nyay Panchayat / Post Office / PIN Code
- **Update Address via Map** — opens the map picker; after you confirm a pin, the address fields are filled in from the map and a green note says *"Address auto-filled from map — review & save below"*. Nothing you already typed elsewhere in the form is lost.

Tap **Save Changes**. You get *"Your personal details have been updated."*

> Note: Aadhaar is captured once during sign-up and is not editable from this form.

### Land & Crop Summary card

Shows Total Land Area (in Bigha) and your **Rabi**, **Kharif** and **Zaid** crops.

Tap **Edit** to open **Edit Land Details**:

- **Total Land Area** plus a unit selector (Acres / Hectares / Bigha) — the hint *1 Bigha ≈ 0.4 Acres ≈ 0.16 Hectares* is shown
- **Crops Grown**, grouped by season with the growing period beside each:
  - **Rabi Crop** (Oct – Mar)
  - **Kharif Crop** (Jun – Sep)
  - **Zaid Crop** (Mar – Jun)
- Each season uses a multi-select — tick every crop you grow. Selecting **Others (type name)** reveals a box for the crop's name.

### Livestock Summary card

Lists each animal you own with its count and a grand total.

Tap **Edit** to open **Edit Livestock Details** — a counter row for **Cow, Buffalo, Sheep, Goat, Pig, Hen/Poultry, Horse** and **Others**. Use **+ / −** or type a number directly.

### Settings card

| Row | What it does |
|---|---|
| **App Language** | Switches between English and हिंदी. The current one is shown on the right. |
| **About & Disclaimer** | Opens the About page — what the app is, where scheme information comes from, and the non-government disclaimer |
| **Logout** | Asks *"Are you sure you want to logout?"* then signs you out and returns you to the Welcome screen |

---

## 15. Other screens you can reach

| Screen | How you get there | What it does |
|---|---|---|
| **Search** | Search bars on Home / Programs / Schemes | Searches schemes, training programmes and events together. Filter chips: All, Scheme, Training, Event, Quick Action. Shows a result count, or *"Try using different keywords or check the spelling"* |
| **Notifications** | Bell icon on Home | All your notifications grouped into **Today**, **Yesterday** and **Earlier**. Shows an unread count and a **Mark all as read** button. Opening the screen marks everything read. Tapping a notification jumps to the scheme, event or screen it refers to. |
| **All events** | **View all** under Past Events | The complete list of past events, newest first. Pull to refresh. |
| **Category listing** | Tapping a category on the Schemes tab | All schemes in that category with search, sort and filters |
| **Scan to Attend** | Event details → Scan to Attend | Camera QR scanner for marking your attendance |
| **Location picker** | Onboarding, or Profile → Edit → Update Address via Map | The Google map pin screen |
| **About & Disclaimer** | Profile → Settings | Legal and source information |

---

## 16. Complete data schema — what the app asks you for

This is the full set of information Tanak Prabha stores about you.

### 16.1 Identity and personal information

| Field | Where it is collected | Required | Format |
|---|---|---|---|
| Mobile number | Sign-up (phone screen) | Yes | 10 digits, starts with 6/7/8/9. This is your unique login ID. |
| Password | Sign-up (set password) | Yes | Minimum 6 characters |
| Profile photo | Onboarding · Profile tab | No | Square image from camera or gallery |
| Full name | Onboarding · Profile edit | Yes | 2–100 letters and spaces (English or Hindi) |
| Age | Onboarding · Profile edit | Yes | 18–120 |
| Gender | Onboarding · Profile edit | Yes | male / female / other |
| Aadhaar number | Onboarding | No | Exactly 12 digits; displayed masked |
| Father's name | Onboarding · Profile edit | Yes | Letters and spaces |
| Mother's name | Onboarding · Profile edit | No | Letters and spaces |
| Educational qualification | Profile edit | No | Chosen from a list |

### 16.2 Family information (Profile edit only)

| Field | Format |
|---|---|
| Married sons | Whole number, 0 or more |
| Unmarried sons | Whole number, 0 or more |
| Married daughters | Whole number, 0 or more |
| Unmarried daughters | Whole number, 0 or more |
| Other family members | Whole number, 0 or more |

### 16.3 Address

| Field | Notes |
|---|---|
| State | From a list of 28 states |
| District | List depends on the state |
| Tehsil | Dropdown in Bhadohi/Mirzapur, otherwise free text |
| Nyay Panchayat | Dropdown (Bhadohi/Mirzapur only) |
| Gram Panchayat | Dropdown (Bhadohi/Mirzapur only), otherwise free text |
| Block | Dropdown from the PIN lookup, otherwise free text |
| Village | Dropdown (Bhadohi/Mirzapur only), otherwise free text |
| Post Office | Dropdown from the PIN lookup or the village directory |
| PIN Code | 6 digits, cannot start with 0. Filled automatically from the post office, or used to look up the rest of the address. |

### 16.4 Location (from the map)

| Field | Notes |
|---|---|
| Latitude / Longitude | The exact coordinates of the pin you confirmed |
| Address | The human-readable address looked up from those coordinates |
| Accuracy | How precise the GPS reading was, in metres |
| Captured at | The date and time you confirmed the pin |

### 16.5 Land and crops

| Field | Notes |
|---|---|
| Total land area | Stored in **Bigha**. You may enter it in Acre, Bigha or Hectare and the app converts it. |
| Rabi crop | One or more crops — Wheat, Mustard, Gram, Potato, Barley, Linseed, Peas |
| Kharif crop | One or more crops — Rice, Maize, Soybean, Sugarcane, Groundnut, Cotton, Bajra, Jowar, Tur/Arhar |
| Zaid crop | One or more crops — Vegetables, Fruits, Watermelon, Muskmelon, Cucumber, Moong Dal |
| Other crops | Free text when you select "Other" |

Also available across the lists: Pulses, Tomato, Onion.

### 16.6 Livestock

Counts (whole numbers, 0 or more) for: **Cow, Buffalo, Goat, Sheep, Pig, Poultry/Hen, Horse, Others**.

---

## 17. Maps and location — how Google Maps is used

Tanak Prabha uses **Google Maps** in three places:

1. **The location picker** during sign-up, to record your primary farming location.
2. **Profile → Edit Details → Update Address via Map**, to fill in your address fields from a map pin.
3. **A small preview map on your Profile**, showing the pin you saved (this one is not scrollable or zoomable — it is a picture of your saved location).

Behaviour of the picker:

| Feature | Detail |
|---|---|
| Map provider | Google Maps |
| Pin | Fixed at the centre of the screen — you move the map, not the pin |
| Initial position | Your GPS position; if GPS fails within 10 seconds, a default view of India |
| Accuracy circle | A shaded circle shows how precise the GPS reading is |
| Accuracy warning | If the reading is worse than ~100 m you are offered **Try Again** or **Confirm Anyway** |
| Search | Google place suggestions after you type 2 or more characters |
| Address lookup | The coordinates are converted to a readable address automatically |
| What is saved | Latitude, longitude, address, accuracy, and the time you confirmed |

The **Get Directions / Open on Maps** button on event pages hands the venue over to your phone's maps app; it does not need any permission.

---

## 18. Permissions the app requests

| Permission | When it is asked | Why | If you refuse |
|---|---|---|---|
| **Location** | On the location picker | To pin your farming location and show your district's weather | You cannot confirm a location; the screen offers **Enable in Settings** |
| **Camera** | Taking a profile photo · Scanning an attendance QR code | Photo capture and QR scanning | You can still pick a photo from the gallery. QR attendance will not work — ask the organiser to mark you manually. |
| **Photo library** | Choosing a profile photo | To upload an existing picture | You can still use the camera |
| **Notifications** | First launch after login | To send scheme, event and announcement alerts | You will not get push alerts, but notifications still appear inside the app on the Home tab and the Notifications screen |
| **Microphone** | Declared by the app | Reserved for voice input | No effect on any current feature |

---

## 19. Notifications

- The app registers your device for push notifications when you log in and each time you open it while logged in.
- Notification types: **Announcement**, **Info**, **Alert**, **Reminder** and **Approval**.
- Tapping a push notification opens the app directly on the relevant screen — a scheme, an event, a programme, an expert, your schedule, or the notifications list. This works whether the app was already running or completely closed.
- Inside the app, the Home tab shows up to 3 unread notifications, and the bell icon shows a dot when anything is unread.
- The **Notifications** screen groups everything into Today / Yesterday / Earlier, and marks everything as read when you open it. There is also a **Mark all as read** button.

---

## 20. Working with a weak or missing internet connection

- **You stay logged in.** If the server cannot be reached when the app starts, your saved login is used and you continue to the Home tab.
- **Schemes are cached.** The schemes list is kept on the device, so it still opens when you are offline.
- **Your onboarding answers are saved on the device** as you fill them in. Closing the app halfway does not lose them — you resume at the step you had reached.
- **Uploads and saves need a connection.** Photo uploads, profile saves, event applications, appointment bookings and QR attendance all require internet. If one fails you will see a message such as *"Failed to save. Please check your connection."* — try again once you have signal.

---

## 21. Troubleshooting and error messages

| Message | What it means | What to do |
|---|---|---|
| *Mobile number must be exactly 10 digits* | Too few or too many digits | Re-enter the number without spaces or +91 |
| *Mobile number must start with 6, 7, 8, or 9* | Not a valid Indian mobile number | Check the number |
| *This number is already registered. Please log in instead.* | An account already exists | Tap **Log In** on the banner |
| *Could not send OTP. Please try again.* | The OTP could not be delivered | Check your internet and WhatsApp, then retry |
| *Invalid OTP. Please try again.* | Wrong code | Re-check the WhatsApp message; the boxes clear automatically |
| *OTP has expired. Please request a new one.* | More than 10 minutes passed | Tap **Resend OTP** |
| *This OTP has already been used.* | The code was already verified | Tap **Resend OTP** |
| *Invalid mobile number or password* | Login details do not match | Use **Forgot password?** |
| *Password Not Set* | The account has no password yet | Tap **Send OTP** and set one |
| *Passwords Do Not Match* | The two password boxes differ | Re-type both carefully |
| *Please enter a valid age (18-120)* | Age is out of range | Correct the age |
| *Aadhaar must be 12 digits* | Aadhaar is incomplete | Enter all 12 digits or clear the field |
| *Land area must be greater than 0* | Land toggle is on but no area entered | Enter the area, or switch the toggle off |
| *Location Access Needed* | Location permission was denied | Tap **Enable in Settings** and allow location |
| *Low GPS Accuracy* | The GPS fix is poor | Move outdoors and tap **Try Again**, or **Confirm Anyway** |
| *Could not get your current location* | GPS could not get a fix | Use the search box or drag the map manually |
| *QR Code Expired* | The organiser's QR code is over 24 hours old | Ask the organiser to show a fresh code |
| *Already Applied* | You already registered for this event | No action needed |
| *Date Fully Booked* | That expert already has 3 appointments that day | Pick another date |
| *Unable to open WhatsApp* | WhatsApp is not installed | Use the **Call** option instead |
| *Failed to save. Please check your connection.* | The save did not reach the server | Retry once you have internet |

**If nothing seems to load:** pull down on the screen to refresh. Most list screens (Programs, Schemes, Profile, Notifications, My Schedule, All Events) support pull-to-refresh.
