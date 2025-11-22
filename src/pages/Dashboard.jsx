import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Loader2, Upload } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(10);
  const [resume, setResume] = useState("");
  const [resumeFile, setResumeFile] = useState(null);

  const handleResumeSubmit = async () => {
    if (!user || !resume.trim()) {
      toast({
        title: "Error",
        description: "Please enter your resume text",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ resume })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Resume saved successfully",
      });
      setResume("");
    } catch (error) {
      console.error("Error saving resume:", error);
      toast({
        title: "Error",
        description: "Failed to save resume",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!user || !resumeFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(resumeFile.type)) {
      toast({
        title: "Error",
        description: "Please upload a PDF or Word document",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (resumeFile.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Upload file to storage
      const fileExt = resumeFile.name.split(".").pop();
      const fileName = `${user.id}/resume.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(fileName, resumeFile, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("resumes").getPublicUrl(fileName);

      // Update profile with file URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ resume_file_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Resume file uploaded successfully",
      });
      setResumeFile(null);
    } catch (error) {
      console.error("Error uploading resume:", error);
      toast({
        title: "Error",
        description: "Failed to upload resume file",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterviewSubmit = async () => {
    if (!user || !jobDescription.trim()) {
      toast({
        title: "Error",
        description: "Please enter a job description",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("interviews").insert({
        user_id: user.id,
        job_description: jobDescription,
        difficulty,
        num_questions: numQuestions,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Interview created successfully",
      });
      setJobDescription("");
    } catch (error) {
      console.error("Error creating interview:", error);
      toast({
        title: "Error",
        description: "Failed to create interview",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-4xl font-bold mb-2">
          Hi, {user?.user_metadata?.name || "User"}!
        </h1>
        <p className="text-muted-foreground mb-8">
          Choose to upload your resume or start an interview
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Resume Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Resume</CardTitle>
              <CardDescription>
                Paste your resume text or upload a PDF/Word document
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resume">Resume Text</Label>
                <Textarea
                  id="resume"
                  placeholder="Paste your resume here..."
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                  className="min-h-[150px]"
                />
              </div>
              <Button
                onClick={handleResumeSubmit}
                disabled={isLoading || !resume.trim()}
                className="w-full"
              >
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Resume Text
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resumeFile">Upload Resume File</Label>
                <div className="flex gap-2">
                  <Input
                    id="resumeFile"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) =>
                      setResumeFile(e.target.files?.[0] || null)
                    }
                    className="cursor-pointer"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  PDF or Word document (max 5MB)
                </p>
              </div>
              <Button
                onClick={handleFileUpload}
                disabled={isLoading || !resumeFile}
                className="w-full"
              >
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Upload className="mr-2 h-4 w-4" />
                Upload Resume File
              </Button>
            </CardContent>
          </Card>

          {/* Job Interview Setup Card */}
          <Card>
            <CardHeader>
              <CardTitle>Start Interview</CardTitle>
              <CardDescription>
                Enter job details to generate interview questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jobDescription">Job Description</Label>
                <Textarea
                  id="jobDescription"
                  placeholder="Enter the job description..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select
                  value={difficulty}
                  onValueChange={(value) => setDifficulty(value)}
                >
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="difficult">Difficult</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numQuestions">
                  Number of Questions: {numQuestions}
                </Label>
                <Input
                  id="numQuestions"
                  type="range"
                  min="6"
                  max="15"
                  value={numQuestions}
                  onChange={(e) =>
                    setNumQuestions(parseInt(e.target.value, 10))
                  }
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground">
                  Range: 6-15 questions
                </p>
              </div>

              <Button
                onClick={handleInterviewSubmit}
                disabled={isLoading || !jobDescription.trim()}
                className="w-full"
              >
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Start Interview
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
