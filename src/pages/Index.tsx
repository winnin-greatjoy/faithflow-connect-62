
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar, 
  MessageCircle, 
  CreditCard, 
  BarChart3, 
  Heart, 
  Shield,
  Clock,
  Smartphone,
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  Globe,
  Database
} from "lucide-react";
import Hero from "@/components/Hero";
import FeatureSection from "@/components/FeatureSection";
import PricingSection from "@/components/PricingSection";
import TestimonialSection from "@/components/TestimonialSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <FeatureSection />
      <TestimonialSection />
      <PricingSection />
      <Footer />
    </div>
  );
};

export default Index;
