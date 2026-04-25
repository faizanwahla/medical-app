import axios, { AxiosInstance, AxiosError } from "axios";
import { ApiResponse } from "@medical-app/shared";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
    });

    // Load token from localStorage
    this.accessToken = localStorage.getItem("accessToken");

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
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired, redirect to login
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  setAccessToken(token: string) {
    this.accessToken = token;
    localStorage.setItem("accessToken", token);
  }

  clearToken() {
    this.accessToken = null;
    localStorage.removeItem("accessToken");
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
}

export const apiClient = new ApiClient();
export default apiClient;
