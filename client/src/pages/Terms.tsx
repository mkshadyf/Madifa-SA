import { Helmet } from "react-helmet";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service | Madifa</title>
      </Helmet>
      <Navbar />
      <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-350px)]">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-lg mb-4">
            Last Updated: {new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          
          <p className="mb-6">
            Welcome to Madifa. These Terms of Service ("Terms") govern your use of the Madifa streaming service, website, and applications (collectively, the "Service"). Please read these Terms carefully before using the Service.
          </p>
          
          <h2>1. Agreement to Terms</h2>
          
          <p>
            By using the Service, you agree to be bound by these Terms. If you don't agree to these Terms, you may not use the Service. The Service is not available to anyone previously suspended or removed from the Service by Madifa.
          </p>
          
          <h2>2. Privacy Policy</h2>
          
          <p>
            Our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> describes how we handle the information you provide to us when you use the Service. You understand that through your use of the Service, you consent to the collection and use of this information as set forth in the Privacy Policy.
          </p>
          
          <h2>3. Your Account</h2>
          
          <p>
            To use certain features of the Service, you must register for an account. When you register, you agree to provide accurate, current, and complete information about yourself. You also agree to maintain and promptly update this information.
          </p>
          
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to immediately notify Madifa of any unauthorized use of your account or any other breach of security.
          </p>
          
          <h2>4. Subscription and Payments</h2>
          
          <h3>4.1 Subscription Plans</h3>
          <p>
            Madifa offers various subscription plans, including a free tier with limited content and premium tiers with additional features and content. Details about our current subscription plans are available on our website.
          </p>
          
          <h3>4.2 Payment Terms</h3>
          <p>
            By subscribing to a premium tier, you authorize Madifa to charge your payment method for the subscription fee on a recurring basis until you cancel. We may change subscription fees at any time, but we'll give you reasonable notice before changes apply to you.
          </p>
          
          <h3>4.3 Free Trials</h3>
          <p>
            We may offer free trials for premium tiers. If you sign up for a free trial, we'll begin charging your payment method for the subscription fee at the end of the trial period unless you cancel before that time.
          </p>
          
          <h3>4.4 Cancellation</h3>
          <p>
            You may cancel your subscription at any time. If you cancel, you'll continue to have access to the premium tier until the end of your current billing period, but you won't receive a refund for any fees already paid.
          </p>
          
          <h2>5. Content and Conduct</h2>
          
          <h3>5.1 Content Ownership</h3>
          <p>
            All content on the Service, including but not limited to videos, images, text, software, and trademarks, is owned or licensed by Madifa and is subject to copyright and other intellectual property rights.
          </p>
          
          <h3>5.2 Content License</h3>
          <p>
            Madifa grants you a limited, non-exclusive, non-transferable license to access and view the content on the Service for personal, non-commercial purposes. You may not download, copy, reproduce, distribute, transmit, broadcast, display, sell, license, or otherwise exploit any content on the Service for any other purposes without the prior written consent of Madifa or the respective licensors of the content.
          </p>
          
          <h3>5.3 User Content</h3>
          <p>
            If you submit reviews, comments, or other content to the Service, you grant Madifa a worldwide, non-exclusive, royalty-free license to use, reproduce, distribute, display, and publish that content in connection with the Service. You represent and warrant that you have all rights necessary to grant this license.
          </p>
          
          <h3>5.4 Prohibited Conduct</h3>
          <p>
            You agree not to:
          </p>
          <ul>
            <li>Use the Service for any illegal purpose</li>
            <li>Violate any laws in your jurisdiction</li>
            <li>Circumvent or attempt to circumvent any technological measure implemented by Madifa to protect the Service or its content</li>
            <li>Use automated means to access the Service or collect information from it</li>
            <li>Impersonate any person or entity or misrepresent your affiliation with a person or entity</li>
            <li>Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Service</li>
            <li>Attempt to access any other user's account</li>
            <li>Share your account credentials with anyone else</li>
            <li>Share, transfer, or facilitate account sharing with others</li>
          </ul>
          
          <h2>6. Content Availability</h2>
          
          <p>
            Madifa reserves the right to add or remove content from the Service at any time. The availability of content may vary by region and may change over time. We make no guarantees about the content that will be available through the Service.
          </p>
          
          <h2>7. Service Modifications</h2>
          
          <p>
            Madifa reserves the right to modify or discontinue, temporarily or permanently, the Service (or any part of it) with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the Service.
          </p>
          
          <h2>8. Termination</h2>
          
          <p>
            We may terminate or suspend your account and access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users of the Service, Madifa, or third parties, or for any other reason.
          </p>
          
          <p>
            If your account is terminated, you must immediately stop using the Service and will lose access to your account and all content associated with it.
          </p>
          
          <h2>9. Disclaimers</h2>
          
          <p>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
          </p>
          
          <p>
            MADIFA DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE, THAT DEFECTS WILL BE CORRECTED, OR THAT THE SERVICE OR THE SERVERS THAT MAKE IT AVAILABLE ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
          </p>
          
          <h2>10. Limitation of Liability</h2>
          
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, MADIFA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (A) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE; (B) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICE; OR (C) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT.
          </p>
          
          <h2>11. Governing Law</h2>
          
          <p>
            These Terms shall be governed by the laws of the Republic of South Africa, without regard to its conflict of law provisions. You agree to submit to the personal and exclusive jurisdiction of the courts located in Johannesburg, South Africa.
          </p>
          
          <h2>12. Changes to Terms</h2>
          
          <p>
            We may update these Terms from time to time. If we make material changes, we will notify you by email or through the Service. Your continued use of the Service after such notice constitutes your acceptance of the new Terms.
          </p>
          
          <h2>13. Contact Us</h2>
          
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <p>
            Madifa<br />
            Email: legal@madifa.com<br />
            Address: 123 Main Street, Johannesburg, South Africa
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Terms;