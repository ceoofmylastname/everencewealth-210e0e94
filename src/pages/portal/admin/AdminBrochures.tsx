import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, Search, Trash2, Pencil, Download, BookOpen, MapPin, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia",
  "Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland",
  "Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey",
  "New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina",
  "South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"
];

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "tax_planning", label: "Tax Planning" },
  { value: "retirement_strategies", label: "Retirement Strategies" },
  { value: "iul_education", label: "IUL Education" },
  { value: "estate_planning", label: "Estate Planning" },
];

export default function AdminBrochures() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: brochures, isLoading } = useQuery({
    queryKey: ["admin-brochures"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brochures")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("brochures").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brochures"] });
      toast({ title: "Brochure deleted" });
    },
  });

  const filtered = brochures?.filter((b) => {
    const matchesSearch = !search || b.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || b.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const [stateDialogOpen, setStateDialogOpen] = useState(false);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [stateGenerating, setStateGenerating] = useState(false);
  const [stateProgress, setStateProgress] = useState(0);

  const toggleState = (s: string) => {
    setSelectedStates((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const generateStateGuides = async () => {
    if (!selectedStates.length) return;
    setStateGenerating(true);
    setStateProgress(0);
    for (let i = 0; i < selectedStates.length; i++) {
      const state = selectedStates[i];
      try {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-guide-content`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
          body: JSON.stringify({
            category: "retirement_strategies",
            topic: `Retirement Planning in ${state}`,
            target_audience: "pre-retirees aged 50-65",
            language: "en",
            state,
          }),
        });
      } catch (e) { console.error(`Failed: ${state}`, e); }
      setStateProgress(i + 1);
    }
    toast({ title: "State guides generated!", description: `${selectedStates.length} guides created as drafts.` });
    queryClient.invalidateQueries({ queryKey: ["admin-brochures"] });
    setStateDialogOpen(false);
    setStateGenerating(false);
    setSelectedStates([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
            Brochures
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage educational guides and lead magnets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setStateDialogOpen(true)}>
            <MapPin className="h-4 w-4 mr-2" /> Generate State Guides
          </Button>
          <Button asChild>
            <Link to="/portal/admin/brochures/new">
              <Plus className="h-4 w-4 mr-2" /> New Brochure
            </Link>
          </Button>
        </div>
      </div>

      {/* State Guides Dialog */}
      <Dialog open={stateDialogOpen} onOpenChange={setStateDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate State Retirement Guides</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Select states to generate retirement planning guides for. Each will be created as a draft brochure.</p>
          <div className="flex gap-2 mb-3">
            <Button variant="outline" size="sm" onClick={() => setSelectedStates([...US_STATES])}>Select All</Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedStates([])}>Clear</Button>
          </div>
          <div className="grid grid-cols-2 gap-1.5 max-h-[40vh] overflow-y-auto">
            {US_STATES.map((s) => (
              <label key={s} className="flex items-center gap-2 text-sm py-1 cursor-pointer hover:bg-muted/50 px-2 rounded">
                <Checkbox checked={selectedStates.includes(s)} onCheckedChange={() => toggleState(s)} />
                {s}
              </label>
            ))}
          </div>
          {stateGenerating && (
            <div className="text-sm text-muted-foreground">
              Progress: {stateProgress}/{selectedStates.length}
            </div>
          )}
          <Button onClick={generateStateGuides} disabled={stateGenerating || !selectedStates.length} className="w-full">
            {stateGenerating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating {stateProgress}/{selectedStates.length}...</> : `Generate ${selectedStates.length} State Guide${selectedStates.length !== 1 ? 's' : ''}`}
          </Button>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : !filtered?.length ? (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 text-muted-foreground">No brochures found</p>
          <Button asChild className="mt-4" variant="outline">
            <Link to="/portal/admin/brochures/new">Create your first brochure</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Downloads</TableHead>
                <TableHead className="text-center">Gated</TableHead>
                <TableHead className="text-center">Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium max-w-[300px] truncate">{b.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {b.category?.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={b.status === "published" ? "default" : "secondary"}>
                      {b.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="flex items-center justify-center gap-1 text-sm">
                      <Download className="h-3 w-3" /> {b.download_count ?? 0}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">{b.gated ? "Yes" : "No"}</TableCell>
                  <TableCell className="text-center">{b.featured ? "⭐" : "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/portal/admin/brochures/${b.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete brochure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{b.title}" and all download records.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate(b.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
