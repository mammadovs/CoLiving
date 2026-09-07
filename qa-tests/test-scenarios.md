# CoLiving - QA Test Scenarios

## 1. User Registration

### TC-001 - Successful Registration

**Precondition:**
- User is on the Sign Up page.

**Steps:**
1. Enter a valid name.
2. Enter a valid email address.
3. Enter a valid password.
4. Click the "Sign Up" button.

**Expected Result:**
- The user should be successfully registered.

---

### TC-002 - Registration With Empty Fields

**Precondition:**
- User is on the Sign Up page.

**Steps:**
1. Leave all required fields empty.
2. Click the "Sign Up" button.

**Expected Result:**
- Validation messages should be displayed.
- Registration should not be completed.

---

### TC-003 - Registration With Invalid Email

**Precondition:**
- User is on the Sign Up page.

**Steps:**
1. Enter a valid name.
2. Enter an invalid email address.
3. Enter a valid password.
4. Click the "Sign Up" button.

**Expected Result:**
- An email validation error should be displayed.
- Registration should not be completed.

---

## 2. User Login

### TC-004 - Successful Login

**Precondition:**
- User has a registered account.
- User is on the Login page.

**Steps:**
1. Enter a valid email.
2. Enter the correct password.
3. Click "Log In".

**Expected Result:**
- The user should be successfully logged in.

---

### TC-005 - Login With Incorrect Password

**Precondition:**
- User has a registered account.
- User is on the Login page.

**Steps:**
1. Enter a valid email.
2. Enter an incorrect password.
3. Click "Log In".

**Expected Result:**
- Login should fail.
- An appropriate error message should be displayed.

---

### TC-006 - Login With Empty Fields

**Precondition:**
- User is on the Login page.

**Steps:**
1. Leave the email field empty.
2. Leave the password field empty.
3. Click "Log In".

**Expected Result:**
- Required field validation should be displayed.
- Login should not be completed.

---

## 3. Room Search

### TC-007 - Search For a Room

**Precondition:**
- User is on the Find a Room page.

**Steps:**
1. Enter a location in the search field.
2. Click the search button.

**Expected Result:**
- Matching room listings should be displayed.

---

### TC-008 - Empty Room Search

**Precondition:**
- User is on the Find a Room page.

**Steps:**
1. Leave the search field empty.
2. Click the search button.

**Expected Result:**
- The system should handle the empty search correctly.
- No unexpected error should occur.

---

## 4. Room Listings

### TC-009 - View Available Rooms

**Precondition:**
- User is on the Find a Room page.

**Steps:**
1. Open the page.
2. View the available room listings.

**Expected Result:**
- Available room cards should be displayed.
- Each card should contain relevant room information.

---

### TC-010 - View Room Details

**Precondition:**
- Room listings are displayed.

**Steps:**
1. Select a room.
2. Click "View Details".

**Expected Result:**
- Room details should be displayed.
- The correct room information should be shown.

---

## 5. Navigation

### TC-011 - Navbar Navigation

**Precondition:**
- User is on the home page.

**Steps:**
1. Click "Home".
2. Click "Find a Room".
3. Click "About".

**Expected Result:**
- Each navigation link should open the correct page.

---

### TC-012 - Mobile Navigation

**Precondition:**
- Website is opened on a mobile-sized screen.

**Steps:**
1. Open the hamburger menu.
2. Click a navigation link.

**Expected Result:**
- The hamburger menu should open correctly.
- The selected page should open.
- The menu should close after navigation.

---

## 6. Responsive Design

### TC-013 - Mobile Layout

**Precondition:**
- Screen width is below 768px.

**Steps:**
1. Open the website.
2. Navigate through the main pages.

**Expected Result:**
- Content should fit the screen.
- No horizontal scrolling should occur.
- Navbar should display the hamburger menu.

---

### TC-014 - Room Cards On Mobile

**Precondition:**
- Screen width is below 768px.
- Room listings are available.

**Steps:**
1. Open the Find a Room page.
2. View the room cards.

**Expected Result:**
- Room cards should be displayed in a single-column layout.
- Cards should not touch the screen edges.

---

## 7. UI Components

### TC-015 - Room Card Alignment

**Precondition:**
- Room cards are displayed.

**Steps:**
1. Open a page containing room cards.
2. Inspect the card content.

**Expected Result:**
- Card text should be left-aligned.
- Card spacing should be consistent.
- Card content should be visually readable.

---

### TC-016 - Button Functionality

**Precondition:**
- A page containing buttons is open.

**Steps:**
1. Click the available buttons.
2. Observe their behavior.

**Expected Result:**
- Buttons should be clickable.
- Buttons should perform their expected actions.
- Buttons should have consistent styling.

---

### TC-017 - SVG Icons

**Precondition:**
- Room cards are displayed.

**Steps:**
1. Inspect the location information.
2. Inspect the roommate information.

**Expected Result:**
- Location and roommate information should use SVG icons.
- Emojis should not be used as UI icons.