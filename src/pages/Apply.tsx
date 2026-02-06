import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Upload, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const applicationSchema = z.object({
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

type ApplicationFormData = z.infer<typeof applicationSchema>;

const Apply = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [birthCertFile, setBirthCertFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [resultsFile, setResultsFile] = useState<File | null>(null);

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
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

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('application-documents')
      .upload(fileName, file);
    
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    
    return fileName;
  };

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    
    try {
      // Upload documents if provided
      let birthCertUrl = null;
      let photoUrl = null;
      let resultsUrl = null;

      if (birthCertFile) {
        birthCertUrl = await uploadFile(birthCertFile, 'birth-certificates');
      }
      if (photoFile) {
        photoUrl = await uploadFile(photoFile, 'passport-photos');
      }
      if (resultsFile) {
        resultsUrl = await uploadFile(resultsFile, 'previous-results');
      }

      // Submit application
      const { error } = await supabase.from('applications').insert({
        ...data,
        birth_certificate_url: birthCertUrl,
        passport_photo_url: photoUrl,
        previous_results_url: resultsUrl,
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Application Submitted!",
        description: "We will review your application and contact you soon.",
      });
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
            Application Submitted!
          </h1>
          <p className="text-muted-foreground mb-8">
            Thank you for applying to Africana Muslim Secondary School. We will review your application and contact you via email or phone within 5-7 business days.
          </p>
          <Button onClick={() => navigate("/")}>
            Return to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Homepage</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Student Admission Application
            </h1>
            <p className="text-muted-foreground">
              Fill out the form below to apply for admission to Africana Muslim Secondary School
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              {/* Student Information */}
              <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
                  Student Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="student_first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="student_last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="student_date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="student_gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="student_religion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Religion</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select religion" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="muslim">Muslim</SelectItem>
                            <SelectItem value="christian">Christian</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="class_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class Level *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="s1">S.1</SelectItem>
                            <SelectItem value="s2">S.2</SelectItem>
                            <SelectItem value="s3">S.3</SelectItem>
                            <SelectItem value="s4">S.4</SelectItem>
                            <SelectItem value="s5_arts">S.5 Arts</SelectItem>
                            <SelectItem value="s5_sciences">S.5 Sciences</SelectItem>
                            <SelectItem value="s6">S.6</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="student_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="day">Day Scholar</SelectItem>
                            <SelectItem value="boarding">Boarding</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              {/* Parent/Guardian Information */}
              <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
                  Parent/Guardian Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="parent_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter parent/guardian name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="parent_relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship to Student *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="father">Father</SelectItem>
                            <SelectItem value="mother">Mother</SelectItem>
                            <SelectItem value="guardian">Guardian</SelectItem>
                            <SelectItem value="uncle">Uncle</SelectItem>
                            <SelectItem value="aunt">Aunt</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="parent_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="parent_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 0750492418" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="parent_occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occupation</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter occupation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="parent_address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Address *</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter full address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              {/* Previous School */}
              <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
                  Previous School (if applicable)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="previous_school_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>School Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter previous school name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="previous_school_class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Class Attended</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., P.7, S.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="previous_school_leaving_reason"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Reason for Leaving</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Why are you leaving your previous school?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              {/* Emergency Contact */}
              <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
                  Emergency Contact
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="emergency_contact_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter emergency contact name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergency_contact_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergency_contact_relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="sibling">Sibling</SelectItem>
                            <SelectItem value="relative">Relative</SelectItem>
                            <SelectItem value="neighbor">Neighbor</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              {/* Document Uploads */}
              <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
                  Document Uploads
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Upload the required documents (PDF, JPG, or PNG format, max 10MB each)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="mb-2 block">Birth Certificate</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setBirthCertFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="birth-cert"
                      />
                      <label htmlFor="birth-cert" className="cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {birthCertFile ? birthCertFile.name : "Click to upload"}
                        </span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">Passport Photo</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-colors">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="photo"
                      />
                      <label htmlFor="photo" className="cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {photoFile ? photoFile.name : "Click to upload"}
                        </span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">Previous Results</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setResultsFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="results"
                      />
                      <label htmlFor="results" className="cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {resultsFile ? resultsFile.name : "Click to upload"}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </section>

              {/* Submit Button */}
              <div className="flex justify-center">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="min-w-[200px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
};

export default Apply;
