import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const REFRESH_EXCLUDED_ROUTES = ["/auth/login", "/auth/register", "/auth/refresh"];

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

class ApiClient {
  private client: AxiosInstance;
  private refreshClient: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<string | null> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
    });
    this.refreshClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
    });

    // Load tokens from localStorage
    this.accessToken = localStorage.getItem("accessToken");
    this.refreshToken = localStorage.getItem("refreshToken");

    // Add request interceptor to include token
    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as RetryableRequestConfig | undefined;
        const requestUrl = originalRequest?.url || "";
        const canRefresh =
          error.response?.status === 401 &&
          !!originalRequest &&
          !originalRequest._retry &&
          !!this.refreshToken &&
          !REFRESH_EXCLUDED_ROUTES.some((route) => requestUrl.startsWith(route));

        if (canRefresh && originalRequest) {
          originalRequest._retry = true;
          const refreshedAccessToken = await this.refreshSession();

          if (refreshedAccessToken) {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${refreshedAccessToken}`;
            return this.client(originalRequest);
          }
        }

        if (error.response?.status === 401 && window.location.pathname !== "/") {
          console.warn("Unauthorized request - clearing session");
          this.clearTokens();
          if (window.location.pathname !== "/login") {
            window.location.href = "/";
          }
        }

        return Promise.reject(error);
      }
    );
  }

  setSessionTokens(accessToken: string, refreshToken?: string | null) {
    this.accessToken = accessToken;
    localStorage.setItem("accessToken", accessToken);

    if (typeof refreshToken === "string") {
      this.refreshToken = refreshToken;
      localStorage.setItem("refreshToken", refreshToken);
    }

    this.client.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  }

  setAccessToken(token: string) {
    this.setSessionTokens(token, this.refreshToken);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    delete this.client.defaults.headers.common.Authorization;
  }

  async refreshSession() {
    if (!this.refreshToken) {
      return null;
    }

    if (!this.refreshPromise) {
      this.refreshPromise = this.refreshClient
        .post("/auth/refresh", {
          refreshToken: this.refreshToken,
        })
        .then((response) => {
          const refreshedAccessToken = response.data?.data?.accessToken as string | undefined;
          const refreshedRefreshToken = response.data?.data?.refreshToken as string | undefined;

          if (!refreshedAccessToken) {
            throw new Error("Refresh endpoint did not return a new access token");
          }

          this.setSessionTokens(refreshedAccessToken, refreshedRefreshToken || this.refreshToken);
          return refreshedAccessToken;
        })
        .catch(() => {
          this.clearTokens();
          return null;
        })
        .finally(() => {
          this.refreshPromise = null;
        });
    }

    return this.refreshPromise;
  }

  // Auth endpoints
  async register(email: string, password: string, specialty: string) {
    const response = await this.client.post("/auth/register", {
      email,
      password,
      specialty,
    });
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post("/auth/login", {
      email,
      password,
    });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get("/auth/me");
    return response.data;
  }

  async logout() {
    try {
      if (this.refreshToken) {
        await this.client.post("/auth/logout", {
          refreshToken: this.refreshToken,
        });
      }
    } finally {
      this.clearTokens();
    }
  }

  // Patient endpoints
  async getPatients(page = 1, pageSize = 20) {
    const response = await this.client.get("/patients", {
      params: { page, pageSize },
    });
    return response.data;
  }

  async getPatient(id: string) {
    const response = await this.client.get(`/patients/${id}`);
    return response.data;
  }

  async createPatient(data: any) {
    const response = await this.client.post("/patients", data);
    return response.data;
  }

  async updatePatient(id: string, data: any) {
    const response = await this.client.put(`/patients/${id}`, data);
    return response.data;
  }

  async deletePatient(id: string) {
    const response = await this.client.delete(`/patients/${id}`);
    return response.data;
  }

  // Vital endpoints
  async getVitals(patientId: string) {
    const response = await this.client.get(`/vitals/patient/${patientId}`);
    return response.data;
  }

  async addVital(patientId: string, data: any) {
    const response = await this.client.post(`/vitals/patient/${patientId}`, data);
    return response.data;
  }

  // Investigation endpoints
  async getInvestigations(patientId: string) {
    const response = await this.client.get(`/investigations/patient/${patientId}`);
    return response.data;
  }

  async createInvestigation(patientId: string, data: any) {
    const response = await this.client.post(`/investigations/patient/${patientId}`, data);
    return response.data;
  }

  async updateInvestigation(id: string, data: any) {
    const response = await this.client.put(`/investigations/${id}`, data);
    return response.data;
  }

  // Treatment endpoints
  async getTreatments(patientId: string) {
    const response = await this.client.get(`/treatments/patient/${patientId}`);
    return response.data;
  }

  async getActiveTreatments(patientId: string) {
    const response = await this.client.get(`/treatments/patient/${patientId}/active`);
    return response.data;
  }

  async addTreatment(patientId: string, data: any) {
    const response = await this.client.post(`/treatments/patient/${patientId}`, data);
    return response.data;
  }

  async updateTreatment(id: string, data: any) {
    const response = await this.client.put(`/treatments/${id}`, data);
    return response.data;
  }

  // Note endpoints
  async getNotes(patientId: string) {
    const response = await this.client.get(`/notes/patient/${patientId}`);
    return response.data;
  }

  async createNote(patientId: string, data: any) {
    const response = await this.client.post(`/notes/patient/${patientId}`, data);
    return response.data;
  }

  async updateNote(id: string, data: any) {
    const response = await this.client.put(`/notes/${id}`, data);
    return response.data;
  }

  async deleteNote(id: string) {
    const response = await this.client.delete(`/notes/${id}`);
    return response.data;
  }

  // Medicine endpoints
  async getMedicines(search?: string, type?: string) {
    const response = await this.client.get("/medicines", {
      params: { search, type },
    });
    return response.data;
  }

  // Diagnosis endpoints
  async generateDDx(patientId: string, data: any) {
    const response = await this.client.post(`/diagnosis/generate/${patientId}`, data);
    return response.data;
  }

  async getDiagnoses(patientId: string) {
    const response = await this.client.get(`/diagnosis/${patientId}`);
    return response.data;
  }

  // Disease Library
  async getDiseases() {
    const response = await this.client.get("/diagnosis/library");
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
