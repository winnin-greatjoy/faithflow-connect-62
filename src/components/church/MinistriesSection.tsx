import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Heart, Zap, Star, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Ministry {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

const getMinistryIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('men')) return Users;
  if (lowerName.includes('women')) return Heart;
  if (lowerName.includes('youth')) return Zap;
  if (lowerName.includes('children')) return Star;
  return Building2;
};

const MinistriesSection = () => {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMinistries = async () => {
      try {
        // Use direct fetch to bypass any auth context issues for public page
        const { data, error } = await supabase
          .from('ministries')
          .select('id, name, description, is_active')
          .eq('is_active', true)
          .order('name')
          .limit(4);

        if (error) {
          console.error('Error fetching ministries:', error);
          // Fallback to default ministries for public display
          setMinistries([
            { id: '1', name: "Men's Ministry", description: 'Building godly men who lead with integrity and purpose.', is_active: true },
            { id: '2', name: "Women's Ministry", description: 'Empowering women to grow in faith and serve the community.', is_active: true },
            { id: '3', name: "Youth Ministry", description: 'Helping young people discover their faith and purpose in life.', is_active: true },
            { id: '4', name: "Children's Ministry", description: 'Nurturing children in love and faith through fun activities.', is_active: true },
          ]);
        } else {
          setMinistries(data || []);
        }
      } catch (error) {
        console.error('Error fetching ministries:', error);
        // Use fallback data on error
        setMinistries([
          { id: '1', name: "Men's Ministry", description: 'Building godly men who lead with integrity and purpose.', is_active: true },
          { id: '2', name: "Women's Ministry", description: 'Empowering women to grow in faith and serve the community.', is_active: true },
          { id: '3', name: "Youth Ministry", description: 'Helping young people discover their faith and purpose in life.', is_active: true },
          { id: '4', name: "Children's Ministry", description: 'Nurturing children in love and faith through fun activities.', is_active: true },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMinistries();
  }, []);

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

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading ministries...</p>
          </div>
        ) : ministries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No active ministries found.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {ministries.map((ministry) => {
              const Icon = getMinistryIcon(ministry.name);
              return (
                <Card key={ministry.id} className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="font-serif">{ministry.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="mb-4">
                      {ministry.description || 'Empowering our community to grow in faith and serve with purpose.'}
                    </CardDescription>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/admin/${ministry.name.toLowerCase().replace(/['\s&]+/g, '-')}-ministry`}>Learn More</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

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
