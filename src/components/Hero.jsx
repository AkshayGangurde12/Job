import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-hero">
      {/* Decorative blur elements */}
      <div className="absolute top-20 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                AI-Powered Interview Practice
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Ace Your Next{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Job Interview
              </span>{" "}
              with Confidence
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl">
              Build confidence, sharpen your answers, and master interview skills with 
              real-time AI feedback. Practice like a pro and land your dream job.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-gradient-primary border-0 shadow-elevated hover:shadow-soft transition-all"
              >
                Start Practicing Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button size="lg" variant="outline">
                <PlayCircle className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Success Stories</div>
              </div>

              <div className="h-12 w-px bg-border" />

              <div>
                <div className="text-3xl font-bold text-primary">95%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>

              <div className="h-12 w-px bg-border" />

              <div>
                <div className="text-3xl font-bold text-primary">4.9/5</div>
                <div className="text-sm text-muted-foreground">User Rating</div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative animate-float">
            <div className="relative rounded-2xl overflow-hidden shadow-elevated">
              <img
                src={heroImage}
                alt="Professional interview practice"
                className="w-full h-auto"
              />

              {/* Floating cards */}
              <div className="absolute top-8 right-8 bg-card/95 backdrop-blur-sm rounded-xl p-4 shadow-soft">
                <div className="text-sm font-medium text-muted-foreground">
                  Speed of Speech
                </div>
                <div className="text-2xl font-bold text-primary">126</div>
              </div>

              <div className="absolute bottom-8 left-8 bg-card/95 backdrop-blur-sm rounded-xl p-4 shadow-soft max-w-xs">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                    AI
                  </div>
                  <div>
                    <div className="text-sm font-semibold">AI Feedback</div>
                    <div className="text-xs text-muted-foreground">
                      Work on fluency and clarity in answers
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
