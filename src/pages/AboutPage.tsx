
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Heart, 
  Book, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail,
  Award,
  Target,
  Eye
} from 'lucide-react';
import { ChurchNavbar } from '@/components/church/ChurchNavbar';
import { ChurchFooter } from '@/components/church/ChurchFooter';

const AboutPage = () => {
  const leadership = [
    {
      name: 'Pastor John Williams',
      role: 'Senior Pastor',
      image: '/placeholder.svg',
      description: 'Leading our congregation with wisdom and compassion for over 15 years.',
      email: 'pastor@ourcommunitychurch.com'
    },
    {
      name: 'Elder Sarah Johnson',
      role: 'Elder & Worship Leader',
      image: '/placeholder.svg',
      description: 'Passionate about worship and spiritual growth in our community.',
      email: 'sarah@ourcommunitychurch.com'
    },
    {
      name: 'Deacon Michael Brown',
      role: 'Head of Men\'s Ministry',
      image: '/placeholder.svg',
      description: 'Dedicated to building strong Christian men and fathers.',
      email: 'michael@ourcommunitychurch.com'
    },
    {
      name: 'Sister Grace Davis',
      role: 'Women\'s Ministry Leader',
      image: '/placeholder.svg',
      description: 'Empowering women through faith-based fellowship and service.',
      email: 'grace@ourcommunitychurch.com'
    }
  ];

  const ministries = [
    {
      name: 'Men\'s Ministry',
      description: 'Building godly men through fellowship, accountability, and service.',
      icon: <Users className="h-6 w-6" />,
      participants: 45,
      meetings: 'Monthly - First Saturday'
    },
    {
      name: 'Women\'s Ministry',
      description: 'Encouraging women in their faith journey and life purpose.',
      icon: <Heart className="h-6 w-6" />,
      participants: 60,
      meetings: 'Bi-weekly - Tuesday evenings'
    },
    {
      name: 'Youth Ministry',
      description: 'Engaging young people in dynamic worship and discipleship.',
      icon: <Book className="h-6 w-6" />,
      participants: 35,
      meetings: 'Weekly - Friday evenings'
    },
    {
      name: 'Children\'s Ministry',
      description: 'Teaching children about God\'s love through fun and interactive programs.',
      icon: <Award className="h-6 w-6" />,
      participants: 28,
      meetings: 'Sunday School & Children\'s Church'
    }
  ];

  const milestones = [
    {
      year: '1985',
      title: 'Church Founded',
      description: 'Started as a small fellowship group meeting in homes.'
    },
    {
      year: '1992',
      title: 'First Building',
      description: 'Purchased our first church building to accommodate growing congregation.'
    },
    {
      year: '2001',
      title: 'Expansion Project',
      description: 'Added educational wing and fellowship hall.'
    },
    {
      year: '2010',
      title: 'Community Outreach',
      description: 'Launched food bank and community service programs.'
    },
    {
      year: '2018',
      title: 'Digital Ministry',
      description: 'Introduced online streaming and digital discipleship programs.'
    },
    {
      year: '2023',
      title: 'Ministry Growth',
      description: 'Established specialized committees and expanded leadership structure.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <ChurchNavbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">About Our Community Church</h1>
          <p className="text-xl max-w-3xl mx-auto mb-8">
            For nearly four decades, we've been a beacon of hope and faith in our community, 
            committed to spreading God's love and building lasting relationships.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" variant="secondary">
              <Calendar className="mr-2 h-4 w-4" />
              Visit Us Sunday
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-900">
              <Phone className="mr-2 h-4 w-4" />
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="border-l-4 border-l-blue-600">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5 text-blue-600" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  To glorify God by making disciples of Jesus Christ who love God, love others, 
                  and serve the world. We are committed to creating an environment where people 
                  can experience authentic community, grow in their faith, and discover their 
                  God-given purpose.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-600">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="mr-2 h-5 w-5 text-green-600" />
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  To be a thriving community of believers who transform lives and communities 
                  through the power of Christ. We envision a church that bridges generations, 
                  cultures, and backgrounds, united in our love for God and commitment to 
                  serving others.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Core Values */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Love</h3>
                <p className="text-sm text-gray-600">Unconditional love for God and others</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Book className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Truth</h3>
                <p className="text-sm text-gray-600">Grounded in Biblical truth and integrity</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Community</h3>
                <p className="text-sm text-gray-600">Authentic fellowship and support</p>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">Service</h3>
                <p className="text-sm text-gray-600">Serving others with humility and joy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Leadership Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Meet the dedicated leaders who guide our church with wisdom, 
              compassion, and a heart for serving God and our community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {leadership.map((leader, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                    <img 
                      src={leader.image} 
                      alt={leader.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{leader.name}</h3>
                  <Badge variant="secondary" className="mb-3">{leader.role}</Badge>
                  <p className="text-sm text-gray-600 mb-4">{leader.description}</p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Mail className="mr-2 h-3 w-3" />
                    Contact
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Ministries Overview */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Ministries</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover the various ways you can get involved and grow in your faith 
              through our diverse ministry programs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {ministries.map((ministry, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="bg-blue-100 rounded-lg w-10 h-10 flex items-center justify-center mr-3">
                      {ministry.icon}
                    </div>
                    {ministry.name}
                  </CardTitle>
                  <CardDescription>{ministry.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{ministry.participants}</p>
                        <p className="text-xs text-gray-600">Participants</p>
                      </div>
                    </div>
                    <Badge variant="outline">{ministry.meetings}</Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Church History Timeline */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From humble beginnings to a thriving community, see how God has blessed 
              our church throughout the years.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-200"></div>
              
              {milestones.map((milestone, index) => (
                <div key={index} className="relative flex items-start mb-8">
                  <div className="bg-blue-600 rounded-full w-4 h-4 mt-2 mr-6 z-10 border-4 border-white shadow"></div>
                  <Card className="flex-1">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{milestone.title}</h3>
                        <Badge variant="secondary">{milestone.year}</Badge>
                      </div>
                      <p className="text-gray-600">{milestone.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Visit Us</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              We'd love to meet you! Join us for worship, fellowship, and community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">Location</h3>
              <p className="text-gray-300">
                123 Community Street<br />
                Your City, State 12345
              </p>
            </div>
            <div>
              <div className="bg-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">Service Times</h3>
              <p className="text-gray-300">
                Sunday Worship: 9:00 AM<br />
                Sunday School: 10:30 AM<br />
                Wednesday Bible Study: 7:00 PM
              </p>
            </div>
            <div>
              <div className="bg-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">Contact</h3>
              <p className="text-gray-300">
                Phone: (555) 123-4567<br />
                Email: info@ourcommunitychurch.com
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="secondary">
              <Calendar className="mr-2 h-4 w-4" />
              Plan Your Visit
            </Button>
          </div>
        </div>
      </section>

      <ChurchFooter />
    </div>
  );
};

export default AboutPage;
