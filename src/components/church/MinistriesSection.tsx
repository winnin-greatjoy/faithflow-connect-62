
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Heart, Zap, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const MinistriesSection = () => {
  const ministries = [
    {
      icon: Users,
      title: "Men's Ministry",
      description: "Building strong men of faith through fellowship, leadership development, and community service.",
      link: "/ministries/mens"
    },
    {
      icon: Heart,
      title: "Women's Ministry",
      description: "Empowering women to grow in faith, build meaningful relationships, and serve with purpose.",
      link: "/ministries/womens"
    },
    {
      icon: Zap,
      title: "Youth & Young Adults",
      description: "Dynamic ministry for ages 13-30, focusing on real faith for real life challenges.",
      link: "/ministries/youth"
    },
    {
      icon: Star,
      title: "Children's Ministry",
      description: "Fun, engaging programs that help children discover God's love and build a strong foundation of faith.",
      link: "/ministries/children"
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-serif font-bold mb-6">
            Our Ministries
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover meaningful ways to grow in faith, connect with others, and make a difference in our community.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {ministries.map((ministry, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <ministry.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-serif">{ministry.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="mb-4">{ministry.description}</CardDescription>
                <Button variant="outline" size="sm" asChild>
                  <Link to={ministry.link}>Learn More</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" asChild>
            <Link to="/ministries">View All Ministries</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MinistriesSection;
