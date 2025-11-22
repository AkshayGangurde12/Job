import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Loader2 } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchInterviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("name, email, resume, resume_file_url")
        .eq("id", user?.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setName(data.name);
      setEmail(data.email);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInterviews = async () => {
    try {
      const { data, error } = await supabase
        .from("interviews")
        .select("id, job_description, difficulty, num_questions, created_at")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setInterviews(data || []);
    } catch (error) {
      console.error("Error fetching interviews:", error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !name.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ name })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setProfile((prev) => (prev ? { ...prev, name } : null));
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Profile Settings</h1>

        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-sm text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={isSaving || name === profile?.name}
              >
                {isSaving && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Resume */}
          <Card>
            <CardHeader>
              <CardTitle>Resume</CardTitle>
              <CardDescription>
                Your stored resume information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile?.resume && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Resume Text
                  </Label>
                  <div className="p-4 bg-muted rounded-md">
                    <p className="text-sm whitespace-pre-wrap">
                      {profile.resume}
                    </p>
                  </div>
                </div>
              )}

              {profile?.resume_file_url && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Resume File
                  </Label>
                  <a
                    href={profile.resume_file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View uploaded resume file
                  </a>
                </div>
              )}

              {!profile?.resume && !profile?.resume_file_url && (
                <p className="text-muted-foreground">
                  No resume uploaded yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Interview History */}
          <Card>
            <CardHeader>
              <CardTitle>Interview History</CardTitle>
              <CardDescription>Your past interview sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {interviews.length > 0 ? (
                <div className="space-y-4">
                  {interviews.map((interview, index) => (
                    <div key={interview.id}>
                      {index > 0 && <Separator className="my-4" />}
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium">
                              {new Date(
                                interview.created_at
                              ).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {interview.job_description}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                              {interview.difficulty}
                            </span>
                            <span className="px-2 py-1 text-xs rounded-full bg-secondary/10 text-secondary-foreground">
                              {interview.num_questions} questions
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No interview history yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
