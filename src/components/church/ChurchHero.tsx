
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const ChurchHero = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-serif font-bold text-foreground leading-tight">
                Welcome to Faith Healing Bible Church
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                A place where faith comes alive, healing flows, and community thrives. 
                Join us in experiencing God's love and transforming power.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link to="/visit">
                  Plan Your Visit
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/about">Learn More</Link>
              </Button>
            </div>

            {/* Service Times */}
            <div className="bg-card/50 backdrop-blur rounded-lg p-6 space-y-4">
              <h3 className="font-serif font-semibold text-lg">Join Us This Sunday</h3>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>9:00 AM & 11:30 AM</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Beccle St, London</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Every Sunday</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] bg-gradient-to-br from-primary to-accent rounded-lg shadow-2xl flex items-center justify-center">
              <div className="text-center text-primary-foreground">
                <div className="w-24 h-24 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold">F</span>
                </div>
                <p className="text-sm opacity-90">Church Image Placeholder</p>
              </div>
            </div>
            
            {/* Floating cards */}
            <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-lg shadow-lg border">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Members</div>
              </div>
            </div>
            
            <div className="absolute -top-6 -right-6 bg-card p-4 rounded-lg shadow-lg border">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">3</div>
                <div className="text-sm text-muted-foreground">Branches</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChurchHero;
