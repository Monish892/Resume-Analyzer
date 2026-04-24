import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Download, Printer, User, Briefcase, GraduationCap, Laptop, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";
import { refineResume } from "@/lib/refine";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export function ResumeRefiner({ resumeText, jobDescription }: { resumeText: string, jobDescription: string }) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const onRefine = async () => {
    setLoading(true);
    try {
      const result = await refineResume({ data: { resumeText, jobDescription } });
      if (result.ok) {
        setData(result.data);
        toast.success("Resume perfected and restructured!");
      } else {
        toast.error(result.error || "Refinement failed");
      }
    } catch (e) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!previewRef.current) return;
    toast.info("Generating PDF...");
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: previewRef.current.scrollWidth,
        windowHeight: previewRef.current.scrollHeight,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save("refined-resume.pdf");
      toast.success("PDF Downloaded!");
    } catch (e: any) {
      console.error("PDF Error:", e);
      toast.error("Failed to generate PDF. Try Print / Save instead.");
    }
  };

  const print = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {!data ? (
        <Card className="p-12 text-center border-dashed border-2 bg-muted/20">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <h3 className="text-2xl font-display font-bold mb-3">AI Resume Refiner</h3>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">
            This tool will restructure your resume and rewrite your content to perfectly match the target job description while maintaining professional standards.
          </p>
          <Button onClick={onRefine} disabled={loading} size="lg" className="px-8 bg-gradient-hero">
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
            Generate Refined Resume
          </Button>
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2 items-start">
          {/* Left Side: Editor/Controls */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" /> Refinement Complete
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                The AI has restructured your resume. You can review the result on the right. 
                Any skills or keywords found missing in the analysis have been woven into the summary and experience sections.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={downloadPDF} className="bg-primary text-primary-foreground">
                  <Download className="mr-2 h-4 w-4" /> Download PDF
                </Button>
                <Button onClick={print} variant="outline">
                  <Printer className="mr-2 h-4 w-4" /> Print / Save
                </Button>
                <Button onClick={() => setData(null)} variant="ghost">
                  Start Over
                </Button>
              </div>
            </Card>

            <div className="space-y-4">
               {/* Quick Edit Sections (Optional, could add full editor here) */}
               <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Resume Sections</h4>
               {[
                 { icon: User, name: "Personal Information", count: 1 },
                 { icon: Briefcase, name: "Experience", count: data.experience.length },
                 { icon: Laptop, name: "Skills", count: data.skills.length },
                 { icon: GraduationCap, name: "Education", count: data.education.length },
               ].map((s) => (
                 <div key={s.name} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                    <div className="flex items-center gap-3">
                      <s.icon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{s.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{s.count} items</span>
                 </div>
               ))}
            </div>
          </div>

          {/* Right Side: High Fidelity Preview */}
          <div className="relative group">
            <div className="absolute -top-4 -right-4 z-20">
               <span className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full shadow-lg border-2 border-background">
                 PDF PREVIEW
               </span>
            </div>
            
            <div 
              ref={previewRef}
              className="bg-white text-slate-900 shadow-2xl rounded-sm overflow-hidden p-[15mm] min-h-[297mm] w-full max-w-[210mm] mx-auto print:shadow-none print:p-0"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {/* Header */}
              <div className="border-b-2 border-slate-900 pb-4 mb-6">
                <h1 className="text-3xl font-bold uppercase tracking-tight text-slate-900">{data.personal.name}</h1>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                  <span>{data.personal.email}</span>
                  <span>{data.personal.phone}</span>
                  <span>{data.personal.location}</span>
                  {data.personal.links?.map((l: string, i: number) => (
                    <span key={i}>{l}</span>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="mb-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b border-slate-200 mb-2 pb-1">Professional Summary</h2>
                <p className="text-sm leading-relaxed text-slate-700 italic">
                  {data.summary}
                </p>
              </div>

              {/* Experience */}
              <div className="mb-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b border-slate-200 mb-4 pb-1">Professional Experience</h2>
                <div className="space-y-6">
                  {data.experience.map((exp: any, i: number) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="text-base font-bold text-slate-900">{exp.role}</h3>
                        <span className="text-xs font-bold text-slate-500 uppercase">{exp.date}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-600 mb-2">{exp.company}</p>
                      <ul className="list-disc ml-4 space-y-1">
                        {exp.bullets.map((b: string, j: number) => (
                          <li key={j} className="text-[13px] leading-relaxed text-slate-700">
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b border-slate-200 mb-3 pb-1">Skills & Technologies</h2>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {data.skills.map((s: string, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      <span className="text-sm text-slate-700">{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="mb-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 border-b border-slate-200 mb-3 pb-1">Education</h2>
                <div className="space-y-3">
                  {data.education.map((edu: any, i: number) => (
                    <div key={i} className="flex justify-between items-baseline">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{edu.degree}</h3>
                        <p className="text-sm text-slate-600">{edu.school}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-500 uppercase">{edu.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
