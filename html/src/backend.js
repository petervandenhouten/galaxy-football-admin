// Utility to get the current backend URL
export function getBackendUrl() {
  return localStorage.getItem("backendUrl") || "https://your-production-backend.com";
}