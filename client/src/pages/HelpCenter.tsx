import { Helmet } from "react-helmet";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search } from "lucide-react";
import { Link } from "wouter";

const HelpCenter = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const faqs = [
    {
      category: "Account & Subscription",
      questions: [
        {
          question: "How do I create an account?",
          answer: "To create a new account, click on the 'Sign Up' button in the top-right corner of the page. Enter your email address and create a password. You'll then be asked to complete your profile information. After registration, you can browse our content catalog."
        },
        {
          question: "How do I subscribe to premium?",
          answer: "To subscribe to our premium plan, log in to your account, click on your profile picture, and select 'Subscription' from the dropdown menu. Choose the Premium subscription option and follow the instructions to complete payment via PayFast."
        },
        {
          question: "How can I cancel my subscription?",
          answer: "To cancel your subscription, go to your account settings by clicking on your profile picture and selecting 'Subscription'. Click on 'Cancel Subscription' and follow the prompts to confirm cancellation. Your subscription will remain active until the end of your current billing period."
        },
        {
          question: "Can I share my account with family members?",
          answer: "Madifa accounts are intended for individual use and should not be shared. Each viewer should create their own account to maintain personalized recommendations and watch history."
        },
      ]
    },
    {
      category: "Content & Viewing",
      questions: [
        {
          question: "Why can't I access certain content?",
          answer: "Some content on Madifa is labeled as 'Premium' and requires an active Premium subscription. If you have a Premium subscription but still can't access content, please try logging out and logging back in, or contact our support team."
        },
        {
          question: "How do I add content to My List?",
          answer: "To add content to your List, hover over a title and click the '+' button that appears. Alternatively, you can visit a content's detail page and click 'Add to My List'. To view your list, click on 'My List' in the main navigation menu."
        },
        {
          question: "Can I download content for offline viewing?",
          answer: "Yes, Premium subscribers can download content for offline viewing. Simply navigate to the content you want to download, click the download button, and select your preferred quality. Downloaded content will be available in the 'Downloads' section."
        },
        {
          question: "How do I rate or review content?",
          answer: "To rate content, navigate to the title's detail page and click on the star rating. To write a review, scroll down to the 'Reviews' section on the detail page, click 'Write a Review', and submit your thoughts."
        },
      ]
    },
    {
      category: "Technical Issues",
      questions: [
        {
          question: "Why is my video buffering or not playing?",
          answer: "Buffering issues are usually related to your internet connection. Try: 1) Checking your internet connection speed, 2) Lowering the video quality in the player settings, 3) Closing other applications or tabs that might be using bandwidth, 4) Restarting your device, or 5) Trying a different browser."
        },
        {
          question: "How do I fix audio or subtitle problems?",
          answer: "For audio issues, check your device volume and the volume settings in the video player. For subtitles, click the subtitles/CC button in the player controls to turn subtitles on/off or select a different language."
        },
        {
          question: "The website isn't loading properly. What should I do?",
          answer: "If the website isn't loading properly, try: 1) Refreshing the page, 2) Clearing your browser cache and cookies, 3) Trying a different browser, 4) Disabling browser extensions that might be interfering, or 5) Checking if your internet connection is stable."
        },
        {
          question: "How do I update the app on my device?",
          answer: "For web browsers, Madifa automatically updates when you refresh the page. For the PWA version, updates are applied automatically. For the Android app, updates are available through the Google Play Store."
        },
      ]
    },
    {
      category: "Billing & Payment",
      questions: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept credit cards, debit cards, and bank transfers through our secure payment processor, PayFast. All transactions are encrypted and secure."
        },
        {
          question: "Why was my payment declined?",
          answer: "Payments may be declined for various reasons, including insufficient funds, card expiration, incorrect card details, or bank security measures. Please verify your payment information and try again, or contact your bank for more information."
        },
        {
          question: "How do I update my payment method?",
          answer: "To update your payment method, go to your account settings by clicking on your profile picture and selecting 'Subscription'. Click on 'Update Payment Method' and follow the prompts to enter your new payment information."
        },
        {
          question: "How do I get a refund?",
          answer: "Refund requests are handled on a case-by-case basis. Please contact our support team at support@madifa.com with your account details and reason for requesting a refund, and we'll assist you further."
        },
      ]
    },
  ];
  
  const filteredFaqs = searchTerm.trim() === "" 
    ? faqs 
    : faqs.map(category => ({
        ...category,
        questions: category.questions.filter(qa => 
          qa.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
          qa.answer.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.questions.length > 0);
  
  return (
    <>
      <Helmet>
        <title>Help Center | Madifa</title>
      </Helmet>
      <Navbar />
      <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-350px)]">
        <h1 className="text-3xl font-bold mb-2">Help Center</h1>
        <p className="text-muted-foreground mb-8">Find answers to common questions about Madifa</p>
        
        {/* Search */}
        <div className="relative max-w-2xl mx-auto mb-10">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input
            type="text"
            placeholder="Search for answers..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-gray-800 p-4 rounded-lg text-center hover:bg-gray-700 transition-colors">
            <h3 className="font-medium mb-2">Account Help</h3>
            <p className="text-sm text-muted-foreground mb-2">Login issues, profile settings</p>
            <Button variant="link" asChild>
              <Link href="#account-subscription">View Articles</Link>
            </Button>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg text-center hover:bg-gray-700 transition-colors">
            <h3 className="font-medium mb-2">Billing Support</h3>
            <p className="text-sm text-muted-foreground mb-2">Payment issues, subscriptions</p>
            <Button variant="link" asChild>
              <Link href="#billing-payment">View Articles</Link>
            </Button>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg text-center hover:bg-gray-700 transition-colors">
            <h3 className="font-medium mb-2">Technical Support</h3>
            <p className="text-sm text-muted-foreground mb-2">Playback issues, device support</p>
            <Button variant="link" asChild>
              <Link href="#technical-issues">View Articles</Link>
            </Button>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg text-center hover:bg-gray-700 transition-colors">
            <h3 className="font-medium mb-2">Contact Us</h3>
            <p className="text-sm text-muted-foreground mb-2">Still need help?</p>
            <Button variant="link" asChild>
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
        
        {/* FAQs */}
        <div className="max-w-3xl mx-auto">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((category, index) => (
              <div key={index} className="mb-8" id={category.category.toLowerCase().replace(/\s+/g, '-')}>
                <h2 className="text-xl font-semibold mb-4">{category.category}</h2>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((qa, qIndex) => (
                    <AccordionItem key={qIndex} value={`item-${index}-${qIndex}`}>
                      <AccordionTrigger className="text-left">{qa.question}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {qa.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium mb-2">No results found</h3>
              <p className="text-muted-foreground">Please try a different search term or browse our categories below.</p>
              <Button variant="outline" onClick={() => setSearchTerm("")} className="mt-4">
                Clear Search
              </Button>
            </div>
          )}
        </div>
        
        {/* Contact CTA */}
        <div className="bg-gray-800 p-6 rounded-lg my-10 text-center">
          <h2 className="text-xl font-semibold mb-2">Still Need Help?</h2>
          <p className="text-muted-foreground mb-4">Our support team is ready to assist you with any questions or issues.</p>
          <Button asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default HelpCenter;