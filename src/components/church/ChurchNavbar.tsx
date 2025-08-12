
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

const ChurchNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">F</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-serif font-semibold text-lg text-foreground">
                Faith Healing Bible Church
              </span>
              <p className="text-sm text-muted-foreground">Beccle St Branch</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/" className="text-foreground hover:text-primary transition-colors">
                    Home
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger>About</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-[400px]">
                      <Link to="/about" className="block p-3 space-y-1 hover:bg-accent/50 rounded-md">
                        <div className="text-sm font-medium">Our Story</div>
                        <p className="text-sm text-muted-foreground">Learn about our church history and mission</p>
                      </Link>
                      <Link to="/leadership" className="block p-3 space-y-1 hover:bg-accent/50 rounded-md">
                        <div className="text-sm font-medium">Leadership</div>
                        <p className="text-sm text-muted-foreground">Meet our pastoral team and leaders</p>
                      </Link>
                      <Link to="/beliefs" className="block p-3 space-y-1 hover:bg-accent/50 rounded-md">
                        <div className="text-sm font-medium">What We Believe</div>
                        <p className="text-sm text-muted-foreground">Our statement of faith and core beliefs</p>
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Ministries</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-[400px]">
                      <Link to="/ministries/mens" className="block p-3 space-y-1 hover:bg-accent/50 rounded-md">
                        <div className="text-sm font-medium">Men's Ministry</div>
                        <p className="text-sm text-muted-foreground">Fellowship and growth for men</p>
                      </Link>
                      <Link to="/ministries/womens" className="block p-3 space-y-1 hover:bg-accent/50 rounded-md">
                        <div className="text-sm font-medium">Women's Ministry</div>
                        <p className="text-sm text-muted-foreground">Empowering women in faith</p>
                      </Link>
                      <Link to="/ministries/youth" className="block p-3 space-y-1 hover:bg-accent/50 rounded-md">
                        <div className="text-sm font-medium">Youth & Young Adults</div>
                        <p className="text-sm text-muted-foreground">Ages 13-30 ministry</p>
                      </Link>
                      <Link to="/ministries/children" className="block p-3 space-y-1 hover:bg-accent/50 rounded-md">
                        <div className="text-sm font-medium">Children's Ministry</div>
                        <p className="text-sm text-muted-foreground">Building faith in young hearts</p>
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/events" className="text-foreground hover:text-primary transition-colors">
                    Events
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/give" className="text-foreground hover:text-primary transition-colors">
                    Give
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
                    Contact
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Button asChild>
              <Link to="/visit">Plan Your Visit</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/40">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-foreground hover:text-primary">Home</Link>
              <Link to="/about" className="text-foreground hover:text-primary">About</Link>
              <Link to="/ministries" className="text-foreground hover:text-primary">Ministries</Link>
              <Link to="/events" className="text-foreground hover:text-primary">Events</Link>
              <Link to="/give" className="text-foreground hover:text-primary">Give</Link>
              <Link to="/contact" className="text-foreground hover:text-primary">Contact</Link>
              <Button asChild className="w-fit">
                <Link to="/visit">Plan Your Visit</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default ChurchNavbar;
