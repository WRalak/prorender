import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

// Custom hook for API calls with loading and error handling
export const useApi = (key, fetcher, options = {}) => {
  return useQuery(key, fetcher, {
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

  return useMutation(mutationFn, {
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
          queryClient.invalidateQueries(queryKey);
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

  const uploadMutation = useMutation(
    async (file) => {
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
    {
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
    }
  );

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

  return useQuery(key, fetcher, options);
};

export default useApi;
