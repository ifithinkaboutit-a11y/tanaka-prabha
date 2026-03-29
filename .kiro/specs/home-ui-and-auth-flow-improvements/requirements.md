# Requirements Document

## Introduction

This feature covers a set of UI and authentication flow improvements to the Tanak Prabha React Native / Expo mobile app. The changes span five areas:

1. Adding manual chevron controls to the home screen banner carousel.
2. Restructuring the home screen layout — removing the search bar and carousel, and promoting the four quick-action buttons to the top of the content area.
3. Replacing the search bar on the home screen with an inline notification alert that surfaces the latest unread notification.
4. Replacing the heart/like button on the scheme details page with a dedicated "I'm Interested" button placed above the "Apply Now" button.
5. Implementing a complete Forgot Password flow that authenticates the user via OTP and then requires them to log in again after resetting their password.

---

## Glossary

- **App**: The Tanak Prabha React Native / Expo mobile application.
- **Home_Screen**: The main tab screen rendered by `(tab)/index.tsx`.
- **Banner_Carousel**: The `BannerSlideshow` component that displays rotating promotional banners on the Home_Screen.
- **Chevron_Control**: A left or right arrow button overlaid on the Banner_Carousel that allows manual slide navigation.
- **Quick_Action_Grid**: The `QuickActionGrid` component displaying the four primary action buttons (Update Profile, Ongoing Events, Government Schemes, Book Appointment).
- **Notification_Alert**: A dismissible inline banner on the Home_Screen that displays the latest unread notification.
- **Notification_Service**: The `notificationsApi` service used to fetch and manage notifications.
- **Scheme_Details_Screen**: The screen rendered by `scheme-details.tsx` that shows full details of a government scheme.
- **Interested_Button**: A new CTA button labelled "I'm Interested" on the Scheme_Details_Screen.
- **Apply_Now_Button**: The existing primary CTA button on the Scheme_Details_Screen that opens the scheme's external application URL.
- **Auth_Screen**: Any screen within the `(auth)` route group.
- **OTP_Screen**: The `otp-input.tsx` screen that collects and verifies a one-time password.
- **Set_Password_Screen**: The `set-password.tsx` screen where the user creates or resets their password.
- **Login_Screen**: The `phone-input.tsx` screen rendered with `mode=login`.
- **Forgot_Password_Flow**: The sequence of screens a user traverses to reset their password via OTP verification.
- **OTP**: A 6-digit one-time password sent to the user's registered mobile number via SMS.

---

## Requirements

### Requirement 1: Carousel Chevron Controls

**User Story:** As a farmer using the app, I want to manually navigate the banner carousel using left and right arrow buttons, so that I can browse banners at my own pace without waiting for auto-rotation.

#### Acceptance Criteria

1. THE Banner_Carousel SHALL render a left Chevron_Control and a right Chevron_Control overlaid on the carousel.
2. WHEN the right Chevron_Control is pressed, THE Banner_Carousel SHALL advance to the next slide.
3. WHEN the left Chevron_Control is pressed, THE Banner_Carousel SHALL go back to the previous slide.
4. WHEN the right Chevron_Control is pressed on the last slide, THE Banner_Carousel SHALL wrap around and display the first slide.
5. WHEN the left Chevron_Control is pressed on the first slide, THE Banner_Carousel SHALL wrap around and display the last slide.
6. WHILE only one banner exists, THE Banner_Carousel SHALL hide both Chevron_Controls.
7. THE Chevron_Control SHALL remain accessible with a minimum touch target of 44×44 points.

---

### Requirement 2: Home Screen Layout Restructure

**User Story:** As a farmer, I want the four main action buttons to be the first thing I see when I open the home screen, so that I can quickly navigate to the most important features without scrolling past a search bar or carousel.

#### Acceptance Criteria

1. THE Home_Screen SHALL NOT render the SearchBar component.
2. THE Home_Screen SHALL NOT render the Banner_Carousel component.
3. THE Home_Screen SHALL render the Quick_Action_Grid as the first content section below the greeting header.
4. WHEN the Home_Screen finishes loading, THE Quick_Action_Grid SHALL be visible without any vertical scrolling.

---

### Requirement 3: Notification Alert on Home Screen

**User Story:** As a farmer, I want to see my latest notification directly on the home screen, so that I am immediately aware of important updates without navigating to the notifications page.

#### Acceptance Criteria

1. WHEN the Home_Screen loads and at least one unread notification exists, THE Home_Screen SHALL render the Notification_Alert below the greeting header and above the Quick_Action_Grid.
2. THE Notification_Alert SHALL display the title and a truncated body (maximum 2 lines) of the most recent unread notification.
3. THE Notification_Alert SHALL display a "View All" link that navigates the user to the full notifications screen.
4. WHEN the user presses the dismiss button on the Notification_Alert, THE Home_Screen SHALL hide the Notification_Alert for the remainder of the session.
5. WHEN no unread notifications exist, THE Home_Screen SHALL NOT render the Notification_Alert.
6. THE Notification_Alert SHALL only be rendered on the Home_Screen and not on any other tab screen.
7. IF the Notification_Service returns an error, THEN THE Home_Screen SHALL NOT render the Notification_Alert and SHALL continue to display the rest of the screen normally.

---

### Requirement 4: "I'm Interested" Button on Scheme Details

**User Story:** As a farmer browsing government schemes, I want a clear "I'm Interested" button on the scheme details page, so that I can express my interest in a scheme in a way that feels more meaningful than a like button.

#### Acceptance Criteria

1. THE Scheme_Details_Screen SHALL render an Interested_Button labelled "I'm Interested" in the bottom action area.
2. THE Scheme_Details_Screen SHALL NOT render the heart/like InterestButton component in the scheme title row.
3. THE Interested_Button SHALL be positioned directly above the Apply_Now_Button in the bottom action area.
4. WHEN the Interested_Button is pressed, THE Scheme_Details_Screen SHALL toggle the user's interest state and update the displayed interest count.
5. WHILE the interest toggle request is in progress, THE Interested_Button SHALL display a loading indicator and SHALL be disabled.
6. WHEN the interest toggle request fails, THE Scheme_Details_Screen SHALL display an error message and SHALL revert the interest state to its previous value.
7. THE Interested_Button SHALL reflect the current interest state visually (active vs. inactive style) on load.

---

### Requirement 5: Forgot Password Flow with OTP

**User Story:** As a registered farmer who has forgotten their password, I want to verify my identity via OTP and set a new password, so that I can regain access to my account securely.

#### Acceptance Criteria

1. WHEN the user taps "Forgot Password?" on the Login_Screen with a valid 10-digit mobile number entered, THE App SHALL call the forgot-password API endpoint and navigate to the OTP_Screen with `mode=forgot-password`.
2. WHEN the user taps "Forgot Password?" on the Login_Screen without a valid mobile number entered, THE Login_Screen SHALL display an inline error prompting the user to enter their mobile number first.
3. WHEN the OTP is successfully verified on the OTP_Screen with `mode=forgot-password`, THE App SHALL navigate to the Set_Password_Screen with `mode=reset`.
4. WHEN the user submits a valid new password on the Set_Password_Screen with `mode=reset`, THE App SHALL call the set-password API and then navigate to the Login_Screen.
5. THE App SHALL NOT automatically log the user in after a password reset via the Forgot_Password_Flow.
6. IF the mobile number provided for forgot password is not registered, THEN THE Login_Screen SHALL display an error message indicating the number is not found.
7. THE App SHALL use OTP verification in exactly two flows: new member registration (signup) and the Forgot_Password_Flow.
8. THE Login_Screen SHALL NOT trigger an OTP flow when the user logs in with a password.
9. WHEN the forgot-password API call fails, THE Login_Screen SHALL display an error message and SHALL remain on the Login_Screen.
