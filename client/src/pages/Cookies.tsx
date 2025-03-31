import { Helmet } from "react-helmet";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Cookies = () => {
  return (
    <>
      <Helmet>
        <title>Cookie Policy | Madifa</title>
      </Helmet>
      <Navbar />
      <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-350px)]">
        <h1 className="text-3xl font-bold mb-6">Cookie Policy</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-lg mb-4">
            Last Updated: {new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          
          <p className="mb-6">
            This Cookie Policy explains how Madifa ("we", "us", or "our") uses cookies and similar technologies to recognize you when you visit our streaming service, website, and applications (collectively, the "Service"). It explains what these technologies are and why we use them, as well as your rights to control our use of them.
          </p>
          
          <h2>1. What Are Cookies?</h2>
          
          <p>
            Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
          </p>
          
          <p>
            Cookies set by the website owner (in this case, Madifa) are called "first-party cookies". Cookies set by parties other than the website owner are called "third-party cookies". Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics). The parties that set these third-party cookies can recognize your device both when it visits the website in question and also when it visits certain other websites.
          </p>
          
          <h2>2. Why Do We Use Cookies?</h2>
          
          <p>
            We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Service to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Service. Third parties serve cookies through our Service for advertising, analytics, and other purposes. This is described in more detail below.
          </p>
          
          <h2>3. Types of Cookies We Use</h2>
          
          <h3>3.1 Essential Cookies</h3>
          <p>
            These cookies are strictly necessary to provide you with services available through our Service and to use some of its features, such as access to secure areas. These cookies are essential for using the Service and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in, or filling in forms.
          </p>
          <p>
            Examples of essential cookies we use:
          </p>
          <ul>
            <li>Session cookies to identify you as being logged in to the Service</li>
            <li>Authentication cookies to ensure your connection to the Service is secure</li>
            <li>Load balancing cookies to ensure the Service is working properly</li>
          </ul>
          
          <h3>3.2 Performance and Functionality Cookies</h3>
          <p>
            These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our Service. They help us to know which pages are the most and least popular and see how visitors move around the Service. All information these cookies collect is aggregated and therefore anonymous.
          </p>
          <p>
            Examples of performance and functionality cookies we use:
          </p>
          <ul>
            <li>Analytics cookies to understand how you use the Service</li>
            <li>Preference cookies to remember your preferences and settings</li>
            <li>Device detection cookies to optimize the Service for your device</li>
          </ul>
          
          <h3>3.3 Targeting and Advertising Cookies</h3>
          <p>
            These cookies may be set through our Service by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertisements on other sites. They do not directly store personal information but are based on uniquely identifying your browser and internet device.
          </p>
          <p>
            Examples of targeting and advertising cookies we use:
          </p>
          <ul>
            <li>Google AdSense cookies to deliver and track advertisements</li>
            <li>Retargeting cookies to show you ads related to items you previously viewed</li>
            <li>Social media cookies to enable sharing functionality</li>
          </ul>
          
          <h2>4. Specific Cookies We Use</h2>
          
          <table className="w-full border-collapse my-4">
            <thead>
              <tr>
                <th className="border border-gray-700 p-2 text-left">Name</th>
                <th className="border border-gray-700 p-2 text-left">Purpose</th>
                <th className="border border-gray-700 p-2 text-left">Provider</th>
                <th className="border border-gray-700 p-2 text-left">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-700 p-2">madifa_session</td>
                <td className="border border-gray-700 p-2">Used to identify your session on the Service</td>
                <td className="border border-gray-700 p-2">Madifa</td>
                <td className="border border-gray-700 p-2">Session</td>
              </tr>
              <tr>
                <td className="border border-gray-700 p-2">madifa_auth</td>
                <td className="border border-gray-700 p-2">Used to keep you logged in</td>
                <td className="border border-gray-700 p-2">Madifa</td>
                <td className="border border-gray-700 p-2">30 days</td>
              </tr>
              <tr>
                <td className="border border-gray-700 p-2">madifa_preferences</td>
                <td className="border border-gray-700 p-2">Remembers your preferences (video quality, volume, etc.)</td>
                <td className="border border-gray-700 p-2">Madifa</td>
                <td className="border border-gray-700 p-2">1 year</td>
              </tr>
              <tr>
                <td className="border border-gray-700 p-2">_ga</td>
                <td className="border border-gray-700 p-2">Used to distinguish users for analytics</td>
                <td className="border border-gray-700 p-2">Google Analytics</td>
                <td className="border border-gray-700 p-2">2 years</td>
              </tr>
              <tr>
                <td className="border border-gray-700 p-2">_gid</td>
                <td className="border border-gray-700 p-2">Used to distinguish users for analytics</td>
                <td className="border border-gray-700 p-2">Google Analytics</td>
                <td className="border border-gray-700 p-2">24 hours</td>
              </tr>
              <tr>
                <td className="border border-gray-700 p-2">_gat</td>
                <td className="border border-gray-700 p-2">Used to throttle request rate</td>
                <td className="border border-gray-700 p-2">Google Analytics</td>
                <td className="border border-gray-700 p-2">1 minute</td>
              </tr>
              <tr>
                <td className="border border-gray-700 p-2">__gads</td>
                <td className="border border-gray-700 p-2">Used for ad delivery and measurement</td>
                <td className="border border-gray-700 p-2">Google AdSense</td>
                <td className="border border-gray-700 p-2">1 year</td>
              </tr>
            </tbody>
          </table>
          
          <h2>5. How Can You Control Cookies?</h2>
          
          <h3>5.1 Browser and Device Controls</h3>
          <p>
            Most web browsers allow you to control cookies through their settings preferences. To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit <a href="https://www.aboutcookies.org" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.aboutcookies.org</a> or <a href="https://www.allaboutcookies.org" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.allaboutcookies.org</a>.
          </p>
          <p>
            However, please note that if you delete cookies or refuse to accept them, you might not be able to use all of the features we offer, you may not be able to store your preferences, and some of our pages might not display properly.
          </p>
          
          <h3>5.2 Do Not Track</h3>
          <p>
            Currently, various browsers offer a "Do Not Track" option, but there is no standard for how "Do Not Track" should work on commercial websites. Due to the lack of such standards, this website does not currently respond to "Do Not Track" signals. We will continue to review new technologies and may adopt a standard once one is created.
          </p>
          
          <h3>5.3 Opt-Out of Targeted Advertising</h3>
          <p>
            You can opt-out of targeted advertising by:
          </p>
          <ul>
            <li>Using the Google Ads Settings page: <a href="https://www.google.com/settings/ads" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://www.google.com/settings/ads</a></li>
            <li>Opting out of the Advertising Network Initiative: <a href="https://optout.networkadvertising.org/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://optout.networkadvertising.org/</a></li>
            <li>Visiting the Digital Advertising Alliance's opt-out portal: <a href="https://optout.aboutads.info/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://optout.aboutads.info/</a></li>
          </ul>
          
          <h2>6. Changes to this Cookie Policy</h2>
          
          <p>
            We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
          </p>
          <p>
            The date at the top of this Cookie Policy indicates when it was last updated.
          </p>
          
          <h2>7. Contact Us</h2>
          
          <p>
            If you have any questions about our use of cookies or other technologies, please contact us at:
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

export default Cookies;