// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto px-4 md:px-8">
        <div className="col-span-1 md:col-span-1">
          <span className="text-xl font-bold text-blue-900 mb-4 block">
            PropRent
          </span>
          <p className="font-body-sm text-slate-500 mb-6">
            Redefining the rental market with transparency, technology, and superior service for
            tenants and agents alike.
          </p>
          <div className="flex gap-4 text-slate-400">
            <span className="material-symbols-outlined cursor-pointer hover:text-primary">
              public
            </span>
            <span className="material-symbols-outlined cursor-pointer hover:text-primary">
              group
            </span>
            <span className="material-symbols-outlined cursor-pointer hover:text-primary">
              share
            </span>
          </div>
        </div>
        <div>
          <h4 className="font-label-bold text-on-surface mb-6">Company</h4>
          <ul className="space-y-4">
            <li>
              <a className="font-body-sm text-slate-500 hover:text-blue-900 transition-colors" href="/about">
                About Us
              </a>
            </li>
            <li>
              <a className="font-body-sm text-slate-500 hover:text-blue-900 transition-colors" href="#">
                Careers
              </a>
            </li>
            <li>
              <a className="font-body-sm text-slate-500 hover:text-blue-900 transition-colors" href="/contact">
                Contact
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-label-bold text-on-surface mb-6">Legal</h4>
          <ul className="space-y-4">
            <li>
              <a className="font-body-sm text-slate-500 hover:text-blue-900 transition-colors" href="#">
                Privacy Policy
              </a>
            </li>
            <li>
              <a className="font-body-sm text-slate-500 hover:text-blue-900 transition-colors" href="#">
                Terms of Service
              </a>
            </li>
            <li>
              <a className="font-body-sm text-slate-500 hover:text-blue-900 transition-colors" href="#">
                Sitemap
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-label-bold text-on-surface mb-6">Resources</h4>
          <ul className="space-y-4">
            <li>
              <a className="font-body-sm text-slate-500 hover:text-blue-900 transition-colors" href="#">
                Tenant Guide
              </a>
            </li>
            <li>
              <a className="font-body-sm text-slate-500 hover:text-blue-900 transition-colors" href="#">
                Agent Hub
              </a>
            </li>
            <li>
              <a className="font-body-sm text-slate-500 hover:text-blue-900 transition-colors" href="#">
                Help Center
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-body-sm text-slate-500">
          © 2024 PropRent. All rights reserved. Licensed Real Estate Brokerage.
        </p>
        <div className="flex gap-6">
          <a className="font-body-sm text-slate-400 hover:text-blue-900 transition-colors" href="#">
            English (US)
          </a>
          <a className="font-body-sm text-slate-400 hover:text-blue-900 transition-colors" href="#">
            USD
          </a>
        </div>
      </div>
    </footer>
  );
}