// Mutator used by Orval (fetch-based)
export const customInstance = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: HeadersInit = {
    ...(options?.headers || {}),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  const isAbsolute = /^https?:\/\//.test(url);
  const fullUrl = isAbsolute ? url : `/api${url.startsWith("/") ? url : `/${url}`}`;
  const res = await fetch(fullUrl, { ...options, headers });
  const responseHeaders = res.headers;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  const body = (await res.json()) as unknown;
  return { data: body as unknown, status: res.status, headers: responseHeaders } as unknown as T;
};
