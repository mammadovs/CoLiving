# CoLiving - QA Test Scenarios

## 1. User Registration

### TC-001: Successful registration
- Open the registration page.
- Enter a valid name.
- Enter a valid email.
- Enter a valid password.
- Click "Sign Up".
- Expected result: The user should be successfully registered.

### TC-002: Registration with empty fields
- Open the registration page.
- Leave the required fields empty.
- Click "Sign Up".
- Expected result: Validation messages should be displayed.

### TC-003: Registration with invalid email
- Enter an invalid email address.
- Fill in the remaining required fields.
- Click "Sign Up".
- Expected result: The system should display an email validation error.

---

## 2. User Login

### TC-004: Successful login
- Open the login page.
- Enter valid credentials.
- Click "Log In".
- Expected result: The user should be successfully logged in.

### TC-005: Login with incorrect password
- Enter a valid email.
- Enter an incorrect password.
- Click "Log In".
- Expected result: An appropriate error message should be displayed.

### TC-006: Login with empty fields
- Leave the login fields empty.
- Click "Log In".
- Expected result: Required field validation should be displayed.

---

## 3. Room Search

### TC-007: Search for a room
- Open the Find a Room page.
- Enter a location in the search field.
- Click the search button.
- Expected result: Matching rooms should be displayed.

### TC-008: Empty room search
- Open the Find a Room page.
- Leave the search field empty.
- Perform the search.
- Expected result: The system should handle the empty search correctly.

---

## 4. Room Listings

### TC-009: View available rooms
- Open the Find a Room page.
- Expected result: Available room listings should be displayed.

### TC-010: View room details
- Select a room listing.
- Click "View Details".
- Expected result: Detailed information about the selected room should be displayed.

---

## 5. Navigation

### TC-011: Navbar navigation
- Open the website.
- Click Home, Find a Room, and About.
- Expected result: Each link should navigate to the correct page.

### TC-012: Mobile navigation
- Open the website on a mobile-sized screen.
- Open the hamburger menu.
- Click a navigation link.
- Expected result: The mobile navigation menu should work correctly.

---

## 6. Responsive Design

### TC-013: Mobile layout
- Open the website with a screen width below 768px.
- Expected result: The layout should adapt to the mobile screen without horizontal scrolling.

### TC-014: Room cards on mobile
- Open the room listings on a mobile screen.
- Expected result: Room cards should be displayed in a single-column layout.

---

## 7. UI and Usability

### TC-015: Room card alignment
- Open the room listings.
- Expected result: Room card content should be left-aligned and visually consistent.

### TC-016: Buttons
- Check the buttons throughout the application.
- Expected result: Buttons should be visible, clickable, and visually consistent.

### TC-017: Icons
- Open the room listings.
- Expected result: Location and roommate information should use SVG icons instead of emojis.