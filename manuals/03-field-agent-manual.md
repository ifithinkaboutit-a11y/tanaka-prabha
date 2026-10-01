# Tanak Prabha — Field Agent Manual

**Who this is for:** field agents and volunteers who register farmers, run camps and events, and record attendance on the ground.

**The two tools you use:**

| Tool | Where | When you use it |
|---|---|---|
| **Admin Portal inside the Tanak Prabha mobile app** | Your Android or iOS phone | In the field — registering farmers, marking attendance, creating events, sending broadcasts |
| **Admin Dashboard (web)** | A browser on a laptop or desktop | Back at the office — verifying records, pulling lists, exporting CSVs, reviewing attendance |

Both are connected to the same system. Anything you capture on your phone appears on the web dashboard, and the other way round.

---

## Table of contents

1. [Before you go to the field](#1-before-you-go-to-the-field)
2. [Getting your account and signing in](#2-getting-your-account-and-signing-in)
3. [The mobile dashboard at a glance](#3-the-mobile-dashboard-at-a-glance)
4. [Task — Register a farmer](#4-task--register-a-farmer)
5. [Task — Find and check an existing farmer](#5-task--find-and-check-an-existing-farmer)
6. [Task — Create an event](#6-task--create-an-event)
7. [Task — Mark attendance at a camp](#7-task--mark-attendance-at-a-camp)
8. [Task — Review attendance and chase walk-ins](#8-task--review-attendance-and-chase-walk-ins)
9. [Task — Send a notification to farmers](#9-task--send-a-notification-to-farmers)
10. [Task — Quick content edits from the phone](#10-task--quick-content-edits-from-the-phone)
11. [Working offline](#11-working-offline)
12. [Using the web dashboard](#12-using-the-web-dashboard)
13. [Data you collect — the full checklist](#13-data-you-collect--the-full-checklist)
14. [Field tips that save time](#14-field-tips-that-save-time)
15. [Troubleshooting in the field](#15-troubleshooting-in-the-field)
16. [Quick reference card](#16-quick-reference-card)

---

## 1. Before you go to the field

Run through this list before every camp or village visit:

- [ ] The Tanak Prabha app is installed and updated on your phone.
- [ ] You can **sign in to the Admin Portal** (test it while you still have signal).
- [ ] Your phone is **charged**, and you have a power bank.
- [ ] **Location / GPS is switched on** — the GPS pin is mandatory when you register a farmer.
- [ ] The app has **Camera** permission (for farmer photos) and **Location** permission.
- [ ] The event you are attending has already been **created in the system** — check it appears in the event list on the Mark Attendance screen.
- [ ] If the event uses QR attendance, someone has **printed or can display the QR code** (it is generated from the web dashboard and lasts 24 hours).
- [ ] You have a pen and paper to note down the **default passwords** generated for new farmers.

---

## 2. Getting your account and signing in

Your account is created for you by an administrator from the web dashboard. You will receive:

- An **email address** (your login ID)
- A **password**
- A **role** — Super Admin, Admin, Sub Admin or Volunteer

### Signing in on the phone

1. Open the Tanak Prabha app.
2. On the **Welcome** screen, tap the small **Admin Portal** link at the bottom (shield icon).
3. Enter your **email** and **password** (the eye icon shows what you typed).
4. Tap **Log In as Admin**.

You land on the admin dashboard and stay signed in until you log out. The normal farmer tabs are not shown while you are signed in as staff.

**Signing out:** the log-out icon at the top right of the dashboard.

### Signing in on the web

Open the dashboard URL in a browser, enter the same email and password, and click **Sign in**. Your session lasts **24 hours**.

### Changing your password

Web dashboard → **Settings → Security** → Current Password, New Password (minimum 6 characters), Confirm New Password.

---

## 3. The mobile dashboard at a glance

| Area | What it shows / does |
|---|---|
| **Header** | "Dashboard" and a live count of farmers onboarded. A yellow **"N Pending"** badge appears when something is waiting to sync. Log-out icon on the right. |
| **Amber sync banner** | *"N pending offline sync"* — events or attendance captured without internet, waiting to upload |
| **Create Event** (blue) | Opens the event creation form |
| **Mark Attendance** (green) | Opens the attendance screen |
| **Farmers** stat card | Total farmers → tap to open the farmer list |
| **Land Coverage** stat card | Total land in Bigha → tap to open the farmer list |
| **Livestock** stat card | Total animals → tap for a breakdown by animal type |
| **Active Schemes** stat card | Live schemes → tap to open Content Management |
| **Management grid** | Old Attendance Records · Notify · Farmers · CMS |
| **Event Management** | Create New Event · Mark Attendance · View Attendance Records |

Pull down to refresh the numbers.

---

## 4. Task — Register a farmer

This is your most common job. Do it with the farmer standing next to you so you can take their photo and confirm their details.

### Step A — Always search first

1. From the dashboard tap **Farmers**, then **Add** (top right). Or tap the **Farmers** tile in the management grid.
2. The first screen is a **search box**. Type the farmer's **name or mobile number**.
3. If they already appear in the results, **open their record instead of creating a new one**. Do not create duplicates.
4. If nothing matches, tap **Register New Farmer**.

### Step B — The 4-step wizard

The header shows **Step N of 4** with the step name and a short description.

#### Step 1 — Personal Details ("Basic info + photo of the farmer")

1. Tap the photo area and **take a photo with the camera**. It uploads immediately.
2. Fill in:

| Field | Required | Rules |
|---|---|---|
| **Full Name** | Yes | The farmer's name |
| **Mobile Number** | Yes | Exactly 10 digits |
| **Age** | Yes | 1–120 |
| **Gender** | Yes | Male / Female / Other. Choosing **Other** opens a "Please specify…" box |
| **Father's Name** | Yes | |
| **Aadhaar** | No | If entered, exactly 12 digits |

3. Tap **Next**. Any missing or invalid field is flagged in red.

#### Step 2 — Location ("Where does the farmer live?")

This is the step people get stuck on, so take it slowly.

1. **Drop the GPS pin — this is mandatory.** Tap the map button, wait for the map to find you, adjust the pin to the farmer's home, and tap **Confirm Location**.
   - You cannot move to step 3 without a pin. The error is *"GPS location is mandatory"*.
   - If accuracy is poor (a warning appears at roughly 100 m), step outside, away from buildings, and tap **Try Again**. Only use **Confirm Anyway** if you truly cannot get a better fix.
2. Fill in the address. **All of these are required:**

| Field | How to fill it |
|---|---|
| **PIN Code** | Type the 6 digits. The app looks the PIN up automatically and fills in the State and District, and offers matching **Block** and **Post Office** dropdowns |
| **State** | Dropdown (usually auto-filled by the PIN lookup) |
| **District** | Dropdown — only selectable after a State is chosen |
| **Block / Tehsil** | Dropdown if the PIN lookup returned blocks, otherwise type it |
| **Village** | Type it |
| **Post Office** | Dropdown if the PIN lookup returned post offices, otherwise type it |

> **Type the PIN code first.** It fills in most of the rest for you and prevents spelling mistakes in state and district names.

> The GPS pin and the typed address are stored **separately**. The map never overwrites what you typed, so fill the address in properly even after dropping the pin.

3. Tap **Next**.

#### Step 3 — Land Details ("Land holdings and crops")

| Field | Notes |
|---|---|
| **Total land area** | A number, e.g. `2.5` |
| **Rabi crop** | Pick from the list; "other" opens a text box |
| **Kharif crop** | Pick from the list; "other" opens a text box |

If the farmer owns no land, leave the area blank and continue — nothing is stored.

#### Step 4 — Livestock Details ("Livestock owned by the farmer")

Enter counts for **Cow, Buffalo, Goat, Sheep, Pig, Poultry** and **Others**. Leave a box empty or 0 for animals they do not own. If every count is 0, nothing is stored.

### Step C — Submit and hand over the password

Tap **Register Farmer**. On success you see:

> **Farmer Registered**
> *[Name]* has been successfully registered.
> **Default password: 47382916**
> Please share this with the farmer securely — it won't be shown again.

**This is critical:**

- A **fresh random 8-digit password is generated for every single farmer**. It is different each time.
- **You cannot look it up again.** Once you dismiss the dialog, it is gone.
- Write it on the farmer's slip, or read it out and watch them save it in their phone, **before** tapping OK.
- Tell the farmer: *"Open Tanak Prabha, tap Log In, enter your mobile number and this password. Then change it — tap Forgot password? and you'll get an OTP on WhatsApp."*

### If the mobile number already exists

Registration is refused and a **conflict card** shows the farmer who already holds that number. Open that record instead — do not try a different number for the same person.

---

## 5. Task — Find and check an existing farmer

1. Dashboard → **Farmers**.
2. The list shows every registered farmer with their name, village, district, mobile number and a **Verified** or **Pending** badge. Pull down to refresh.
3. **Search by name or mobile number.**
4. Tap a row to open the full record:
   - Name, village · district and the verification badge in the header
   - Mobile number with a **Call** button — useful for confirming a number on the spot
   - **Personal Info** — Name, Age, Gender, Aadhaar, Father's Name, Mother's Name
   - **Address** — Village, Block, District, State, PIN Code
   - **Land Details** — total area and crops
   - **Livestock** — Cow, Buffalo, Goat, Sheep, Poultry, Others
5. Use the **verify / un-verify** control once you have checked the details against the farmer's documents. You get *"Farmer has been successfully verified."* If the save fails the badge goes back to what it was — check your signal and try again.

---

## 6. Task — Create an event

You can create an event from the phone, which is useful when a camp is arranged at short notice.

Dashboard → **Create Event**.

| Section | What to fill in |
|---|---|
| **Event Cover Image** | Tap to pick a picture from the gallery (16:9 works best). It uploads and shows an **Uploaded** badge. Optional. |
| **Basic Information** | A **English / हिंदी** tab switcher. English tab: **Event Title \*** and Description. हिंदी tab: **Title (Hindi) \*** and Description (Hindi) |
| **Date & Time** | **Select Date \*** (calendar; past dates are disabled), **Start Time \***, End Time. Times use a scroll picker — hour, minute (00/15/30/45), AM/PM |
| **Location** | **Venue / Location Name \***, Full Address |
| **Additional Details** | Guidelines & Rules, Requirements — each in English and Hindi |
| **Trainer & Contact** | Master Trainer name / phone / about (English and Hindi), Trainer name / phone, Contact Number. All optional |
| **GPS Location** | Opens the map picker — drop a pin on the venue. This powers the **Get Directions** button farmers see |

**Both titles are mandatory.** Saving without the Hindi title is refused: *"Hindi Title Required — Please enter the Hindi title (हिंदी शीर्षक आवश्यक है)."*

Other checks: the date cannot be in the past, and the end time must be after the start time.

Tap **Create Event**:

- **Online** → *"✅ Success — Event created successfully!"*
- **Offline** → *"Saved offline — No internet connection. Your event has been saved and will be submitted when you're back online."*

New events start with status **upcoming** and appear in the farmers' Programs tab straight away.

---

## 7. Task — Mark attendance at a camp

There are two ways attendance gets recorded. Use both.

### Method 1 — Farmers scan the QR code (fastest)

1. A QR code for the event is generated from the web dashboard (**Events → open the event → Generate QR**) and downloaded as a PNG.
2. Print it, or display it on a laptop or tablet at the entrance.
3. Farmers open the event in their app and tap **Scan to Attend**. Their attendance is recorded instantly.
4. **The code expires after 24 hours.** If farmers report *"QR Code Expired"*, ask the office to generate a fresh one — or fall back to method 2.

### Method 2 — You mark them manually

Dashboard → **Mark Attendance**.

1. **Select the event** from the list at the top.
2. Type the person's **10-digit mobile number**. As soon as the tenth digit is in, the app looks the number up.
3. **If a registered farmer is found** — a green **Found** card shows their photo, name, mobile number, village, block, district, state, age and gender. Confirm it is the right person, then tap **Mark as Present**.
   - You get *"✅ Done! Attendance marked as Present."* with a **Mark Another** button that clears the form for the next person in the queue.
4. **If no account exists** — you see *"No Registered User Found"*.
   - Type the person's **name** (the button stays disabled until you do).
   - Tap **Mark as Present Anyway**. They are recorded as a **walk-in**.
   - You are then asked: *"This person is not registered. Send them a WhatsApp invite to join Tanak Prabha?"* — tap **Send Invite** to open WhatsApp with a ready-written invitation and download link (it falls back to SMS if WhatsApp is not available), or **Skip**.

> **Marking a walk-in present is not the same as registering them.** If they want an account with their land, livestock and address on file, do a proper registration (section 4) once the queue clears.

---

## 8. Task — Review attendance and chase walk-ins

Dashboard → **Old Attendance Records** (or **View Attendance Records**).

1. **Select the event** from the list — each row shows the date, venue and status.
2. The attendee list opens, grouped so you can see at a glance:
   - **Attended** vs **Registered** (people who applied but were never marked present)
   - **Pre-registered** (they have an app account) vs **Walk-in** (no account)
3. Each row shows initials, the name or mobile number, the number, and a status badge.
   - Walk-ins carry an amber **Walk-in** badge.
   - A walk-in who has since created an account also shows a green **Registered** badge — that is a successful conversion.
4. **Resend Invite** appears on walk-ins who have not joined yet. Tapping it re-sends the WhatsApp invitation and logs the attempt.
5. Tapping a row for a registered farmer opens their full profile.

**Good follow-up routine after a camp:** open the event's records, filter your eye to walk-ins without the green badge, and send each one a **Resend Invite**.

---

## 9. Task — Send a notification to farmers

Dashboard → **Notify**.

1. **Title \*** — up to 80 characters (a live counter is shown).
2. **Message** — optional, up to 250 characters.
3. **Notification Type** — Announcement, Info, Alert or Reminder.
4. **Target Audience** — **All Users**, or **By District** (type the district name).
5. The **preview card** at the top shows exactly what will land on a farmer's phone. Read it before sending.
6. Tap **Send**. Confirm the dialog: *"Send [title] to all users / users in [district]?"*
7. You get a receipt: *"Notification delivered to N users. M device(s) will receive a push notification."*

> A broadcast cannot be un-sent from the phone. If you make a mistake, ask someone with the web dashboard to **Edit** it (which rewrites it for everyone who received it) or **Recall** it.

Typical uses: reminding a district about tomorrow's camp, announcing a new scheme, or a weather warning.

---

## 10. Task — Quick content edits from the phone

Dashboard → **CMS**. Two tabs.

### Schemes

Create, view, edit or delete a scheme with:

| Field | Required |
|---|---|
| Scheme Image | No |
| Title (English) | **Yes** |
| Title (Hindi) | No |
| Category | **Yes** |
| Description / Description (Hindi) | No |
| Eligibility | No |

> This is a quick-edit tool. Full scheme content — overview, application process, objectives, structured eligibility criteria, hero image and the official apply link — is entered on the web dashboard.

### Experts

Create, view, edit or delete a professional with **Full Name \***, **Role \***, **Category \***, Department, Phone Number, District and a photo.

> **The category must be one of the four Connect categories** — Training & Guidance, Livestock & Veterinary, Market & Buyers, Government Schemes. An expert saved with anything else will not show up anywhere in the farmer app.

---

## 11. Working offline

Village camps often have no signal. The app is built for that.

### What works offline

| Action | Behaviour |
|---|---|
| **Create Event** | Saved on the phone: *"Saved offline — No internet connection. Your event has been saved and will be submitted when you're back online."* |
| **Mark Attendance** | Saved on the phone: *"Saved offline — No internet connection. Attendance has been saved and will be submitted when you're back online."* |

### What needs a connection

- **Registering a farmer** (the mobile-number duplicate check and the photo upload both need the server)
- Looking a farmer up by mobile number on the Mark Attendance screen
- Sending notifications
- Any content or CMS change
- Verifying a farmer

### Watching the queue

- The dashboard header shows a **"N Pending"** badge and an amber banner: *"N pending offline sync"*.
- The queue uploads **automatically** as soon as the phone regains internet. You do not have to press anything.
- **Do not uninstall the app or clear its data while the badge is showing** — the queued records live on the phone until they upload.
- Before you leave the field for the day, get back into signal and watch the badge drop to zero.
- If an upload fails permanently you get *"Upload Failed — A cached [event / attendance] submission could not be uploaded. It will be retried later."*

### Practical plan for a no-signal camp

1. Create the event **before** you leave, while you still have signal — that way farmers can see and apply to it.
2. At the camp, mark attendance freely; it queues.
3. Collect registration details for new farmers on paper if there is no signal at all, then register them properly once you are back in coverage.
4. Return to signal, confirm the pending badge clears, and only then close the app.

---

## 12. Using the web dashboard

Back at the office, the browser dashboard does the things a phone is bad at.

### Sidebar items you will use most

| Item | What you do there |
|---|---|
| **Farmers** | Filter, verify, correct and export farmer records |
| **Events** | Create events properly, generate QR codes, manage participants |
| **Reports** | Build and export CSV lists for your supervisor |
| **Analytics** | See coverage maps and trends for your area |
| **Notifications** | Send, edit or recall broadcasts |
| **Settings** | Change your password |

### Farmers page

- **Filter bar:** Search · **Districts** · **Crops** · **Seasons** (Rabi/Kharif/Zaid) · **Status** (Verified/Pending) · **Clear (N)** · **Export CSV** · **Add Farmer**
- **Table columns:** Farmer Name · District/Block · Mobile Number · Land Area · crops by season · Livestock · Status · Actions
- Clicking a farmer opens a tabbed record — **Personal**, **Address**, **Farming**, **Livestock**, **Family** — with edit and delete controls.

**Verification routine:** filter **Status → Pending**, open each record, check the details, mark **Verified**.

### Events page and the QR code

1. **Events → open the event → Generate QR**.
2. A QR image appears; click **Download** to save it as `event-<id>-qr.png`.
3. Print it or display it at the venue.
4. It is valid for **24 hours** and only works for that one event.

On the same page you also get:

- **Mentors & Instructors** — add the professionals running the session
- **On-Spot Registration** — add a walk-in by **Phone Number \*** and Name
- **Participants** — the full list with an attendance percentage, and a button on each unmarked row to mark them present
- **Edit** to add the **Outcome** write-up and upload **Media** (photos and videos) after the event, and to set the status to **Completed**

### Reports page — pulling a list

1. Set the filters: Search · State · District · **Land area** (< 1 / 1–3 / 3–5 / 5–10 / > 10 Bigha) · Verification status · Crop.
2. Tick the columns you need. Available: Name, Mobile Number, District, State, Village, Block, Land Area (Bigha), Rabi Crop, Kharif Crop, Zaid Crop, Livestock Count, Verified, Registration Date.
3. Check the preview table.
4. Click **Export CSV** — the file downloads as `farmer-report-YYYY-MM-DD.csv` with exactly the rows and columns you chose.

---

## 13. Data you collect — the full checklist

Print this or keep it on your phone. It is everything the registration wizard asks for, in order.

### Step 1 — Personal

- [ ] Photo (camera)
- [ ] Full Name **\***
- [ ] Mobile Number **\*** — 10 digits
- [ ] Age **\*** — 1 to 120
- [ ] Gender **\*** — Male / Female / Other (+ specify)
- [ ] Father's Name **\***
- [ ] Aadhaar — 12 digits, optional

### Step 2 — Location

- [ ] **GPS pin — mandatory**
- [ ] PIN Code **\*** — 6 digits (type this first)
- [ ] State **\***
- [ ] District **\***
- [ ] Block / Tehsil **\***
- [ ] Village **\***
- [ ] Post Office **\***

### Step 3 — Land

- [ ] Total land area
- [ ] Rabi crop (+ other)
- [ ] Kharif crop (+ other)

### Step 4 — Livestock

- [ ] Cow
- [ ] Buffalo
- [ ] Goat
- [ ] Sheep
- [ ] Pig
- [ ] Poultry
- [ ] Others

### After submitting

- [ ] **Write down the 8-digit default password** and hand it to the farmer
- [ ] Tell them to log in with mobile number + that password, then change it via **Forgot password?**

---

## 14. Field tips that save time

1. **Search before you register.** A duplicate is far more work to clean up than a ten-second search.
2. **Type the PIN code first** on the location step. It fills in the state, district, block and post office for you and eliminates spelling errors.
3. **Get the GPS pin outdoors.** Standing under a roof or between buildings gives a poor fix and triggers the accuracy warning.
4. **Take the photo in daylight**, with the farmer facing the light. The photo is cropped to a square.
5. **Hand over the password immediately.** It is generated fresh for every farmer and shown exactly once.
6. **Use "Mark Another"** after each attendance entry — it clears the form so you can work straight down a queue.
7. **Send the WhatsApp invite to every walk-in** while you are still standing with them. Conversions drop sharply once people leave.
8. **Create events before you lose signal**, so farmers can see and apply to them.
9. **Check the pending-sync badge before you close the app** at the end of the day.
10. **Confirm the mobile number by reading it back** to the farmer — it is their login ID and cannot be changed casually.
11. **Both English and Hindi titles are required** on events. Have the Hindi title ready before you start the form.
12. **Ask the farmer their preferred language** and show them how to switch it: Profile → Settings → App Language.

---

## 15. Troubleshooting in the field

| Problem | What is happening | What to do |
|---|---|---|
| Cannot move past the Location step | *"GPS location is mandatory"* | Tap the map button and confirm a pin. Turn on GPS if it is off. |
| *Low GPS Accuracy* warning | The fix is worse than about 100 m | Move outdoors and tap **Try Again**. Use **Confirm Anyway** only as a last resort. |
| The map opens on all of India | GPS could not get a fix in 10 seconds | Use the search box to find the village, or drag the map manually |
| *Permission Denied* when taking a photo | Camera permission was refused | Allow camera access in the phone's settings, then retry |
| PIN lookup fills in nothing | The PIN is wrong, or there is no internet | Check the digits; otherwise type the address fields manually |
| Registration fails with a conflict card | That mobile number already has an account | Open the existing record — do not register a second one |
| *Enter a valid 10-digit mobile number* | Wrong number of digits | Re-enter without +91 or spaces |
| Attendance says *"Saved offline"* | No internet at the venue | Nothing to do — it uploads when signal returns |
| Farmers report *"QR Code Expired"* | The code is more than 24 hours old | Generate a fresh one from the web dashboard, or mark them manually |
| Farmers report *"Already Applied"* | They already registered for the event | No action needed |
| A farmer cannot log in with the password you gave | Wrong password noted, or it was mistyped | Tell them to use **Forgot password?** — they will get an OTP on WhatsApp and can set their own |
| A farmer says *"Password Not Set"* | The account has no password | Tell them to tap **Send OTP** on that alert and set one |
| The pending badge will not clear | Still no usable connection, or an upload failed | Move into good signal and reopen the app. *"Upload Failed"* means it will retry — do not clear the app's data. |
| An expert you added is not visible in the app | The category is not one of the four Connect categories | Edit the expert and set a valid category |
| A scheme you added is not visible | It has no category, or an invalid one | Edit the scheme and pick a category from the approved list |
| Signed out of the web dashboard unexpectedly | The 24-hour session expired | Sign in again |
| *Could not reach the server* on admin login | No internet, or the backend is down | Check connectivity, then report it to the office |

---

## 16. Quick reference card

### Numbers to remember

| Thing | Value |
|---|---|
| Farmer mobile number | 10 digits, starts with 6/7/8/9 |
| Aadhaar | 12 digits |
| PIN code | 6 digits |
| Farmer age accepted at registration | 1–120 |
| OTP | 6 digits, WhatsApp, valid 10 minutes |
| Default password generated per farmer | 8 digits, random, shown once |
| Attendance QR code validity | 24 hours |
| Appointment slots | 09:00, 10:00, 11:00 AM · 02:00, 03:00, 04:00 PM |
| Max appointments per expert per day | 3 |
| Notification title / message limits | 80 / 250 characters |
| Web dashboard session | 24 hours |

### Mandatory fields when registering a farmer

Name · Mobile Number · Age · Gender · Father's Name · **GPS pin** · State · District · Block/Tehsil · Village · PIN Code · Post Office

### The four Connect categories for experts

Training & Guidance · Livestock & Veterinary · Market & Buyers · Government Schemes

### Event statuses

Upcoming · Ongoing · Completed · Cancelled

### Attendance statuses

Registered (applied, not present) · Attended (marked present) · Cancelled
Plus the **Walk-in** badge for anyone without an app account, and a green **Registered** badge once they join.

### The three sentences to say to every new farmer

1. "Your login is your mobile number and this password — write it down."
2. "Open the app, tap **Log In**, then change your password with **Forgot password?** — you'll get a code on WhatsApp."
3. "Everything is in the app: schemes, events, and experts you can call. You can switch it to Hindi from your Profile."
