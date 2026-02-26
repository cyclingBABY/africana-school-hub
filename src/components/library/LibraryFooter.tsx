import { Link } from "react-router-dom";

const LibraryFooter = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                <span className="font-serif font-bold text-lg">L</span>
              </div>
              <div>
                <h3 className="font-serif font-bold">Kampala Library</h3>
                <p className="text-xs text-primary-foreground/70">Management System</p>
              </div>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Empowering knowledge seekers across Uganda with access to thousands of physical and digital resources.
            </p>
          </div>

          <div>
            <h4 className="font-serif font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>
                <Link to="/catalog" className="hover:text-accent transition-colors">
                  Browse Catalog
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-accent transition-colors">
                  Join the Library
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-accent transition-colors">
                  Member Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>Science &amp; Technology</li>
              <li>Mathematics</li>
              <li>Literature &amp; Arts</li>
              <li>History &amp; Geography</li>
              <li>Religious Studies</li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>Bombo Road, Kawempe</li>
              <li>Kampala, Uganda</li>
              <li>+256 750 492418</li>
              <li>library@kampala.ug</li>
              <li className="pt-1">Mon-Sat: 8 AM - 8 PM EAT</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center">
          <p className="text-sm text-primary-foreground/50">
            © {new Date().getFullYear()} Kampala Library Management System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LibraryFooter;
