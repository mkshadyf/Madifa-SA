import { Link } from "wouter";
import { Facebook, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-gray-800 py-8 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <span className="text-primary text-3xl font-bold">MADIFA</span>
            <p className="text-muted-foreground text-sm mt-2">South African Original Content Platform</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-foreground font-medium mb-3">Company</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-muted-foreground text-sm hover:text-primary transition">About Us</Link></li>
                <li><Link href="#" className="text-muted-foreground text-sm hover:text-primary transition">Careers</Link></li>
                <li><Link href="#" className="text-muted-foreground text-sm hover:text-primary transition">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-foreground font-medium mb-3">Support</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-muted-foreground text-sm hover:text-primary transition">Help Center</Link></li>
                <li><Link href="#" className="text-muted-foreground text-sm hover:text-primary transition">Terms of Use</Link></li>
                <li><Link href="#" className="text-muted-foreground text-sm hover:text-primary transition">Privacy Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-foreground font-medium mb-3">Connect</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-muted-foreground text-sm hover:text-primary transition flex items-center gap-2">
                    <Facebook className="h-4 w-4" />
                    <span>Facebook</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground text-sm hover:text-primary transition flex items-center gap-2">
                    <Twitter className="h-4 w-4" />
                    <span>Twitter</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground text-sm hover:text-primary transition flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    <span>Instagram</span>
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-foreground font-medium mb-3">Download</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-muted-foreground text-sm hover:text-primary transition">iOS App</Link></li>
                <li><Link href="#" className="text-muted-foreground text-sm hover:text-primary transition">Android App</Link></li>
                <li><Link href="#" className="text-muted-foreground text-sm hover:text-primary transition">Smart TV</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} Madifa. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <Link href="#" className="text-muted-foreground text-sm hover:text-primary transition mr-4">Terms</Link>
            <Link href="#" className="text-muted-foreground text-sm hover:text-primary transition mr-4">Privacy</Link>
            <Link href="#" className="text-muted-foreground text-sm hover:text-primary transition">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
