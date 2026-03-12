export interface SocorroAdvisor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  headshot_url: string | null;
  bio: string | null;
  is_approved: boolean;
  auth_user_id: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface SocorroAvailabilitySlot {
  id: string;
  advisor_id: string;
  event_date: string;
  time_slot: string;
  is_booked: boolean;
  created_at: string;
}

export interface SocorroRegistration {
  id: string;
  advisor_id: string;
  availability_slot_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  selected_date: string;
  selected_time: string;
  ghl_webhook_sent: boolean;
  email_sent: boolean;
  created_at: string;
}

export interface SocorroBookingState {
  advisor_id: string;
  advisor_name: string;
  slot_id: string;
  date: string;
  time: string;
}
