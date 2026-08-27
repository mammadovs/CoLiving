# CoLiving QA Tests

## Purpose

This directory contains the initial Quality Assurance test
scenarios for the CoLiving project.

The tests focus on the core backend API functionality
implemented for Sprint 2.

## Scope

The following modules are covered:

- Authentication
- User Management
- Room Listings
- Listing CRUD operations
- Listing image upload
- Roommate compatibility
- Messaging
- Validation
- Authentication and authorization

## Test Types

The initial QA tests include:

- Functional testing
- Positive testing
- Negative testing
- Validation testing
- Authentication testing
- Authorization testing
- Error handling testing

## Backend API Modules

### Authentication

- POST /login

### Users

- POST /users/
- GET /users/{user_id}
- PATCH /users/me
- GET /users/{user_id}/compatibility

### Listings

- POST /listings/
- GET /listings/
- GET /listings/{listing_id}
- PUT /listings/{listing_id}
- DELETE /listings/{listing_id}
- POST /listings/{listing_id}/images

### Messages

- POST /messages/
- GET /messages/conversation/{other_user_id}
- GET /messages/conversations