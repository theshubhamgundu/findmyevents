import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export default function PlaceholderPage({ 
  title, 
  description, 
  icon = <Star className="w-12 h-12 text-fme-blue" /> 
}: PlaceholderPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="mb-6">
                {icon}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {title}
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                {description}
              </p>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Continue prompting to help me build out this page with more features and functionality.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/">
                    <Button variant="outline">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Home
                    </Button>
                  </Link>
                  
                  <Link to="/events">
                    <Button className="bg-fme-blue hover:bg-fme-blue/90">
                      Explore Events
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
