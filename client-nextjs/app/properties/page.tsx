"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useProperties } from "../../hooks/useApi";

export default function ListingsPage() {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>(["Pets Allowed"]);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 12;

  const { data: propertiesData, loading, error, fetchProperties } = useProperties();

  // Generate map markers from real data
  const mapMarkers = propertiesData?.data?.map((property: any) => ({
    id: property.id,
    lat: property.latitude || -1.2921, // Default to Nairobi if not provided
    lng: property.longitude || 36.8219,
    price: property.price,
    active: false
  })) || [];

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  const addFilter = (filter: string) => {
    if (!activeFilters.includes(filter)) {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter));
  };

  return (
    <div className="bg-background text-on-background">
      {/* Main Container: Split-View */}
      <main className="pt-20 h-screen flex overflow-hidden">
        {/* Left Panel: Filter & Listings (40%) */}
        <section className="w-full md:w-[40%] flex flex-col border-r border-outline-variant bg-white z-10">
          {/* Filter Bar */}
          <div className="p-6 border-b border-outline-variant shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="font-headline-md text-primary">Properties for Rent</h1>
              <span className="text-body-sm text-outline">124 properties found</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="relative">
                <select
                  className="w-full pl-3 pr-8 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm appearance-none focus:ring-2 focus:ring-primary-container outline-none"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                >
                  <option value="">Price Range</option>
                  <option value="1k-2k">$1k - $2k</option>
                  <option value="2k-4k">$2k - $4k</option>
                  <option value="4k+">$4k+</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-2 text-outline pointer-events-none">
                  expand_more
                </span>
              </div>
              <div className="relative">
                <select
                  className="w-full pl-3 pr-8 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm appearance-none focus:ring-2 focus:ring-primary-container outline-none"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                >
                  <option value="">Bedrooms</option>
                  <option value="1+">1+ Bed</option>
                  <option value="2+">2+ Beds</option>
                  <option value="3+">3+ Beds</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-2 text-outline pointer-events-none">
                  expand_more
                </span>
              </div>
              <div className="relative col-span-2 lg:col-span-1">
                <select
                  className="w-full pl-3 pr-8 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm appearance-none focus:ring-2 focus:ring-primary-container outline-none"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                >
                  <option value="">Property Type</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="condo">Condo</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-2 text-outline pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {activeFilters.map((filter) => (
                <button
                  key={filter}
                  className="whitespace-nowrap px-3 py-1.5 bg-surface-container-high rounded-full text-caption flex items-center gap-1 border border-outline-variant hover:bg-primary-fixed-dim transition-colors"
                  onClick={() => removeFilter(filter)}
                >
                  {filter} <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              ))}
              {!activeFilters.includes("Parking") && (
                <button
                  className="whitespace-nowrap px-3 py-1.5 bg-surface-container-low rounded-full text-caption flex items-center gap-1 border border-outline-variant hover:bg-primary-fixed-dim transition-colors"
                  onClick={() => addFilter("Parking")}
                >
                  Parking <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
              )}
              {!activeFilters.includes("Gym") && (
                <button
                  className="whitespace-nowrap px-3 py-1.5 bg-surface-container-low rounded-full text-caption flex items-center gap-1 border border-outline-variant hover:bg-primary-fixed-dim transition-colors"
                  onClick={() => addFilter("Gym")}
                >
                  Gym <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
              )}
              {!activeFilters.includes("Pool") && (
                <button
                  className="whitespace-nowrap px-3 py-1.5 bg-surface-container-low rounded-full text-caption flex items-center gap-1 border border-outline-variant hover:bg-primary-fixed-dim transition-colors"
                  onClick={() => addFilter("Pool")}
                >
                  Pool <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Listing Cards */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-surface-container-lowest">
            {propertiesData?.data?.map((property: any) => (
              <div
                key={property.id}
                className="group bg-white rounded-xl border border-outline-variant hover:shadow-[0px_4px_20px_rgba(30,58,138,0.08)] transition-all overflow-hidden flex flex-col lg:flex-row"
              >
                <div className="lg:w-48 h-48 lg:h-auto relative overflow-hidden">
                  <Image
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src={property.image}
                    alt={property.title}
                    width={192}
                    height={192}
                  />
                  <span
                    className={`absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                      property.tag === "available" ? "bg-secondary" : "bg-tertiary"
                    }`}
                  >
                    {property.status}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-primary font-bold text-lg">
                        ${property.price.toLocaleString()}
                        <span className="text-sm font-normal text-outline">/mo</span>
                      </span>
                      <button onClick={() => toggleFavorite(property.id)}>
                        <span
                          className={`material-symbols-outlined hover:text-error transition-colors cursor-pointer ${
                            favorites.includes(property.id) ? "text-error" : "text-outline"
                          }`}
                          style={
                            favorites.includes(property.id)
                              ? { fontVariationSettings: "'FILL' 1" }
                              : {}
                          }
                        >
                          favorite
                        </span>
                      </button>
                    </div>
                    <h3 className="font-label-bold text-on-surface truncate">{property.title}</h3>
                    <p className="text-caption text-outline mb-3">{property.address}</p>
                    <div className="flex gap-4 text-caption text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">bed</span>{" "}
                        {property.beds} Beds
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">bathtub</span>{" "}
                        {property.baths} Baths
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">square_foot</span>{" "}
                        {property.area} sqft
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 py-2 bg-primary text-on-primary rounded-lg text-caption font-label-bold hover:bg-primary-container transition-colors">
                      Message
                    </button>
                    <button className="px-3 py-2 border border-outline-variant rounded-lg text-primary hover:bg-surface-container transition-colors">
                      <span className="material-symbols-outlined text-base">calendar_today</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 pt-6 flex-wrap">
              <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-primary hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-on-primary font-label-bold">
                1
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low">
                2
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low">
                3
              </button>
              <span className="px-2 text-outline">...</span>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low">
                {totalPages}
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-primary hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </section>

        {/* Right Panel: Map (60%) */}
        <section className="hidden md:block md:w-[60%] relative bg-surface-container">
          {/* Mock Map Background */}
          <div
            className="absolute inset-0 w-full h-full bg-slate-200"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAh2WUoyvHgoC4vpHEL5tIM7MXYLtjCE4sR-sCiHy3mfQ0vCTOdgPbvNRGxif9PtjnAsl1vKSk0RSl1Hli21PJDD9R80dmGfQxvAHdu4XsAelt49tlXJBkidSsM2HqSYKSlh2ISIoU0ZB3TViEphqEM2JlHgNzxHTxFAZTUhi5BEl0GxDdctotFiu8kbw3srJn_6heahpHPGl9lOpfCwYGGXD4zssGm3TIF9gJMejIyVnbBSy7wrs4tUzic0Wjb6DofDPZCPX8syPE')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-blue-900/10 pointer-events-none"></div>
          </div>

          {/* Custom Map Markers */}
          {mapMarkers.map((marker, idx) => (
            <div
              key={idx}
              className="absolute cursor-pointer group"
              style={{ top: marker.top, left: marker.left }}
            >
              <div
                className={`px-3 py-1.5 rounded-full font-label-bold text-caption shadow-lg transition-transform ${
                  marker.isActive
                    ? "bg-white text-primary border-2 border-primary group-hover:bg-primary group-hover:text-on-primary"
                    : "bg-primary text-on-primary group-hover:scale-110"
                }`}
              >
                {marker.price}
              </div>
              <div className="w-0.5 h-2 bg-primary mx-auto"></div>
            </div>
          ))}

          {/* Map Controls */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2">
            <button className="bg-white px-6 py-3 rounded-full shadow-lg border border-outline-variant font-label-bold text-primary flex items-center gap-2 hover:bg-primary hover:text-white transition-all scale-95 active:opacity-90">
              <span className="material-symbols-outlined text-xl">refresh</span>
              Search this area
            </button>
          </div>

          <div className="absolute bottom-10 right-6 flex flex-col gap-3">
            <button className="w-12 h-12 bg-white rounded-xl shadow-lg border border-outline-variant flex items-center justify-center text-primary hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined">my_location</span>
            </button>
            <div className="flex flex-col bg-white rounded-xl shadow-lg border border-outline-variant overflow-hidden">
              <button className="w-12 h-12 flex items-center justify-center text-primary hover:bg-surface-container-low border-b border-outline-variant transition-colors">
                <span className="material-symbols-outlined">add</span>
              </button>
              <button className="w-12 h-12 flex items-center justify-center text-primary hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined">remove</span>
              </button>
            </div>
          </div>

          {/* Map Attribution */}
          <div className="absolute bottom-2 left-2 bg-white/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-on-surface-variant font-caption">
            © Mapbox © OpenStreetMap
          </div>
        </section>
      </main>

      {/* Contextual FAB (Only mobile search helper) */}
      <button className="md:hidden fixed bottom-8 right-6 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center z-50">
        <span className="material-symbols-outlined">map</span>
      </button>
    </div>
  );
}