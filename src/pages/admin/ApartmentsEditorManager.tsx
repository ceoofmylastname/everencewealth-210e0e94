import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, Plus, Trash2, UserPlus, Users } from "lucide-react";

interface Editor {
  user_id: string;
  email: string;
  created_at: string;
}

const ApartmentsEditorManager = () => {
  const [editors, setEditors] = useState<Editor[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adding, setAdding] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const fetchEditors = useCallback(async () => {
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;

    const { data, error } = await supabase.functions.invoke("manage-apartments-editors", {
      method: "POST",
      body: { action: "list" },
    });

    if (error) {
      toast({ title: "Error loading editors", description: error.message, variant: "destructive" });
    } else if (data?.editors) {
      setEditors(data.editors);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchEditors(); }, [fetchEditors]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setAdding(true);

    const { data, error } = await supabase.functions.invoke("manage-apartments-editors", {
      method: "POST",
      body: { action: "add", email, password: password || undefined },
    });

    if (error || data?.error) {
      toast({ title: "Failed to add editor", description: error?.message || data?.error, variant: "destructive" });
    } else {
      toast({ title: "Editor added", description: `${email} now has apartments editor access` });
      setEmail("");
      setPassword("");
      fetchEditors();
    }
    setAdding(false);
  };

  const handleRemove = async () => {
    if (!removeId) return;
    const { data, error } = await supabase.functions.invoke("manage-apartments-editors", {
      method: "POST",
      body: { action: "remove", user_id: removeId },
    });

    if (error || data?.error) {
      toast({ title: "Failed to remove editor", description: error?.message || data?.error, variant: "destructive" });
    } else {
      toast({ title: "Editor removed" });
      fetchEditors();
    }
    setRemoveId(null);
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Apartments Editors</h1>
        </div>

        {/* Add Editor */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" />Add Editor</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="flex gap-3 items-end flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <Label>Email *</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="editor@example.com" required />
              </div>
              <div className="min-w-[200px]">
                <Label>Password (for new accounts)</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank if user exists" />
              </div>
              <Button type="submit" disabled={adding}>
                {adding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Add Editor
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2">If the user doesn't exist, provide a password to create their account.</p>
          </CardContent>
        </Card>

        {/* Editors List */}
        <Card>
          <CardHeader><CardTitle>Current Editors</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : editors.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No apartments editors yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editors.map((editor) => (
                    <TableRow key={editor.user_id}>
                      <TableCell>{editor.email}</TableCell>
                      <TableCell>{new Date(editor.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" onClick={() => setRemoveId(editor.user_id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Remove Confirmation */}
        <AlertDialog open={!!removeId} onOpenChange={() => setRemoveId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Editor Access?</AlertDialogTitle>
              <AlertDialogDescription>This will revoke their apartments editor access. They will no longer be able to edit apartments content.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRemove}>Remove</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default ApartmentsEditorManager;
