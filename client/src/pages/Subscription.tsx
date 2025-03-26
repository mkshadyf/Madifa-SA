import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plan } from "@shared/types";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Loader, CreditCard, ArrowRight } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import AuthModal from "@/components/auth/AuthModal";

const Subscription = () => {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Fetch current subscription status
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const res = await fetch("/api/subscription/status", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          setCurrentSubscription(data.subscription);
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubscription();
  }, [user]);
  
  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
  };
  
  const handleSubscribe = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    if (!selectedPlan) {
      toast({
        title: "Please select a plan",
        description: "You need to select a subscription plan to continue.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const res = await apiRequest("/api/subscription/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          amount: selectedPlan.price * 100, // Convert to cents
          name: `${selectedPlan.name} Plan`,
          returnUrl: `${window.location.origin}/subscription?status=success`,
          cancelUrl: `${window.location.origin}/subscription?status=cancelled`,
        }),
      });
      
      if (res.ok) {
        const { paymentUrl } = await res.json();
        window.location.href = paymentUrl;
      } else {
        const error = await res.json();
        toast({
          title: "Subscription Error",
          description: error.message || "Failed to create subscription",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      toast({
        title: "Subscription Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCancelSubscription = async () => {
    if (!user || !currentSubscription) return;
    
    setIsProcessing(true);
    
    try {
      const res = await apiRequest("/api/subscription/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setCurrentSubscription(data.subscription);
        
        toast({
          title: "Subscription Cancelled",
          description: "Your subscription has been cancelled. You'll still have access until the end of your current billing period.",
        });
      } else {
        const error = await res.json();
        toast({
          title: "Cancellation Error",
          description: error.message || "Failed to cancel subscription",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Cancellation Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle payment URL parameters and subscription status updates
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const status = searchParams.get("status");
    
    // Show appropriate toasts based on URL status parameter
    if (status === "success") {
      toast({
        title: "Payment Initiated",
        description: "Your payment is being processed. It may take a few moments to activate your subscription.",
      });
    } else if (status === "cancelled") {
      toast({
        title: "Payment Cancelled",
        description: "You have cancelled the payment process.",
        variant: "destructive",
      });
    } else if (status === "error") {
      const errorMsg = searchParams.get("error") || "An unknown error occurred";
      toast({
        title: "Payment Error",
        description: decodeURIComponent(errorMsg),
        variant: "destructive",
      });
    }
    
    // Remove query params from URL (for all status types)
    if (status) {
      window.history.replaceState({}, document.title, "/subscription");
    }
    
    // If no user is signed in, no need to proceed
    if (!user) return;
    
    // Track the previous status to detect changes
    let previousStatus = currentSubscription?.status;
    
    // Define subscription status fetching function
    const fetchSubscription = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) return;
        
        const response = await fetch("/api/subscription/status", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Update subscription state
          setCurrentSubscription(data.subscription);
          
          // Detect status transitions from pending to active/failed
          if (previousStatus === "pending" && data.subscription?.status === "active") {
            toast({
              title: "Subscription Active",
              description: "Your premium subscription is now active! Enjoy ad-free content.",
            });
          } else if (previousStatus === "pending" && data.subscription?.status === "failed") {
            toast({
              title: "Payment Failed",
              description: "There was a problem with your payment. Please try again.",
              variant: "destructive",
            });
          }
          
          // Update previous status for next check
          previousStatus = data.subscription?.status;
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
      }
    };
    
    // Perform initial fetch
    fetchSubscription();
    
    // Set up polling interval - more frequent for pending payments
    const isPending = currentSubscription?.status === "pending" || status === "success";
    const interval = isPending ? 5000 : 30000;
    
    const checkInterval = setInterval(() => {
      if (!document.hidden) { // Only check when tab is visible
        fetchSubscription();
      }
    }, interval);
    
    // Clean up on unmount
    return () => clearInterval(checkInterval);
  }, [user, currentSubscription?.status, toast]);
  
  if (!user && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
            <p className="mb-6 text-muted-foreground">
              You need to sign in to manage your subscription.
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => setShowAuthModal(true)}>Sign In</Button>
              <Button variant="outline" onClick={() => navigate("/")}>
                Back to Home
              </Button>
            </div>
          </div>
        </main>
        <Footer />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialView="login"
        />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Madifa Premium</h1>
          <p className="text-muted-foreground mb-8">
            Upgrade your viewing experience with ad-free content and exclusive premium movies and series
          </p>
          
          {/* Subscription Status Section */}
          {user && (
            <div className="mb-8">
              {isLoading ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-center">
                      <Loader className="h-8 w-8 animate-spin text-primary" />
                    </div>
                    <p className="text-center mt-4">Loading subscription information...</p>
                  </CardContent>
                </Card>
              ) : currentSubscription?.status === "active" ? (
                <Card className="border-primary/50 bg-primary/5">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">Active Subscription</CardTitle>
                      <Badge variant="premium">Premium</Badge>
                    </div>
                    <CardDescription>
                      You are currently enjoying Madifa Premium
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium">Plan Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                          <div>
                            <span className="text-sm text-muted-foreground">Plan Name:</span>
                            <p>Premium</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Price:</span>
                            <p>R59/month</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Status:</span>
                            <p className={
                              currentSubscription.status === "cancelled" 
                                ? "text-yellow-500" 
                                : "text-green-500"
                            }>
                              {currentSubscription.status === "cancelled" 
                                ? "Cancelled (active until period ends)" 
                                : "Active"
                              }
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Next Billing Date:</span>
                            <p>
                              {currentSubscription.endDate
                                ? new Date(currentSubscription.endDate).toLocaleDateString()
                                : "Not available"}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium">Benefits</h3>
                        <ul className="mt-2 space-y-2">
                          <li className="flex items-center">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                            Ad-free viewing
                          </li>
                          <li className="flex items-center">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                            Access to all premium content
                          </li>
                          <li className="flex items-center">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                            HD and 4K quality where available
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {currentSubscription.status !== "cancelled" && (
                      <Button 
                        variant="destructive" 
                        onClick={handleCancelSubscription}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Cancel Subscription"
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ) : currentSubscription?.status === "pending" ? (
                <Card className="border-yellow-500/50 bg-yellow-500/5">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">Payment Processing</CardTitle>
                      <Badge className="bg-yellow-500">Pending</Badge>
                    </div>
                    <CardDescription>
                      Your subscription payment is being processed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-center py-4">
                        <div className="text-center">
                          <Loader className="h-12 w-12 animate-spin text-yellow-500 mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            We're waiting for confirmation from PayFast. This usually takes just a few moments.
                          </p>
                        </div>
                      </div>

                      {currentSubscription.paymentId && (
                        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
                          <h3 className="font-medium mb-2">Payment Details</h3>
                          <div className="grid grid-cols-1 gap-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Transaction ID:</span>
                              <span className="font-mono">{currentSubscription.paymentId}</span>
                            </div>
                            {currentSubscription.paymentReference && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">PayFast Reference:</span>
                                <span className="font-mono">{currentSubscription.paymentReference}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Amount:</span>
                              <span>R{(currentSubscription.amount / 100).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Date:</span>
                              <span>{new Date(currentSubscription.startDate).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="rounded-lg bg-muted p-4">
                        <h3 className="font-medium mb-2">What happens next?</h3>
                        <ol className="space-y-2 list-decimal list-inside text-sm">
                          <li>PayFast is processing your payment</li>
                          <li>Once confirmed, your account will be upgraded automatically</li>
                          <li>You'll receive a confirmation notification</li>
                          <li>You can refresh this page to check your status</li>
                        </ol>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="w-full flex flex-col space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => window.location.reload()}
                      >
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Refresh Status
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        The page will also refresh automatically every few seconds
                      </p>
                    </div>
                  </CardFooter>
                </Card>
              ) : (
                <Alert variant="default" className="bg-primary/10 border-primary/30">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  <AlertTitle>You're on the Free Plan</AlertTitle>
                  <AlertDescription>
                    Upgrade to Premium for ad-free viewing and access to exclusive content.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          
          {/* Subscription Plans Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Subscription Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Free Plan */}
              <Card className={`border-2 ${selectedPlan === null ? 'border-primary' : 'border-transparent'}`}>
                <CardHeader>
                  <CardTitle>Free Plan</CardTitle>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-3xl font-bold">R0</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <Badge>Free</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Access to free content</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>Watch trailers for premium content</span>
                    </li>
                    <li className="flex items-start text-muted-foreground">
                      <AlertCircle className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
                      <span>Ad-supported viewing experience</span>
                    </li>
                    <li className="flex items-start text-muted-foreground">
                      <AlertCircle className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
                      <span>Limited video quality</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setSelectedPlan(null)}
                  >
                    {currentSubscription?.status === "active" ? "Already Subscribed" : "Current Plan"}
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Premium Plan */}
              {SUBSCRIPTION_PLANS.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`border-2 ${selectedPlan?.id === plan.id ? 'border-primary' : 'border-transparent'}`}
                >
                  <CardHeader>
                    <CardTitle>{plan.name} Plan</CardTitle>
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-3xl font-bold">{plan.currency}{plan.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      <Badge variant="premium">Premium</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {currentSubscription?.status === "active" ? (
                      <Button className="w-full" disabled>
                        Current Plan
                      </Button>
                    ) : (
                      <Button 
                        className="w-full"
                        onClick={() => handleSelectPlan(plan)}
                        variant={selectedPlan?.id === plan.id ? "default" : "outline"}
                      >
                        {selectedPlan?.id === plan.id ? "Selected" : "Select Plan"}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Payment Action */}
          {(!currentSubscription?.status || 
            (currentSubscription.status !== "active" && 
             currentSubscription.status !== "pending")) ? (
            <div className="flex justify-center">
              <Button 
                size="lg" 
                className="px-8"
                onClick={handleSubscribe}
                disabled={!selectedPlan || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Subscribe Now
                  </>
                )}
              </Button>
            </div>
          ) : null}
          
        </div>
      </main>
      
      <Footer />
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialView="login"
      />
    </div>
  );
};

export default Subscription;