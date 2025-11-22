import { Brain, MessageSquare, TrendingUp, Target, Zap, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Feedback",
    description:
      "Get real-time insights on your answers, body language, and communication style with advanced AI analysis.",
  },
  {
    icon: MessageSquare,
    title: "Realistic Interview Scenarios",
    description:
      "Practice with industry-specific questions and common interview formats tailored to your field.",
  },
  {
    icon: TrendingUp,
    title: "Performance Analytics",
    description:
      "Track your progress over time with detailed metrics on fluency, vocabulary, and speech patterns.",
  },
  {
    icon: Target,
    title: "Personalized Coaching",
    description:
      "Receive customized recommendations based on your performance and career goals.",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description:
      "Get immediate feedback after each practice session to improve faster and more effectively.",
  },
  {
    icon: Shield,
    title: "Confidence Building",
    description:
      "Reduce interview anxiety through repeated practice in a safe, judgment-free environment.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-gradient-soft">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Everything You Need to{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered platform provides comprehensive tools and insights to
            help you master every aspect of the interview process.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-0 shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div className="mb-4 inline-flex p-3 rounded-xl bg-gradient-primary">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
