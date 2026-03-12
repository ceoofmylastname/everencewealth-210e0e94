import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useSocorroAvailability } from "@/hooks/useSocorroAvailability";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const WORKSHOP_DATES = [
  { value: "2026-03-24", label: "Mon March 24" },
  { value: "2026-03-25", label: "Tue March 25" },
  { value: "2026-03-26", label: "Wed March 26" },
  { value: "2026-03-27", label: "Thu March 27" },
  { value: "2026-03-28", label: "Fri March 28" },
];

const TIME_SLOTS = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
];

interface SocorroAvailabilityManagerProps {
  advisorId: string;
}

export default function SocorroAvailabilityManager({ advisorId }: SocorroAvailabilityManagerProps) {
  const { data: slots = [], isLoading } = useSocorroAvailability(advisorId);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(WORKSHOP_DATES[0].value);
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[0]);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const addSlot = async () => {
    setAdding(true);
    try {
      const { error } = await supabase
        .from("socorro_advisor_availability" as any)
        .insert({
          advisor_id: advisorId,
          event_date: selectedDate,
          time_slot: selectedTime,
        });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["socorro-availability", advisorId] });
      toast({ title: "Slot added", description: `${selectedDate} at ${selectedTime}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  const removeSlot = async (slotId: string) => {
    setDeletingId(slotId);
    try {
      const { error } = await supabase
        .from("socorro_advisor_availability" as any)
        .delete()
        .eq("id", slotId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["socorro-availability", advisorId] });
      toast({ title: "Slot removed" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add slot form */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WORKSHOP_DATES.map((d) => (
                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
          <Select value={selectedTime} onValueChange={setSelectedTime}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={addSlot} disabled={adding} className="bg-[#1A4D3E] hover:bg-[#163f33]">
          {adding ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
          Add Slot
        </Button>
      </div>

      {/* Slots table */}
      {isLoading ? (
        <div className="flex items-center gap-2 py-8 text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading slots…
        </div>
      ) : slots.length === 0 ? (
        <p className="py-8 text-center text-gray-400 text-sm">No availability slots yet. Add your first one above.</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slots.map((slot) => (
                <TableRow key={slot.id}>
                  <TableCell className="font-medium">{slot.event_date}</TableCell>
                  <TableCell>{slot.time_slot}</TableCell>
                  <TableCell>
                    {slot.is_booked ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        Booked
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Available
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {!slot.is_booked && (
                      <button
                        onClick={() => removeSlot(slot.id)}
                        disabled={deletingId === slot.id}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        {deletingId === slot.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
