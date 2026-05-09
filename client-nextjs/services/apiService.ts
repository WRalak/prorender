import { API_ENDPOINTS, getApiUrl } from '../lib/apiEndpoints'

// API Service for handling all API calls
class ApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = getApiUrl('')
  }

  // Authentication methods
  async login(credentials: { email: string; password: string }) {
    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
    return response.json()
  }

  async register(userData: { email: string; password: string; firstName: string; lastName: string }) {
    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.AUTH.REGISTER}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })
    return response.json()
  }

  async logout() {
    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.AUTH.LOGOUT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
    return response.json()
  }

  // Properties methods
  async getProperties(params?: Record<string, string>) {
    const url = new URL(`${this.baseUrl}${API_ENDPOINTS.PROPERTIES.LIST}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value)
      })
    }
    const response = await fetch(url.toString())
    return response.json()
  }

  async createProperty(propertyData: any) {
    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.PROPERTIES.CREATE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(propertyData),
    })
    return response.json()
  }

  // Applications methods
  async getApplications() {
    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.APPLICATIONS.LIST}`)
    return response.json()
  }

  async createApplication(applicationData: any) {
    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.APPLICATIONS.CREATE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(applicationData),
    })
    return response.json()
  }

  // Users methods
  async getUsers() {
    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.USERS.LIST}`)
    return response.json()
  }

  // System methods
  async healthCheck() {
    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.SYSTEM.HEALTH_CHECK}`)
    return response.json()
  }

  async getSystemStatus() {
    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.SYSTEM.STATUS}`)
    return response.json()
  }

  async getSystemMetrics() {
    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.SYSTEM.METRICS}`)
    return response.json()
  }

  // Notifications methods
  async getNotifications() {
    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.NOTIFICATIONS.LIST}`)
    return response.json()
  }

  // Payments methods
  async createPaymentIntent(paymentData: any) {
    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.PAYMENTS.CREATE_INTENT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData),
    })
    return response.json()
  }

  // Search methods
  async searchProperties(query: string) {
    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.SEARCH.GLOBAL}?q=${encodeURIComponent(query)}`)
    return response.json()
  }

  // File upload methods
  async uploadFile(file: File, onProgress?: (progress: number) => void) {
    const formData = new FormData()
    formData.append('file', file)
    
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${this.baseUrl}${API_ENDPOINTS.FILES.UPLOAD}`)
    
    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100
          onProgress(progress)
        }
      }
    }
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText)
        return response
      } else {
        throw new Error(`Upload failed with status ${xhr.status}`)
      }
    }
    
    xhr.send(formData)
    return new Promise((resolve, reject) => {
      xhr.onerror = () => reject(new Error('Upload failed'))
      xhr.onload = () => {
        try {
          const result = JSON.parse(xhr.responseText)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }
    })
  }
}

export default new ApiService()
