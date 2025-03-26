import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  const [, navigate] = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-primary/20 shadow-lg">
          <CardContent className="pt-8 pb-8 px-6">
            <div className="flex flex-col items-center text-center mb-6">
              <AlertCircle className="h-16 w-16 text-primary mb-4" />
              <h1 className="text-3xl font-bold text-foreground mb-2">404 Not Found</h1>
              <p className="text-muted-foreground">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <Button 
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
              
              <Button 
                className="flex items-center gap-2"
                onClick={() => navigate("/")}
              >
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}
