        # Kelale Transport - Backend (Updated)

This backend scaffold includes a more complete booking flow and QR generation for tickets.

## New additions
- Auth middleware (routes protected with JWT)
- Buses endpoints
- Bookings endpoints (create booking, user bookings) with QR code generation
- Schedule model and endpoints (basic)
- Swagger annotations added to new routes

## Setup
1. Copy `.env.example` to `.env` and fill values.
2. `npm install`
3. `npm run dev` (requires nodemon) or `npm start`

## Notes
- Booking currently uses a simple 'confirmed' status after booking; you can change status flow to include 'pending' and payment verification.
- Payment integration is simulated for the MVP. Real payment gateway integration will be added later.

Swagger docs are available at `/api-docs` after running the server.
