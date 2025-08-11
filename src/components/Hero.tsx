
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, ArrowRight, Globe, Database, Users } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 hero-gradient"></div>
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px)`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Badge */}
          <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
            <Globe className="w-4 h-4 mr-2" />
            Empowering Ministry. Engaging Community. Enabling Growth.
          </Badge>

          {/* Main heading */}
          <h1 className="mb-6 animate-fade-in-up">
            Faith Healing Bible Church
            <span className="block text-2xl lg:text-4xl mt-2 font-normal text-yellow-300">
              Beccle St Branch
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl lg:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto animate-fade-in-up">
            Complete Church Management System combining a beautiful public website 
            with powerful admin tools for modern ministry.
          </p>

          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-4 mb-10 animate-fade-in-up">
            <div className="flex items-center bg-white/20 rounded-full px-4 py-2">
              <Users className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Member Management</span>
            </div>
            <div className="flex items-center bg-white/20 rounded-full px-4 py-2">
              <Database className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Financial Tracking</span>
            </div>
            <div className="flex items-center bg-white/20 rounded-full px-4 py-2">
              <Globe className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Public Website</span>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
            <Button size="lg" className="btn-secondary group">
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              View Demo
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-blue-900">
              Learn More
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-blue-200 text-sm mb-4">Trusted by churches of all sizes</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">50+</div>
                <div className="text-xs text-blue-200">Churches</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">5000+</div>
                <div className="text-xs text-blue-200">Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">99.9%</div>
                <div className="text-xs text-blue-200">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
