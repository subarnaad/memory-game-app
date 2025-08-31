import axios from "axios";
import Cookies from "js-cookie";

export const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: apiUrl,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get("refresh_token");
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await api.post("/refresh-token", { refreshToken });

        Cookies.set("access_token", data.accessToken, { expires: 1 });

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${data.accessToken}`,
        };

        return api(originalRequest);
      } catch (refreshError) {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
