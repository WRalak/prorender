import { useState, useEffect, useCallback } from 'react';
import { apiClient, API_ENDPOINTS, ApiResponse, PaginatedResponse, ApiError, handleApiError } from '../lib/api';

// Generic API hook
export function useApi<T>(
  endpoint: string,
  options: {
    immediate?: boolean;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    onSuccess?: (data: T) => void;
    onError?: (error: ApiError) => void;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(async (requestBody?: any) => {
    try {
      setLoading(true);
      setError(null);

      let result;
      switch (options.method) {
        case 'POST':
          result = await apiClient.post<T>(endpoint, requestBody || options.body);
          break;
        case 'PUT':
          result = await apiClient.put<T>(endpoint, requestBody || options.body);
          break;
        case 'DELETE':
          result = await apiClient.delete<T>(endpoint);
          break;
        default:
          result = await apiClient.get<T>(endpoint);
      }

      setData(result);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      options.onError?.(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [endpoint, options.method, options.body, options.onSuccess, options.onError]);

  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, [execute, options.immediate]);

  return {
    data,
    loading,
    error,
    execute,
    refetch: execute,
  };
}

// Authentication hooks
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string, role: string) => {
    try {
      const response = await apiClient.post<any>(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
        role,
      });

      if (response.success && response.data.token) {
        apiClient.setToken(response.data.token);
        setUser(response.data.user);
        localStorage.setItem('userRole', role);
      }

      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      apiClient.clearToken();
      setUser(null);
      localStorage.removeItem('userRole');
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      apiClient.setToken(token);
      // Fetch user profile
      apiClient.get(API_ENDPOINTS.USERS.PROFILE)
        .then((profileData: any) => {
          setUser(profileData);
        })
        .catch(() => {
          // Token might be invalid, clear it
          apiClient.clearToken();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user,
  };
}

// Agent registration hook
export function useAgentRegistration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const registerAgent = async (formData: any, file?: File) => {
    setLoading(true);
    setError(null);

    try {
      // First register the agent
      const response = await apiClient.post(API_ENDPOINTS.AGENT.REGISTER, formData);
      
      // If there's a file, upload it
      if (file) {
        await apiClient.upload(API_ENDPOINTS.AGENT.VERIFY_LICENSE, file, {
          agentId: response.data.id,
        });
      }

      return response;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  };

  return {
    registerAgent,
    loading,
    error,
  };
}

// Properties hooks
export function useProperties(filters?: any) {
  const [data, setData] = useState<PaginatedResponse<any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchProperties = useCallback(async (page = 1, newFilters?: any) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(newFilters || filters || {}),
      });

      const response = await apiClient.get<PaginatedResponse<any>>(
        `${API_ENDPOINTS.PROPERTIES.LIST}?${queryParams}`
      );
      
      setData(response);
      return response;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return {
    data,
    loading,
    error,
    fetchProperties,
    refetch: fetchProperties,
  };
}

export function usePropertyDetails(id: string) {
  return useApi(`${API_ENDPOINTS.PROPERTIES.DETAIL}/${id}`, {
    immediate: true,
  });
}

// Admin hooks
export function useAdminDashboard() {
  return useApi(API_ENDPOINTS.ADMIN.DASHBOARD, {
    immediate: true,
  });
}

export function useAdminSpaces() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchSpaces = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.SPACES);
      setData(response);
      return response;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const approveSpace = async (spaceId: number) => {
    try {
      await apiClient.post(`${API_ENDPOINTS.ADMIN.APPROVE_SPACE}/${spaceId}`);
      await fetchSpaces(); // Refresh the list
    } catch (err) {
      throw handleApiError(err);
    }
  };

  const rejectSpace = async (spaceId: number, reason?: string) => {
    try {
      await apiClient.post(`${API_ENDPOINTS.ADMIN.REJECT_SPACE}/${spaceId}`, { reason });
      await fetchSpaces(); // Refresh the list
    } catch (err) {
      throw handleApiError(err);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, [fetchSpaces]);

  return {
    data,
    loading,
    error,
    fetchSpaces,
    approveSpace,
    rejectSpace,
  };
}

// Super Admin hooks
export function useSuperAdminSettings() {
  return useApi(API_ENDPOINTS.SUPER_ADMIN.SETTINGS, {
    immediate: true,
  });
}

export function useCommissionRates() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(API_ENDPOINTS.SUPER_ADMIN.COMMISSION_RATES);
      setData(response);
      return response;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRates = async (rates: any) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.SUPER_ADMIN.COMMISSION_RATES, rates);
      setData(response);
      return response;
    } catch (err) {
      throw handleApiError(err);
    }
  };

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  return {
    data,
    loading,
    error,
    fetchRates,
    updateRates,
  };
}

// Payment hooks
export function usePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const createPaymentIntent = async (amount: number, currency: string, metadata?: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.INTENT, {
        amount,
        currency,
        metadata,
      });
      return response;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (paymentIntentId: string) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.CONFIRM, {
        paymentIntentId,
      });
      return response;
    } catch (err) {
      throw handleApiError(err);
    }
  };

  return {
    createPaymentIntent,
    confirmPayment,
    loading,
    error,
  };
}

// Notification hooks
export function useNotifications() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST);
      setData(response);
      return response;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = async (notificationIds: string[]) => {
    try {
      await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.MARK_READ, {
        notificationIds,
      });
      await fetchNotifications(); // Refresh the list
    } catch (err) {
      throw handleApiError(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    data,
    loading,
    error,
    fetchNotifications,
    markAsRead,
  };
}
