
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main footer content */}
      <div className="container mx-auto px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company info */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Faith Healing Bible Church</h3>
              <p className="text-yellow-400 font-medium mb-4">Beccle St Branch</p>
              <p className="text-gray-300 max-w-md">
                Empowering churches with modern management tools and beautiful websites 
                that strengthen community and simplify ministry.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <MapPin className="w-5 h-5 mr-3 text-yellow-400" />
                <span>123 Beccle Street, Faith City, FC 12345</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Phone className="w-5 h-5 mr-3 text-yellow-400" />
                <span>(555) 123-FAITH</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Mail className="w-5 h-5 mr-3 text-yellow-400" />
                <span>info@faithhealingchurch.org</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Platform</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors">Features</a></li>
              <li><a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors">Demo</a></li>
              <li><a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors">Support</a></li>
              <li><a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors">Documentation</a></li>
            </ul>
          </div>

          {/* Church info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Church</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors">Sermons</a></li>
              <li><a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors">Ministries</a></li>
              <li><a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors">Events</a></li>
              <li><a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Social media and CTA */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-6 md:mb-0">
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <Youtube className="w-6 h-6" />
              </a>
            </div>

            <div className="text-center md:text-right">
              <p className="text-gray-300 mb-4">Ready to transform your church?</p>
              <Button className="btn-secondary">
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 py-6">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <div className="flex items-center mb-4 md:mb-0">
              <Heart className="w-4 h-4 mr-2 text-red-500" />
              <span>Made with love for the church community</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-yellow-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-yellow-400 transition-colors">Terms of Service</a>
              <span>© 2024 Faith Healing Bible Church. All rights reserved.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
