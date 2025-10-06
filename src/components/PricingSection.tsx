
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star } from "lucide-react";

const PricingSection = () => {
  const plans = [
    {
      name: "Starter",
      description: "Perfect for small churches",
      price: "Free",
      period: "Forever",
      popular: false,
      features: [
        "Up to 50 members",
        "Basic member management",
        "Public website",
        "Event calendar",
        "Online giving",
        "Email support"
      ]
    },
    {
      name: "Growth",
      description: "Ideal for growing congregations",
      price: "$49",
      period: "per month",
      popular: true,
      features: [
        "Up to 500 members",
        "Advanced member management",
        "Ministry management",
        "SMS & email campaigns",
        "Financial dashboard",
        "Volunteer scheduling",
        "Analytics & reporting",
        "Priority support"
      ]
    },
    {
      name: "Enterprise",
      description: "For large churches and networks",
      price: "$99",
      period: "per month",
      popular: false,
      features: [
        "Unlimited members",
        "Multi-campus support",
        "Advanced analytics",
        "Custom integrations",
        "Background checks",
        "Livestream integration",
        "White-label options",
        "Dedicated support"
      ]
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Pricing
          </Badge>
          <h2 className="text-gradient mb-6">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Flexible pricing that grows with your church. Start free and upgrade as needed.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`feature-card relative ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-gray-600 mb-6">
                  {plan.description}
                </CardDescription>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period !== "Forever" && (
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full ${plan.popular ? 'btn-hero' : 'btn-secondary'}`}
                  size="lg"
                >
                  {plan.price === "Free" ? "Get Started Free" : "Start Free Trial"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            All plans include a 30-day free trial. No credit card required.
          </p>
          <p className="text-sm text-gray-500">
            Need a custom solution? <a href="#" className="text-blue-600 hover:underline">Contact our sales team</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
