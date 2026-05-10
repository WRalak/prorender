import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

// Default API fetcher
const apiFetcher = async (endpoint) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
  const response = await fetch(`${baseUrl}${endpoint}`);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Custom hook for API calls with loading and error handling
export const useApi = (keyOrEndpoint, fetcherOrOptions, options = {}) => {
  // Handle old API: useApi(endpoint, options)
  if (typeof fetcherOrOptions === 'object' && !fetcherOrOptions.then) {
    const endpoint = keyOrEndpoint;
    const userOptions = fetcherOrOptions;
    
    return useQuery({
      queryKey: [endpoint],
      queryFn: () => apiFetcher(endpoint),
      retry: 1,
      refetchOnWindowFocus: false,
      onError: (error) => {
        toast.error(error.message || 'An error occurred');
      },
      ...userOptions,
    });
  }
  
  // Handle new API: useApi(key, fetcher, options)
  const key = keyOrEndpoint;
  const fetcher = typeof fetcherOrOptions === 'string' 
    ? () => apiFetcher(fetcherOrOptions)
    : fetcherOrOptions;
    
  return useQuery({
    queryKey: key,
    queryFn: fetcher,
    retry: 1,
    refetchOnWindowFocus: false,
    onError: (error) => {
      toast.error(error.message || 'An error occurred');
    },
    ...options,
  });
};

// Custom hook for mutations with success/error handling
export const useApiMutation = (mutationFn, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mutationFn,
    onError: (error) => {
      toast.error(error.message || 'An error occurred');
    },
    onSuccess: (data, variables, context) => {
      if (options.successMessage) {
        toast.success(options.successMessage);
      }
      
      // Invalidate related queries
      if (options.invalidateQueries) {
        options.invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      
      // Call custom success handler
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
};

// Custom hook for pagination
export const usePaginatedApi = (key, fetcher, options = {}) => {
  return useQuery(key, fetcher, {
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) => {
      toast.error(error.message || 'An error occurred');
    },
    ...options,
  });
};

// Custom hook for infinite scroll
export const useInfiniteApi = (key, fetcher, options = {}) => {
  return useInfiniteQuery(
    key,
    ({ pageParam = 1 }) => fetcher({ page: pageParam }),
    {
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.pagination?.page < lastPage.pagination?.pages) {
          return lastPage.pagination.page + 1;
        }
        return undefined;
      },
      onError: (error) => {
        toast.error(error.message || 'An error occurred');
      },
      ...options,
    }
  );
};

// Custom hook for file uploads
export const useFileUpload = (endpoint, options = {}) => {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      setIsUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
        }
      });

      return new Promise((resolve, reject) => {
        xhr.onload = () => {
          setIsUploading(false);
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error('Upload failed'));
          }
        };

        xhr.onerror = () => {
          setIsUploading(false);
          reject(new Error('Upload failed'));
        };

        xhr.open('POST', endpoint);
        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
        xhr.send(formData);
      });
    },
    onSuccess: (data) => {
      toast.success('File uploaded successfully');
      setProgress(0);
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      toast.error('File upload failed');
      setProgress(0);
      setIsUploading(false);
      if (options.onError) {
        options.onError(error);
      }
    },
  });

  return {
    upload: uploadMutation.mutate,
    isUploading,
    progress,
  };
};

// Custom hook for debounced API calls
export const useDebouncedApi = (key, fetcher, delay = 500) => {
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [query, delay]);

  return useQuery(
    [key, debouncedQuery],
    () => fetcher(debouncedQuery),
    {
      enabled: debouncedQuery.length > 0,
      ...options,
    }
  );
};

// Custom hook for real-time data
export const useRealtimeApi = (key, fetcher, socketEvent, options = {}) => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      const handleRealtimeUpdate = (data) => {
        queryClient.setQueryData(key, data);
      };

      socket.on(socketEvent, handleRealtimeUpdate);

      return () => {
        socket.off(socketEvent, handleRealtimeUpdate);
      };
    }
  }, [socket, socketEvent, key, queryClient]);

  return useQuery({
    queryKey: key,
    queryFn: fetcher,
    ...options
  });
};

// Export commonly used hooks
export const useAuth = () => {
  // This is a placeholder - actual auth logic should be in AuthContext
  return useQuery({
    queryKey: ['auth'],
    queryFn: () => fetch('/api/auth/me').then(res => res.json())
  });
};

export const useAgentRegistration = () => {
  // This is a placeholder for agent registration
  const queryClient = useQueryClient();
  
  const registerAgent = useMutation({
    mutationFn: async (agentData) => {
      const response = await fetch('/api/auth/register/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData)
      });
      return response.json();
    },
    onSuccess: () => {
      toast.success('Agent registration successful!');
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Registration failed');
    }
  });

  return {
    registerAgent: registerAgent.mutateAsync,
    isLoading: registerAgent.isLoading
  };
};

// Properties hook
export const useProperties = (filters) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let result;
      const queryString = filters ? `?${new URLSearchParams(filters).toString()}` : '';
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/properties${queryString}`);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      result = await response.json();
      setData(result);
      return result;
    } catch (err) {
      const apiError = {
        message: err.message || 'An error occurred',
        status: 500,
        code: 'UNKNOWN_ERROR'
      };
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Auto-execute on mount if needed
// useEffect(() => {
//   if (options.immediate) {
//     execute();
//   }
// }, [execute, options.immediate]);

  return {
    data,
    loading,
    error,
    execute,
    refetch: execute,
  };
};

export default useApi;
