import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdSense, AdDisplay, InFeedAd } from "@/components/ads";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const AdDemo = () => {
  // Simulated content items for the in-feed ad demo
  const demoContentItems = Array(9).fill(null).map((_, i) => ({
    id: i + 1,
    title: `Example Content Item ${i + 1}`,
    description: `This is a placeholder for real content item ${i + 1}.`
  }));
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">AdSense Demo</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Basic AdSense Components</h2>
          <p className="text-muted-foreground mb-6">
            Direct integration with Google AdSense for simple ad placements
          </p>
          
          <Card>
            <CardHeader>
              <CardTitle>Anywhere Ad Unit</CardTitle>
              <CardDescription>
                Responsive ad that adapts to different screen sizes and placements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdSense type="anywhere" className="w-full min-h-[250px] border border-dashed border-gray-600 rounded-md" />
            </CardContent>
          </Card>

          <Separator className="my-8" />
          
          <Card>
            <CardHeader>
              <CardTitle>Multiplex Ad Unit</CardTitle>
              <CardDescription>
                Multiple ads in a relaxed format for content-rich areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdSense type="multiplex" className="w-full min-h-[400px] border border-dashed border-gray-600 rounded-md" />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Enhanced Ad Components</h2>
          <p className="text-muted-foreground mb-6">
            Advanced components with additional features like loading states and frequency control
          </p>
          
          <Card>
            <CardHeader>
              <CardTitle>Banner Ad Component</CardTitle>
              <CardDescription>
                Horizontal banner with premium user filtering and impression tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdDisplay type="banner" forceShow={true} />
            </CardContent>
          </Card>

          <Separator className="my-8" />
          
          <Card>
            <CardHeader>
              <CardTitle>Rectangle Ad Component</CardTitle>
              <CardDescription>
                Medium rectangle format with loading indicator and ad choices link
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <AdDisplay type="rectangle" forceShow={true} />
            </CardContent>
          </Card>
          
          <Separator className="my-8" />
          
          <Card>
            <CardHeader>
              <CardTitle>Interstitial Ad Component</CardTitle>
              <CardDescription>
                Full-size ad with close button (appears after 5 seconds)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdDisplay type="interstitial" forceShow={true} />
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Separator className="my-10" />
      
      <div>
        <h2 className="text-xl font-semibold mb-4">In-Feed Ad Integration</h2>
        <p className="text-muted-foreground mb-6">
          Example of how ads are automatically integrated into content feeds with frequency control
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Content Feed With Ads</CardTitle>
                <CardDescription>
                  Ads appear after every 3 content items
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {demoContentItems.map((item, index) => (
                  <div key={item.id}>
                    <div className="p-4 rounded-lg bg-card border">
                      <h3 className="font-medium mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    
                    {/* This component will automatically show ads at the right frequency */}
                    <InFeedAd 
                      index={index} 
                      frequency={3} 
                      type="anywhere"
                      forceShow={index === 2 || index === 5 || index === 8}
                      // For demo, we force ads to show at specific positions
                      // In a real app, remove the forceShow prop
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>How In-Feed Ads Work</CardTitle>
                <CardDescription>
                  Add ads to content lists with minimal effort
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md mb-4">
                  <pre className="text-xs overflow-x-auto">
{`// In your content rendering loop
{contentItems.map((item, index) => (
  <div key={item.id}>
    <ContentCard item={item} />
    
    {/* This automatically handles showing ads 
       at the correct frequency */}
    <InFeedAd index={index} />
  </div>
))}`}
                  </pre>
                </div>
                
                <div className="text-sm space-y-4">
                  <div>
                    <h4 className="font-semibold">Key Features:</h4>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                      <li>Automatic frequency control (e.g., every 3rd item)</li>
                      <li>Premium user filtering (no ads for premium users)</li>
                      <li>Loading state management with skeleton UI</li>
                      <li>Respects cooldown periods between ad displays</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-yellow-900/20 rounded-lg">
        <p className="text-sm">
          <strong>Note:</strong> AdSense ads may not appear during development or until the site is approved by Google. 
          You might see empty spaces or test ads during the review period.
        </p>
      </div>
    </div>
  );
};

export default AdDemo;