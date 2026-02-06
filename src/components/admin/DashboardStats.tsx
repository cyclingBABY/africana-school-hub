import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DashboardStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    under_review: 0,
    approved: 0,
    rejected: 0,
  });
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentApplications();
  }, []);

  const fetchStats = async () => {
    const { data, error } = await supabase
      .from('applications')
      .select('status');

    if (data) {
      const counts = {
        total: data.length,
        pending: data.filter(a => a.status === 'pending').length,
        under_review: data.filter(a => a.status === 'under_review').length,
        approved: data.filter(a => a.status === 'approved').length,
        rejected: data.filter(a => a.status === 'rejected').length,
      };
      setStats(counts);
    }
    setIsLoading(false);
  };

  const fetchRecentApplications = async () => {
    const { data } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      setRecentApplications(data);
    }
  };

  const statCards = [
    { label: "Total Applications", value: stats.total, icon: FileText, color: "bg-primary" },
    { label: "Pending Review", value: stats.pending, icon: Clock, color: "bg-amber-500" },
    { label: "Under Review", value: stats.under_review, icon: Eye, color: "bg-blue-500" },
    { label: "Approved", value: stats.approved, icon: CheckCircle, color: "bg-emerald-500" },
    { label: "Rejected", value: stats.rejected, icon: XCircle, color: "bg-red-500" },
  ];

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
      <div>
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Overview of admission applications</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {recentApplications.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No applications yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Class</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.map((app) => (
                    <tr key={app.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">
                        {app.student_first_name} {app.student_last_name}
                      </td>
                      <td className="py-3 px-4 uppercase">{app.class_level}</td>
                      <td className="py-3 px-4 capitalize">{app.student_type}</td>
                      <td className="py-3 px-4">
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(app.status)}`}>
                          {app.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
