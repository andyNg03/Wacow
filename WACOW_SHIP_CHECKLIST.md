# WaCow — Ship Checklist (Apple App Store)

**Primary target:** Apple App Store, **live by Tue Sept 15, 2026**
**Grace window:** Mon Sept 22, 2026 (absorbs one extra rejection cycle)
**Reach goal:** Google Play, Q4 2026 — deferred, see bottom
**Re-baselined:** Aug 11, 2026 (switched from Play-first)

---

## Why the plan changed

- **Google Play is out for v1.** Personal developer accounts must run a closed test with
  **12+ testers for 14 consecutive days** before production access unlocks. The team can't
  field 12 testers, and that clock alone would have consumed the entire remaining schedule.
- **Apple has no equivalent gate.** TestFlight *internal* testing (up to 100 people on the
  App Store Connect team) needs **no review and no minimum tester count**. That removes the
  blocking constraint entirely.
- **The new critical path is Apple's review, not a waiting period.** Review is fast
  (typically 24–48h), but **rejection is likely on a first submission** and each round costs
  1–3 days. The schedule is built around surviving one rejection inside the target and a
  second inside the grace window.

### What that means for the deadline

| | date |
|---|---|
| **1a de-scope decisions all made** | **Sat Aug 16** |
| Feature-complete + device-tested | **Sun Sept 6** |
| **First submission — hard date** | **Tue Sept 8** |
| Approved, one rejection absorbed | Sept 12–15 |
| Live | **Sept 15** |
| Second rejection absorbed | → Sept 22 |

**Sept 8 is the date that matters.** Everything before it is negotiable scope; slipping it
eats the rejection buffer, not the launch date.

---

## Timeline at a glance

| Phase | Window | Focus |
|---|---|---|
| 1. Build | Aug 11 → Aug 30 (3 wks) | Bug fixes, de-scope, wire real data |
| 2. Secure + Apple requirements | Aug 24 → Sep 4 (overlaps) | RLS, account deletion, privacy policy, first iOS build |
| 3. Device testing | Aug 31 → Sep 6 | Real iPhones; one TestFlight pass before submitting |
| 4. Submit | Sep 7 → Sep 15 | Listing assets, submit Sep 8, handle rejection |
| 5. Post-launch | From Sep 15 | Crash monitoring, support |
| R. Reach | Q4 2026 | Google Play |

---

## Day 1 — external dependencies (do these Aug 11–12, they have wait times)

Not a phase, but these block the *end* of the schedule, so they can't wait for the build.

- [ ] **Enroll in the Apple Developer Program ($99/yr)** — do this first, today.
      Individual enrollment is often same-day but can take 1–2 days.
      *If you enroll as an **organization** you need a D-U-N-S number, which takes 1–2+
      weeks — that would blow the deadline. **Enroll as an individual.***
- [x] **Confirm physical iPhone access** for at least one person. The simulator will not
      surface layout, keyboard, safe-area, or performance issues, and reviewers test on
      real hardware.
- [x] **Decide the bundle identifier** — done: **`com.wacow.app`**, set in `app.json`
      for both iOS and Android (Aug 16). **Permanent after first upload.**
- [x] **Set `ios.supportsTablet: false`** in `app.json` — done (Aug 16).
      Leaving it `true` means Apple reviews the app on iPad **and requires iPad
      screenshots**. Free win — flip it unless iPad is a real goal.
- [x] **Supabase dashboard checks** (~2 min, unblocks the signup/profile fixes below).
      The schema is **not** in this repo — no `supabase/` folder, no migrations, no `.sql`.
      It lives only in the dashboard:
  - [x] (yes, but wrong) **Database → Triggers** — does a trigger on `auth.users` exist (usually
        `on_auth_user_created` → `handle_new_user`)? It's what creates the `public.users`
        row after signup. If missing, signup is silently half-broken.
  - [x] (not on) **Database → Tables → users** — UNIQUE constraint on `auth_id`?
        (`.upsert(..., { onConflict: 'auth_id' })` requires it.)
  - [x] (not on) **Authentication → Providers → Email** — is "Confirm email" ON?
        If yes, the client is *not logged in* after signup and cannot write to `users`
        at all — the row must be created server-side by the trigger.
- [x] Export the schema to `supabase/` and commit it, so the source of truth stops being
      a web UI
- [x] **Remove the existing scheduled-notification code** — dead/placeholder code is a
      rejection risk, and MoreScreen currently requests notification permission on mount
      with no context (users deny it, reviewers flag it).
      *Building the real "time to work out" notification system is **deferred to v1.1** —
      see the backlog. It's 2–4 days (permissions, scheduling, timezones, purpose strings,
      testing across app states) and nothing about the launch requires it. If the team
      wants it in v1, something else comes out — most likely StatsScreen.*

---

## Phase 1 — Build (Aug 11 → Aug 30)

### 1a. De-scope pass — DO THIS FIRST (highest rejection risk in the project)

Apple rejects under **Guideline 2.1 (App Completeness)** and **4.2 (Minimum
Functionality)** for placeholder content, fake data, and dead buttons. Right now four
screens render hardcoded numbers and at least one button does nothing. **This is the most
likely reason a submission gets rejected**, and it is cheaper to delete than to wire.

Rule for every item: **wire it or delete it. Nothing ships showing invented data.**

> ### ⏱ All 1a decisions made by **Sat Aug 16**
> An undecided item stays fake by default, and fake is the rejection risk.
> Anything still undecided on Aug 16 gets deleted — that's the default, not a punishment.

**Group A — no decision available. These get removed or hidden, full stop.**

XP, badges, achievements, and the daily challenge were cut from v1 back in July: their
tables, RLS, and trigger logic are all deferred to v1.1. **There is nothing to wire them
to.** Listing them as open choices invites someone to spend a week building the XP system.

- [x] HomeScreen — (Delete) XP stat card, achievements card, badges row, DailyChallenge
- [x] StatsScreen — (Delete) LatestAchievement
- [x] ProfileScreen — (Delete) BadgesSection, level/XP bar *(or repoint the bar to streak)*
- [x] (Delete) `SearchBar.js` is 0 bytes — delete

**Group B — genuine decisions. The data exists or is cheap; the team calls it.**

**Decided Aug 14 — motto: real data or delete, no exceptions.**

| Item | Wiring cost | Decision |
|---|---|---|
| Greetings card → user's name | `users.name` exists, ~20 min | ☑ wire |
| StatsScreen "This week" / "Activity This Week" (workouts, active time) | computable from `sessions`; no existing query pattern in the repo yet, new aggregation logic | ☑ wire |
| StatsScreen "calories" stat | no calories column exists anywhere in the `sessions` insert shape — nothing to wire | ☑ delete |
| Monthly goal | `users.weekly_goal` value is trivial; "progress" rides on the same `sessions` aggregation as the week stats above | ☑ wire |
| Edit Profile button | reuses ProfileSetupScreen — **must add pre-fill of existing values first**, or opening it blanks out a user's real profile | ☑ wire |
| `ProfileHeader.js:32` hardcoded `"Gym Hero"` | same pattern as greetings card | ☑ wire |

**MoreScreen placeholder menu items** — decided per row, not as one item:

| Row | Decision | Notes |
|---|---|---|
| Settings | ☑ wire (minimal) | A few basic settings — exact contents still TBD, team call, not decided here |
| Help & Support | ☑ wire | New screen, two options: "Question" and "Report Issue" |
| Share App | ☑ wire | Trivial — native `Share.share()`, no backend |
| Rate Us | ☑ delete | No App Store link exists pre-launch — can't wire a link that doesn't exist yet |

**Group C — additions, not removals (tracked here so 1a is the single UI worklist)**

- [ ] Add the **Delete Account** button to ProfileScreen/MoreScreen
      *(the button is trivial; the Edge Function behind it is not — see Phase 2)*
- [ ] **(Toung)** Converge Home, Profile, and Stats into a single HomeScreen — after
      the Group A deletions the three tabs look empty; merge their surviving content
      into one screen. *Ripples to check when doing this: `TabNav.js` drops two tabs;
      the three separate 1c wiring items below collapse into one; logout + Edit
      Profile buttons (currently on ProfileScreen) need a new home*

**Sweep**
- [ ] Grep for remaining hardcoded module-level arrays feeding the UI and list them here
- [ ] `ResultsOverlay.js:29` — hardcoded `currentStreak = 8` shows every user an
      8-day streak after every workout *(found Aug 21; missed by the Group A pass,
      which only swept the four main screens)*. Wire it to the real streak — the
      HomeScreen 1c work computes the same number, so reuse that — or hide the
      streak card for v1

### 1b. Bug fixes

Found during the Aug 2026 code walkthrough. **One root cause runs through most of these:
`error` is returned by every Supabase call and almost never checked, so "no error" gets
treated as "success"** — including when a write matched zero rows or the network died.
Files carry inline `BUG —` / `FIX:` comments at each site.

**Highest-value fix — do first, it closes three items at once:** ✅ **done Aug 20,
verified end-to-end** (throwaway signup → no error alert → `users` row landed with
name + `profile_complete = false`). Also added the UNIQUE constraint on `users.auth_id`.

- [x] ~~Create~~ Edit the signup trigger (it already existed, writing only
      `auth_id` + `email`) so the `users` row is created **server-side**, guaranteed:
      `handle_new_user()` (`security definer`) now also writes `name` from
      `new.raw_user_meta_data->>'name'` and `profile_complete = false`
- [x] Pass the name into signup so the trigger can read it:
      `supabase.auth.signUp({ email, password, options: { data: { name } } })`
- [x] Deleted the client-side `users` write in `AuthScreen` — dead code
      *(this also fixes the ProfileSetupScreen wizard trap below; the "check your
      email" alert went in with the same edit)*

**App.js** — **all five fixed Aug 21, verified on device** (cold-start spinner, no
flash; airplane-mode cold start shows retry screen instead of the wizard)
- [x] `checkProfile` three states: `profileStatus` loading/ready/error; genuine
      no-row (`PGRST116`) routes to the wizard, any other error shows a retry
      screen instead of routing on a guess
- [x] Loading state: `authReady` flag + spinner until `getSession()` answers —
      no screen flash on cold start
- [x] `onAuthStateChange` subscription unsubscribed via effect cleanup
- [x] Hourly re-run fixed: effect depends on `session?.user?.id` (string), not
      the session object
- [x] Unused `HomeScreen` import removed

**AuthScreen.js**
- [x] ~~Signup writes the name with `.update()`, which only edits an existing row~~
      → changed to `.upsert()` with the result captured *(Aug 2026; superseded by the
      trigger fix above, which is the real solution)*
- [x] No "check your email" message when `data.session` is null after signup — added
      with the trigger fix (Aug 20). Moot while confirmation is OFF, but guards the
      flow if it's ever turned on
- [x] Validation added (Aug 21, verified): mode-aware checks before any network
      call — name required (trimmed) on signup, email format, password ≥ 6
      (Supabase's own minimum). Also closes the nameless-signup hole that would
      have re-introduced blank names past the trigger fix
- [x] `setLoading(false)` moved into `finally` — button can't stick on "Loading..."
- [x] Hardcoded colors → theme roles (13 swaps). Note: the old `#e53935` wasn't
      even the brand red — theme `primary` is `#D00000`; the login screen now
      matches the rest of the app

**ProfileSetupScreen.js**
- [x] ~~`.update()` assumes the row exists → **the wizard trap**~~ — root cause closed
      by the trigger fix (Aug 20): every account now gets its `users` row server-side,
      so the update always has a row to hit. *Still worth reading the update's `error`
      here when touching this file (general error-audit habit)*
- [x] Field validation added (Aug 21, verified on device): per-step checks gate
      Next, Complete re-checks all steps and jumps to the offending one; ranges
      age 13–120, height 50–300 cm, weight 20–500 kg. Save wrapped in
      `try/finally` so the button can't stick on "Saving..."
- [x] Escape hatch added (Aug 21): "Log out" button in the wizard header —
      `signOut()` with the error read; App.js's gate routes to AuthScreen

**WorkoutsScreen.js** *(found in the Aug 19 silent-failure sweep)* — **both fixed
Aug 21, verified on device** (airplane-mode save → alert with results kept → retry
with signal → saved; cold-start offline → retry gate blocks session start)
- [x] 🔴 **Save silently skipped**: `getUserId()` discarded `error` on both calls;
      `userId` stayed `null` and the save was skipped behind a success screen.
      Fixed: errors read, `userIdStatus` loading/ready/error, picker shows a
      retry gate on error, save does a last-chance id re-fetch
- [x] Save failure alerted but wiped the results anyway. Fixed: session state is
      only cleared by `finishSession()`, reached solely via successful insert or
      an explicit "Discard workout" tap — overlay and results survive failures

**ExercisePickerScreen.js / ProfileScreen.js** *(minor, same sweep)*
- [ ] Picker fetch failure → alert, then a permanently empty list; add a retry path
- [ ] `signOut()` result discarded — a failed logout does nothing visible; read the
      error and alert

**Auth flow, still open**
- [ ] Password reset / "forgot password" flow — **Apple will test this.** Email/password
      auth with no recovery path is both a support disaster and a review risk
- [x] (Off for V1) Decide email-confirmation handling: disable for v1 (recommended — no deep-link work),
      or implement the redirect. Default settings dead-end mobile signups
- [x] ~~Audit remaining silent-failure spots~~ — done Aug 19: every Supabase call site
      in the app is now audited; findings recorded above

### 1c. Wire the screens to real data

- [ ] **HomeScreen** — streak computed from `sessions` (consecutive days, midnight
      rollover in the user's timezone; keep the logic in one place, recommend a Postgres
      function/view); workout count from `sessions`; loading state; empty state for a
      brand-new user
- [ ] **WorkoutsScreen** — save already works; handle save failure (network down, RLS
      reject) so a workout is never silently lost; trigger the streak update after save
- [ ] **StatsScreen** — query the current week's sessions → weekly chart; totals from real
      data; empty-data case
- [ ] **ProfileScreen** — fetch name, member-since, weekly goal from `users`; loading state

---

## Phase 2 — Secure + Apple requirements (Aug 24 → Sep 4, overlaps Phase 1)

### Row Level Security (BLOCKING — the anon key ships inside the app)

- [ ] RLS policy on `users` (read own row, update own row)
- [ ] RLS policy on `sessions` (read own, insert own, update own, delete own)
- [ ] RLS policy on `workouts` (read all presets, read/write own custom)
- [ ] Test with `curl` using the anon key while logged out → confirm zero access to
      user data

### Apple-required, non-negotiable

- [ ] **In-app account deletion** — required by **Guideline 5.1.1(v)** for any app that
      creates accounts. Missing this is an automatic rejection.
  - [ ] "Delete Account" button in MoreScreen + confirmation dialog
  - [ ] Deletes the auth user + all their rows, then logs out
- [ ] **Privacy policy URL**, live and reachable (Termly/iubenda generator is fine)
  - [ ] Declares: email + workout data collected, stored in Supabase
  - [ ] Declares: how users delete their data
- [ ] **Support URL** — required field in App Store Connect; a simple page or mailto works
- [ ] **Privacy nutrition labels** in App Store Connect — must match what the app
      actually collects
- [ ] **Demo account credentials** in App Review notes — login-gated apps are rejected
      without a working one. Create it early and verify it works on the submitted build.
- [ ] Export compliance — `ITSAppUsesNonExemptEncryption: false` is already set in
      `app.json`; confirm it survives the build
- [ ] Age rating questionnaire
- [ ] *Not required:* **Sign in with Apple** is only mandatory when you offer third-party
      sign-in (Google/Facebook/etc.). Email+password alone is exempt. **Do not add
      third-party sign-in before launch** or this becomes required work.

### First iOS build — do this by Aug 28 at the latest

The app has never been built for iOS or run on a physical device. First builds always
surface something.

- [ ] EAS Build configured for iOS; production Supabase env vars in EAS
- [ ] Bundle ID set to the final value
- [ ] Signing certificates / provisioning handled by EAS (confirm the account is enrolled)
- [ ] App icon and splash render correctly on device
- [ ] Fix `expo-notifications` version mismatch (54 vs SDK 55.0.x)
- [ ] Audit `.env` — only `EXPO_PUBLIC_` keys in the app (anon key fine; **service role
      key NEVER**)
- [ ] Separate production Supabase project from dev (don't ship test data)

### Database constraints

- [ ] CHECK constraints for numeric ranges in `sessions` (weight ≥ 0, reps > 0, sets > 0)
- [ ] NOT NULL where applicable (user_id, workout_id, date)
- [ ] Foreign keys with ON DELETE behavior defined *(needed for account deletion to work
      cleanly)*

---

## Phase 3 — Device testing (Aug 31 → Sep 6)

**TestFlight is not mandatory.** You can submit straight to review, and you can test on
real iPhones without it — EAS **internal distribution** builds install directly on devices
whose UDIDs you've registered. Use those for day-to-day testing: faster iteration, no
upload wait.

**But do not skip TestFlight entirely.** TestFlight runs the *actual release build* —
same signing, same release-mode configuration, same binary path as the one going to
review. Ad-hoc dev builds are a different configuration and things do break between them.
Skip it and you submit a binary nobody has ever run in its final form.

- [ ] EAS internal-distribution build installed on the team's devices (day-to-day testing)
- [ ] Test on at least 2 physical iPhones, ideally different sizes / iOS versions
- [ ] **Gate before submission:** one TestFlight pass on the *exact build* you intend to
      submit. Internal testing needs no Beta App Review, so this is an upload plus a few
      installs — about an hour. Run the smoke path below on it.
      *(External TestFlight testers — anyone outside the App Store Connect team — do
      require a ~1 day Beta App Review. Not needed for this launch.)*

### The test matrix (this is where rejections get caught early)

- [ ] Cold start on a fresh install — first launch, no saved session
- [ ] Full signup → profile setup → first workout → stats update
- [ ] Login with wrong password; signup with an already-used email
- [ ] **Password reset end to end**
- [ ] Offline behavior — airplane mode mid-action on every screen
- [ ] Force-quit mid-save — does data corrupt or vanish?
- [ ] Keyboard avoidance on AuthScreen and exercise inputs
- [ ] Safe-area handling (notch / Dynamic Island / home indicator)
- [ ] Log out → log back in
- [ ] Delete account → confirm data is gone and the app returns to the login screen
- [ ] Watch someone use it silently; note where they get confused

### Loading and error states (every Supabase call)

- [ ] HomeScreen skeleton while fetching
- [ ] WorkoutsScreen spinner during session save
- [ ] StatsScreen skeleton while computing
- [ ] ProfileScreen skeleton while fetching
- [ ] Network-error UI with retry on every screen

---

## Phase 4 — Submit (Sep 7 → Sep 15)

### Listing assets — prepare during Phase 3, not on submission day

- [ ] App icon 1024×1024 (no alpha channel — a classic rejection)
- [ ] Screenshots for the required display sizes — **check App Store Connect for the
      current requirement** (6.9"/6.7" iPhone; iPad only if `supportsTablet` stayed true)
- [ ] App name + subtitle
- [ ] Description, keywords, promotional text
- [ ] Category: Health & Fitness
- [ ] Version number and build number; document the bump process

### Submission

- [ ] **Submit by Tue Sep 8** — this is the hard date
- [ ] Reviewer notes: demo account credentials, plus a one-line "how to use this app"
- [ ] Monitor App Store Connect for the review result
- [ ] **If rejected:** read the exact guideline cited, fix only that, resubmit same day
      if possible. Resubmissions usually re-review fast.
- [ ] Release option: manual release (so you choose the go-live moment) or automatic

---

## Phase 5 — Post-launch (set up before launch day)

- [ ] Sentry crash reporting active and confirmed capturing in the TestFlight build
- [ ] Support email set up and monitored
- [ ] Know the Supabase free-tier limits; check the dashboard weekly
- [ ] App Store Connect metrics checked after release
- [ ] Confirm Expo OTA updates work — patch JS bugs without a store round trip
      *(note: OTA can't fix native changes, and Apple requires OTA content to stay
      within what was reviewed)*

---

## Reach goal — Google Play (Q4 2026)

Deferred, not cancelled. Revisit after App Store v1 is stable.

- [ ] Recruit 12+ testers, **or** register an **organization** Play account — org accounts
      are exempt from the 12-tester/14-day closed-test rule. That exemption is the whole
      reason to consider an org account.
- [ ] Play Console enrollment ($25 one-time)
- [ ] Application ID (permanent), signed AAB via EAS
- [ ] Data safety form, IARC content rating, pre-launch report
- [ ] Android back button behavior on every screen (core Android UX, not needed for iOS)
- [ ] Android 13+ POST_NOTIFICATIONS runtime permission
- [ ] Verify `elevation` vs iOS `shadow*` styling renders correctly on Android
- [ ] Privacy policy + account deletion already exist from the App Store launch — reuse

---

## v1.1 backlog (cut from v1 — don't lose these)

- XP system, badges, achievements (+ their tables, RLS, trigger logic)
- Daily challenge
- **Workout reminder notifications** ("time to start a session") — 2–4 days: permissions,
  scheduling, timezone handling, Apple purpose strings, testing across app states.
  Deliberately deferred; better built once there are real users to time it against.
  The *existing* broken scheduled-notification code is removed in Day 1.
- **Offline session queue** — persist unsaved workout results to device storage and
  sync when connectivity returns (survives app restarts; needs dedup + a decision on
  what date a late-synced session counts toward, since streaks care). The v1 fix only
  keeps results in memory until save succeeds — good for network blips, not for
  app-killed-mid-workout
- Pull-to-refresh, tab/overlay animations
- AsyncStorage → SecureStore migration
- Settings screen, help & support, rate-us prompt
- Dedicated analytics (App Store Connect + Supabase dashboard is enough at this scale)
- iPad support
- Email confirmation on

---

## Red flags — if any is true on Sep 6, cut scope rather than slip the submission date

- Crashes on launch for any user
- Signup, login, or password reset broken for any user
- Data loss on session save
- RLS not fully tested
- No privacy policy live / no support URL
- No in-app account deletion *(automatic rejection)*
- Any screen still showing invented data *(likely rejection under 2.1 / 4.2)*
- No demo account, or the demo account doesn't work on the submitted build
- App has never run on a physical iPhone

**Submitting on Sep 8 with reduced scope beats submitting on Sep 12 with full scope.**
The rejection buffer is worth more than any single feature.

---

## "Done" definition for v1 launch

- [ ] Live on the App Store
- [ ] Crash reporting confirmed active
- [ ] Privacy policy live and linked; nutrition labels accurate
- [ ] Account deletion working in-app
- [ ] At least 3 people used it for a full week on real devices without major issues
- [ ] Support email monitored
- [ ] Team knows the update process (OTA vs. full submission)
- [ ] Explicit decision recorded: Google Play reach phase starts on [date] or is
      re-evaluated
