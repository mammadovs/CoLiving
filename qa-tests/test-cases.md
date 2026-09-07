# CoLiving QA Test Cases

## 1. Authentication

### TC-AUTH-001 — Successful Login

**Endpoint:** POST /login

**Priority:** High

**Precondition:** A registered user exists.

**Steps:**
1. Send a POST request to `/login`.
2. Provide a valid user email as username.
3. Provide the correct password.
4. Submit the request.

**Expected Result:**
- Response status is 200.
- An access token is returned.
- Token type is `bearer`.

---

### TC-AUTH-002 — Login With Incorrect Password

**Endpoint:** POST /login

**Priority:** High

**Steps:**
1. Send a POST request to `/login`.
2. Provide a registered email.
3. Provide an incorrect password.
4. Submit the request.

**Expected Result:**
- Response status is 403.
- Authentication fails.
- No valid access token is returned.

---

### TC-AUTH-003 — Login With Non-existing Email

**Endpoint:** POST /login

**Priority:** High

**Steps:**
1. Send a POST request to `/login`.
2. Provide an email that is not registered.
3. Provide any password.
4. Submit the request.

**Expected Result:**
- Response status is 403.
- Authentication fails.

---

## 2. User Management

### TC-USER-001 — Successful User Registration

**Endpoint:** POST /users/

**Priority:** High

**Steps:**
1. Send a POST request to `/users/`.
2. Provide valid user registration data.
3. Submit the request.

**Expected Result:**
- Response status is 201.
- A new user is created.
- User information is returned.

---

### TC-USER-002 — Registration With Existing Email

**Endpoint:** POST /users/

**Priority:** High

**Precondition:** A user with the provided email already exists.

**Steps:**
1. Send a POST request to `/users/`.
2. Use an existing email.
3. Submit the request.

**Expected Result:**
- Response status is 400.
- A duplicate user is not created.

---

### TC-USER-003 — Get Existing User

**Endpoint:** GET /users/{user_id}

**Priority:** Medium

**Steps:**
1. Provide a valid user ID.
2. Send a GET request.

**Expected Result:**
- Response status is 200.
- The user's profile information is returned.

---

### TC-USER-004 — Get Non-existing User

**Endpoint:** GET /users/{user_id}

**Priority:** Medium

**Steps:**
1. Provide a user ID that does not exist.
2. Send a GET request.

**Expected Result:**
- Response status is 404.
- An appropriate error message is returned.

---

### TC-USER-005 — Update Own Profile

**Endpoint:** PATCH /users/me

**Priority:** High

**Precondition:** User is authenticated.

**Steps:**
1. Authenticate as a valid user.
2. Send a PATCH request to `/users/me`.
3. Provide valid profile information.

**Expected Result:**
- Response status is 200.
- The profile is updated successfully.

---

### TC-USER-006 — Update Profile Without Authentication

**Endpoint:** PATCH /users/me

**Priority:** High

**Steps:**
1. Send a PATCH request without an access token.
2. Provide valid profile data.

**Expected Result:**
- Request is rejected.
- An authentication error is returned.

---

### TC-USER-007 — Calculate Compatibility Between Two Users

**Endpoint:** GET /users/{user_id}/compatibility

**Priority:** Medium

**Precondition:** Two users exist and the requesting user is authenticated.

**Steps:**
1. Authenticate as User A.
2. Request compatibility with User B.
3. Send the request.

**Expected Result:**
- Response status is 200.
- A compatibility score is returned.
- A breakdown of compatibility factors is returned.

---

### TC-USER-008 — Calculate Compatibility With Yourself

**Endpoint:** GET /users/{user_id}/compatibility

**Priority:** Medium

**Steps:**
1. Authenticate as User A.
2. Request compatibility with User A's own ID.

**Expected Result:**
- Response status is 400.
- Compatibility calculation is rejected.

---

## 3. Listings

### TC-LIST-001 — Create Listing

**Endpoint:** POST /listings/

**Priority:** High

**Precondition:** User is authenticated.

**Steps:**
1. Authenticate as a valid user.
2. Send a POST request to `/listings/`.
3. Provide valid listing information.
4. Submit the request.

**Expected Result:**
- Response status is 201.
- A new listing is created.
- The listing belongs to the authenticated user.

---

### TC-LIST-002 — Create Listing Without Authentication

**Endpoint:** POST /listings/

**Priority:** High

**Steps:**
1. Send a POST request to `/listings/`.
2. Do not provide an access token.
3. Provide valid listing data.

**Expected Result:**
- Request is rejected.
- An authentication error is returned.
- No listing is created.

---

### TC-LIST-003 — Get Active Listings

**Endpoint:** GET /listings/

**Priority:** High

**Steps:**
1. Send a GET request to `/listings/`.

**Expected Result:**
- Response status is 200.
- A list of active listings is returned.

---

### TC-LIST-004 — Filter Listings By District

**Endpoint:** GET /listings/

**Priority:** Medium

**Steps:**
1. Send a GET request with a valid district filter.
2. Submit the request.

**Expected Result:**
- Response status is 200.
- Returned listings match the selected district.

---

### TC-LIST-005 — Filter Listings By Price

**Endpoint:** GET /listings/

**Priority:** Medium

**Steps:**
1. Send a GET request with `min_price`.
2. Optionally provide `max_price`.
3. Submit the request.

**Expected Result:**
- Response status is 200.
- Returned listings match the requested price range.

---

### TC-LIST-006 — Get Listing By Valid ID

**Endpoint:** GET /listings/{listing_id}

**Priority:** High

**Steps:**
1. Provide an existing listing ID.
2. Send a GET request.

**Expected Result:**
- Response status is 200.
- The requested listing information is returned.

---

### TC-LIST-007 — Get Non-existing Listing

**Endpoint:** GET /listings/{listing_id}

**Priority:** Medium

**Steps:**
1. Provide a listing ID that does not exist.
2. Send a GET request.

**Expected Result:**
- Response status is 404.
- An appropriate error message is returned.

---

### TC-LIST-008 — Update Own Listing

**Endpoint:** PUT /listings/{listing_id}

**Priority:** High

**Precondition:** The authenticated user owns the listing.

**Steps:**
1. Authenticate as the listing owner.
2. Send a PUT request.
3. Provide valid updated listing data.

**Expected Result:**
- Response status is 200.
- Listing information is updated.

---

### TC-LIST-009 — Update Another User's Listing

**Endpoint:** PUT /listings/{listing_id}

**Priority:** High

**Precondition:** The listing belongs to another user.

**Steps:**
1. Authenticate as User A.
2. Attempt to update a listing owned by User B.

**Expected Result:**
- Response status is 403.
- The listing is not modified.

---

### TC-LIST-010 — Delete Own Listing

**Endpoint:** DELETE /listings/{listing_id}

**Priority:** High

**Precondition:** The authenticated user owns the listing.

**Steps:**
1. Authenticate as the listing owner.
2. Send a DELETE request.

**Expected Result:**
- Response status is 204.
- The listing is deleted.

---

### TC-LIST-011 — Delete Another User's Listing

**Endpoint:** DELETE /listings/{listing_id}

**Priority:** High

**Steps:**
1. Authenticate as a user who does not own the listing.
2. Send a DELETE request.

**Expected Result:**
- Response status is 403.
- The listing is not deleted.

---

### TC-LIST-012 — Upload Listing Image

**Endpoint:** POST /listings/{listing_id}/images

**Priority:** Medium

**Precondition:** Authenticated user owns the listing.

**Steps:**
1. Authenticate as the listing owner.
2. Select an image file.
3. Send the POST request.

**Expected Result:**
- Response status is 201.
- The image is associated with the listing.

---

## 4. Messaging

### TC-MSG-001 — Send Message

**Endpoint:** POST /messages/

**Priority:** High

**Precondition:** User is authenticated and receiver exists.

**Steps:**
1. Authenticate as User A.
2. Provide User B's ID.
3. Provide message content.
4. Send the request.

**Expected Result:**
- Response status is 201.
- The message is created successfully.

---

### TC-MSG-002 — Send Message To Non-existing User

**Endpoint:** POST /messages/

**Priority:** Medium

**Steps:**
1. Authenticate as a valid user.
2. Provide a non-existing receiver ID.
3. Send the request.

**Expected Result:**
- Response status is 404.
- The message is not created.

---

### TC-MSG-003 — Send Message To Yourself

**Endpoint:** POST /messages/

**Priority:** Medium

**Steps:**
1. Authenticate as User A.
2. Use User A's own ID as receiver.
3. Send the request.

**Expected Result:**
- Response status is 400.
- The message is not created.

---

### TC-MSG-004 — Get Conversation History

**Endpoint:** GET /messages/conversation/{other_user_id}

**Priority:** High

**Precondition:** User is authenticated.

**Steps:**
1. Authenticate as User A.
2. Provide User B's ID.
3. Send the GET request.

**Expected Result:**
- Response status is 200.
- Conversation messages are returned chronologically.

---

### TC-MSG-005 — Get Conversations

**Endpoint:** GET /messages/conversations

**Priority:** Medium

**Precondition:** User is authenticated.

**Steps:**
1. Authenticate as a valid user.
2. Send a GET request.

**Expected Result:**
- Response status is 200.
- The user's conversations are returned.
- Last message and unread count are included.

---

# 5. General Error Handling

### TC-ERR-001 — Unauthorized Access

**Steps:**
1. Send a request to an authentication-protected endpoint without a token.

**Expected Result:**
- Request is rejected.
- An appropriate authentication error is returned.

---

### TC-ERR-002 — Invalid Resource ID

**Steps:**
1. Request a resource using a non-existing ID.

**Expected Result:**
- Response status is 404.
- An appropriate error message is returned.

---

### TC-ERR-003 — Invalid Request Data

**Steps:**
1. Send invalid or incomplete data to an endpoint requiring a request body.

**Expected Result:**
- Request is rejected.
- Validation errors are returned.
- No invalid data is stored.