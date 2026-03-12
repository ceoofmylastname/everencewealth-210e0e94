

## Plan: Reset Test Bookings

The three 1:30 PM slots (Mar 25, 26, 27) for advisor Johnathon Melvin were all booked during previous testing. They need to be unbooked so real users (or further testing) can use them.

### Action
Run a database update to set `is_booked = false` on the three test-booked slots:
- `096623f8-c83d-4b19-94b3-4da57891347e` (Mar 25)
- `bcfe5a03-4dae-4b47-acb4-886b2222f82b` (Mar 26)  
- `69962d1a-9351-41a5-b4e0-f20be21e7b21` (Mar 27)

Also delete the corresponding test registration rows from `socorro_workshop_registrations` so the data stays clean.

No code changes needed — this is a data-only fix.

