import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, Eye, User, Phone, Mail, 
  MapPin, Calendar, Loader2, Camera, ExternalLink,
  CheckCircle2, XCircle, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const ApplicationsList = () => {
  const { toast } = useToast();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isActionPending, setIsActionPending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const fetchStudents = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setApps(data);
    setLoading(false);
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleStatusChange = async (id: string, newStatus: 'approved' | 'rejected') => {
    setIsActionPending(true);
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: `Application ${newStatus === 'approved' ? 'Approved' : 'Rejected'}`,
        description: `Notification email is being sent to ${selectedStudent.parent_email}`,
        variant: newStatus === 'approved' ? 'default' : 'destructive',
      });

      // Refresh list and close modal
      await fetchStudents();
      setSelectedStudent(null);
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsActionPending(false);
    }
  };

  const filtered = apps.filter(s => 
    `${s.student_first_name} ${s.student_last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-serif">Admissions Management</h2>
        <Input 
          placeholder="Search students..." 
          className="max-w-xs" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((student) => (
          <Card key={student.id} className="border-none shadow-sm hover:ring-1 ring-primary/20 transition-all">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-100 border">
                {student.passport_photo_url ? (
                  <img src={student.passport_photo_url} className="h-full w-full object-cover" />
                ) : (
                  <User className="p-2 text-slate-300 w-full h-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 truncate">
                  {student.student_first_name} {student.student_last_name}
                </p>
                <div className="flex items-center gap-2">
                   <Badge variant={student.status === 'approved' ? 'default' : student.status === 'rejected' ? 'destructive' : 'secondary'} className="text-[9px] h-4">
                    {student.status}
                  </Badge>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">{student.class_level}</span>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setSelectedStudent(student)}>
                <Eye size={18} />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedStudent} onOpenChange={() => !isActionPending && setSelectedStudent(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl">
          {selectedStudent && (
            <div className="flex flex-col">
              {/* Header */}
              <div className="bg-slate-900 p-8 text-white flex items-center gap-6">
                <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-white/20">
                  <img src={selectedStudent.passport_photo_url} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{selectedStudent.student_first_name} {selectedStudent.student_last_name}</h3>
                  <p className="text-slate-400 text-sm italic">{selectedStudent.parent_email}</p>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 grid grid-cols-2 gap-6">
                <div className="space-y-4">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Student Info</p>
                   <div className="text-sm space-y-1">
                     <p><strong>DOB:</strong> {selectedStudent.student_date_of_birth}</p>
                     <p><strong>Gender:</strong> {selectedStudent.student_gender}</p>
                     <p><strong>Class:</strong> {selectedStudent.class_level.toUpperCase()}</p>
                   </div>
                </div>
                <div className="space-y-4">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Academic Records</p>
                   <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.open(selectedStudent.previous_results_url, '_blank')}
                   >
                     <ExternalLink className="mr-2 h-4 w-4" /> View Report Card
                   </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 bg-slate-50 border-t flex justify-between items-center px-8">
                <div className="flex items-center gap-2 text-slate-400">
                  <AlertCircle size={14} />
                  <span className="text-[10px]">Action will trigger an automated email to parent.</span>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="destructive" 
                    disabled={isActionPending}
                    onClick={() => handleStatusChange(selectedStudent.id, 'rejected')}
                  >
                    {isActionPending ? <Loader2 className="animate-spin h-4 w-4" /> : <><XCircle className="mr-2 h-4 w-4"/> Reject</>}
                  </Button>
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={isActionPending}
                    onClick={() => handleStatusChange(selectedStudent.id, 'approved')}
                  >
                    {isActionPending ? <Loader2 className="animate-spin h-4 w-4" /> : <><CheckCircle2 className="mr-2 h-4 w-4"/> Approve</>}
                  </Button>
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