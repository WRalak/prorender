'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useApi } from '../../../hooks/useApi'
import { 
  UserIcon,
  BuildingOfficeIcon,
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  CameraIcon,
  HeartIcon,
  ShareIcon,
  CalendarIcon,
  DocumentTextIcon,
  LanguageIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'


export default function AgentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const agentId = params.id
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState('properties')

  // Fetch agent data
  const { data: agentData, loading: agentLoading, error: agentError } = useApi(`/agents/${agentId}`)
  const { data: propertiesData, loading: propertiesLoading } = useApi(`/agents/${agentId}/properties`)
  const { data: reviewsData, loading: reviewsLoading } = useApi(`/agents/${agentId}/reviews`)

  const agent = (agentData as any)?.agent
  const properties = (propertiesData as any)?.properties || []
  const reviews = (reviewsData as any)?.reviews || []

  if (agentLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading agent profile...</p>
        </div>
      </div>
    )
  }

  if (agentError || !agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Agent Not Found</h2>
          <p className="text-gray-600 mb-4">The agent you're looking for doesn't exist.</p>
          <Link
            href="/agents"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Agents
          </Link>
        </div>
      </div>
    )
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarSolidIcon key={i} className="h-5 w-5 text-yellow-400" />)
    }
    
    if (hasHalfStar) {
      stars.push(<StarSolidIcon key="half" className="h-5 w-5 text-yellow-400" />)
    }
    
    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<StarIcon key={`empty-${i}`} className="h-5 w-5 text-gray-300" />)
    }

    return stars
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="relative h-48 bg-gray-200">
        <img
          src={agent.coverImage}
          alt={`${agent.name.first} ${agent.name.last}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-900 p-2 rounded-lg transition-all"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-900 p-2 rounded-lg transition-all"
          >
            {isFavorite ? (
              <HeartSolidIcon className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5" />
            )}
          </button>
          <button className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-900 p-2 rounded-lg transition-all">
            <ShareIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Agent Info */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-start gap-6">
                <img
                  src={agent.profile?.avatar}
                  alt={`${agent.name.first} ${agent.name.last}`}
                  className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg -mt-16"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {agent.name.first} {agent.name.last}
                    </h1>
                    {agent.metadata?.verified && (
                      <CheckCircleIcon className="h-6 w-6 text-blue-500" title="Verified Agent" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {agent.profile?.businessAddress?.city}, {agent.profile?.businessAddress?.state}
                    </div>
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                      {agent.metadata?.propertiesCount || 0} properties
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {agent.metadata?.responseTime || 'N/A'}
                    </div>
                  </div>

                  <div className="flex items-center mb-4">
                    {renderStars(agent.metadata?.rating || 0)}
                    <span className="ml-2 font-medium text-gray-900">{agent.metadata?.rating || 0}</span>
                    <span className="ml-1 text-gray-500">({agent.metadata?.reviewCount || 0} reviews)</span>
                  </div>

                  <p className="text-gray-700">{agent.profile?.bio}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3 mt-6">
                <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  <EnvelopeIcon className="h-5 w-5 inline mr-2" />
                  Send Message
                </button>
                <button className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  <PhoneIcon className="h-5 w-5 inline mr-2" />
                  {agent.profile?.phone || 'N/A'}
                </button>
                <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
                  <CalendarIcon className="h-5 w-5 inline mr-2" />
                  Schedule
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  {['properties', 'about', 'reviews'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                        activeTab === tab
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'properties' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Featured Properties ({properties.length})
                    </h3>
                    {propertiesLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-600">Loading properties...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {properties.map((property) => (
                        <div key={property.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          <div className="relative">
                            <img
                              src={property.image}
                              alt={property.title}
                              className="w-full h-48 object-cover"
                            />
                            {property.featured && (
                              <span className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="p-4">
                            <h4 className="font-semibold text-gray-900 mb-1">{property.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{property.address}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-blue-600">${property.price}/mo</span>
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <span>{property.bedrooms} bed</span>
                                <span>{property.bathrooms} bath</span>
                                <span>{property.area} sqft</span>
                              </div>
                            </div>
                            <button className="w-full mt-3 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                              View Property
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    )}
                  </div>
                )}

                {activeTab === 'about' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">About {agent.name.first}</h3>
                      <p className="text-gray-700 leading-relaxed">{agent.profile?.bio}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Professional Information</h4>
                        <dl className="space-y-2">
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Experience:</dt>
                            <dd className="font-medium">{agent.metadata?.experience || 'N/A'}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-600">License:</dt>
                            <dd className="font-medium">{agent.profile?.licenseNumber || 'N/A'}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Company:</dt>
                            <dd className="font-medium">{agent.profile?.companyName || 'N/A'}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Languages:</dt>
                            <dd className="font-medium">{(agent.metadata?.languages || []).join(', ')}</dd>
                          </div>
                        </dl>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Specialties</h4>
                        <div className="flex flex-wrap gap-2">
                          {(agent.metadata?.specialties || []).map((specialty, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {agent.metadata?.achievements && agent.metadata.achievements.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Achievements</h4>
                        <ul className="space-y-2">
                          {agent.metadata.achievements.map((achievement, index) => (
                            <li key={index} className="flex items-center text-gray-700">
                              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Client Reviews</h3>
                      <div className="flex items-center">
                        {renderStars(agent.metadata?.rating || 0)}
                        <span className="ml-2 font-medium text-gray-900">{agent.metadata?.rating || 0}</span>
                        <span className="ml-1 text-gray-500">({agent.metadata?.reviewCount || 0} reviews)</span>
                      </div>
                    </div>

                    {reviewsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-600">Loading reviews...</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                          <div className="flex items-start gap-4">
                            <img
                              src={review.avatar}
                              alt={review.author}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-medium text-gray-900">{review.author}</h4>
                                  <p className="text-sm text-gray-600">{review.date}</p>
                                </div>
                                <div className="flex items-center">
                                  {renderStars(review.rating)}
                                </div>
                              </div>
                              <p className="text-gray-700 mb-2">{review.comment}</p>
                              <p className="text-sm text-blue-600 font-medium">{review.property?.title || review.property}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <a
                  href={`mailto:${agent.email}`}
                  className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <EnvelopeIcon className="h-5 w-5 mr-3 text-gray-400" />
                  {agent.email}
                </a>
                <a
                  href={`tel:${agent.profile?.phone}`}
                  className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <PhoneIcon className="h-5 w-5 mr-3 text-gray-400" />
                  {agent.profile?.phone || 'N/A'}
                </a>
                {agent.metadata?.website && (
                  <a
                    href={`https://${agent.metadata.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <DocumentTextIcon className="h-5 w-5 mr-3 text-gray-400" />
                    {agent.metadata.website}
                  </a>
                )}
              </div>
            </div>

            {/* Working Hours */}
            {agent.metadata?.workingHours && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Working Hours</h3>
                <div className="space-y-2">
                  {Object.entries(agent.metadata.workingHours).map(([day, hours]: [string, string]) => (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">{day}</span>
                      <span className="font-medium text-gray-900">{hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* List Property CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-sm p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">List Your Property</h3>
              <p className="text-blue-100 text-sm mb-4">
                Work with {agent.name.first} to get your property listed and find the perfect tenants.
              </p>
              <button className="w-full bg-white text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                List Property
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
