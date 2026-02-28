import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Video, RefreshCw, Eye, Download, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface RecruitLead {
    id: string;
    name: string;
    email: string;
    phone: string;
    audit_score: number;
    video_watch_time: number;
    status: string;
    audit_answers: Record<string, any>;
    created_at: string;
}

export function RecruitCRM() {
    const [leads, setLeads] = useState<RecruitLead[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [savingVideo, setSavingVideo] = useState(false);
    const [viewAnswersLead, setViewAnswersLead] = useState<RecruitLead | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        try {
            // 1. Fetch leads
            const { data: leadsData, error: leadsError } = await supabase
                .from("recruit_leads")
                .select("*")
                .order("created_at", { ascending: false });

            if (leadsError && leadsError.code !== 'PGRST205') {
                console.error("Error fetching leads:", leadsError);
            } else if (leadsData) {
                setLeads(leadsData);
            }

            // 2. Fetch config
            const { data: settingsData, error: settingsError } = await supabase
                .from("recruit_settings")
                .select("value")
                .eq("key", "briefing_video_url")
                .maybeSingle();

            if (!settingsError && settingsData) {
                setVideoUrl(settingsData.value);
            } else {
                setVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
            }
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSaveVideoUrl() {
        setSavingVideo(true);
        try {
            const { data: exist } = await supabase.from('recruit_settings').select('id').eq('key', 'briefing_video_url').maybeSingle();

            let error;
            if (exist) {
                const res = await supabase.from('recruit_settings').update({ value: videoUrl }).eq('key', 'briefing_video_url');
                error = res.error;
            } else {
                const res = await supabase.from('recruit_settings').insert({ key: 'briefing_video_url', value: videoUrl });
                error = res.error;
            }

            if (error && error.code !== 'PGRST205') throw error;
            if (error?.code === 'PGRST205') {
                toast({ title: "Database Sync Required", description: "The recruit_settings table has not been created in the database yet. Push migrations.", variant: "destructive" });
            } else {
                toast({ title: "Video URL Saved", description: "The briefing masterclass video has been updated successfully." });
            }
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setSavingVideo(false);
        }
    }

    function downloadCsv() {
        if (!leads.length) return;

        const headers = ["Date", "Name", "Email", "Phone", "Score", "Comments", "Status"];
        const rows = leads.map(sub => {
            const answers = sub.audit_answers || {};
            const comments = answers.comments || "";
            const dateStr = new Date(sub.created_at).toLocaleDateString();
            return `"${dateStr}","${sub.name}","${sub.email}","${sub.phone}","${sub.audit_score}","${comments.replace(/"/g, '""')}","${sub.status}"`;
        });

        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `everence_recruits_${new Date().toISOString().split('T')[0]}.csv`);
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
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Video className="w-5 h-5 text-[#D4AF37]" /> Briefing Masterclass Settings
                    </h2>
                    <p className="text-sm text-gray-500 mt-1 max-w-lg">
                        Update the YouTube or Zoom recording URL that newly captured recruits will see precisely when they hit the /briefing gate.
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Input
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full md:w-80 border-gray-200"
                    />
                    <Button
                        className="bg-[#1A4D3E] hover:bg-[#143d30]"
                        onClick={handleSaveVideoUrl}
                        disabled={savingVideo}
                    >
                        {savingVideo ? "Saving..." : "Save URL"}
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)]">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 justify-between items-center">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search recruits..."
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
                                <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Date</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Name</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email & Phone</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500 text-center">Audit Score</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500 text-center">Status</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500 text-right">Data</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-gray-400">
                                        No recruits captured yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((l) => (
                                    <TableRow key={l.id} className="border-b border-gray-100 hover:bg-gray-50/50 group">
                                        <TableCell className="text-gray-500 text-sm whitespace-nowrap">
                                            {new Date(l.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="font-medium text-gray-900">{l.name}</TableCell>
                                        <TableCell>
                                            <div className="text-sm text-gray-700">{l.email}</div>
                                            <div className="text-xs text-gray-400 mt-0.5">{l.phone}</div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className={`inline-flex items-center justify-center font-bold px-3 py-1 rounded-full text-xs ${l.audit_score >= 35 ? "bg-emerald-100 text-emerald-700" :
                                                    l.audit_score >= 20 ? "bg-amber-100 text-amber-700" :
                                                        "bg-red-100 text-red-700"
                                                }`}>
                                                {l.audit_score} / 40
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="inline-flex items-center bg-gray-100 text-gray-600 rounded-lg text-xs px-2.5 py-1 font-medium border border-gray-200 uppercase tracking-wider">
                                                {l.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => setViewAnswersLead(l)} className="text-[#1A4D3E] hover:bg-[#F0F5F3]">
                                                <Eye className="w-4 h-4 mr-1.5" /> View Audit Intels
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>

            <Dialog open={!!viewAnswersLead} onOpenChange={(o) => (!o && setViewAnswersLead(null))}>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Audit Dossier: {viewAnswersLead?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 mt-4">
                        <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div>
                                <p className="text-gray-500 mb-1 leading-none">Email</p>
                                <p className="font-semibold text-gray-900">{viewAnswersLead?.email}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1 leading-none">Phone</p>
                                <p className="font-semibold text-gray-900">{viewAnswersLead?.phone}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1 leading-none">Final Audit Score</p>
                                <p className="font-semibold text-[#D4AF37]">{viewAnswersLead?.audit_score} / 40 points</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold border-b pb-2">Vibe Check Answers</h3>
                            {viewAnswersLead?.audit_answers && Object.entries(viewAnswersLead.audit_answers).filter(([k]) => k !== 'comments').map(([qIdx, answerLabel]) => (
                                <div key={qIdx} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-semibold">Question {qIdx}</p>
                                    <p className="text-sm font-medium text-gray-800">{String(answerLabel)}</p>
                                </div>
                            ))}

                            {viewAnswersLead?.audit_answers?.comments && (
                                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 mt-4">
                                    <p className="text-xs text-amber-600/60 uppercase tracking-wider mb-2 font-semibold flex items-center gap-1.5 border-b border-amber-200/50 pb-2">
                                        Message / Comments
                                    </p>
                                    <p className="text-sm font-medium text-amber-900 italic">
                                        "{viewAnswersLead.audit_answers.comments}"
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
