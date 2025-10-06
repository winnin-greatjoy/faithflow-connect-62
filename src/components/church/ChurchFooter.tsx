
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

const ChurchFooter = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {/* Church Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <img
              src="/lovable-uploads/5d36a4a9-6499-4550-9a40-87f4bc150872.png"
              alt="Faith Healing Bible Church Logo"
              className="w-10 h-10 rounded-sm"
            />
              </div>
              <div>
                <span className="font-serif font-semibold text-lg">
                  Faith Healing Bible Church
                </span>
                <p className="text-sm text-background/70">Beccle St Branch</p>
              </div>
            </div>
            <p className="text-background/80">
              A community of faith where healing <br/>flows,
              lives are transformed, and God's love is experienced by all.
            </p>
            <div className="flex space-x-3">
              <Button size="sm" variant="outline" className="bg-transparent border-background/30 text-background hover:bg-background hover:text-foreground">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" className="bg-transparent border-background/30 text-background hover:bg-background hover:text-foreground">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" className="bg-transparent border-background/30 text-background hover:bg-background hover:text-foreground">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-serif font-semibold text-lg">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/about" className="block text-background/80 hover:text-accent transition-colors">About Us</Link>
              <Link to="/ministries" className="block text-background/80 hover:text-accent transition-colors">Ministries</Link>
              <Link to="/events" className="block text-background/80 hover:text-accent transition-colors">Events</Link>
              <Link to="/give" className="block text-background/80 hover:text-accent transition-colors">Give Online</Link>
              <Link to="/prayer" className="block text-background/80 hover:text-accent transition-colors">Prayer Requests</Link>
              <Link to="/admin" className="block text-background/80 hover:text-accent transition-colors">Member Portal</Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-serif font-semibold text-lg">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-background/80">Beccle Street</p>
                  <p className="text-background/80">London, UK</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-background/80">+44 20 1234 5678</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-background/80">info@fhbc.org</span>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-background/80">Sunday Services:</p>
                  <p className="text-background/80">9:00 AM & 11:30 AM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-serif font-semibold text-lg">Stay Connected</h3>
            <p className="text-background/80">
              Subscribe to our newsletter for updates on events, sermons, and community news.
            </p>
            <div className="space-y-2">
              <Input 
                placeholder="Your email address" 
                className="bg-background/10 border-background/30 text-background placeholder:text-background/50"
              />
              <Button className="w-full bg-primary hover:bg-primary/90">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 mt-12 pt-8 text-center">
          <p className="text-background/60">
            © 2024 Faith Healing Bible Church - Beccle St Branch. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default ChurchFooter;
