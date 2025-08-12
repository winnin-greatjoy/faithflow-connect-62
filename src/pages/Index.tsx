
import React from 'react';
import ChurchNavbar from '@/components/church/ChurchNavbar';
import ChurchHero from '@/components/church/ChurchHero';
import MinistriesSection from '@/components/church/MinistriesSection';
import ChurchFooter from '@/components/church/ChurchFooter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Heart, Users, BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen">
      <ChurchNavbar />
      <ChurchHero />
      
      {/* Values Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-serif font-bold mb-6">
              Our Core Values
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              These values guide everything we do as a church community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-serif">Faith</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Building unwavering trust in God's promises and living by His word.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="font-serif">Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Creating authentic relationships and supporting one another in love.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-serif">Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Encouraging spiritual maturity and personal development in Christ.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="font-serif">Service</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Using our gifts to serve God, our church, and our community.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <MinistriesSection />

      {/* Upcoming Events */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl lg:text-5xl font-serif font-bold mb-4">
                Upcoming Events
              </h2>
              <p className="text-xl text-muted-foreground">
                Join us for these special gatherings and services.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/events">
                View All Events
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Calendar className="h-12 w-12 text-primary-foreground" />
              </div>
              <CardContent className="p-6">
                <div className="text-sm text-accent font-medium mb-2">January 21, 2024</div>
                <h3 className="font-serif font-semibold text-lg mb-2">Men's Prayer Breakfast</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Join us for fellowship, prayer, and encouragement as we start the day together.
                </p>
                <Button size="sm" variant="outline">Learn More</Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <Heart className="h-12 w-12 text-primary-foreground" />
              </div>
              <CardContent className="p-6">
                <div className="text-sm text-primary font-medium mb-2">February 14, 2024</div>
                <h3 className="font-serif font-semibold text-lg mb-2">Marriage Enrichment Seminar</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Strengthen your marriage with biblical principles and practical wisdom.
                </p>
                <Button size="sm" variant="outline">Learn More</Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-primary/70 to-accent/70 flex items-center justify-center">
                <Users className="h-12 w-12 text-primary-foreground" />
              </div>
              <CardContent className="p-6">
                <div className="text-sm text-accent font-medium mb-2">March 15-17, 2024</div>
                <h3 className="font-serif font-semibold text-lg mb-2">Youth Conference</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Three days of worship, teaching, and fellowship for our young people.
                </p>
                <Button size="sm" variant="outline">Learn More</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <ChurchFooter />
    </div>
  );
};

export default Index;
