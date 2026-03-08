import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const PILLAR_KEYS = [
  { key: "academic_reputation", label: "Academic Reputation" },
  { key: "citations_per_faculty", label: "Citations / Faculty" },
  { key: "employer_reputation", label: "Employer Reputation" },
  { key: "faculty_student_ratio", label: "Faculty-Student Ratio" },
  { key: "international_research_network", label: "Intl Research Network" },
  { key: "employment_outcomes", label: "Employment Outcomes" },
  { key: "sustainability", label: "Sustainability" },
  { key: "international_diversity", label: "Intl Diversity" },
];

const ITEMS_PER_PAGE = 10;

interface UniRow {
  id: string;
  slug: string;
  name: string;
  country: string;
  city: string;
  founded: number | null;
  students: number | null;
  research_focus: string | null;
  domain: string | null;
  academic_reputation: number;
  citations_per_faculty: number;
  employer_reputation: number;
  faculty_student_ratio: number;
  international_research_network: number;
  employment_outcomes: number;
  sustainability: number;
  international_diversity: number;
  highlights: string[];
  is_active: boolean;
}

const emptyUni: Omit<UniRow, "id"> = {
  slug: "", name: "", country: "", city: "", founded: null, students: null,
  research_focus: "", domain: "", academic_reputation: 50, citations_per_faculty: 50,
  employer_reputation: 50, faculty_student_ratio: 50, international_research_network: 50,
  employment_outcomes: 50, sustainability: 50, international_diversity: 50,
  highlights: [], is_active: true,
};

export function UniversityManagerTab() {
  const [universities, setUniversities] = useState<UniRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [editUni, setEditUni] = useState<UniRow | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UniRow | null>(null);
  const [addMode, setAddMode] = useState(false);
  const [addStep, setAddStep] = useState(0);
  const [newUni, setNewUni] = useState(emptyUni);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchUniversities = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("universities").select("*").order("name");
    if (data) setUniversities(data as unknown as UniRow[]);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setLoading(false);
  };

  useEffect(() => { fetchUniversities(); }, []);

  const filtered = universities.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.country.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const handleSaveEdit = async () => {
    if (!editUni) return;
    setSaving(true);
    const { id, ...rest } = editUni;
    const { error } = await supabase.from("universities").update(rest as any).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "University updated!" }); fetchUniversities(); }
    setSaving(false);
    setSheetOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("universities").delete().eq("id", deleteTarget.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "University deleted" }); fetchUniversities(); }
    setDeleteTarget(null);
  };

  const handleAddNew = async () => {
    if (!newUni.name || !newUni.slug || !newUni.country || !newUni.city) {
      toast({ title: "Missing required fields", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("universities").insert(newUni as any);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "University added!" }); fetchUniversities(); setAddMode(false); setNewUni(emptyUni); setAddStep(0); }
    setSaving(false);
  };

  const getAvgScore = (u: UniRow) => {
    const vals = PILLAR_KEYS.map((p) => (u as any)[p.key] || 0);
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-2xl font-bold">University Manager</h2>
        <Button onClick={() => { setAddMode(true); setAddStep(0); setNewUni(emptyUni); }}>
          <Plus className="h-4 w-4 mr-1" /> Add New University
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name or country..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : (
        <>
          <div className="rounded-lg border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead className="text-right">Avg Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((uni) => (
                  <TableRow key={uni.id}>
                    <TableCell className="font-medium">{uni.name}</TableCell>
                    <TableCell>{uni.country}</TableCell>
                    <TableCell>{uni.city}</TableCell>
                    <TableCell className="text-right font-mono">{getAvgScore(uni)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditUni(uni); setSheetOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(uni)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {paged.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No universities found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{filtered.length} total</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                <span className="text-sm">{page + 1} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="font-display">Edit University</SheetTitle>
            <SheetDescription>Modify scores, location, and metadata.</SheetDescription>
          </SheetHeader>
          {editUni && (
            <div className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Name</Label><Input value={editUni.name} onChange={(e) => setEditUni({ ...editUni, name: e.target.value })} /></div>
                <div><Label>Slug</Label><Input value={editUni.slug} onChange={(e) => setEditUni({ ...editUni, slug: e.target.value })} /></div>
                <div><Label>Country</Label><Input value={editUni.country} onChange={(e) => setEditUni({ ...editUni, country: e.target.value })} /></div>
                <div><Label>City</Label><Input value={editUni.city} onChange={(e) => setEditUni({ ...editUni, city: e.target.value })} /></div>
                <div><Label>Founded</Label><Input type="number" value={editUni.founded || ""} onChange={(e) => setEditUni({ ...editUni, founded: parseInt(e.target.value) || null })} /></div>
                <div><Label>Students</Label><Input type="number" value={editUni.students || ""} onChange={(e) => setEditUni({ ...editUni, students: parseInt(e.target.value) || null })} /></div>
                <div className="col-span-2"><Label>Domain</Label><Input value={editUni.domain || ""} onChange={(e) => setEditUni({ ...editUni, domain: e.target.value })} /></div>
                <div className="col-span-2"><Label>Research Focus</Label><Input value={editUni.research_focus || ""} onChange={(e) => setEditUni({ ...editUni, research_focus: e.target.value })} /></div>
              </div>
              <div className="space-y-3 pt-2">
                <h4 className="font-display font-semibold text-sm">Pillar Scores</h4>
                {PILLAR_KEYS.map((p) => (
                  <div key={p.key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{p.label}</span>
                      <span className="font-mono">{(editUni as any)[p.key]}</span>
                    </div>
                    <Slider min={0} max={100} step={0.1} value={[(editUni as any)[p.key]]} onValueChange={([v]) => setEditUni({ ...editUni, [p.key]: v })} />
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" onClick={handleSaveEdit} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete University?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New University Dialog - Multi-Step */}
      <Dialog open={addMode} onOpenChange={setAddMode}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Add New University</DialogTitle>
            <DialogDescription>Step {addStep + 1} of 2: {addStep === 0 ? "Basic Info" : "Pillar Scores"}</DialogDescription>
          </DialogHeader>
          {addStep === 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name *</Label><Input value={newUni.name} onChange={(e) => setNewUni({ ...newUni, name: e.target.value })} /></div>
              <div><Label>Slug *</Label><Input value={newUni.slug} onChange={(e) => setNewUni({ ...newUni, slug: e.target.value })} placeholder="e.g. mit" /></div>
              <div><Label>Country *</Label><Input value={newUni.country} onChange={(e) => setNewUni({ ...newUni, country: e.target.value })} /></div>
              <div><Label>City *</Label><Input value={newUni.city} onChange={(e) => setNewUni({ ...newUni, city: e.target.value })} /></div>
              <div><Label>Founded</Label><Input type="number" value={newUni.founded || ""} onChange={(e) => setNewUni({ ...newUni, founded: parseInt(e.target.value) || null })} /></div>
              <div><Label>Students</Label><Input type="number" value={newUni.students || ""} onChange={(e) => setNewUni({ ...newUni, students: parseInt(e.target.value) || null })} /></div>
              <div className="col-span-2"><Label>Domain</Label><Input value={newUni.domain || ""} onChange={(e) => setNewUni({ ...newUni, domain: e.target.value })} /></div>
              <div className="col-span-2"><Label>Research Focus</Label><Input value={newUni.research_focus || ""} onChange={(e) => setNewUni({ ...newUni, research_focus: e.target.value })} /></div>
            </div>
          )}
          {addStep === 1 && (
            <div className="space-y-3">
              {PILLAR_KEYS.map((p) => (
                <div key={p.key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{p.label}</span>
                    <span className="font-mono">{(newUni as any)[p.key]}</span>
                  </div>
                  <Slider min={0} max={100} step={0.1} value={[(newUni as any)[p.key]]} onValueChange={([v]) => setNewUni({ ...newUni, [p.key]: v })} />
                </div>
              ))}
            </div>
          )}
          <DialogFooter className="gap-2">
            {addStep > 0 && <Button variant="outline" onClick={() => setAddStep(0)}>Back</Button>}
            {addStep === 0 && <Button onClick={() => setAddStep(1)}>Next: Scores</Button>}
            {addStep === 1 && <Button onClick={handleAddNew} disabled={saving}>{saving ? "Adding..." : "Add University"}</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
