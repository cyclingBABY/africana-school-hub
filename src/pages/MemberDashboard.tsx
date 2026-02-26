import { BookOpen, RefreshCcw, Wallet, FileText, Clock, BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const borrowedBooks = [
  {
    title: "Physics Essentials",
    type: "Physical",
    due: "3 days",
    action: "Renew",
  },
  {
    title: "Uganda Digital Archives",
    type: "Digital",
    due: "Always available",
    action: "Read Now",
  },
  {
    title: "African Literature Anthology",
    type: "Physical",
    due: "5 days",
    action: "Renew",
  },
  {
    title: "Choir Arrangements Vol. 2",
    type: "Digital",
    due: "Always available",
    action: "Read Now",
  },
];

const MemberDashboard = () => {
  const memberName = localStorage.getItem("member_name") || "Amina";

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            Hello, {memberName}! You have 2 books due in 3 days.
          </h1>
        </div>
      </header>

      <main className="p-6 space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <BookMarked className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Borrowed Books</p>
                  <p className="text-2xl font-bold text-foreground">4</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Due Soon</p>
                  <p className="text-2xl font-bold text-foreground">2</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Wallet className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Fine Wallet</p>
                  <p className="text-2xl font-bold text-foreground">UGX 12,000</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Bookshelf</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {borrowedBooks.map((book) => (
                <div
                  key={book.title}
                  className="border border-border rounded-lg p-4 bg-background"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant={book.type === "Digital" ? "secondary" : "outline"}>
                      {book.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Due in {book.due}</span>
                  </div>
                  <h3 className="font-semibold text-foreground mt-3">{book.title}</h3>
                  <Button
                    variant={book.type === "Digital" ? "default" : "outline"}
                    size="sm"
                    className="mt-4"
                  >
                    {book.action}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Digital Reader</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-dashed border-border rounded-lg p-6 text-center">
                <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium text-foreground mb-2">
                  Secure PDF/ePub Viewer
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Read instantly without downloading files to protect DRM.
                </p>
                <Button size="sm">Open Reader</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fine Wallet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Wallet className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Outstanding Balance</p>
                  <p className="text-sm text-muted-foreground">UGX 12,000</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCcw className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Pay with Mobile Money</p>
                  <p className="text-sm text-muted-foreground">MTN or Airtel supported.</p>
                </div>
              </div>
              <Button className="w-full">Clear Balance</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MemberDashboard;
