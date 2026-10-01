# Tanak Prabha — Administrator Manual

**Applies to two administration surfaces:**

| Surface | Where it runs | Used for |
|---|---|---|
| **Admin Portal in the mobile app** | Inside the Tanak Prabha React Native app (Android / iOS) | On-the-ground work — events, attendance, farmer registration, quick content edits, broadcasts |
| **Admin Dashboard (web)** | A Next.js web application opened in a browser | Full management — analytics, CMS, appointments, reports, admin accounts, settings |

Both surfaces talk to the same backend and the same database, so anything you change in one appears in the other.

---

## Table of contents

1. [Getting an administrator account](#1-getting-an-administrator-account)
2. [Signing in to the mobile Admin Portal](#2-signing-in-to-the-mobile-admin-portal)
3. [Signing in to the web Admin Dashboard](#3-signing-in-to-the-web-admin-dashboard)
4. [Mobile Admin Portal — dashboard home](#4-mobile-admin-portal--dashboard-home)
5. [Mobile — Create Event](#5-mobile--create-event)
6. [Mobile — Mark Attendance](#6-mobile--mark-attendance)
7. [Mobile — Attendance Records](#7-mobile--attendance-records)
8. [Mobile — Farmers (beneficiaries)](#8-mobile--farmers-beneficiaries)
9. [Mobile — Add Farmer](#9-mobile--add-farmer)
10. [Mobile — Content Management (CMS)](#10-mobile--content-management-cms)
11. [Mobile — Send Notification](#11-mobile--send-notification)
12. [Web Dashboard — layout and navigation](#12-web-dashboard--layout-and-navigation)
13. [Web — Dashboard home](#13-web--dashboard-home)
14. [Web — Analytics](#14-web--analytics)
15. [Web — Events](#15-web--events)
16. [Web — Appointments](#16-web--appointments)
17. [Web — Farmers](#17-web--farmers)
18. [Web — Content (CMS)](#18-web--content-cms)
19. [Web — Notifications](#19-web--notifications)
20. [Web — Manage Professionals](#20-web--manage-professionals)
21. [Web — Reports](#21-web--reports)
22. [Web — User Management](#22-web--user-management)
23. [Web — Settings](#23-web--settings)
24. [Reference tables](#24-reference-tables)
25. [Standard operating procedures](#25-standard-operating-procedures)
26. [Troubleshooting](#26-troubleshooting)

---

## 1. Getting an administrator account

Administrator accounts are **email + password** accounts, separate from farmer accounts (which use mobile number + OTP/password).

An existing administrator creates your account from the web dashboard under **User Management → Add User**, entering:

- **Name**
- **Email address** — this becomes your login ID
- **Password**
- **Role** — Super Admin, Admin, Sub Admin or Volunteer

Passwords are stored hashed (bcrypt). You can change yours later from **Settings → Security**.

---

## 2. Signing in to the mobile Admin Portal

1. Open the Tanak Prabha app.
2. On the **Welcome** screen, tap the small **Admin Portal** link at the bottom (with the shield icon).
3. Enter your **email address** and **password**. The eye icon reveals the password.
4. Tap **Log In as Admin**.

You are taken straight to the **admin dashboard** inside the app, and stay there until you sign out — the farmer tabs are not shown while you are signed in as an administrator.

**Sign out:** the log-out icon at the top right of the admin dashboard.

Possible errors:

| Message | Cause |
|---|---|
| *Invalid admin credentials* | Wrong email or password |
| *Could not reach the server. Please try again.* | No internet, or the backend is unreachable |

---

## 3. Signing in to the web Admin Dashboard

1. Open the dashboard URL in a browser.
2. You land on the **login page** (any other URL redirects here until you sign in).
3. Enter your **Email address** and **Password**, then click **Sign in**.
4. On success you are taken to the dashboard home.

Session details:

- The session lasts **24 hours**, after which you must sign in again.
- Every page except the login page is protected — an unauthenticated visitor is always redirected to `/login`.
- The dashboard supports **light and dark themes**; use the theme toggle in the interface.
- The sidebar can be collapsed to icons using the toggle beside the logo.

---

## 4. Mobile Admin Portal — dashboard home

The first screen after admin login.

### Header

- **Dashboard** title and a live count: *"N farmers onboarded"*.
- A yellow **"N Pending"** badge if anything is queued for offline sync.
- **Log-out** icon.

### Offline sync banner

If any event or attendance record was captured without internet, an amber banner reads *"N pending offline sync"*. These are uploaded automatically as soon as the device reconnects.

### Primary actions

| Card | Opens |
|---|---|
| **Create Event** | The event creation form |
| **Mark Attendance** | Look up a farmer by mobile and mark them present |

### Statistic cards

Four cards, each tappable:

| Card | Value | Tapping it opens |
|---|---|---|
| **Farmers** | Total registered farmers | The Farmers list |
| **Land Coverage** | Total land area, in Bigha | The Farmers list |
| **Livestock** | Total animals across all farmers | A **Livestock Summary** sheet |
| **Active Schemes** | Number of live schemes | Content Management |

The **Livestock Summary** sheet breaks the total down by Cows, Buffaloes, Goats, Sheep, Poultry, Pigs, Horses and Others, with a grand total.

### Management grid

| Tile | Opens |
|---|---|
| **Old Attendance Records** | Attendance records by event |
| **Notify** | Send Notification |
| **Farmers** | Farmers list |
| **CMS** | Content Management |

### Event Management section

Three larger cards repeating the main event tasks: **Create New Event**, **Mark Attendance** and **View Attendance Records**.

Pull down to refresh the statistics.

---

## 5. Mobile — Create Event

A single scrolling form. Fields marked * are mandatory.

### Event Cover Image

Tap the box to pick an image from the photo library (16:9 recommended). It uploads immediately and shows an **Uploaded** badge. If the upload fails you can still create the event without a cover image.

### Basic Information

A **English / हिंदी** tab switcher sits above these fields:

| Tab | Fields |
|---|---|
| **English** | Event Title *, Description |
| **हिंदी** | Title (Hindi) *, Description (Hindi) |

> **Both the English title and the Hindi title are mandatory.** Saving without a Hindi title is refused with *"Hindi Title Required — Please enter the Hindi title (हिंदी शीर्षक आवश्यक है)."*

### Date & Time

- **Select Date \*** — opens a month calendar. Past dates are disabled. Confirm your pick.
- **Start Time \*** and **End Time** — open a scroll picker for hour (01–12), minute (00 / 15 / 30 / 45) and AM/PM.

Validation: the date cannot be in the past, and the end time must be after the start time.

### Location

- **Venue / Location Name \***
- **Full Address** (optional)

### Additional Details

Also split by the English / हिंदी tabs:

- **Guidelines & Rules** / Guidelines (Hindi)
- **Requirements** / Requirements (Hindi)

### Trainer & Contact

All optional: Master Trainer Name, Master Trainer Phone, About Master Trainer (English and Hindi), Trainer Name, Trainer Phone, Contact Number.

### GPS Location

Opens the map picker so you can drop a pin on the venue. The chosen coordinates are attached to the event and power the **Get Directions** button farmers see.

### Saving

Tap **Create Event**.

- **Online** → *"✅ Success — Event created successfully!"* and you return to the dashboard.
- **Offline** → *"Saved offline — No internet connection. Your event has been saved and will be submitted when you're back online."* The dashboard's pending badge increases by one.

New events are created with status **upcoming**.

---

## 6. Mobile — Mark Attendance

Used at the venue to record who turned up.

1. **Select the event** from the list at the top.
2. Type the attendee's **10-digit mobile number**. After the tenth digit the app looks the number up automatically (half a second later).
3. One of two cards appears:

### Registered farmer found

A green **Found** card showing the farmer's photo (or initials), name, mobile number, and Village, Block, District, State, Age and Gender.

Tap **Mark as Present**. You get *"✅ Done! Attendance marked as Present."* with a **Mark Another** button that clears the form for the next person.

### No registered user found

*"No Registered User Found — No account found for 9xxxxxxxxx. You can still mark them as present."*

1. Type the person's **name** (required — the button stays disabled until you do).
2. Tap **Mark as Present Anyway**.
3. Attendance is recorded as a **walk-in**.
4. You are then offered: *"This person is not registered. Send them a WhatsApp invite to join Tanak Prabha?"*
   - **Send Invite** — opens WhatsApp with a pre-written invitation and download link (falls back to SMS if WhatsApp is unavailable)
   - **Skip** — clears the form

### Offline

If there is no connection, attendance is saved on the device and uploaded automatically once you are back online: *"Saved offline — No internet connection. Attendance has been saved and will be submitted when you're back online."*

---

## 7. Mobile — Attendance Records

1. **Select an event** from the list (each row shows the date, venue and status).
2. The attendee list opens, split into groups:
   - **Attended** vs **Registered** (registered but not yet marked present)
   - **Pre-registered** (they have an app account) vs **Walk-in** (no account)
3. Each row shows initials, name or mobile number, the mobile number and a status badge.
   - **Walk-in** rows carry an amber *Walk-in* badge.
   - A walk-in who later created an account shows an additional green **Registered** badge.
4. **Resend Invite** appears on walk-ins who have not yet joined — it re-sends the WhatsApp invitation and records the attempt.
5. Tapping a row for a registered farmer opens that farmer's full profile.

---

## 8. Mobile — Farmers (beneficiaries)

- A searchable list of all registered farmers (loaded 100 at a time).
- The header shows the total count and an **Add** button.
- **Search by name or mobile number**.
- Each row: initials avatar, name, village, district, mobile number, and a **Verified** or **Pending** badge.
- Pull down to refresh.

### Farmer detail

Tapping a row opens the farmer's profile:

- Header with name, village · district and the verification badge
- Mobile number with a **Call** button
- **Personal Info** — Name, Age, Gender, Aadhaar, Father's Name, Mother's Name
- **Address** — Village, Block, District, State, PIN Code
- **Land Details** — total area and crops
- **Livestock** — Cow, Buffalo, Goat, Sheep, Poultry, Others
- A control to **verify / un-verify** the farmer. The change is applied immediately and confirmed with *"Farmer has been successfully verified."* If the save fails the badge reverts.

---

## 9. Mobile — Add Farmer

Reached from **Farmers → Add**. Designed for registering farmers face-to-face.

### Step 0 — Search first

Before creating anything, search by name or mobile number to check whether the farmer already exists. If they do, open their record instead. Otherwise tap **Register New Farmer**.

### The 4-step wizard

| Step | Title | Contents |
|---|---|---|
| 1 | **Personal Details** — basic info + photo of the farmer | Photo (camera capture), Full Name *, Mobile Number * (10 digits), Age * (1–120), Gender * (with a free-text box if "Other"), Father's Name *, Aadhaar (optional, 12 digits) |
| 2 | **Location** — where does the farmer live? | **GPS pin (mandatory)**, State *, District *, Block / Tehsil *, Village *, PIN Code * (6 digits), Post Office * |
| 3 | **Land Details** — land holdings and crops | Total land area, Rabi crop, Kharif crop (each with an "other" text box) |
| 4 | **Livestock Details** — livestock owned | Counts for Cow, Buffalo, Goat, Sheep, Pig, Poultry, Others |

Notes on step 2:

- **The GPS pin is required** — you cannot advance without one. Tap the map button, place the pin at the farmer's home, and confirm.
- Typing a **6-digit PIN code** looks the address up and offers matching Block and Post Office dropdowns.
- The address you type is kept independent of the GPS pin — geocoding does not overwrite the fields you filled in.

### Submitting

Tap **Register Farmer**. On success:

> **Farmer Registered** — *[Name]* has been successfully registered.
> Default password: **12345678**
> Please share this with the farmer securely — it won't be shown again.

A **fresh random 8-digit password is generated for every farmer**. Write it down or show it to the farmer before dismissing the dialog — it is not stored anywhere you can read back. Tell the farmer to log in with their mobile number and this password, and to change it via **Forgot password?**.

**If the mobile number already exists**, the registration is refused and a conflict card shows the existing farmer so you can open their record instead of creating a duplicate.

---

## 10. Mobile — Content Management (CMS)

Two tabs: **Schemes** and **Experts**.

### Schemes tab

Lists existing schemes. You can **create**, **view**, **edit** and **delete**.

Create/edit form:

| Field | Required |
|---|---|
| Scheme Image (upload) | No |
| Title (English) | **Yes** |
| Title (Hindi) | No |
| Category | **Yes** |
| Description | No |
| Description (Hindi) | No |
| Eligibility | No |

> For richer scheme content — overview, application process, objectives, structured eligibility criteria, hero image and apply link — use the **web dashboard CMS** (section 18). The mobile form is a quick-edit tool.

### Experts tab

Lists professionals. You can **create**, **view**, **edit** and **delete**.

| Field | Required |
|---|---|
| Profile Photo (upload) | No |
| Full Name | **Yes** |
| Role | **Yes** (e.g. Doctor, Veterinarian) |
| Category | **Yes** |
| Department | No |
| Phone Number | No |
| District | No |

> **Category must be one of the four Connect categories** (see the reference tables in section 24), otherwise the expert will not appear anywhere in the farmer app.

---

## 11. Mobile — Send Notification

Broadcasts a push notification and an in-app notification to farmers.

1. **Title \*** — up to 80 characters (a live character count is shown).
2. **Message** — optional, up to 250 characters.
3. **Notification Type** — Announcement, Info, Alert or Reminder.
4. **Target Audience**:
   - **All Users**
   - **By District** — type the district name
5. A **live preview** at the top shows exactly how the notification will look on a farmer's phone.
6. Tap **Send**. A confirmation dialog asks *"Send [title] to all users / users in [district]?"*
7. After sending you get a receipt: *"Notification delivered to N users. M device(s) will receive a push notification."*

---

## 12. Web Dashboard — layout and navigation

A collapsible left sidebar with the Tanak Prabha logo, a notifications popover, the sidebar toggle, and your account at the bottom.

| Menu item | Route | Purpose |
|---|---|---|
| **Dashboard** | `/` | KPIs, quick actions, highlights, recent activity, top regions |
| **Analytics** | `/analytics` | Maps and charts |
| **Events** | `/events` | Event list and creation |
| **Appointments** | `/appointments` | All farmer–expert appointments |
| **Farmers** | `/beneficiaries` | Farmer records |
| **Content (CMS)** | `/content` | Schemes & Programs · Banners |
| **Notifications** | `/notifications` | Broadcast composer and history |
| **Manage Professionals** | `/professionals` | Experts shown in Connect |
| **Reports** | `/reports` | Custom report builder and CSV export |
| **User Management** | `/users` | Administrator accounts |
| **Settings** | `/settings` | Account, security, alerts, system info |

---

## 13. Web — Dashboard home

### KPI cards

| Card | Meaning |
|---|---|
| **Total Farmers** | Registered farmers |
| **Land Coverage** | Total cultivable area |
| **Livestock** | Total animals |
| **Active Schemes** | Live government programmes |
| **Total Professionals** | Active experts |

### Quick Actions

Shortcut buttons: **Add Farmer**, **New Content**, **Add Professional**.

### Panels

- **Highlights chart** — headline trend
- **Recent Activity** — the latest registrations and content changes
- **Top Regions** — the districts with the most farmers

---

## 14. Web — Analytics

### KPI cards

The same five summary cards as the dashboard home.

### Geographic Distribution — India

A single unified map covering every data layer. Pick the dataset — **users, landholding, livestock or crops** — then choose how to display it:

- **Heatmap** — density shading
- **Pins** — individual points

Each dataset has its own filters (for example a specific animal type or a crop).

### Charts

| Chart | Shows |
|---|---|
| **Farmer Trends** | Registrations over time |
| **Livestock Breakdown** | Composition of the total herd |
| **Top Regions** | Districts ranked by farmer count |
| **Top Livestock Regions** | Districts ranked by animal numbers |

---

## 15. Web — Events

### Event list

Events are split into **Upcoming** (upcoming and ongoing, soonest first) and **Past** (completed and cancelled, most recent first). Status is recalculated live from the date, start time and end time — it does not rely on a stale stored value.

Each card offers **View details** and **View gallery**.

### Create Event

Click **Create Event** to open the dialog.

**Bilingual content editor** — English on the left, हिंदी on the right, side by side, with a completion percentage for each language:

| Field | English | हिंदी |
|---|---|---|
| Title | ✔ | ✔ (**mandatory**) |
| Description | ✔ | ✔ |
| Guidelines & Rules | ✔ | ✔ |
| Requirements | ✔ | ✔ |
| Perks & Benefits | ✔ | ✔ |

**Other fields:** Date, Location Name, Start Time, End Time, **Status** (Upcoming / Ongoing / Completed / Cancelled), Location Address, Image URL, **Outcome** (a write-up added after the event) and **Media** (photos and videos).

Saving without a Hindi title is refused: *"Please enter the Hindi title (हिंदी शीर्षक आवश्यक है)"*.

### Event detail page

Opened from **View details**. It contains:

**Header actions**

| Button | What it does |
|---|---|
| **Edit** | Reopens the event form |
| **Generate QR** | Creates the attendance QR code (see below) |
| **Delete** | Permanently deletes the event *and all participant data* — confirmation required |
| **Status** control | Moves the event between Upcoming / Ongoing / Completed / Cancelled |

**Event Info** — all the stored details.

**Mentors & Instructors** — pick a professional from the dropdown and click **Add Mentor**; mentors can be removed again.

**On-Spot Registration** — for walk-ins at the venue:
- **Phone Number \*** and **Name** (optional)
- Adds the person as a participant immediately

**Participants** — the full list with an attendance percentage (`present / registered`). Each row that is not yet marked has a button to **mark attendance**.

### The attendance QR code

1. Click **Generate QR**.
2. A QR code image is created and shown in a dialog.
3. **Download** it as a PNG (`event-<id>-qr.png`) to print or project at the venue.
4. Farmers scan it from **Event details → Scan to Attend** in the mobile app and are marked present automatically.

**The QR code is valid for 24 hours.** After that, farmers scanning it see *"QR Code Expired"* — generate a fresh one. Each code is signed for one specific event and cannot be used for another.

---

## 16. Web — Appointments

A table of every appointment booked between farmers and professionals.

**Columns:** Farmer · Professional · Date · Time · Status · Actions

**Filters:** Status, From date, To date, and a page size of 20 or 50. A **Clear** control resets them.

**Statuses and the actions available:**

| Status | Meaning | Available actions |
|---|---|---|
| **Pending** | Booked by the farmer, not yet acknowledged | Confirm · Cancel |
| **Confirmed** | Accepted | Complete · Cancel |
| **Completed** | The consultation happened | — |
| **Cancelled** | Called off | — |

Clicking an action updates the row immediately and confirms with a toast; if the server rejects it, the previous status is restored.

Appointment capacity is enforced by the system: the standard slots are **09:00 AM, 10:00 AM, 11:00 AM, 02:00 PM, 03:00 PM, 04:00 PM** and a professional can take a maximum of **3 appointments per day**.

---

## 17. Web — Farmers

The primary farmer register.

### Filter bar

- **Search farmers** — free text
- **Districts** — multi-select, searchable
- **Crops** — multi-select, searchable
- **Seasons** — multi-select (Rabi / Kharif / Zaid)
- **Status** — multi-select (Verified / Pending)
- **Clear (N)** — removes all active filters
- **Export CSV** — downloads exactly the rows currently shown
- **Add Farmer** — opens the creation dialog

### Table columns

Farmer Name · District/Block · Mobile Number · Land Area · one column per crop season · Livestock · Status · Actions.

Row actions include verifying/un-verifying, editing and deleting a farmer.

### Add / Edit Farmer dialog

A two-step form:

| Step | Fields |
|---|---|
| 1 | Full Name *, Mobile Number * (10 digits), Age, Father's Name, Education, Gender |
| 2 | Village, Block, District, State |

Name and a valid 10-digit mobile number are required before you can move to step 2.

### Farmer detail page

Opened by clicking a farmer. Header shows their photo, name and verification state, with **Edit** and **Delete** controls. The body is tabbed:

| Tab | Contents |
|---|---|
| **Personal** | Full Name, Mobile Number, Age, Gender, Father's Name, Mother's Name, Education, Aadhaar (masked to the last 4 digits) |
| **Address** | Village, Gram Panchayat, Nyay Panchayat, Post Office, Block, District, State, PIN Code |
| **Farming** | Land area and crops by season |
| **Livestock** | Counts by animal |
| **Family** | Sons and daughters (married / unmarried), other family members |

---

## 18. Web — Content (CMS)

Two tabs: **Schemes & Programs** and **Banners**. Both can be reached directly from the sidebar sub-menu.

### Schemes & Programs

Displays every scheme as a card. You can create, open, edit, publish/unpublish and delete.

**The scheme form**

1. **Category** — chosen from a fixed list (see section 24). *A scheme saved without a valid category never appears under a category in the app*, so the form refuses to save without one: *"Please select a category — schemes without one never appear in the app"*.

2. **Bilingual content editor** — English and हिंदी side by side, with a completion percentage per language:

   | Field | Type |
   |---|---|
   | Title | Single line |
   | Description | Paragraph |
   | Overview | Long paragraph |
   | Application Process | Paragraph |
   | Objectives / Benefits | One objective or benefit **per line** — each line becomes a bullet in the app |

3. **Eligibility Criteria editor** — add criteria one at a time. Each criterion has:
   - A **Category**: Income Based, Landholding Based, Age Based, Occupation Based, Social Category, Disability Based, Gender Based, Residency Based, or Other
   - The criterion text in **English** and in **हिंदी**

   These are flattened into the eligibility text that farmers read on the scheme's Eligibility tab.

4. **Scheme image** — drag and drop or click to upload (max 5 MB, 16:9).

### Banners

Manage the promotional banners in the app.

| Field | Notes |
|---|---|
| Banner image | Drag & drop or click to upload |
| Redirect URL | Where tapping the banner sends the user, e.g. `https://pmkisan.gov.in` |
| Sort Order | Lower numbers appear first |

Banners can be created, edited, toggled active/inactive and deleted.

### Content detail page

Opening any scheme or banner shows its full record with English and Hindi values side by side, a publish/unpublish toggle and a delete control.

---

## 19. Web — Notifications

The broadcast centre.

### Summary cards

**Total Broadcasts**, **Announcements**, **Alerts**, **Information**.

### Broadcast history

Every broadcast already sent, one entry per broadcast, with its type badge, subject, message and how long ago it was sent. You can **search** the history and **filter by type**.

### Composing a broadcast

Click the compose button and fill in:

| Field | Required | Notes |
|---|---|---|
| **Subject** | Yes | e.g. "Important Update" |
| **Description** | Yes | The body of the message |
| **Notification Type** | Yes | Announcement · Info · Alert · Reminder |
| **State** | No | "All" targets every state |
| **District** | No | Only selectable after a state; "All districts" is the default. Changing the state resets the district. |

Click send. The recipient counts are read back from the server so the numbers shown are real.

### Editing and recalling

| Action | Effect |
|---|---|
| **Edit** | Rewrites the subject, description and type **for every recipient who already received it** |
| **Recall (delete)** | Removes the broadcast from every recipient's notification list |

Both actions are immediate and affect all recipients — use them carefully.

---

## 20. Web — Manage Professionals

Manages the experts farmers reach from the **Connect** tab.

Two tabs: **Experts** and **All Professionals**.

### Table

Columns: Professional · Specialization · Category · Contact · Location · Status · Actions.

Filters: a search box and a **Filter by Category** dropdown.

Row actions: edit, delete, and a toggle for **available / unavailable** (this drives the Available / Busy badge farmers see).

### Add / Edit Professional dialog

| Step | Fields |
|---|---|
| 1 | Full Name *, Role * (e.g. "Senior Veterinarian"), Phone Number, Email, **Category \***, Description |
| 2 | Department, Service Area, Specializations (comma separated), State, District |

> **Category is the field that decides whether the expert is visible in the app.** It must be one of the four Connect categories in section 24. Professionals carrying an old category value from earlier versions of the dashboard are flagged with a warning — re-save them with a valid category.

---

## 21. Web — Reports

The **Custom Report Builder** generates a filtered farmer list and exports it to CSV.

### Filters

| Filter | Options |
|---|---|
| **Search** | Name, phone or village |
| **State** | All States, or one state |
| **District** | All Districts, or one district (depends on the state) |
| **Land area** | All · < 1 Bigha · 1–3 Bigha · 3–5 Bigha · 5–10 Bigha · > 10 Bigha |
| **Verification** | All Statuses · Verified · Pending |
| **Crop** | All Crops, or one crop |

An active-filter count is shown, with a **Clear** button.

### Choosing columns

Tick the columns to include. Available columns (defaults ticked are marked ✔):

| Column | Default |
|---|---|
| Name | ✔ |
| Mobile Number | ✔ |
| District | ✔ |
| State | ✔ |
| Village | ✔ |
| Block | |
| Land Area (Bigha) | ✔ |
| Rabi Crop | |
| Kharif Crop | |
| Zaid Crop | |
| Livestock Count | |
| Verified | |
| Registration Date | |

A live preview table shows the result.

### Exporting

Click **Export CSV**. The file downloads as `farmer-report-YYYY-MM-DD.csv` containing exactly the filtered rows and selected columns, and you are told how many profiles were exported.

---

## 22. Web — User Management

Manages administrator accounts.

### Table

Name · Email · Role · Status · Last login · Actions.

**Search** matches name, email or role.

### Roles

| Role | Badge colour |
|---|---|
| **Super Admin** | Purple |
| **Admin** | Blue |
| **Sub Admin** | Amber |
| **Volunteer** | Green |

### Adding a user

Click **Add User** and provide **Name**, **Email**, **Password** and **Role**. All four are required.

### Editing a user

Change **Name**, **Email** and **Role**. (Passwords are not changed here — a user changes their own from Settings → Security.)

### Activating / deactivating

Each account carries an **Active** or **Inactive** state. Deactivating an account is the standard way to remove access without deleting the record and its history. The change is confirmed with *"User activated"* / *"User deactivated"*.

---

## 23. Web — Settings

Four tabs.

### Account

- **Admin Profile** — your email, role, session state and authentication provider (Credentials — Email + Password)
- **Session** — a **Sign Out** button with a confirmation dialog

### Security

- **Change password** — Current Password, New Password (minimum 6 characters), Confirm New Password. Success is confirmed with *"Password updated successfully"*.
- **Security Overview** — authentication state, session duration (24 hours), JWT strategy (HS256) and password hashing (bcrypt, 10 rounds)

### Alerts

Toggles for which alerts you want to see:

| Alert | Description |
|---|---|
| New Registrations | When a new farmer registers |
| Event Updates | Event registrations and attendance |
| Scheme Alerts | Content changes, new schemes published |
| System Alerts | Server errors, downtime, critical issues |
| Email Digest | Weekly summary of dashboard activity |

> These preferences are stored **in your browser only**.

### System

Read-only reference information: API base URL, dashboard auth method, CORS state, database engine (PostgreSQL / Supabase with PostGIS), and the platform stack (Next.js dashboard, Express.js backend, React Native / Expo mobile app, Cloudinary file storage).

---

## 24. Reference tables

### Scheme categories

Use only these values — a scheme with any other category never appears under a category in the app.

| Stored value | Shown as |
|---|---|
| Financial Support | Finance & Credit Support |
| Agricultural Development | Agricultural Development |
| Soil Management | Soil Management |
| Crop Insurance | Crop Insurance |
| Animal Husbandry & Dairy | Animal Husbandry & Dairy |
| Training | Training & Skill Development |
| Irrigation & Water Management | Irrigation & Water Management |
| Marketing & Post-Harvest | Marketing & Post-Harvest |
| Farm Mechanization | Farm Mechanization |
| Fisheries | Fisheries |

### Professional (Connect) categories

| Stored value | Shown in the app as |
|---|---|
| `training-guidance` | Training & Guidance |
| `livestock-veterinary` | Livestock & Veterinary |
| `market-buyers` | Market & Buyers |
| `government-schemes` | Government Schemes |

### Notification types

`announcement` · `info` · `alert` · `reminder` · `approval`

### Event statuses

`upcoming` · `ongoing` · `completed` · `cancelled`
Displayed status is recalculated live from the event's date, start time and end time.

### Appointment statuses

`pending` · `confirmed` · `completed` · `cancelled`

### Participant statuses

`registered` (applied, not yet present) · `attended` (marked present) · `cancelled`

### Appointment slots

09:00 AM · 10:00 AM · 11:00 AM · 02:00 PM · 03:00 PM · 04:00 PM — maximum **3 per professional per day**.

### OTP rules (farmer accounts)

6 digits · delivered over WhatsApp · valid for **10 minutes** · 30-second resend cooldown in the app.

---

## 25. Standard operating procedures

### 25.1 Running an event end to end

1. **Create the event** — web dashboard (**Events → Create Event**) or the mobile portal. Fill in both English and Hindi content, the date and times, the venue and, if you use the mobile form, the GPS pin.
2. **Add mentors** — open the event detail page and add the professionals who will run it.
3. **Let it publish** — the event appears in the farmers' **Programs** tab immediately, and they apply from there.
4. **Watch registrations** — the event detail page shows the participant list and an attendance percentage.
5. **On the day — QR attendance:** click **Generate QR**, download the PNG, and print or project it. Farmers scan it from the app. Remember it expires after 24 hours.
6. **On the day — manual attendance:** for anyone who cannot scan, use the mobile portal's **Mark Attendance** screen, or the event page's participant list on the web.
7. **Walk-ins:** use **On-Spot Registration** on the web, or **Mark as Present Anyway** on mobile. Send the WhatsApp invite so they can create an account.
8. **After the event:** edit the event to add the **Outcome** write-up and upload **Media** (photos and videos), and set the status to **Completed**.
9. **Follow up:** use **Attendance Records** to find walk-ins who never joined, and **Resend Invite**.

### 25.2 Publishing a scheme

1. **Content (CMS) → Schemes & Programs → create**.
2. Pick a **Category** from the approved list first.
3. Fill in the bilingual editor: Title, Description, Overview, Application Process and Objectives (one per line). Aim for 100% completion on both the English and हिंदी columns — the completion percentage tells you what is missing.
4. Add **Eligibility Criteria**, each with its category and both languages.
5. Upload the scheme image.
6. Save, then verify it appears under the right category in the mobile app.

### 25.3 Sending a broadcast

1. Decide the audience — everyone, a state, or a single district.
2. **Notifications → compose**. Write a short subject and a clear description, and pick the right type.
3. Send, and check the delivery counts in the receipt.
4. If you need to correct it afterwards, use **Edit** (rewrites it for everyone who received it) rather than sending a second message. Use **Recall** to withdraw it entirely.

### 25.4 Onboarding a new expert into Connect

1. **Manage Professionals → add**.
2. Enter the name, role and — critically — one of the four valid **categories**.
3. Add the department, service area, specializations, state and district so farmers can see who covers their area.
4. Add a phone number and email; these power the Call, WhatsApp and email actions in the app.
5. Set the availability toggle to **available**.
6. Check the Connect tab in the app to confirm the expert shows under the right category.

### 25.5 Verifying farmers

1. Open **Farmers** (web) or the mobile Farmers list.
2. Filter by **Status → Pending**.
3. Open each record, check the personal details, address and land/livestock entries.
4. Mark the farmer **Verified**.

---

## 26. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| A scheme is missing from the app | No category, or an unrecognised category | Re-save the scheme with a category from the approved list |
| An expert never appears in Connect | The category is not one of the four Connect categories | Edit the professional and pick a valid category |
| An event cannot be saved | Missing Hindi title, past date, or end time before start time | The alert names the exact problem — fix it and re-save |
| Farmers report *QR Code Expired* | The code is more than 24 hours old | Click **Generate QR** again and show the new code |
| Registering a farmer fails with a conflict | That mobile number already has an account | Open the existing record shown in the conflict card |
| The mobile portal shows *"N pending offline sync"* | Events or attendance were captured offline | Reconnect the device; the queue uploads automatically |
| An appointment cannot be confirmed | A network error, or the status already changed elsewhere | Refresh the page and retry — the row reverts to its real state on failure |
| Broadcast delivered to fewer users than expected | The district filter matched fewer farmers, or those farmers have no registered push device | Check the district spelling; the in-app notification still reaches them even without push |
| Redirected to the login page unexpectedly | The 24-hour session expired | Sign in again |
| *Could not reach the server* on mobile admin login | No internet, or the backend is down | Check connectivity, then check the backend health |
