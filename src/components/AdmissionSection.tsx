import { useState } from "react";
import { FileText, CreditCard, IdCard, Camera, FolderOpen, UserPlus, Loader2, Upload, FileCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AnimatedSection from "./AnimatedSection";

const AdmissionSection = () => {
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [passportFileName, setPassportFileName] = useState("");
  const [performanceFileName, setPerformanceFileName] = useState("");

  const requirements = [
    { icon: FileText, label: "Admission Fee", amount: "50,000" },
    { icon: CreditCard, label: "Development Fee", amount: "50,000", note: "Per year" },
    { icon: IdCard, label: "Identity Card", amount: "10,000" },
    { icon: FolderOpen, label: "File", amount: "5,000" },
    { icon: Camera, label: "Passport Photos", amount: "10,000" },
  ];

  // Helper function to upload files to Supabase Storage
  const uploadFile = async (file: File, folder: string) => {
    if (!file || file.size === 0) return "";
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('applications')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('applications')
      .getPublicUrl(filePath);
      
    return publicUrl;
  };

  const handleRegistration = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    
    const formData = new FormData(e.currentTarget);
    const photoFile = formData.get("passportPhoto") as File;
    const perfFile = formData.get("performanceDoc") as File;
    
    try {
      // 1. Upload both files simultaneously
      const [passportUrl, resultsUrl] = await Promise.all([
        uploadFile(photoFile, "passports"),
        uploadFile(perfFile, "academic_records")
      ]);

      // 2. Prepare Database Data
      const registrationData = {
        student_first_name: formData.get("firstName")?.toString() || "",
        student_last_name: formData.get("lastName")?.toString() || "",
        student_date_of_birth: formData.get("dob")?.toString() || "",
        student_gender: formData.get("gender")?.toString() || "",
        class_level: formData.get("classLevel")?.toString() || "",
        student_type: formData.get("studentType")?.toString() || "new",
        previous_school_name: formData.get("prevSchool")?.toString() || "",
        previous_performance_type: formData.get("docType")?.toString() || "",
        previous_results_url: resultsUrl,
        passport_photo_url: passportUrl,
        parent_name: formData.get("parentName")?.toString() || "",
        parent_email: formData.get("parentEmail")?.toString() || "",
        parent_phone: formData.get("parentPhone")?.toString() || "",
        parent_address: formData.get("address")?.toString() || "",
        parent_relationship: formData.get("relationship")?.toString() || "",
        emergency_contact_name: formData.get("emergencyName")?.toString() || "",
        emergency_contact_phone: formData.get("emergencyPhone")?.toString() || "",
        emergency_contact_relationship: formData.get("emergencyRel")?.toString() || "",
        status: "pending" as const,
      };

      const { error } = await supabase.from("applications").insert([registrationData]);

      if (error) throw error;

      toast({
        title: "Application Received",
        description: `Successfully submitted records for ${registrationData.student_first_name}.`,
      });
      setIsOpen(false);
      setPassportFileName("");
      setPerformanceFileName("");
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <section id="admission" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Admission Requirements
          </h2>
          <div className="section-divider mb-6 mx-auto w-24 h-1 bg-primary" />
          <p className="text-muted-foreground max-w-2xl mx-auto mb-10">
            Join Africana Muslim SS. Provide your academic history below to begin your application.
          </p>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-full px-10 py-6 text-lg shadow-lg hover:scale-105 transition-transform">
                <UserPlus className="mr-2 h-6 w-6" /> Register Now
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif">Official Admission Form</DialogTitle>
                <DialogDescription>
                  Ensure all files are clear and readable for verification.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleRegistration} className="space-y-6 mt-4">
                
                {/* Section: File Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Passport Photo */}
                  <div className="bg-secondary/20 p-4 rounded-lg border-2 border-dashed border-primary/20">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 uppercase tracking-tighter">
                      <Camera className="w-4 h-4" /> Student Passport
                    </h4>
                    <Input 
                      type="file" 
                      name="passportPhoto" 
                      accept="image/*"
                      className="cursor-pointer bg-white"
                      onChange={(e) => setPassportFileName(e.target.files?.[0]?.name || "")}
                      required 
                    />
                    <p className="text-[10px] text-muted-foreground mt-2">{passportFileName || "No file chosen"}</p>
                  </div>

                  {/* Academic Document */}
                  <div className="bg-secondary/20 p-4 rounded-lg border-2 border-dashed border-primary/20">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 uppercase tracking-tighter">
                      <FileCheck className="w-4 h-4" /> Academic Performance
                    </h4>
                    <Input 
                      type="file" 
                      name="performanceDoc" 
                      accept=".pdf,image/*,.doc,.docx"
                      className="cursor-pointer bg-white"
                      onChange={(e) => setPerformanceFileName(e.target.files?.[0]?.name || "")}
                      required 
                    />
                    <p className="text-[10px] text-muted-foreground mt-2">{performanceFileName || "Report/Result Slip"}</p>
                  </div>
                </div>

                {/* Section: Student Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input name="firstName" placeholder="First Name" required />
                  <Input name="lastName" placeholder="Last Name" required />
                  <Input name="dob" type="date" required />
                  <Select name="gender" required>
                    <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Section: Academic History */}
                <div className="border-t pt-4 space-y-4">
                  <h4 className="font-semibold text-sm uppercase text-slate-500 tracking-wider">Previous Schooling</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input name="prevSchool" placeholder="Name of Former School" required />
                    <Select name="docType" required>
                      <SelectTrigger><SelectValue placeholder="Type of Document Uploaded" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ple_results">PLE Results (S.1)</SelectItem>
                        <SelectItem value="uneb_slip">UCE/UNEB Slip (S.5)</SelectItem>
                        <SelectItem value="transfer_report">Transfer/Term Report</SelectItem>
                        <SelectItem value="other">Other Records</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select name="classLevel" required>
                      <SelectTrigger><SelectValue placeholder="Applying for Class" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="s1">Senior 1</SelectItem>
                        <SelectItem value="s2">Senior 2</SelectItem>
                        <SelectItem value="s3">Senior 3</SelectItem>
                        <SelectItem value="s4">Senior 4</SelectItem>
                        <SelectItem value="s5">Senior 5</SelectItem>
                        <SelectItem value="s6">Senior 6</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select name="studentType" defaultValue="new">
                      <SelectTrigger><SelectValue placeholder="Student Type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New Student</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Section: Parent & Emergency Info (Collapsed for brevity) */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Guardian Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input name="parentName" placeholder="Full Name" required />
                    <Input name="parentPhone" placeholder="Phone Number" required />
                    <Input name="parentEmail" type="email" placeholder="Email" required />
                    <Input name="relationship" placeholder="Relationship" required />
                    <div className="md:col-span-2">
                      <Input name="address" placeholder="Residential Address" required />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Emergency Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input name="emergencyName" placeholder="Name" required />
                    <Input name="emergencyPhone" placeholder="Phone" required />
                    <Input name="emergencyRel" placeholder="Relationship" required />
                  </div>
                </div>

                <Button type="submit" className="w-full py-6 text-lg" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                      Uploading Records...
                    </>
                  ) : "Submit Official Application"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </AnimatedSection>

        {/* Requirements grid remains consistent */}
        <div className="max-w-4xl mx-auto">
          <AnimatedSection animation="scale" className="mb-8">
            <Card className="bg-primary text-primary-foreground overflow-hidden">
              <CardContent className="p-8 text-center">
                <p className="text-lg mb-2 relative z-10 font-medium">Total Admission Package</p>
                <div className="text-4xl md:text-5xl font-bold relative z-10">
                  UGX <span className="text-yellow-400">125,000</span>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requirements.map((item, index) => (
              <AnimatedSection key={item.label} delay={index * 100}>
                <Card className="h-full border-border hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center text-primary">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-xs text-muted-foreground uppercase tracking-wider">{item.label}</h3>
                        <p className="text-xl font-bold text-primary">UGX {item.amount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdmissionSection;