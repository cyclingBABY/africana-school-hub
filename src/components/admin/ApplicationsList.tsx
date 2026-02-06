import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
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
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Applications</h2>
          <p className="text-muted-foreground">Manage student admission applications</p>
        </div>
        <Button onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
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
              {/* Status Update */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <span className="text-sm font-medium">Update Status:</span>
                <Select 
                  value={selectedApp.status} 
                  onValueChange={(value) => handleStatusChange(selectedApp.id, value)}
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
