import { ClipboardList, PhoneCall, ThumbsUp } from "lucide-react";
import { FadeIn } from "./FadeIn";

interface HowItWorksProps {
  /** Override the professional noun — defaults to "pro" */
  professionalLabel?: string;
}

const defaultSteps = [
  {
    icon: ClipboardList,
    title: "Tell Us What You Need",
    getDescription: (label: string) =>
      `Fill out a quick form describing your issue and contact info.`,
  },
  {
    icon: PhoneCall,
    title: "Get Matched",
    getDescription: (label: string) =>
      `We connect you with a local ${label} who handles your type of job.`,
  },
  {
    icon: ThumbsUp,
    title: "Get It Fixed",
    getDescription: (label: string) =>
      `Your ${label} reaches out, provides a quote, and gets the job done right.`,
  },
];

export function HowItWorks({ professionalLabel = "pro" }: HowItWorksProps) {
  return (
    <section className="py-16 bg-secondary" aria-labelledby="how-it-works-heading">
      <div className="container">
        <FadeIn>
          <h2 id="how-it-works-heading" className="text-3xl font-bold text-center mb-12 text-foreground">How It Works</h2>
        </FadeIn>
        <ol className="grid gap-8 md:grid-cols-3 list-none p-0 m-0">
          {defaultSteps.map((step, i) => (
            <FadeIn key={i} delay={i * 0.15}>
              <li className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground" aria-hidden="true">
                  <step.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground font-sans">
                  <span className="sr-only">Step {i + 1}: </span>{step.title}
                </h3>
                <p className="text-muted-foreground">{step.getDescription(professionalLabel)}</p>
              </li>
            </FadeIn>
          ))}
        </ol>
      </div>
    </section>
  );
}
