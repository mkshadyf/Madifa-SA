import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  urlOrConfig: string | { url: string; method?: string; data?: unknown },
  method: string = "GET",
  data?: unknown | undefined,
): Promise<any> {
  let url: string;
  let actualMethod: string = method;
  let actualData: unknown | undefined = data;
  
  // Handle overloaded function signature
  if (typeof urlOrConfig === 'object') {
    url = urlOrConfig.url;
    actualMethod = urlOrConfig.method || 'GET';
    actualData = urlOrConfig.data;
  } else {
    url = urlOrConfig;
  }
  
  // Get auth token from localStorage
  const token = localStorage.getItem("auth_token");
  
  // Set up headers
  const headers: HeadersInit = {};
  if (actualData) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const res = await fetch(url, {
    method: actualMethod,
    headers,
    body: actualData ? JSON.stringify(actualData) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  
  // Try to parse as JSON first, fall back to text
  try {
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    }
    return await res.text();
  } catch (e) {
    // If parsing fails for any reason, return the raw response
    return res;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get auth token from localStorage
    const token = localStorage.getItem("auth_token");
    
    // Set up headers
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    const res = await fetch(queryKey[0] as string, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
