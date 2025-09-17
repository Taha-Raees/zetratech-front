// Centralized API utility functions for the ZetraTech admin system
// All API calls to the separate Fastify backend running on port 3001

import { 
  Store, 
  User, 
  AdminUser, 
  Product,
  ProductVariant,
  Order,
  OrderItem,
  SubscriptionPackage,
  DatabaseConstraint,
  RecycleBinItem,
  AuditLog,
  ApiResponse,
  AuthResponse 
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

// Global variable to track if we're currently refreshing tokens
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: Response | PromiseLike<Response>) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(new Response(JSON.stringify({ success: true }), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' }
      }));
    }
  });
  
  failedQueue = [];
};

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    console.error('API Error:', data.error || 'API request failed', 'Status:', response.status, 'Headers:', Object.fromEntries(response.headers.entries()));
    throw new Error(data.error || 'API request failed');
  }
  return data;
}

// Enhanced fetch wrapper with automatic token refresh
async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = input.toString();
  const options = {
    credentials: 'include' as const,
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  };

  let response = await fetch(url, options);

  // If we get a 401, try to refresh the token
  if (response.status === 401) {
    if (isRefreshing) {
      // If we're already refreshing, queue this request
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      });
    }

    isRefreshing = true;

    try {
      // For admin endpoints, use admin refresh
      const refreshEndpoint = `${API_BASE_URL}/auth/admin-login/refresh`;

      const refreshResponse = await fetch(refreshEndpoint, {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshResponse.ok) {
        // Retry the original request
        response = await fetch(url, options);
        processQueue(null, 'refreshed');
      } else {
        // Refresh failed, clear the queue with error
        processQueue(new Error('Token refresh failed'));
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/admin-login';
        }
        // Return the original 401 response
        return response;
      }
    } catch (error) {
      processQueue(error);
      if (typeof window !== 'undefined') {
        window.location.href = '/admin-login';
      }
      // Return the original 401 response
      return response;
    } finally {
      isRefreshing = false;
    }
  }

  return response;
}

// Type guard for API responses
function isApiResponse<T>(data: any): data is ApiResponse<T> {
  return typeof data === 'object' && data !== null && 'success' in data;
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiFetch(`${API_BASE_URL}/auth/admin-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<ApiResponse<AuthResponse>>(response);
  },

  logout: async () => {
    const response = await apiFetch(`${API_BASE_URL}/auth/admin-login/logout`, {
      method: 'POST',
    });
    return handleResponse<ApiResponse>(response);
  },

  verify: async () => {
    const response = await apiFetch(`${API_BASE_URL}/auth/admin-login/verify`);
    return handleResponse<ApiResponse<{ user: AdminUser }>>(response);
  },

  refresh: async () => {
    const response = await apiFetch(`${API_BASE_URL}/auth/admin-login/refresh`, {
      method: 'POST',
    });
    return handleResponse<ApiResponse>(response);
  },
};

// Admin API
export const adminApi = {
  // Store management
  createStore: async (storeData: any) => {
    const response = await apiFetch(`${API_BASE_URL}/admin/create-store`, {
      method: 'POST',
      body: JSON.stringify(storeData),
    });
    return handleResponse<ApiResponse<any>>(response);
  },
  
  getStores: async () => {
    const response = await apiFetch(`${API_BASE_URL}/admin/create-store`);
    return handleResponse<ApiResponse<Store[]>>(response);
  },
  
  getStoreById: async (id: string) => {
    const response = await apiFetch(`${API_BASE_URL}/admin/create-store/${id}`);
    return handleResponse<ApiResponse<Store>>(response);
  },
  
  updateStore: async (id: string, storeData: Partial<Store>) => {
    const response = await apiFetch(`${API_BASE_URL}/admin/create-store/${id}`, {
      method: 'PUT',
      body: JSON.stringify(storeData),
    });
    return handleResponse<ApiResponse<Store>>(response);
  },
  
  deleteStore: async (id: string) => {
    const response = await apiFetch(`${API_BASE_URL}/admin/create-store/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<ApiResponse>(response);
  },

  // Store subscription management
  assignSubscription: async (storeId: string, subscriptionPackageId: string) => {
    const response = await apiFetch(`${API_BASE_URL}/admin/store-subscription/assign`, {
      method: 'POST',
      body: JSON.stringify({ storeId, subscriptionPackageId }),
    });
    return handleResponse<ApiResponse<Store>>(response);
  },

  updateStoreStatus: async (id: string, status: 'active' | 'suspended') => {
    const response = await apiFetch(`${API_BASE_URL}/admin/store-subscription/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return handleResponse<ApiResponse<Store>>(response);
  },

  getActiveSubscriptionPackages: async () => {
    const response = await apiFetch(`${API_BASE_URL}/admin/store-subscription/packages`);
    return handleResponse<ApiResponse<SubscriptionPackage[]>>(response);
  },

  // User management
  getUsers: async () => {
    const response = await apiFetch(`${API_BASE_URL}/admin/users`);
    return handleResponse<ApiResponse<User[]>>(response);
  },
  
  getUserById: async (id: string) => {
    const response = await apiFetch(`${API_BASE_URL}/admin/users/${id}`);
    return handleResponse<ApiResponse<User>>(response);
  },
  
  createUser: async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await apiFetch(`${API_BASE_URL}/admin/users`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return handleResponse<ApiResponse<User>>(response);
  },
  
  updateUser: async (id: string, userData: Partial<User>) => {
    const response = await apiFetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return handleResponse<ApiResponse<User>>(response);
  },
  
  deleteUser: async (id: string) => {
    const response = await apiFetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<ApiResponse>(response);
  },

  // Subscription packages
  getSubscriptionPackages: async () => {
    const response = await apiFetch(`${API_BASE_URL}/admin/subscription-packages`);
    return handleResponse<ApiResponse<SubscriptionPackage[]>>(response);
  },
  
  getSubscriptionPackageById: async (id: string) => {
    const response = await apiFetch(`${API_BASE_URL}/admin/subscription-packages/${id}`);
    return handleResponse<ApiResponse<SubscriptionPackage>>(response);
  },
  
  createSubscriptionPackage: async (packageData: Omit<SubscriptionPackage, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await apiFetch(`${API_BASE_URL}/admin/subscription-packages`, {
      method: 'POST',
      body: JSON.stringify(packageData),
    });
    return handleResponse<ApiResponse<SubscriptionPackage>>(response);
  },
  
  updateSubscriptionPackage: async (id: string, packageData: Partial<SubscriptionPackage>) => {
    const response = await apiFetch(`${API_BASE_URL}/admin/subscription-packages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(packageData),
    });
    return handleResponse<ApiResponse<SubscriptionPackage>>(response);
  },
  
  deleteSubscriptionPackage: async (id: string) => {
    const response = await apiFetch(`${API_BASE_URL}/admin/subscription-packages/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<ApiResponse>(response);
  },

  // Dashboard analytics
  getDashboardData: async () => {
    const response = await apiFetch(`${API_BASE_URL}/admin/analytics/dashboard`);
    return handleResponse<ApiResponse<any>>(response);
  },

  // Constraint visualization
  getConstraints: async () => {
    const response = await apiFetch(`${API_BASE_URL}/admin/constraints`);
    return handleResponse<ApiResponse<DatabaseConstraint[]>>(response);
  },

  // Recycle bin
  getDeletedItems: async () => {
    const response = await apiFetch(`${API_BASE_URL}/admin/recycle-bin`);
    return handleResponse<ApiResponse<RecycleBinItem[]>>(response);
  },

  restoreItem: async (type: string, id: string) => {
    const response = await apiFetch(`${API_BASE_URL}/admin/recycle-bin/restore`, {
      method: 'POST',
      body: JSON.stringify({ type, id }),
    });
    return handleResponse<ApiResponse>(response);
  },

  permanentlyDeleteItem: async (type: string, id: string) => {
    const response = await apiFetch(`${API_BASE_URL}/admin/recycle-bin/permanent-delete`, {
      method: 'POST',
      body: JSON.stringify({ type, id }),
    });
    return handleResponse<ApiResponse>(response);
  },
};

// Products API
export const productsApi = {
  getAll: async () => {
    const response = await apiFetch(`${API_BASE_URL}/products`);
    return handleResponse<ApiResponse<Product[]>>(response);
  },

  getById: async (id: string) => {
    const response = await apiFetch(`${API_BASE_URL}/products/${id}`);
    return handleResponse<ApiResponse<Product>>(response);
  },

  create: async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await apiFetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      body: JSON.stringify(product),
    });
    return handleResponse<ApiResponse<Product>>(response);
  },

  update: async (id: string, product: Partial<Product>) => {
    const response = await apiFetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
    return handleResponse<ApiResponse<Product>>(response);
  },

  delete: async (id: string) => {
    const response = await apiFetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<ApiResponse>(response);
  },
};

// Orders API
export const ordersApi = {
  getAll: async (storeId?: string) => {
    const url = new URL(`${API_BASE_URL}/orders`);
    if (storeId) {
      url.searchParams.append('storeId', storeId);
    }
    const response = await apiFetch(url.toString());
    return handleResponse<ApiResponse<Order[]>>(response);
  },

  getById: async (id: string) => {
    const response = await apiFetch(`${API_BASE_URL}/orders/${id}`);
    return handleResponse<ApiResponse<Order>>(response);
  },

  create: async (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => {
    const response = await apiFetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      body: JSON.stringify(order),
    });
    return handleResponse<ApiResponse<Order>>(response);
  },
};

// Audit API
export const auditApi = {
  getLogs: async (params?: {
    limit?: number;
    offset?: number;
    entityType?: string;
    action?: string;
    userId?: string;
  }) => {
    const url = new URL(`${API_BASE_URL}/audit/logs`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await apiFetch(url.toString());
    return handleResponse<ApiResponse<AuditLog[]>>(response);
  },

  getEntityLogs: async (entityType: string, entityId: string, limit?: number) => {
    const url = new URL(`${API_BASE_URL}/audit/logs/${entityType}/${entityId}`);
    if (limit) url.searchParams.append('limit', limit.toString());
    
    const response = await apiFetch(url.toString());
    return handleResponse<ApiResponse<AuditLog[]>>(response);
  },

  getUsers: async () => {
    const response = await apiFetch(`${API_BASE_URL}/audit/users`);
    return handleResponse<ApiResponse<User[]>>(response);
  },

  getEntityTypes: async () => {
    const response = await apiFetch(`${API_BASE_URL}/audit/entity-types`);
    return handleResponse<ApiResponse<string[]>>(response);
  },

  getActions: async () => {
    const response = await apiFetch(`${API_BASE_URL}/audit/actions`);
    return handleResponse<ApiResponse<string[]>>(response);
  },

  exportLogs: async (params: {
    format?: 'csv' | 'json';
    entityType?: string;
    action?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiFetch(`${API_BASE_URL}/audit/export`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response;
  },
};

// Type exports for convenience
export type { 
  Store, 
  User, 
  AdminUser, 
  Product,
  ProductVariant,
  Order,
  OrderItem,
  SubscriptionPackage,
  DatabaseConstraint,
  RecycleBinItem,
  AuditLog,
  ApiResponse,
  AuthResponse 
};
