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
    <section className="py-16 bg-secondary" aria-labelledby="how-it-works-heading">
      <div className="container">
        <h2 id="how-it-works-heading" className="text-3xl font-bold text-center mb-12 text-foreground">How It Works</h2>
        <ol className="grid gap-8 md:grid-cols-3 list-none p-0 m-0">
          {steps.map((step, i) => (
            <li key={i} className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground" aria-hidden="true">
                <step.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground font-sans">
                <span className="sr-only">Step {i + 1}: </span>{step.title}
              </h3>
              <p className="text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
