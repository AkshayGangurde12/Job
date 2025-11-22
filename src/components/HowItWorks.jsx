import { CheckCircle } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Choose Your Interview Type",
    description:
      "Select from various interview formats including behavioral, technical, and case interviews tailored to your industry.",
  },
  {
    number: "02",
    title: "Practice with AI",
    description:
      "Answer questions while our AI analyzes your responses in real-time, providing instant feedback on content and delivery.",
  },
  {
    number: "03",
    title: "Review & Improve",
    description:
      "Get detailed analytics and personalized recommendations to refine your answers and boost your confidence.",
  },
  {
    number: "04",
    title: "Ace the Real Interview",
    description:
      "Walk into your interview prepared, confident, and ready to impress with polished responses.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            How It{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to interview success
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xl font-bold shadow-elevated">
                  {step.number}
                </div>

                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>

                <p className="text-muted-foreground">{step.description}</p>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary to-transparent" />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-hero rounded-2xl p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4">
                Ready to Transform Your Interview Skills?
              </h3>
              <p className="text-muted-foreground mb-6">
                Join thousands of successful candidates who've landed their
                dream jobs with our AI-powered practice platform.
              </p>

              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Unlimited practice sessions</span>
                </li>

                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Real-time AI feedback and coaching</span>
                </li>

                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Industry-specific question banks</span>
                </li>

                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Progress tracking and analytics</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-center">
              <div className="bg-card rounded-xl p-8 shadow-elevated">
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">
                    7 Days
                  </div>
                  <div className="text-muted-foreground mb-4">Free Trial</div>

                  <button className="w-full px-6 py-3 bg-gradient-primary text-white rounded-lg font-semibold hover:shadow-soft transition-all">
                    Start Your Free Trial
                  </button>

                  <p className="text-xs text-muted-foreground mt-3">
                    No credit card required
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
