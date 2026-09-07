POST /users/
→ valid registration → 201

POST /users/
→ duplicate email → 400

POST /login
→ correct credentials → 200

POST /login
→ wrong password → 403

GET /listings/
→ active listings → 200

GET /listings/999999
→ listing not found → 404

...