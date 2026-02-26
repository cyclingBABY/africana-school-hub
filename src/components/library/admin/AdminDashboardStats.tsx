import { mockStats, mockLoans, mockReservations } from "@/lib/mock-data";

const AdminDashboardStats = () => {
  const overdueLoans = mockLoans.filter((l) => l.status === "overdue");

  const statCards = [
    {
      label: "Physical Books",
      value: mockStats.totalPhysicalBooks.toLocaleString(),
      change: "+120 this month",
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      label: "eBooks",
      value: mockStats.totalEbooks.toLocaleString(),
      change: "+45 this month",
      color: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      label: "Active Members",
      value: mockStats.totalMembers.toLocaleString(),
      change: "+32 this month",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      label: "Active Loans",
      value: mockStats.activeLoans.toString(),
      change: `${mockStats.overdueBooks} overdue`,
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      label: "Today's Issues",
      value: mockStats.todayIssues.toString(),
      change: "Books issued today",
      color: "bg-cyan-50 text-cyan-700 border-cyan-200",
    },
    {
      label: "Today's Returns",
      value: mockStats.todayReturns.toString(),
      change: "Books returned today",
      color: "bg-rose-50 text-rose-700 border-rose-200",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Library overview and quick stats</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl p-5 border ${stat.color}`}
          >
            <p className="text-sm font-medium opacity-80">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
            <p className="text-xs mt-1 opacity-70">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Overdue Books */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-serif font-semibold text-foreground mb-4">
            Overdue Books ({overdueLoans.length})
          </h3>
          {overdueLoans.length > 0 ? (
            <div className="space-y-3">
              {overdueLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {loan.book.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {loan.memberName} — Due: {loan.dueDate}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
                    UGX {loan.fine.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No overdue books</p>
          )}
        </div>

        {/* Pending Reservations */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-serif font-semibold text-foreground mb-4">
            Pending Reservations ({mockReservations.length})
          </h3>
          {mockReservations.length > 0 ? (
            <div className="space-y-3">
              {mockReservations.map((res) => (
                <div
                  key={res.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-100"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {res.book.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {res.memberName} — {res.reservedDate}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      res.status === "ready"
                        ? "text-emerald-600 bg-emerald-100"
                        : "text-amber-600 bg-amber-100"
                    }`}
                  >
                    {res.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No pending reservations</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardStats;
