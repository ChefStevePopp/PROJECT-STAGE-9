// src/lib/error-handling.ts
export const handleAPIError = async (response: Response) => {
  if (response.status === 502) {
    console.warn("Backend service temporarily unavailable, retrying...");
    // Add retry logic here if needed
    return null;
  }
  throw new Error(`API Error: ${response.status}`);
};
