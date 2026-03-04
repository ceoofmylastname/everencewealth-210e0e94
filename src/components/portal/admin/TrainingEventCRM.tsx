import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, RefreshCw, Download, Search } from "lucide-react";

interface TrainingLead {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    audit_answers: any;
    created_at: string;
}

export function TrainingEventCRM() {
    const [leads, setLeads] = useState<TrainingLead[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        try {
            const { data, error } = await (supabase as any)
                .from("recruit_leads")
                .select("id, name, email, phone, status, audit_answers, created_at")
                .eq("status", "March21Event")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching event leads:", error);
            } else if (data) {
                setLeads(data as TrainingLead[]);
            }
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function downloadCsv() {
        if (!leads.length) return;

        const headers = ["Registration Date", "Name", "Email", "Phone", "10 Day Reminder", "5 Day Reminder", "24 Hr Reminder"];
        const rows = leads.map(sub => {
            const answers = typeof sub.audit_answers === 'string' ? JSON.parse(sub.audit_answers) : (sub.audit_answers || {});
            const dateStr = new Date(sub.created_at).toLocaleDateString();
            return `"${dateStr}","${sub.name}","${sub.email}","${sub.phone}","${answers.reminder_10d_sent ? 'Sent' : 'Pending'}","${answers.reminder_5d_sent ? 'Sent' : 'Pending'}","${answers.reminder_24h_sent ? 'Sent' : 'Pending'}"`;
        });

        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `broker_training_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const filtered = leads.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 mt-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)]">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 justify-between items-center">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search registrations..."
                            className="pl-9 border-gray-200 bg-white placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-[#1A4D3E]"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="gap-2">
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                        </Button>
                        <Button variant="outline" size="sm" onClick={downloadCsv} disabled={leads.length === 0} className="gap-2 text-[#1A4D3E] border-[#1A4D3E]/30 hover:bg-[#1A4D3E]/5">
                            <Download className="w-4 h-4" /> Export CSV
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-6 h-6 border-4 border-[#1A4D3E] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                                <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Date Registered</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Name</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Contact</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500 text-center">Reminders Sent</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-12 text-gray-400">
                                        No event registrations found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((l) => {
                                    const answers = typeof l.audit_answers === 'string' ? JSON.parse(l.audit_answers) : (l.audit_answers || {});
                                    return (
                                        <TableRow key={l.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                                            <TableCell className="text-gray-500 text-sm whitespace-nowrap">
                                                {new Date(l.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="font-medium text-gray-900">{l.name}</TableCell>
                                            <TableCell>
                                                <div className="text-sm text-gray-700">{l.email}</div>
                                                <div className="text-xs text-gray-400 mt-0.5">{l.phone}</div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${answers.reminder_10d_sent ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>10D</span>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${answers.reminder_5d_sent ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>5D</span>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${answers.reminder_24h_sent ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>24H</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
