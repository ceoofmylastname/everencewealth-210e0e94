
UPDATE socorro_advisor_availability
SET is_booked = false
WHERE id IN (
  '096623f8-c83d-4b19-94b3-4da57891347e',
  'bcfe5a03-4dae-4b47-acb4-886b2222f82b',
  '69962d1a-9351-41a5-b4e0-f20be21e7b21'
);

DELETE FROM socorro_workshop_registrations
WHERE availability_slot_id IN (
  '096623f8-c83d-4b19-94b3-4da57891347e',
  'bcfe5a03-4dae-4b47-acb4-886b2222f82b',
  '69962d1a-9351-41a5-b4e0-f20be21e7b21'
);
