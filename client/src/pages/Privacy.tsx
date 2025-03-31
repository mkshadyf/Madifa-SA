import { Helmet } from "react-helmet";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Madifa</title>
      </Helmet>
      <Navbar />
      <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-350px)]">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-lg mb-4">
            Last Updated: {new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          
          <p className="mb-6">
            At Madifa, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our streaming service, website, and applications (collectively, the "Service"). Please read this policy carefully. If you do not agree with the terms of this privacy policy, please do not access the Service.
          </p>
          
          <h2>1. Information We Collect</h2>
          
          <h3>1.1 Personal Information</h3>
          <p>
            We may collect personal information that you voluntarily provide when using our Service, including but not limited to:
          </p>
          <ul>
            <li>Name, email address, and contact information when you create an account</li>
            <li>Payment information when you subscribe to premium services</li>
            <li>Profile information such as profile picture and preferences</li>
            <li>Content you choose to upload, post, or submit to the Service</li>
            <li>Communications between you and Madifa</li>
          </ul>
          
          <h3>1.2 Automatically Collected Information</h3>
          <p>
            When you access or use our Service, we may automatically collect certain information, including:
          </p>
          <ul>
            <li>Device information (e.g., device type, operating system, browser type)</li>
            <li>IP address and location information</li>
            <li>Usage data (e.g., viewing history, search queries, interaction with content)</li>
            <li>Performance data and error reports</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
          
          <h2>2. How We Use Your Information</h2>
          
          <p>
            We may use the information we collect for various purposes, including:
          </p>
          <ul>
            <li>Providing, maintaining, and improving the Service</li>
            <li>Processing transactions and managing your account</li>
            <li>Personalizing your experience and content recommendations</li>
            <li>Communicating with you about your account, updates, and promotional offers</li>
            <li>Analyzing usage patterns and optimizing our Service</li>
            <li>Protecting against fraudulent, unauthorized, or illegal activity</li>
            <li>Enforcing our Terms of Service and other legal rights</li>
          </ul>
          
          <h2>3. Sharing Your Information</h2>
          
          <p>
            We may share your information in the following circumstances:
          </p>
          
          <h3>3.1 Service Providers</h3>
          <p>
            We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf, such as payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.
          </p>
          
          <h3>3.2 Business Transfers</h3>
          <p>
            If Madifa is involved in a merger, acquisition, or sale of all or a portion of its assets, your information may be transferred as part of that transaction. We will notify you of any change in ownership or uses of your information.
          </p>
          
          <h3>3.3 Legal Requirements</h3>
          <p>
            We may disclose your information where required to do so by law or in response to valid requests by public authorities (e.g., a court or government agency).
          </p>
          
          <h3>3.4 Protection of Rights</h3>
          <p>
            We may disclose your information to protect and defend the rights, property, or safety of Madifa, our users, or others.
          </p>
          
          <h3>3.5 With Your Consent</h3>
          <p>
            We may share your information with your consent or at your direction.
          </p>
          
          <h2>4. Data Retention</h2>
          
          <p>
            We will retain your information for as long as your account is active or as needed to provide you with the Service. We will also retain and use your information as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.
          </p>
          
          <h2>5. Cookies and Tracking Technologies</h2>
          
          <p>
            We use cookies and similar tracking technologies to track activity on our Service and hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier. For more information about the cookies we use, please see our <a href="/cookies" className="text-primary hover:underline">Cookie Policy</a>.
          </p>
          
          <h2>6. Third-Party Services</h2>
          
          <p>
            Our Service may contain links to third-party websites and services that are not owned or controlled by Madifa. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. We encourage you to review the privacy policies of any third-party websites or services that you visit.
          </p>
          
          <h2>7. Advertising</h2>
          
          <p>
            We may use third-party advertising companies to serve ads when you visit our Service. These companies may use information about your visits to our Service and other websites to provide advertisements about goods and services of interest to you.
          </p>
          
          <h2>8. Security</h2>
          
          <p>
            We use reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>
          
          <h2>9. Children's Privacy</h2>
          
          <p>
            The Service is not directed to children under the age of 13, and we do not knowingly collect personal information from children under 13. If we learn that we have collected personal information from a child under 13, we will promptly delete that information.
          </p>
          
          <h2>10. International Data Transfers</h2>
          
          <p>
            Your information may be transferred to, and maintained on, computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those in your jurisdiction. If you are located outside South Africa and choose to provide information to us, please note that we transfer the data to South Africa and process it there.
          </p>
          
          <h2>11. Your Rights</h2>
          
          <p>
            Depending on your location, you may have certain rights regarding your personal information, including:
          </p>
          <ul>
            <li>The right to access, update, or delete your personal information</li>
            <li>The right to rectification if your information is inaccurate or incomplete</li>
            <li>The right to object to our processing of your personal information</li>
            <li>The right to request restriction of processing your personal information</li>
            <li>The right to data portability</li>
            <li>The right to withdraw consent</li>
          </ul>
          
          <p>
            To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
          </p>
          
          <h2>12. Changes to This Privacy Policy</h2>
          
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy. You are advised to review this Privacy Policy periodically for any changes.
          </p>
          
          <h2>13. Contact Us</h2>
          
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p>
            Madifa<br />
            Email: privacy@madifa.com<br />
            Address: 123 Main Street, Johannesburg, South Africa
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Privacy;