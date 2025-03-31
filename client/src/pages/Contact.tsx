import { Helmet } from "react-helmet";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent",
        description: "Thank you for contacting us. We'll get back to you soon!",
      });
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        category: ""
      });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | Madifa</title>
      </Helmet>
      <Navbar />
      <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-350px)]">
        <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="prose prose-invert max-w-none">
              <p className="text-lg">
                We'd love to hear from you! Whether you have questions about your subscription, feedback on our content, 
                or business inquiries, our team is here to help.
              </p>
              
              <h2>How Can We Help?</h2>
              <p>
                Fill out the form with your details and we'll get back to you as soon as possible. Alternatively, 
                you can reach out to us directly using the contact information below.
              </p>
              
              <h3>Customer Support</h3>
              <p>
                For issues related to your account, subscriptions, or technical difficulties:
                <br />
                <strong>Email:</strong> support@madifa.com
                <br />
                <strong>Phone:</strong> +27 10 123 4567
                <br />
                <strong>Hours:</strong> Monday to Friday, 8:00 AM - 6:00 PM SAST
              </p>
              
              <h3>Content Submissions</h3>
              <p>
                Interested in having your content featured on Madifa?
                <br />
                <strong>Email:</strong> creators@madifa.com
              </p>
              
              <h3>Business Inquiries</h3>
              <p>
                For partnerships, advertising, and other business opportunities:
                <br />
                <strong>Email:</strong> partnerships@madifa.com
              </p>
              
              <h3>Office Location</h3>
              <p>
                Madifa<br />
                123 Main Street<br />
                Johannesburg<br />
                South Africa
              </p>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full"
                  placeholder="Enter your email address"
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-1">
                  Inquiry Category <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.category}
                  onValueChange={handleSelectChange}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="account">Account & Subscription</SelectItem>
                    <SelectItem value="technical">Technical Support</SelectItem>
                    <SelectItem value="content">Content Submission</SelectItem>
                    <SelectItem value="business">Business Inquiry</SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full"
                  placeholder="Enter subject"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full min-h-[150px]"
                  placeholder="Enter your message"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Contact;