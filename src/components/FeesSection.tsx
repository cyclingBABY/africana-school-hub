import { Sun, Home, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const FeesSection = () => {
  const feeData = [
    { level: "S.1 – S.3", day: "500,000", boarding: "1,000,000" },
    { level: "S.4 – S.6", day: "N/A", boarding: "1,100,000", dayNote: "Boarding Only" },
    { level: "S.5 Arts", day: "550,000", boarding: "1,000,000" },
    { level: "S.5 Sciences", day: "600,000", boarding: "1,000,000" },
  ];

  return (
    <section id="fees" className="py-20 bg-secondary/30 geometric-pattern">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tuition & School Fees
          </h2>
          <div className="section-divider mb-6" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Fees vary based on the student's level and whether they are day scholars or boarding students.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden shadow-xl border-0">
            <CardHeader className="bg-primary text-primary-foreground">
              <CardTitle className="text-center font-serif text-2xl">
                Fee Structure (Per Term)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-bold text-foreground py-4">Class Level</TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Sun className="w-4 h-4 text-accent" />
                          <span className="font-bold text-foreground">Day Scholars (UGX)</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Home className="w-4 h-4 text-primary" />
                          <span className="font-bold text-foreground">Boarding Students (UGX)</span>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feeData.map((row, index) => (
                      <TableRow key={row.level} className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                        <TableCell className="font-semibold text-foreground py-4">
                          {row.level}
                        </TableCell>
                        <TableCell className="text-center">
                          {row.day === "N/A" ? (
                            <span className="text-muted-foreground italic text-sm">{row.dayNote}</span>
                          ) : (
                            <span className="font-medium text-foreground">{row.day}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center font-bold text-primary">
                          {row.boarding}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Important note */}
          <div className="mt-8 flex items-start gap-3 bg-accent/10 border border-accent/30 rounded-lg p-4">
            <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              <strong>Important:</strong> All candidate classes (S.4 and S.6) must be in the boarding section to ensure focused preparation for national examinations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeesSection;
