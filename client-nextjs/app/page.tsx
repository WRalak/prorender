// app/page.tsx
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[870px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            className="w-full h-full object-cover brightness-[0.7]"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJ8KofWPO5xUGFJkdwdoM58vvGpkgNXbzzF1m6N5BBw4Mxu6eX2nVj4lv1RlVtkbOv_OGNsAyipk9SFNYx4UBn-bGgDRxzyAqRksH8JftTUld9vwC25o_SxEwqleToK_4zrGFr5WuJNrKUxPTfVRAA1r0e2H-38KsNdtaVrYeTR_M71pq59bvGks6DMhOMGvzBQwd8Vpq1Jt7pdKTlnYOJVNyLskfxiERmE-HeIJZ_2nxKJBehhomlvm8xiGO7XDiU-tVV9uTASy8"
            alt="A luxurious, modern villa with expansive glass walls and clean white architecture, set against a stunning dusk sky with warm amber lighting."
            width={1920}
            height={1080}
            priority
          />
        </div>
        <div className="relative z-10 w-full max-w-7xl px-4 md:px-8 text-center">
          <h1 className="font-display-xl text-white mb-6">Find Your Next Home with PropRent</h1>
          <p className="font-body-lg text-white/90 mb-12 max-w-2xl mx-auto">
            Discover a seamless rental experience with curated listings and expert support in every
            neighborhood.
          </p>
          {/* Search Bar */}
          <div className="bg-white p-2 rounded-xl shadow-xl max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-2">
            <div className="flex-1 flex items-center gap-3 px-4 w-full">
              <span className="material-symbols-outlined text-outline">location_on</span>
              <input
                className="w-full border-none focus:ring-0 text-on-surface font-body-md placeholder:text-outline"
                placeholder="Where would you like to live?"
                type="text"
              />
            </div>
            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
            <div className="flex-1 flex items-center gap-3 px-4 w-full">
              <span className="material-symbols-outlined text-outline">home</span>
              <select className="w-full border-none focus:ring-0 text-on-surface font-body-md bg-transparent">
                <option>Property Type</option>
                <option>Apartment</option>
                <option>House</option>
                <option>Condo</option>
              </select>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
            <div className="flex-1 flex items-center gap-3 px-4 w-full">
              <span className="material-symbols-outlined text-outline">payments</span>
              <select className="w-full border-none focus:ring-0 text-on-surface font-body-md bg-transparent">
                <option>Price Range</option>
                <option>$1000 - $2000</option>
                <option>$2000 - $4000</option>
                <option>$4000+</option>
              </select>
            </div>
            <button className="w-full md:w-auto px-10 py-4 bg-primary text-white rounded-lg font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">search</span>
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-xxl bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="text-center p-4 md:p-8 rounded-2xl bg-surface-container-low border border-slate-100">
              <p className="font-display-xl text-primary text-3xl md:text-4xl mb-2">10k+</p>
              <p className="font-label-bold text-outline uppercase tracking-wider text-xs">
                Properties
              </p>
            </div>
            <div className="text-center p-4 md:p-8 rounded-2xl bg-surface-container-low border border-slate-100">
              <p className="font-display-xl text-primary text-3xl md:text-4xl mb-2">5k+</p>
              <p className="font-label-bold text-outline uppercase tracking-wider text-xs">
                Happy Tenants
              </p>
            </div>
            <div className="text-center p-4 md:p-8 rounded-2xl bg-surface-container-low border border-slate-100">
              <p className="font-display-xl text-primary text-3xl md:text-4xl mb-2">2k+</p>
              <p className="font-label-bold text-outline uppercase tracking-wider text-xs">
                Expert Agents
              </p>
            </div>
            <div className="text-center p-4 md:p-8 rounded-2xl bg-surface-container-low border border-slate-100">
              <p className="font-display-xl text-primary text-3xl md:text-4xl mb-2">15+</p>
              <p className="font-label-bold text-outline uppercase tracking-wider text-xs">Cities</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-xxl bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 md:mb-12 gap-4">
            <div>
              <h2 className="font-headline-lg text-on-surface mb-2">Featured Homes</h2>
              <p className="text-outline font-body-md">Handpicked premium rentals for your consideration.</p>
            </div>
            <button className="text-primary font-label-bold flex items-center gap-2 hover:underline">
              View All Listings <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Property Card 1 */}
            <div className="bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-[0px_4px_20px_rgba(30,58,138,0.08)] transition-all group">
              <div className="relative h-64 overflow-hidden">
                <Image
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDh8HsDKNoawn-9IYodfZ7r5at6E3aj2fTkBftNyKgVRYSxYhAFefsBgjaKWEYTNdwzHFEJ8C75sKPMds3TFMBNoc0MFHA2hJLeLtAzHBN1gcAnNnjJ_K66xd_Dj9z87qQ3_bdQMHjR2gWG6A1CJOgmJT_7hQwuIt0ftUIgiTUN1EyCs7__2dvEzlSFkP2RMVBqbrj_mYlkZbGNwTe7PGySdeJnN-PjgoQkrVC8KHtvscNXViNldjqjfoRrk5gI9b24FGq0gIjHL9Y"
                  alt="A bright, modern luxury apartment interior featuring floor-to-ceiling windows, minimalist furniture in neutral tones, and polished hardwood floors."
                  width={600}
                  height={400}
                />
                <div className="absolute top-4 left-4 bg-secondary-fixed text-on-secondary-fixed-variant px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  Available
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-headline-md text-primary mb-1">$3,200/mo</h3>
                <p className="font-label-bold text-on-surface mb-4">The Skyline Penthouse</p>
                <div className="flex items-center gap-4 text-outline mb-6">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">bed</span> 3 Beds
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">bathtub</span> 2 Baths
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">square_foot</span> 1,200 sqft
                  </div>
                </div>
                <div className="flex items-center gap-2 text-outline text-sm">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  452 Broadway, New York, NY
                </div>
              </div>
            </div>
            {/* Property Card 2 */}
            <div className="bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-[0px_4px_20px_rgba(30,58,138,0.08)] transition-all group">
              <div className="relative h-64 overflow-hidden">
                <Image
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuXRhhAxvkeCvQj2HpsLyBrT-5atomT8154RW28bw4nG3vq_3KnP0tG-YxBU7DQh4UhQuj46VgNks9LrZJzPrtcH9-4bdemQ7KqQGYAw1u25aG6WnYRiTXr78ew_19b41-GApl8wtevtK1uLdpsNvtN_nJGuf9WQSWpo3KQmTBDV7q38eo9bScylNS0g84TUCe7C7nALyzozaQyx09RG06m3X2I48b8qkhPRWHWE0boMURzOciWPgTkbQCTNpWckFwYEbNavoY1Kw"
                  alt="Exterior view of a contemporary suburban home with dark charcoal siding and warm wood accents."
                  width={600}
                  height={400}
                />
                <div className="absolute top-4 left-4 bg-secondary-fixed text-on-secondary-fixed-variant px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  Featured
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-headline-md text-primary mb-1">$4,500/mo</h3>
                <p className="font-label-bold text-on-surface mb-4">Modern Garden Villa</p>
                <div className="flex items-center gap-4 text-outline mb-6">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">bed</span> 4 Beds
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">bathtub</span> 3 Baths
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">square_foot</span> 2,400 sqft
                  </div>
                </div>
                <div className="flex items-center gap-2 text-outline text-sm">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  89 Oak Avenue, Austin, TX
                </div>
              </div>
            </div>
            {/* Property Card 3 */}
            <div className="bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-[0px_4px_20px_rgba(30,58,138,0.08)] transition-all group">
              <div className="relative h-64 overflow-hidden">
                <Image
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuOKjSf3xOlLJbZGo-AvnHC3wB0yDmN_yYiVHfT94yC4iSC1nhMWftI6Qck1QHpquXYKXRwjkoZFdfuyUdbfdLOqYoBV9mGq-NU5RejDgOTC5bIStjQx45JhydLJ_Ta8Jo7xGpaCxOk1U34DXuOME_w9b_HMDT40pO_Rp3JtdcnTm-p5aH0ALCK6ctxFC7kpopuLjL-vZHDBTZHDxYyb2LMoZoLREwRvylwAJDU230At0hamhkc97TaVffkT-tvMOYTYfyRVtgCGg"
                  alt="A chic urban studio apartment with exposed brick walls, industrial metal details, and warm Edison bulb lighting."
                  width={600}
                  height={400}
                />
              </div>
              <div className="p-6">
                <h3 className="font-headline-md text-primary mb-1">$2,100/mo</h3>
                <p className="font-label-bold text-on-surface mb-4">Downtown Loft</p>
                <div className="flex items-center gap-4 text-outline mb-6">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">bed</span> 1 Bed
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">bathtub</span> 1 Bath
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">square_foot</span> 850 sqft
                  </div>
                </div>
                <div className="flex items-center gap-2 text-outline text-sm">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  12 Market St, San Francisco, CA
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-xxl bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <h2 className="font-headline-lg text-on-surface mb-12 md:mb-16">Simple Steps to Your New Home</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined text-4xl">search_insights</span>
              </div>
              <h3 className="font-headline-md text-on-surface mb-4">1. Search Properties</h3>
              <p className="text-outline font-body-md">
                Browse our massive database of verified rentals with advanced filters to find your
                perfect match.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined text-4xl">chat</span>
              </div>
              <h3 className="font-headline-md text-on-surface mb-4">2. Message Agents</h3>
              <p className="text-outline font-body-md">
                Connect directly with certified property managers and real estate agents through our
                secure platform.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined text-4xl">event_available</span>
              </div>
              <h3 className="font-headline-md text-on-surface mb-4">3. Schedule Your Tour</h3>
              <p className="text-outline font-body-md">
                Book in-person or virtual tours at your convenience and finalize your lease digitally
                with ease.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Agent Pricing */}
      <section className="py-xxl bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-headline-lg text-on-surface mb-4">Agent Plans</h2>
            <p className="text-outline font-body-md">Scale your property portfolio with our specialized agent tools.</p>
          </div>
          <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-8 items-stretch">
            <div className="w-full max-w-sm p-6 md:p-10 bg-white border border-slate-200 rounded-2xl flex flex-col hover:border-primary/20 transition-all mx-auto">
              <div className="mb-8">
                <p className="font-label-bold text-outline uppercase mb-2">Basic</p>
                <h3 className="font-display-xl text-on-surface">
                  $49<span className="text-xl font-medium text-outline">/mo</span>
                </h3>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 font-body-md text-on-surface">
                  <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                  10 properties
                </li>
                <li className="flex items-center gap-3 font-body-md text-on-surface">
                  <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                  Basic analytics
                </li>
                <li className="flex items-center gap-3 font-body-md text-on-surface">
                  <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                  Email support
                </li>
              </ul>
              <button className="w-full py-4 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary/5 transition-all">
                Choose Basic
              </button>
            </div>
            <div className="w-full max-w-sm p-6 md:p-10 bg-primary-container text-white border border-primary-container rounded-2xl flex flex-col shadow-xl mx-auto">
              <div className="mb-8">
                <p className="font-label-bold text-primary-fixed uppercase mb-2">Pro</p>
                <h3 className="font-display-xl">
                  $99<span className="text-xl font-medium text-primary-fixed">/mo</span>
                </h3>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 font-body-md">
                  <span className="material-symbols-outlined text-secondary-container text-sm">check_circle</span>
                  50 properties
                </li>
                <li className="flex items-center gap-3 font-body-md">
                  <span className="material-symbols-outlined text-secondary-container text-sm">check_circle</span>
                  Advanced performance data
                </li>
                <li className="flex items-center gap-3 font-body-md">
                  <span className="material-symbols-outlined text-secondary-container text-sm">check_circle</span>
                  Priority 24/7 support
                </li>
                <li className="flex items-center gap-3 font-body-md">
                  <span className="material-symbols-outlined text-secondary-container text-sm">check_circle</span>
                  Featured listing slots
                </li>
              </ul>
              <button className="w-full py-4 bg-white text-primary-container font-bold rounded-lg hover:bg-slate-50 transition-all">
                Choose Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-xxl bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="font-headline-lg text-on-surface text-center mb-12 md:mb-16">Trusted by Thousands</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-surface-container-low p-6 md:p-10 rounded-2xl italic relative">
              <span className="material-symbols-outlined absolute top-6 left-6 text-slate-200 text-6xl opacity-20">
                format_quote
              </span>
              <p className="font-body-lg text-on-surface-variant mb-6 md:mb-8 relative z-10">
                "PropRent made finding my downtown apartment incredibly simple. The filtering options
                actually worked, and I was in my new home within two weeks."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                  <Image
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqm_mpxaO_Qz8HDzIUm6ltlxOOgZxf18WMmAYaFDTFS--YeI96HewHs1I6G9lmecFqDXCYX_02BBLOiy9vxf98GISjBr4olmNy_-k6vX1Zhh6MmfqHMc6oKCwkU000CS2lWN7ko3Zu-cKFgxgULWNCsUG7LA2JtBraG2jDV5fl-ALDzqTqnhApnb2NqUe6-VoZghcA_H6msd43lcyyaz22J7ISUvZfKn7BET9TQFvdEUKtsTcXWdj5On5zSkO5frLaF_JjUFf3qIQ"
                    alt="A professional and friendly portrait of a young woman with a warm smile"
                    width={48}
                    height={48}
                  />
                </div>
                <div>
                  <p className="font-label-bold text-on-surface">Elena Rodriguez</p>
                  <p className="font-caption text-outline">Verified Tenant</p>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-low p-6 md:p-10 rounded-2xl italic relative">
              <span className="material-symbols-outlined absolute top-6 left-6 text-slate-200 text-6xl opacity-20">
                format_quote
              </span>
              <p className="font-body-lg text-on-surface-variant mb-6 md:mb-8 relative z-10">
                "As an agent, the Pro dashboard gives me all the insights I need to manage my
                listings effectively. The lead quality is significantly higher than other platforms."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                  <Image
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDe8nLq9vtg_BKe3Q6-uJlCrbQt22J_W-vNcKXFJSo7Kcwh1tk-KiotYEIhaVGz9Os-IkoWF_ydWFD9Uu-4mN1aYHuO2fn7rkSFhx0M-fo5zqX3PnaiZzoTSecDswZTmDKjWTh7GQIu3eF7YhiSdonGHzeLWuirkC8u03K3TB3o19BNe_AOCwALbZXxffKWVAtpx8T5EL-tlYe_P4n0BhJs9xIhzGx3eRGXAfkUzbKqNPBFjrs4ygFfckSbhV-02ZfgGnEa7UvuWY"
                    alt="A sharp, professional headshot of a middle-aged man in business attire"
                    width={48}
                    height={48}
                  />
                </div>
                <div>
                  <p className="font-label-bold text-on-surface">Marcus Thorne</p>
                  <p className="font-caption text-outline">Premier Agent</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-xxl bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="font-headline-lg mb-4">Stay Ahead of the Market</h2>
          <p className="font-body-md text-primary-fixed mb-8">
            Join our newsletter to receive the latest property listings and market trends directly in
            your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              className="flex-1 px-6 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-secondary-container"
              placeholder="Your email address"
              type="email"
            />
            <button className="px-8 py-4 bg-secondary-container text-on-secondary-container font-bold rounded-lg hover:bg-secondary-fixed transition-all">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
}