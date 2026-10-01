# Google Play Store Listing — Tanak Prabha

> Rejection: **Misleading Claims policy — "Insufficient Sources Provided"** (2026-08-23).
> Google's complaint: the description said "Examples of official government sources..." and
> named only 3, which "makes it seem like there are more than one source of information used
> without listing all of them." Fix: never use "Examples of" language — list *every* official
> source domain the app actually uses. The list below is generated from the real `apply_url`
> values in `Server/backend/src/data/schemesSeed.json` (60 distinct domains as of this writing).
> If schemes are added/removed, regenerate the list before resubmitting:
>
> ```bash
> grep -oE '"apply_url"\s*:\s*"[^"]*"' Server/backend/src/data/schemesSeed.json \
>   | sed -E 's/.*"(https?:\/\/[^"\/]+)\/?.*/\1/' | sed 's#https\?://##;s#www\.##' | sort -u
> ```

---

## Short Description (80 chars max)

Scheme info & farmer services, independent non-govt app. Hindi + English.

---

## Full Description (≤ 4000 chars)

🌾 Tanak Prabha – Empowering Farmers Through Digital Innovation

Tanak Prabha is an independent, farmer-focused digital platform bringing agricultural information, programme updates, and support services together in one easy-to-use mobile app for farmers, field workers, and rural communities.

━━━━━━━━━━━━━━━
🌱 Key Features

👨‍🌾 Farmer Registration & Digital Profile — manage personal details, land records, and livestock information.
📢 Agricultural Information & Awareness — schemes, programmes, benefits, and eligibility requirements collected from publicly available sources (full list below).
📅 Programme Updates — awareness campaigns, training sessions, workshops, and local farming activities.
🤝 Appointment Booking & Support — connect with local professionals and programme coordinators.
🔔 Notifications & Alerts — announcements, appointment reminders, and farming-related updates.
🌐 Multi-Language Support — Hindi and English, with a simple, farmer-friendly design.

━━━━━━━━━━━━━━━
🔒 Privacy & Security

Your information is protected using modern authentication and security practices.

━━━━━━━━━━━━━━━
⚠️ Important Disclaimer

Tanak Prabha is an independent, non-government application. It is NOT a government entity, government application, or official government service, and is not affiliated with, endorsed by, sponsored by, or operated on behalf of the Government of India, any state government, ministry, department, agency, or other government organization. Scheme and programme information is collected from publicly available sources for informational purposes only, may change, and should not be treated as an official government notification or confirmation of eligibility.

━━━━━━━━━━━━━━━
🌐 Government Information & Complete List of Official Sources

Tanak Prabha does not process, approve, or decide on government scheme applications. Every scheme entry includes an "Apply" link to that scheme's official government website, where users should verify current details before applying. The linked official source is always the authoritative one.

Complete list of official government sources used by this app: abdm.gov.in, agrimachinery.nic.in, amrut.gov.in, amrut.mohua.gov.in, apprenticeshipindia.gov.in, ataljal.mowr.gov.in, civilaviation.gov.in, ddugky.gov.in, dfpd.gov.in, digitalindia.gov.in, doe.gov.in, dpiit.gov.in, eatrightindia.gov.in, education.gov.in, epfindia.gov.in, eshram.gov.in, heavyindustries.gov.in, fame2.heavyindustries.gov.in, incometaxindia.gov.in, ism.gov.in, jaljeevanmission.gov.in, jansuraksha.gov.in, kheloindia.gov.in, maandhan.in, makeinindia.com, meity.gov.in, missionshakti.wcd.gov.in, wcd.gov.in, mnre.gov.in, nghm.mnre.gov.in, mohua.gov.in, mopng.gov.in, myscheme.gov.in (National Government Services Portal), nfsa.gov.in, niti.gov.in, nmeo.dac.gov.in, nstedb.com, pmay-urban.gov.in, pmcaresforchildren.in, pmdaksh.dosje.gov.in, pmfby.gov.in, pmgatishakti.gov.in, pmgsy.nic.in, pmjay.gov.in, pmjdy.gov.in, pmkisan.gov.in, pmksy.gov.in, pmssy.mohfw.gov.in, pmuy.gov.in, pmvishwakarma.gov.in, prana.cpcb.gov.in, rurban.gov.in, saubhagya.gov.in, seedfund.startupindia.gov.in, skillindiadigital.gov.in, smartcities.gov.in, standupmitra.in, startupindia.gov.in, swachhbharatmission.ddws.gov.in, tourism.gov.in, tribal.gov.in, udyamimitra.in.

Tanak Prabha does not represent any of these organizations. Always verify the latest information on the linked official government source before taking action.

━━━━━━━━━━━━━━━
Contact: reach us through the contact details listed in the app.

---

## Notes for the Play Console submission

1. Paste the Full Description above verbatim (it is ~3550 characters, under the 4000 limit) —
   do **not** shorten the source list back down to a handful of "examples"; that's what
   triggered the rejection.
2. Under **App content → Government apps**, confirm this is NOT a government app.
3. If prompted for "information and services" apps, select the option that the app
   aggregates public information and is independently developed.
4. Also consider adding an in-app disclaimer (e.g. a banner on the home/schemes screen)
   stating the same non-government disclosure — Play's Misleading Claims policy for
   government-adjacent content applies to the whole app experience, not just the store
   listing, and there is currently no such in-app disclaimer anywhere in `Client/src`.
5. Regenerate the source list (see command at top of this file) any time schemes are
   added to `schemesSeed.json`, and update this doc + the live Play Console listing together.
