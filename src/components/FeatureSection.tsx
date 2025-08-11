
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
  Globe,
  Database,
  UserCheck,
  Bell,
  Settings
} from "lucide-react";

const FeatureSection = () => {
  const frontendFeatures = [
    {
      icon: Globe,
      title: "Beautiful Public Website",
      description: "Modern, responsive church website with sermons, events, and ministry information."
    },
    {
      icon: Calendar,
      title: "Event Management",
      description: "Interactive calendar with registration and payment processing for all church events."
    },
    {
      icon: Heart,
      title: "Online Giving",
      description: "Secure donation platform with recurring giving and automatic tax statements."
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Perfect experience on desktop, tablet, and mobile devices for all users."
    }
  ];

  const backendFeatures = [
    {
      icon: Users,
      title: "Member Management",
      description: "Complete member profiles with family links, ministry participation, and attendance tracking."
    },
    {
      icon: MessageCircle,
      title: "Communication Hub", 
      description: "Mass SMS, email campaigns, and targeted messaging with automated workflows."
    },
    {
      icon: CreditCard,
      title: "Financial Dashboard",
      description: "Real-time giving analytics, budget tracking, and comprehensive financial reporting."
    },
    {
      icon: UserCheck,
      title: "Volunteer Management",
      description: "Skills matching, scheduling, and automated reminders for volunteer coordination."
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Deep insights into member engagement, giving trends, and ministry effectiveness."
    },
    {
      icon: Settings,
      title: "Ministry Management",
      description: "Organize departments, track activities, and manage roles across all ministries."
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Complete Solution
          </Badge>
          <h2 className="text-gradient mb-6">
            Everything Your Church Needs
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            One platform that combines a stunning public website with powerful 
            church management tools. Streamline operations while strengthening community.
          </p>
        </div>

        {/* Frontend Features */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Public Website Features</h3>
            <p className="text-gray-600">Engage your community with a beautiful, modern website</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {frontendFeatures.map((feature, index) => (
              <Card key={index} className="feature-card">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Backend Features */}
        <div>
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Admin Management Features</h3>
            <p className="text-gray-600">Powerful tools to manage every aspect of your church</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {backendFeatures.map((feature, index) => (
              <Card key={index} className="feature-card">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-blue-900" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Integration highlight */}
        <div className="mt-20 text-center">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-blue-900 to-blue-800 text-white border-0">
            <CardHeader>
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Database className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl text-white">Seamless Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-100 text-lg">
                Your public website and admin system work together seamlessly. 
                Updates in the admin panel automatically reflect on your website, 
                and member interactions flow directly into your management system.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
