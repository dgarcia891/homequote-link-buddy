import {
  Droplets, Flame, SearchCheck, PipetteIcon, Wrench, ShowerHead, AlertTriangle, Settings,
  Wind, Thermometer, Fan, Gauge, Snowflake, Sun, Timer,
  TreePine, Scissors, Droplet, Fence, Flower2, Leaf, Mountain,
  Zap, PlugZap, Lightbulb, Power, BatteryCharging, Lamp, CircuitBoard,
  type LucideIcon,
} from "lucide-react";
import type { VerticalKey } from "./constants";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface VerticalPageContent {
  heroTitle: string;
  heroDescription: string;
  metaTitle: string;
  metaDescription: string;
  servicesHeading: string;
  services: { icon: LucideIcon; title: string; description: string }[];
  howItWorks: { title: string; description: string }[];
  jsonLdServiceType: string;
  faqs: FAQItem[];
}

export const VERTICAL_CONTENT: Record<VerticalKey, VerticalPageContent> = {
  plumbing: {
    heroTitle: "Find a Plumber in Santa Clarita",
    heroDescription: "Tell us what you need. We'll connect you with a local pro — free, fast, and no obligation.",
    metaTitle: "HomeQuoteLink — Santa Clarita Plumbing Quotes",
    metaDescription: "Get free plumbing quotes from local pros in the Santa Clarita Valley. Fast, easy, no obligation.",
    servicesHeading: "Common Plumbing Services",
    services: [
      { icon: Droplets, title: "Drain Cleaning", description: "Clogged drains cleared fast with professional equipment." },
      { icon: Flame, title: "Water Heater", description: "Repair or replacement for tank and tankless water heaters." },
      { icon: SearchCheck, title: "Leak Detection", description: "Find and fix hidden leaks before they cause damage." },
      { icon: PipetteIcon, title: "Sewer Line", description: "Sewer line inspection, repair, and replacement." },
      { icon: Wrench, title: "Repiping", description: "Whole-home or partial repiping for aging plumbing." },
      { icon: ShowerHead, title: "Fixture Install", description: "Faucets, toilets, showers, and more installed right." },
      { icon: AlertTriangle, title: "Emergency", description: "24/7 emergency plumbing when you need it most." },
      { icon: Settings, title: "General Plumbing", description: "All-around plumbing maintenance and repairs." },
    ],
    howItWorks: [
      { title: "Tell Us What You Need", description: "Fill out a quick form with your plumbing issue and contact info." },
      { title: "Get Matched", description: "We connect you with a local plumber who handles your type of job." },
      { title: "Get It Fixed", description: "Your plumber reaches out, provides a quote, and gets the job done right." },
    ],
    jsonLdServiceType: "Plumbing",
    faqs: [
      { question: "Is there a fee to get a plumbing quote?", answer: "No, our service is 100% free for homeowners. We connect you with local plumbers at no cost to you." },
      { question: "How quickly will a plumber contact me?", answer: "Most plumbers respond within a few hours during business hours. For emergencies, response times are typically even faster." },
      { question: "Are the plumbers licensed and insured?", answer: "Yes, we only work with licensed, insured plumbing professionals in the Santa Clarita Valley." },
      { question: "What areas do you serve?", answer: "We serve all of Santa Clarita Valley including Valencia, Saugus, Canyon Country, Newhall, Stevenson Ranch, and Castaic." },
      { question: "Am I obligated to hire the plumber who contacts me?", answer: "Not at all. Getting a quote is free and comes with no obligation. You're free to compare and choose the best option for you." },
    ],
  },
  hvac: {
    heroTitle: "Find an HVAC Technician in Santa Clarita",
    heroDescription: "AC broken? Furnace acting up? Get connected to a trusted local HVAC pro — free quote, no obligation.",
    metaTitle: "HVAC & AC Repair Quotes — Santa Clarita | HomeQuoteLink",
    metaDescription: "Get free HVAC and AC repair quotes from trusted technicians in the Santa Clarita Valley. Fast, easy, no obligation.",
    servicesHeading: "HVAC & AC Services",
    services: [
      { icon: Snowflake, title: "AC Repair", description: "Fast diagnosis and repair to get your cooling back on track." },
      { icon: Wind, title: "AC Installation", description: "New AC units sized and installed for your home's needs." },
      { icon: Flame, title: "Furnace Repair", description: "Keep your home warm with expert furnace diagnostics and repair." },
      { icon: Thermometer, title: "Furnace Installation", description: "Energy-efficient furnace installation by certified pros." },
      { icon: Fan, title: "Duct Cleaning", description: "Improve air quality and efficiency with professional duct cleaning." },
      { icon: Sun, title: "Heat Pump", description: "Installation and repair of energy-efficient heat pump systems." },
      { icon: Gauge, title: "Thermostat Install", description: "Smart and programmable thermostat setup for optimal comfort." },
      { icon: AlertTriangle, title: "Emergency HVAC", description: "24/7 emergency heating and cooling service when you need it." },
    ],
    howItWorks: [
      { title: "Describe Your HVAC Issue", description: "Fill out a quick form with your heating or cooling problem and contact info." },
      { title: "Get Matched", description: "We connect you with a local HVAC technician who specializes in your issue." },
      { title: "Stay Comfortable", description: "Your tech reaches out, provides a quote, and gets your system running." },
    ],
    jsonLdServiceType: "HVAC",
    faqs: [
      { question: "How much does AC repair typically cost?", answer: "AC repair costs vary based on the issue. Getting a free quote through our service helps you understand exact pricing before committing." },
      { question: "Do you offer emergency HVAC service?", answer: "Yes, many of our partner technicians offer 24/7 emergency service for urgent heating and cooling issues." },
      { question: "How do I know if I need AC repair or replacement?", answer: "If your AC is over 10-15 years old, requires frequent repairs, or your energy bills are rising, it may be time to consider replacement. Our technicians can help you decide." },
      { question: "Are your HVAC technicians certified?", answer: "Yes, we only partner with licensed, insured, and EPA-certified HVAC professionals." },
      { question: "How long does a typical AC installation take?", answer: "Most residential AC installations are completed in one day, though complex installations may take longer." },
    ],
  },
  landscaping: {
    heroTitle: "Find a Landscaper in Santa Clarita",
    heroDescription: "Transform your outdoor space. Get connected to a local landscaping professional — free quote, no obligation.",
    metaTitle: "Landscaping & Yard Service Quotes — Santa Clarita | HomeQuoteLink",
    metaDescription: "Get free landscaping and yard maintenance quotes from local pros in the Santa Clarita Valley. Fast, easy, no obligation.",
    servicesHeading: "Landscaping & Yard Services",
    services: [
      { icon: Leaf, title: "Lawn Care", description: "Regular mowing, edging, and lawn health treatments." },
      { icon: TreePine, title: "Tree Trimming", description: "Professional pruning and tree maintenance for safety and beauty." },
      { icon: Droplet, title: "Sprinkler Systems", description: "Installation, repair, and optimization of irrigation systems." },
      { icon: Mountain, title: "Landscape Design", description: "Custom landscape plans tailored to your property and climate." },
      { icon: Fence, title: "Hardscaping", description: "Patios, walkways, retaining walls, and outdoor structures." },
      { icon: Scissors, title: "Fence Installation", description: "Wood, vinyl, and metal fencing for privacy and security." },
      { icon: Flower2, title: "Garden Maintenance", description: "Planting, weeding, mulching, and seasonal garden care." },
      { icon: Timer, title: "Other", description: "Custom yard and outdoor projects — just tell us what you need." },
    ],
    howItWorks: [
      { title: "Tell Us About Your Project", description: "Fill out a quick form with your landscaping needs and contact info." },
      { title: "Get Matched", description: "We connect you with a local landscaper who handles your type of project." },
      { title: "Love Your Yard", description: "Your landscaper reaches out, provides a quote, and brings your vision to life." },
    ],
    jsonLdServiceType: "Landscaping",
    faqs: [
      { question: "What landscaping services do you cover?", answer: "We cover everything from lawn care and tree trimming to full landscape design, hardscaping, irrigation, and fence installation." },
      { question: "Do landscapers provide free estimates?", answer: "Yes, getting quotes through our service is free. Landscapers will typically visit your property to provide accurate estimates." },
      { question: "How often should I schedule lawn maintenance?", answer: "Most lawns benefit from weekly or bi-weekly maintenance during the growing season. Your landscaper can recommend a schedule based on your specific lawn." },
      { question: "Can landscapers help with drought-resistant designs?", answer: "Absolutely. Many of our Santa Clarita landscapers specialize in drought-tolerant and California-native landscaping to reduce water usage." },
      { question: "Do I need a permit for landscaping work?", answer: "Some projects like retaining walls, major grading, or structures may require permits. Your landscaper will advise you on permit requirements." },
    ],
  },
  electrical: {
    heroTitle: "Find an Electrician in Santa Clarita",
    heroDescription: "Electrical issues? Get connected to a licensed local electrician — free quote, no obligation.",
    metaTitle: "Electrician Quotes — Santa Clarita | HomeQuoteLink",
    metaDescription: "Get free electrical service quotes from licensed electricians in the Santa Clarita Valley. Fast, easy, no obligation.",
    servicesHeading: "Electrical Services",
    services: [
      { icon: Zap, title: "General Electrical", description: "Wiring, troubleshooting, and all-around electrical work." },
      { icon: CircuitBoard, title: "Panel Upgrade", description: "Upgrade your electrical panel for safety and capacity." },
      { icon: PlugZap, title: "Outlet & Switch Install", description: "New outlets, switches, and dedicated circuits installed safely." },
      { icon: Lightbulb, title: "Lighting Installation", description: "Indoor and outdoor lighting design and installation." },
      { icon: Fan, title: "Ceiling Fan Install", description: "Professional ceiling fan mounting and wiring." },
      { icon: BatteryCharging, title: "EV Charger Install", description: "Level 2 EV charger installation for your home." },
      { icon: AlertTriangle, title: "Emergency Electrical", description: "24/7 emergency electrical service for urgent issues." },
      { icon: Lamp, title: "Other", description: "Custom electrical projects — tell us what you need." },
    ],
    howItWorks: [
      { title: "Describe Your Electrical Need", description: "Fill out a quick form with your electrical issue and contact info." },
      { title: "Get Matched", description: "We connect you with a licensed local electrician for your type of job." },
      { title: "Get It Done Right", description: "Your electrician reaches out, provides a quote, and handles the work safely." },
    ],
    jsonLdServiceType: "Electrical",
    faqs: [
      { question: "Are your electricians licensed?", answer: "Yes, we only work with fully licensed and insured electricians in the Santa Clarita Valley." },
      { question: "How much does an EV charger installation cost?", answer: "Level 2 EV charger installations typically range from $500-$2,000 depending on your electrical panel and installation location. Get a free quote for exact pricing." },
      { question: "Do I need a permit for electrical work?", answer: "Most electrical work in California requires a permit. Licensed electricians will handle permit requirements as part of the job." },
      { question: "What's included in a panel upgrade?", answer: "A panel upgrade typically includes a new electrical panel, updated wiring to the panel, and ensuring your home meets current electrical codes." },
      { question: "Can you help with emergency electrical issues?", answer: "Yes, many of our partner electricians offer 24/7 emergency services for urgent issues like power outages, sparking outlets, or electrical fires." },
    ],
  },
};
