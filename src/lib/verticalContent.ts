import {
  Droplets, Flame, SearchCheck, PipetteIcon, Wrench, ShowerHead, AlertTriangle, Settings,
  Wind, Thermometer, Fan, Gauge, Snowflake, Sun, Timer,
  TreePine, Scissors, Droplet, Fence, Flower2, Leaf, Mountain,
  Zap, PlugZap, Lightbulb, Power, BatteryCharging, Lamp, CircuitBoard,
  type LucideIcon,
} from "lucide-react";
import type { VerticalKey } from "./constants";

export interface VerticalPageContent {
  heroTitle: string;
  heroDescription: string;
  metaTitle: string;
  metaDescription: string;
  servicesHeading: string;
  services: { icon: LucideIcon; title: string; description: string }[];
  howItWorks: { title: string; description: string }[];
  jsonLdServiceType: string;
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
  },
};
