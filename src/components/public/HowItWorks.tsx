import { ClipboardList, PhoneCall, ThumbsUp } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Tell Us What You Need",
    description: "Fill out a quick form with your plumbing issue and contact info.",
  },
  {
    icon: PhoneCall,
    title: "Get Matched",
    description: "We connect you with a local plumber who handles your type of job.",
  },
  {
    icon: ThumbsUp,
    title: "Get It Fixed",
    description: "Your plumber reaches out, provides a quote, and gets the job done right.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 bg-secondary">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">How It Works</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <step.icon className="h-7 w-7" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground font-sans">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
