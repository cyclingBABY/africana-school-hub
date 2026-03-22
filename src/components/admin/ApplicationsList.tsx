import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  X,
  Edit3,
  DownloadCloud
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ApplicationsListProps {
  staffId: string;
}

const ApplicationsList = ({ staffId }: ApplicationsListProps) => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Database['public']['Tables']['applications']['Row'][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<Database['public']['Tables']['applications']['Row'] | null>(null);
  const [editingApp, setEditingApp] = useState<Database['public']['Tables']['applications']['Row'] | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const itemsPerPage = 10;

  // Zod schema for edit form (matching Apply.tsx)
  const editApplicationSchema = z.object({
    student_first_name: z.string().min(2, "First name is required").max(50),
    student_last_name: z.string().min(2, "Last name is required").max(50),
    student_date_of_birth: z.string().min(1, "Date of birth is required"),
    student_gender: z.string().min(1, "Gender is required"),
    student_religion: z.string().optional(),
    class_level: z.string().min(1, "Class level is required"),
    student_type: z.string().min(1, "Student type is required"),
    parent_name: z.string().min(2, "Parent name is required").max(100),
    parent_email: z.string().email("Valid email is required"),
    parent_phone: z.string().min(10, "Valid phone number is required").max(15),
    parent_relationship: z.string().min(1, "Relationship is required"),
    parent_address: z.string().min(5, "Address is required").max(200),
    parent_occupation: z.string().optional(),
    previous_school_name: z.string().optional(),
    previous_school_class: z.string().optional(),
    previous_school_leaving_reason: z.string().optional(),
    emergency_contact_name: z.string().min(2, "Emergency contact name is required").max(100),
    emergency_contact_phone: z.string().min(10, "Emergency contact phone is required").max(15),
    emergency_contact_relationship: z.string().min(1, "Relationship is required"),
  });

  type EditApplicationData = z.infer<typeof editApplicationSchema>;

  const editForm = useForm<EditApplicationData>({
    resolver: zodResolver(editApplicationSchema),
    defaultValues: {
      student_first_name: "",
      student_last_name: "",
      student_date_of_birth: "",
      student_gender: "",
      student_religion: "",
      class_level: "",
      student_type: "",
      parent_name: "",
      parent_email: "",
      parent_phone: "",
      parent_relationship: "",
      parent_address: "",
      parent_occupation: "",
      previous_school_name: "",
      previous_school_class: "",
      previous_school_leaving_reason: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      emergency_contact_relationship: "",
    },
  });


  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setApplications(data);
    }
    setIsLoading(false);
  };

  const fetchNotes = async (appId: string) => {
    const { data } = await supabase
      .from('application_notes')
      .select(`
        *,
        staff_members (full_name)
      `)
      .eq('application_id', appId)
      .order('created_at', { ascending: false });

    if (data) {
      setNotes(data);
    }
  };

  const handleViewDetails = async (app: any) => {
    setSelectedApp(app);
    setIsDetailOpen(true);
    await fetchNotes(app.id);
  };

  const handleStatusChange = async (appId: string, newStatus: "pending" | "under_review" | "approved" | "rejected") => {
    const { error } = await supabase
      .from('applications')
      .update({ 
        status: newStatus,
        reviewed_by: staffId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', appId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Status Updated",
        description: `Application marked as ${newStatus.replace('_', ' ')}`,
      });
      fetchApplications();
      if (selectedApp?.id === appId) {
        setSelectedApp({ ...selectedApp, status: newStatus });
      }
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedApp) return;

    const { error } = await supabase
      .from('application_notes')
      .insert({
        application_id: selectedApp.id,
        staff_id: staffId,
        note: newNote.trim(),
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    } else {
      setNewNote("");
      fetchNotes(selectedApp.id);
      toast({
        title: "Note Added",
        description: "Your note has been saved",
      });
    }
  };

  const handleExport = () => {
    const filteredApps = getFilteredApplications();
    const csvContent = [
      ["Name", "Class", "Type", "Parent", "Phone", "Email", "Status", "Date"].join(","),
      ...filteredApps.map(app => [
        `"${app.student_first_name} ${app.student_last_name}"`,
        app.class_level.toUpperCase(),
        app.student_type,
        `"${app.parent_name}"`,
        app.parent_phone,
        app.parent_email,
        app.status,
        new Date(app.created_at).toLocaleDateString(),
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applications-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Exported ${filteredApps.length} applications`,
    });
  };

  const getFilteredApplications = () => {
    return applications.filter(app => {
      const matchesSearch = 
        `${app.student_first_name} ${app.student_last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.parent_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.parent_phone.includes(searchTerm);
      
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const filteredApps = getFilteredApplications();
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const paginatedApps = filteredApps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-100 text-amber-800",
      under_review: "bg-blue-100 text-blue-800",
      approved: "bg-emerald-100 text-emerald-800",
      rejected: "bg-red-100 text-red-800",
    };
    return styles[status] || "bg-muted text-muted-foreground";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {selectedApps.length > 0 && (
        <div className="flex gap-2 p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">{selectedApps.length} selected</span>
          <Select onValueChange={async (status) => {
            for (const id of selectedApps) {
              await handleStatusChange(id, status as any);
            }
            setSelectedApps([]);
            setSelectAll(false);
          }}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Bulk update status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport}>
            Export Selected
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setSelectedApps([])}>
            Clear Selection
          </Button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Online Applications</h2>
          <p className="text-muted-foreground">Manage student admission applications</p>
        </div>
        <Button onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export All CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications Table */}
      <Card>
        <CardContent className="p-0">
          {paginatedApps.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No applications found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
<th className="w-12">
  <Checkbox
    checked={selectAll}
    onCheckedChange={(checked) => {
      setSelectAll(checked as boolean);
      if (checked) {
        setSelectedApps(paginatedApps.map(app => app.id));
      } else {
        setSelectedApps([]);
      }
    }}
    aria-label="Select all"
  />
</th>
<th className="text-left py-3 px-4 font-medium text-muted-foreground">Student</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Class</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Parent Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
{paginatedApps.map((app) => (
                    <tr key={app.id} className="border-b border-border hover:bg-muted/50">
                      <td className="w-12 p-3">
                        <Checkbox
                          checked={selectedApps.includes(app.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedApps([...selectedApps, app.id]);
                            } else {
                              setSelectedApps(selectedApps.filter(id => id !== app.id));
                            }
                          }}
                          aria-label={`Select ${app.student_first_name}`}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{app.student_first_name} {app.student_last_name}</p>
                          <p className="text-sm text-muted-foreground capitalize">{app.student_gender}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 uppercase">{app.class_level}</td>
                      <td className="py-3 px-4 capitalize">{app.student_type}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm">{app.parent_phone}</p>
                          <p className="text-sm text-muted-foreground">{app.parent_email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(app.status)}`}>
                          {app.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(app)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingApp(app);
                            editForm.reset({
                              student_first_name: app.student_first_name,
                              student_last_name: app.student_last_name,
                              student_date_of_birth: app.student_date_of_birth,
                              student_gender: app.student_gender,
                              student_religion: app.student_religion || '',
                              class_level: app.class_level,
                              student_type: app.student_type,
                              parent_name: app.parent_name,
                              parent_email: app.parent_email,
                              parent_phone: app.parent_phone,
                              parent_relationship: app.parent_relationship,
                              parent_address: app.parent_address,
                              parent_occupation: app.parent_occupation || '',
                              previous_school_name: app.previous_school_name || '',
                              previous_school_class: app.previous_school_class || '',
                              previous_school_leaving_reason: app.previous_school_leaving_reason || '',
                              emergency_contact_name: app.emergency_contact_name,
                              emergency_contact_phone: app.emergency_contact_phone,
                              emergency_contact_relationship: app.emergency_contact_relationship,
                            });
                            setIsEditOpen(true);
                          }}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredApps.length)} of {filteredApps.length}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit Application Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">Edit Application</DialogTitle>
          </DialogHeader>
          {editingApp && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(async (data) => {
                const updateData: Database['public']['Tables']['applications']['Update'] = {
                  ...data,
                  updated_at: new Date().toISOString(),
                  reviewed_by: staffId,
                };
                const { error } = await supabase
                  .from('applications')
                  .update(updateData)
                  .eq('id', editingApp.id);
                if (error) {
                  toast({ title: "Error", description: error.message, variant: "destructive" });
                } else {
                  toast({ title: "Application Updated" });
                  fetchApplications();
                  setIsEditOpen(false);
                  setEditingApp(null);
                }
              })} className="space-y-6">
                {/* Student Info */}
                <section>
                  <h3 className="font-semibold mb-4">Student Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={editForm.control} name="student_first_name" render={({ field }) => (
                      <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={editForm.control} name="student_last_name" render={({ field }) => (
                      <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={editForm.control} name="student_date_of_birth" render={({ field }) => (
                      <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={editForm.control} name="student_gender" render={({ field }) => (
                      <FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                    )} />
                    {/* Add more fields similarly... */}
                  </div>
                </section>
                <Button type="submit" className="w-full">Save Changes</Button>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* Application Details Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">
              Application Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedApp && (
            <div className="space-y-6">
              {/* Documents Section */}
              <section>
                <h3 className="font-semibold mb-3">Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedApp.birth_certificate_url && (
                    <Button variant="outline" onClick={() => window.open(selectedApp.birth_certificate_url!, '_blank')}>
                      <DownloadCloud className="w-4 h-4 mr-2" />
                      Birth Certificate
                    </Button>
                  )}
                  {selectedApp.passport_photo_url && (
                    <Button variant="outline" onClick={() => window.open(selectedApp.passport_photo_url!, '_blank')}>
                      <DownloadCloud className="w-4 h-4 mr-2" />
                      Passport Photo
                    </Button>
                  )}
                  {selectedApp.previous_results_url && (
                    <Button variant="outline" onClick={() => window.open(selectedApp.previous_results_url!, '_blank')}>
                      <DownloadCloud className="w-4 h-4 mr-2" />
                      Previous Results
                    </Button>
                  )}
                </div>
              </section>
              {/* Status Update */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <span className="text-sm font-medium">Update Status:</span>
                <Select 
                  value={selectedApp.status} 
                  onValueChange={(value: "pending" | "under_review" | "approved" | "rejected") => handleStatusChange(selectedApp.id, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Student Info */}
              <div>
                <h3 className="font-semibold mb-3">Student Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium">{selectedApp.student_first_name} {selectedApp.student_last_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date of Birth:</span>
                    <p className="font-medium">{new Date(selectedApp.student_date_of_birth).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gender:</span>
                    <p className="font-medium capitalize">{selectedApp.student_gender}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Religion:</span>
                    <p className="font-medium capitalize">{selectedApp.student_religion || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Class Level:</span>
                    <p className="font-medium uppercase">{selectedApp.class_level}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Student Type:</span>
                    <p className="font-medium capitalize">{selectedApp.student_type}</p>
                  </div>
                </div>
              </div>

              {/* Parent Info */}
              <div>
                <h3 className="font-semibold mb-3">Parent/Guardian Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium">{selectedApp.parent_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Relationship:</span>
                    <p className="font-medium capitalize">{selectedApp.parent_relationship}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{selectedApp.parent_email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium">{selectedApp.parent_phone}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Address:</span>
                    <p className="font-medium">{selectedApp.parent_address}</p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="font-semibold mb-3">Emergency Contact</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium">{selectedApp.emergency_contact_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium">{selectedApp.emergency_contact_phone}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Relationship:</span>
                    <p className="font-medium capitalize">{selectedApp.emergency_contact_relationship}</p>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Notes
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Add a note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {notes.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No notes yet</p>
                    ) : (
                      notes.map((note) => (
                        <div key={note.id} className="p-3 bg-muted rounded-lg">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>{note.staff_members?.full_name}</span>
                            <span>{new Date(note.created_at).toLocaleString()}</span>
                          </div>
                          <p className="text-sm">{note.note}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicationsList;
