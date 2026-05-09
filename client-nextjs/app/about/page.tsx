import { BuildingOfficeIcon, HomeIcon, ShieldCheckIcon, UsersIcon } from '@heroicons/react/24/outline'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            About PropRent
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
            Your trusted platform for finding the perfect rental home. We connect tenants with property owners to make renting simple and secure.
          </p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 mx-auto bg-blue-100 rounded-full">
                <HomeIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">10,000+</h3>
              <p className="mt-2 text-base text-gray-500">Properties Listed</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 mx-auto bg-green-100 rounded-full">
                <UsersIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">50,000+</h3>
              <p className="mt-2 text-base text-gray-500">Happy Tenants</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 mx-auto bg-purple-100 rounded-full">
                <BuildingOfficeIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">1,000+</h3>
              <p className="mt-2 text-base text-gray-500">Property Agents</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 mx-auto bg-yellow-100 rounded-full">
                <ShieldCheckIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">100%</h3>
              <p className="mt-2 text-base text-gray-500">Secure Transactions</p>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
              <p className="mt-4 text-lg text-gray-500">
                To revolutionize the rental experience by providing a seamless, transparent, and secure platform that connects property owners with qualified tenants.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
              <p className="mt-4 text-lg text-gray-500">
                To become the world's most trusted rental marketplace, making quality housing accessible to everyone while empowering property owners with powerful management tools.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Choose PropRent?</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 mx-auto bg-blue-100 rounded-lg mb-4">
                <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Secure & Verified</h3>
              <p className="text-base text-gray-500">All properties and users are thoroughly verified to ensure safety and authenticity.</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 mx-auto bg-green-100 rounded-lg mb-4">
                <HomeIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Easy to Use</h3>
              <p className="text-base text-gray-500">Intuitive platform designed to make finding and listing properties effortless.</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 mx-auto bg-purple-100 rounded-lg mb-4">
                <UsersIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-base text-gray-500">Our dedicated support team is always here to help you with your rental journey.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
