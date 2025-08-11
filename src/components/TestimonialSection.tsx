
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote } from "lucide-react";

const TestimonialSection = () => {
  const testimonials = [
    {
      name: "Pastor Michael Johnson",
      role: "Senior Pastor",
      church: "Grace Community Church",
      content: "This system transformed how we manage our church. The integration between our website and admin tools is seamless, and our members love the online giving platform.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Sarah Williams",
      role: "Church Administrator", 
      church: "New Life Baptist Church",
      content: "Finally, a church management system that doesn't require a computer science degree to use. The volunteer scheduling feature alone has saved us hours every week.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Pastor David Chen",
      role: "Lead Pastor",
      church: "Covenant Fellowship",
      content: "The analytics and reporting features give us insights we never had before. We can see exactly how our ministries are performing and where to focus our efforts.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Testimonials
          </Badge>
          <h2 className="text-gradient mb-6">
            Loved by Church Leaders
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See what pastors and church administrators are saying about our platform.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="feature-card relative">
              <CardContent className="pt-8">
                {/* Quote icon */}
                <div className="absolute -top-4 left-8 w-8 h-8 bg-gradient-to-r from-blue-900 to-blue-800 rounded-full flex items-center justify-center">
                  <Quote className="w-4 h-4 text-white" />
                </div>

                {/* Rating stars */}
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Testimonial content */}
                <p className="text-gray-600 text-center mb-6 italic">
                  "{testimonial.content}"
                </p>

                {/* Author info */}
                <div className="text-center">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                  />
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-blue-600 font-medium">{testimonial.church}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
