"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function ListingsPage() {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>(["Garden", "Garage"]);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 12;

  // Mock house data
  const housesData = {
    data: [
      {
        id: 1,
        title: "Modern Family Home",
        address: "123 Maple Street, Westlands",
        price: 2500,
        beds: 4,
        baths: 3,
        area: 2400,
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
        status: "available",
        tag: "available",
        latitude: -1.2921,
        longitude: 36.8219
      },
      {
        id: 2,
        title: "Luxury Villa with Pool",
        address: "456 Palm Avenue, Karen",
        price: 4500,
        beds: 5,
        baths: 4,
        area: 3500,
        image: "https://images.unsplash.com/photo-1600607687939-ce8a62525c2f?w=400",
        status: "available",
        tag: "available",
        latitude: -1.2921,
        longitude: 36.8219
      },
      {
        id: 3,
        title: "Cozy Suburban House",
        address: "789 Oak Lane, Lavington",
        price: 1800,
        beds: 3,
        baths: 2,
        area: 1800,
        image: "https://images.unsplash.com/photo-1600047509807-b6236c70f45f?w=400",
        status: "available",
        tag: "available",
        latitude: -1.2921,
        longitude: 36.8219
      },
      {
        id: 4,
        title: "Contemporary Townhouse",
        address: "321 Cedar Court, Kileleshwa",
        price: 2200,
        beds: 3,
        baths: 2,
        area: 2000,
        image: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=400",
        status: "available",
        tag: "available",
        latitude: -1.2921,
        longitude: 36.8219
      },
      {
        id: 5,
        title: "Spacious Family Estate",
        address: "654 Elm Street, Runda",
        price: 3500,
        beds: 4,
        baths: 3,
        area: 2800,
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
        status: "available",
        tag: "available",
        latitude: -1.2921,
        longitude: 36.8219
      },
      {
        id: 6,
        title: "Modern Townhouse",
        address: "987 Birch Road, Kilimani",
        price: 2800,
        beds: 3,
        baths: 3,
        area: 2200,
        image: "https://images.unsplash.com/photo-1600607687939-ce8a62525c2f?w=400",
        status: "available",
        tag: "available",
        latitude: -1.2921,
        longitude: 36.8219
      }
    ]
  };

  const propertiesData = housesData;

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
    <div className="bg-gray-50 text-gray-900">
      {/* Main Container: Split-View */}
      <main className="pt-20 h-screen flex overflow-hidden">
        {/* Left Panel: Filter & Listings (40%) */}
        <section className="w-full md:w-[40%] flex flex-col border-r border-gray-300 bg-white z-10">
          {/* Filter Bar */}
          <div className="p-6 border-b border-gray-300 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-blue-600">Houses for Rent</h1>
              <span className="text-sm text-gray-500">{housesData.data.length} houses found</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="relative">
                <select
                  className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm appearance-none focus:ring-2 focus:ring-blue-200 outline-none"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                >
                  <option value="">Price Range</option>
                  <option value="1k-2k">$1k - $2k</option>
                  <option value="2k-4k">$2k - $4k</option>
                  <option value="4k+">$4k+</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-2 text-gray-500 pointer-events-none">
                  expand_more
                </span>
              </div>
              <div className="relative">
                <select
                  className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm appearance-none focus:ring-2 focus:ring-blue-200 outline-none"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                >
                  <option value="">Bedrooms</option>
                  <option value="1+">1+ Bed</option>
                  <option value="2+">2+ Beds</option>
                  <option value="3+">3+ Beds</option>
                  <option value="4+">4+ Beds</option>
                  <option value="5+">5+ Beds</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-2 text-gray-500 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {activeFilters.map((filter) => (
                <button
                  key={filter}
                  className="whitespace-nowrap px-3 py-1.5 bg-gray-100 rounded-full text-xs flex items-center gap-1 border border-gray-300 hover:bg-blue-100 transition-colors"
                  onClick={() => removeFilter(filter)}
                >
                  {filter} <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              ))}
              {!activeFilters.includes("Garden") && (
                <button
                  className="whitespace-nowrap px-3 py-1.5 bg-gray-100 rounded-full text-xs flex items-center gap-1 border border-gray-300 hover:bg-blue-100 transition-colors"
                  onClick={() => addFilter("Garden")}
                >
                  Garden <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
              )}
              {!activeFilters.includes("Garage") && (
                <button
                  className="whitespace-nowrap px-3 py-1.5 bg-gray-100 rounded-full text-xs flex items-center gap-1 border border-gray-300 hover:bg-blue-100 transition-colors"
                  onClick={() => addFilter("Garage")}
                >
                  Garage <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
              )}
              {!activeFilters.includes("Pool") && (
                <button
                  className="whitespace-nowrap px-3 py-1.5 bg-gray-100 rounded-full text-xs flex items-center gap-1 border border-gray-300 hover:bg-blue-100 transition-colors"
                  onClick={() => addFilter("Pool")}
                >
                  Pool <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
              )}
              {!activeFilters.includes("Fenced") && (
                <button
                  className="whitespace-nowrap px-3 py-1.5 bg-gray-100 rounded-full text-xs flex items-center gap-1 border border-gray-300 hover:bg-blue-100 transition-colors"
                  onClick={() => addFilter("Fenced")}
                >
                  Fenced <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Listing Cards */}
          <div className="flex-1 overflow-y-auto overflow-y-scroll p-6 space-y-6 bg-gray-50">
            {propertiesData?.data?.map((property: any) => (
              <div
                key={property.id}
                className="group bg-white rounded-xl border border-gray-300 hover:shadow-[0px_4px_20px_rgba(30,58,138,0.08)] transition-all overflow-hidden flex flex-col lg:flex-row"
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
                      property.tag === "available" ? "bg-green-500" : "bg-gray-500"
                    }`}
                  >
                    {property.status}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-blue-600 font-bold text-lg">
                        ${property.price.toLocaleString()}
                        <span className="text-sm font-normal text-gray-500">/mo</span>
                      </span>
                      <button onClick={() => toggleFavorite(property.id)}>
                        <span
                          className={`material-symbols-outlined hover:text-red-500 transition-colors cursor-pointer ${
                            favorites.includes(property.id) ? "text-red-500" : "text-gray-500"
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
                    <h3 className="font-bold text-gray-700 truncate">{property.title}</h3>
                    <p className="text-xs text-gray-500 mb-3">{property.address}</p>
                    <div className="flex gap-4 text-xs text-gray-600">
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
                    <button className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">
                      Message
                    </button>
                    <button className="px-3 py-2 border border-gray-300 rounded-lg text-blue-600 hover:bg-gray-50 transition-colors">
                      <span className="material-symbols-outlined text-base">calendar_today</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 pt-6 flex-wrap">
              <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 text-blue-600 hover:bg-gray-100 transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                1
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100">
                2
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100">
                3
              </button>
              <span className="px-2 text-gray-500">...</span>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100">
                {totalPages}
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 text-blue-600 hover:bg-gray-100 transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </section>

        {/* Right Panel: Map (60%) */}
        <section className="hidden md:block md:w-[60%] relative bg-gray-100">
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
              style={{ top: marker.lat, left: marker.lng }}
            >
              <div
                className={`px-3 py-1.5 rounded-full font-bold text-xs shadow-lg transition-transform ${
                  marker.active
                    ? "bg-white text-blue-600 border-2 border-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                    : "bg-blue-600 text-white group-hover:scale-110"
                }`}
              >
                {marker.price}
              </div>
              <div className="w-0.5 h-2 bg-blue-600 mx-auto"></div>
            </div>
          ))}

          {/* Map Controls */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2">
            <button className="bg-white px-6 py-3 rounded-full shadow-lg border border-gray-300 font-bold text-blue-600 flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all scale-95 active:opacity-90">
              <span className="material-symbols-outlined text-xl">refresh</span>
              Search this area
            </button>
          </div>

          <div className="absolute bottom-10 right-6 flex flex-col gap-3">
            <button className="w-12 h-12 bg-white rounded-xl shadow-lg border border-gray-300 flex items-center justify-center text-blue-600 hover:bg-gray-100 transition-colors">
              <span className="material-symbols-outlined">my_location</span>
            </button>
            <div className="flex flex-col bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden">
              <button className="w-12 h-12 flex items-center justify-center text-blue-600 hover:bg-gray-100 border-b border-gray-300 transition-colors">
                <span className="material-symbols-outlined">add</span>
              </button>
              <button className="w-12 h-12 flex items-center justify-center text-blue-600 hover:bg-gray-100 transition-colors">
                <span className="material-symbols-outlined">remove</span>
              </button>
            </div>
          </div>

          {/* Map Attribution */}
          <div className="absolute bottom-2 left-2 bg-white/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-gray-600 text-xs">
            © Mapbox © OpenStreetMap
          </div>
        </section>
      </main>

      {/* Contextual FAB (Only mobile search helper) */}
      <button className="md:hidden fixed bottom-8 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50">
        <span className="material-symbols-outlined">map</span>
      </button>
    </div>
  );
}