import { Helmet } from "react-helmet";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const AboutUs = () => {
  return (
    <>
      <Helmet>
        <title>About Us | Madifa</title>
      </Helmet>
      <Navbar />
      <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-350px)]">
        <h1 className="text-3xl font-bold mb-6">About Madifa</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-lg mb-6">
            Madifa is South Africa's premier streaming platform dedicated to showcasing authentic South African content and supporting local creators.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div>
              <h2>Our Mission</h2>
              <p>
                At Madifa, our mission is to promote and preserve South African culture through digital storytelling. We aim to create a platform where local filmmakers, musicians, and content creators can showcase their work to both local and international audiences, while providing viewers with access to high-quality, authentic South African content.
              </p>
            </div>
            
            <div>
              <h2>Our Vision</h2>
              <p>
                We envision a world where South African stories are accessible to global audiences, where local talent is nurtured and celebrated, and where our rich cultural heritage is preserved and shared across generations through the power of digital media.
              </p>
            </div>
          </div>
          
          <h2>Our Story</h2>
          <p>
            Madifa was founded in 2023 by a team of passionate media professionals and technology experts who recognized the need for a dedicated platform to showcase South African content. With decades of combined experience in the film, television, and technology industries, our founders set out to create a streaming service that would not only provide entertainment but also serve as a cultural bridge between South Africa and the world.
          </p>
          <p>
            The name "Madifa" draws inspiration from South Africa's rich linguistic heritage, representing our commitment to celebrating and preserving the diverse cultures of our nation.
          </p>
          
          <h2>What We Offer</h2>
          <p>
            Madifa provides a wide range of content categories:
          </p>
          <ul>
            <li><strong>Movies:</strong> Feature films produced in South Africa, including both indie productions and commercial releases</li>
            <li><strong>Short Films:</strong> A curated selection of short-form storytelling from emerging and established filmmakers</li>
            <li><strong>Trailers:</strong> Previews of upcoming South African film and TV productions</li>
            <li><strong>Music Videos:</strong> Visual artistry from South Africa's vibrant music scene</li>
          </ul>
          
          <h2>Our Commitment to Creators</h2>
          <p>
            We believe in fair compensation for creators and transparent revenue sharing. When you subscribe to Madifa, you're not just paying for entertainment—you're supporting a sustainable ecosystem for South African creative professionals. We're committed to:
          </p>
          <ul>
            <li>Fair revenue sharing with content creators</li>
            <li>Promoting independent filmmakers and musicians</li>
            <li>Providing analytics and audience insights to creators</li>
            <li>Investing in the production of original South African content</li>
          </ul>
          
          <h2>Our Team</h2>
          <p>
            Madifa is powered by a diverse team of professionals who are passionate about South African culture and technology. Our team includes:
          </p>
          <ul>
            <li>Film and media industry veterans</li>
            <li>Software developers and UX designers</li>
            <li>Content curators and cultural specialists</li>
            <li>Marketing and community engagement experts</li>
          </ul>
          
          <div className="bg-gray-800 p-6 rounded-lg my-8">
            <h2 className="text-primary">Join the Madifa Family</h2>
            <p>
              We're more than just a streaming service—we're a community that celebrates South African creativity. Whether you're a viewer, creator, or investor, there's a place for you in the Madifa family.
            </p>
            <ul>
              <li>Subscribe to access our full content library</li>
              <li>Follow us on social media for updates and behind-the-scenes content</li>
              <li>Contact us to explore content submission opportunities</li>
            </ul>
          </div>
          
          <h2>Contact Information</h2>
          <p>
            We'd love to hear from you! Whether you have questions, feedback, or business inquiries, please don't hesitate to reach out:
          </p>
          <p>
            <strong>General Inquiries:</strong> info@madifa.com<br />
            <strong>Content Submissions:</strong> creators@madifa.com<br />
            <strong>Business Development:</strong> partnerships@madifa.com<br />
            <strong>Press:</strong> media@madifa.com
          </p>
          
          <p>
            <strong>Address:</strong><br />
            Madifa<br />
            123 Main Street<br />
            Johannesburg<br />
            South Africa
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AboutUs;