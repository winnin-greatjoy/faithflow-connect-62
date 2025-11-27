import { supabase } from '@/integrations/supabase/client';
import type {
  ApiResponse,
  ApiError,
  ApiResult,
  PaginatedResponse,
  FilterOptions,
  SortOptions,
  CreateRequest,
  UpdateRequest,
  ListRequest,
} from '@/types/api';

// Base API Configuration
export const API_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_TIMEOUT: 30000,
} as const;

// Error handling utilities
export const handleApiError = (error: any): ApiError => {
  const message = error?.message || error?.error_description || 'An unexpected error occurred';
  const code = error?.code || error?.status?.toString() || 'UNKNOWN_ERROR';
  const details = error?.details || error;

  return {
    data: null,
    error: { message, code, details },
  };
};

// Generic API response wrapper
export const createApiResponse = <T>(data: T): ApiResponse<T> => ({
  data,
  error: null,
});

export const createApiError = (message: string, code?: string, details?: any): ApiError => ({
  data: null,
  error: { message, code, details },
});

// Pagination utilities
export const calculatePagination = (total: number, page: number, limit: number) => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

// Filter utilities for Supabase queries
export const applyFilters = <T>(
  query: any,
  filters?: FilterOptions,
  searchFields: string[] = []
) => {
  let filteredQuery = query;

  if (filters?.search && searchFields.length > 0) {
    // Apply search across multiple fields
    const searchConditions = searchFields.map((field) => `${field}.ilike.%${filters.search}%`);
    filteredQuery = filteredQuery.or(searchConditions.join(','));
  }

  if (filters?.status) {
    filteredQuery = filteredQuery.eq('status', filters.status);
  }

  if (filters?.category) {
    filteredQuery = filteredQuery.eq('category', filters.category);
  }

  if (filters?.assignedTo) {
    filteredQuery = filteredQuery.eq('assigned_to', filters.assignedTo);
  }

  if (filters?.branchId) {
    filteredQuery = filteredQuery.eq('branch_id', filters.branchId);
  }

  if (filters?.dateFrom) {
    filteredQuery = filteredQuery.gte('created_at', filters.dateFrom);
  }

  if (filters?.dateTo) {
    filteredQuery = filteredQuery.lte('created_at', filters.dateTo);
  }

  return filteredQuery;
};

// Sort utilities for Supabase queries
export const applySorting = <T>(
  query: any,
  sort?: SortOptions,
  defaultSort?: { field: string; direction: 'asc' | 'desc' }
) => {
  if (sort) {
    return query.order(sort.field, { ascending: sort.direction === 'asc' });
  }

  if (defaultSort) {
    return query.order(defaultSort.field, { ascending: defaultSort.direction === 'asc' });
  }

  return query.order('created_at', { ascending: false });
};

// Pagination utilities for Supabase queries
export const applyPagination = <T>(query: any, pagination?: { page: number; limit: number }) => {
  const page = pagination?.page || 1;
  const limit = Math.min(
    pagination?.limit || API_CONFIG.DEFAULT_PAGE_SIZE,
    API_CONFIG.MAX_PAGE_SIZE
  );
  const offset = (page - 1) * limit;

  return query.range(offset, offset + limit - 1);
};

// Generic CRUD operations for Supabase (simplified to avoid type issues)
export class BaseApiService {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async list(request?: ListRequest): Promise<ApiResult<any[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(request?.pagination?.limit || 20);

      if (error) {
        return handleApiError(error);
      }

      return createApiResponse(data || []);
    } catch (error) {
      return handleApiError(error);
    }
  }

  async getById(id: string): Promise<ApiResult<any>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName as any)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return handleApiError(error);
      }

      return createApiResponse(data);
    } catch (error) {
      return handleApiError(error);
    }
  }

  async create(request: CreateRequest<any>): Promise<ApiResult<any>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName as any)
        .insert(request.data)
        .select()
        .single();

      if (error) {
        return handleApiError(error);
      }

      return createApiResponse(data);
    } catch (error) {
      return handleApiError(error);
    }
  }

  async update(request: UpdateRequest<any>): Promise<ApiResult<any>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName as any)
        .update(request.data)
        .eq('id', request.id)
        .select()
        .single();

      if (error) {
        return handleApiError(error);
      }

      return createApiResponse(data);
    } catch (error) {
      return handleApiError(error);
    }
  }

  async delete(id: string): Promise<ApiResult<any>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName as any)
        .delete()
        .eq('id', id);

      if (error) {
        return handleApiError(error);
      }

      return createApiResponse(data);
    } catch (error) {
      return handleApiError(error);
    }
  }

  async count(filters?: FilterOptions): Promise<ApiResult<number>> {
    try {
      const { count, error } = await supabase
        .from(this.tableName as any)
        .select('*', { count: 'exact', head: true });

      if (error) {
        return handleApiError(error);
      }

      return createApiResponse(count || 0);
    } catch (error) {
      return handleApiError(error);
    }
  }
}

// Batch operations utility
export const batchOperation = async <T>(
  operations: (() => Promise<ApiResult<T>>)[],
  batchSize: number = 5
): Promise<ApiResult<T[]>> => {
  const results: T[] = [];
  const errors: string[] = [];

  // Process operations in batches
  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize);

    const batchResults = await Promise.allSettled(batch.map((op) => op()));

    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const apiResult = result.value;
        if (apiResult.error) {
          errors.push(apiResult.error.message);
        } else {
          results.push(apiResult.data);
        }
      } else {
        errors.push('Operation failed');
      }
    });
  }

  if (errors.length > 0) {
    return createApiError(
      `Batch operation completed with ${errors.length} errors`,
      'BATCH_ERROR',
      errors
    );
  }

  return createApiResponse(results);
};

// File upload utility for Supabase Storage
export const uploadFile = async (
  bucket: string,
  filePath: string,
  file: File,
  options?: {
    cacheControl?: string;
    contentType?: string;
    upsert?: boolean;
  }
): Promise<ApiResult<{ path: string; fullPath: string }>> => {
  try {
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: options?.cacheControl || '3600',
      contentType: options?.contentType || file.type,
      upsert: options?.upsert || false,
    });

    if (error) {
      return handleApiError(error);
    }

    return createApiResponse({
      path: data.path,
      fullPath: supabase.storage.from(bucket).getPublicUrl(data.path).data.publicUrl,
    });
  } catch (error) {
    return handleApiError(error);
  }
};

// Authentication utilities
export const getCurrentUser = async (): Promise<ApiResult<any>> => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return handleApiError(error);
    }

    return createApiResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getUserProfile = async (userId?: string): Promise<ApiResult<any>> => {
  try {
    const targetUserId = userId || (await getCurrentUser()).data?.id;

    if (!targetUserId) {
      return createApiError('User ID is required');
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetUserId)
      .single();

    if (error) {
      return handleApiError(error);
    }

    return createApiResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
};

// Real-time subscription utilities
export const subscribeToTable = (
  tableName: string,
  callback: (payload: any) => void,
  filters?: FilterOptions
) => {
  const subscription = supabase
    .channel(`${tableName}_changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: tableName,
        ...(filters && {
          filter: Object.entries(filters)
            .map(([key, value]) => `${key}=eq.${value}`)
            .join(','),
        }),
      },
      callback
    )
    .subscribe();

  return {
    unsubscribe: () => subscription.unsubscribe(),
    subscription,
  };
};

// Cache utilities
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export const getCachedData = <T>(key: string): T | null => {
  const cached = cache.get(key);
  if (!cached) return null;

  if (Date.now() - cached.timestamp > cached.ttl) {
    cache.delete(key);
    return null;
  }

  return cached.data;
};

export const setCachedData = <T>(key: string, data: T, ttl: number = 300000): void => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
};

export const clearCache = (pattern?: string): void => {
  if (!pattern) {
    cache.clear();
    return;
  }

  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};

// Retry utility for failed operations
export const retryOperation = async <T>(
  operation: () => Promise<ApiResult<T>>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<ApiResult<T>> => {
  let lastError: ApiError | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();

      if (!result.error) {
        return result;
      }

      const errResult = result as ApiError;
      lastError = errResult;

      // Don't retry on certain error types
      if (errResult.error.code === 'PERMISSION_DENIED' || errResult.error.code === 'NOT_FOUND') {
        return errResult;
      }

      // Wait before retrying
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    } catch (error) {
      lastError = handleApiError(error);

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  }

  return createApiError(
    `Operation failed after ${maxRetries} attempts`,
    'RETRY_EXHAUSTED',
    lastError?.error.details
  );
};
