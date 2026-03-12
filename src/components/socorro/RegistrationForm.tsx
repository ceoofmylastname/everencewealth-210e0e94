import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import type { SocorroBookingState } from "@/types/socorro";

const schema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(100),
  last_name: z.string().trim().min(1, "Last name is required").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().min(7, "Please enter a valid phone number").max(20),
});

type FormValues = z.infer<typeof schema>;

interface RegistrationFormProps {
  booking: SocorroBookingState;
}

export default function RegistrationForm({ booking }: RegistrationFormProps) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { first_name: "", last_name: "", email: "", phone: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setError(null);

    try {
      const { data, error: fnErr } = await supabase.functions.invoke(
        "register-socorro-booking",
        {
          body: {
            first_name: values.first_name,
            last_name: values.last_name,
            email: values.email,
            phone: values.phone,
            advisor_id: booking.advisor_id,
            slot_id: booking.slot_id,
            selected_date: booking.date,
            selected_time: booking.time,
          },
        }
      );

      if (fnErr) throw new Error(fnErr.message);
      if (data?.error) throw new Error(data.error);

      const successParams = new URLSearchParams({
        name: values.first_name,
        advisor: booking.advisor_name,
        date: booking.date,
        time: booking.time,
      });
      navigate(`/socorro-isd/booking/success?${successParams.toString()}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  style={{
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#1A4D3E",
                  }}
                >
                  First Name
                </FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  style={{
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#1A4D3E",
                  }}
                >
                  Last Name
                </FormLabel>
                <FormControl>
                  <Input placeholder="Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#1A4D3E",
                }}
              >
                Email
              </FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#1A4D3E",
                }}
              >
                Phone Number
              </FormLabel>
              <FormControl>
                <Input type="tel" placeholder="(555) 555-1234" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <div
            className="p-3"
            style={{
              background: "rgba(239,68,68,0.08)",
              borderRadius: "4px",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <p
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "14px",
                color: "#DC2626",
              }}
            >
              {error}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 transition-colors duration-200"
          style={{
            background: submitting ? "#b8996a" : "#C8A96E",
            color: "#1A4D3E",
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: "15px",
            fontWeight: 700,
            padding: "14px 32px",
            borderRadius: "4px",
            border: "none",
            cursor: submitting ? "not-allowed" : "pointer",
          }}
          onMouseEnter={(e) => {
            if (!submitting) e.currentTarget.style.background = "#b8996a";
          }}
          onMouseLeave={(e) => {
            if (!submitting) e.currentTarget.style.background = "#C8A96E";
          }}
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? "Reserving Your Spot…" : "Confirm Registration"}
        </button>

        <p
          className="text-center"
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: "12px",
            color: "#9CA3AF",
          }}
        >
          By registering you agree to be contacted regarding your appointment.
        </p>
      </form>
    </Form>
  );
}
