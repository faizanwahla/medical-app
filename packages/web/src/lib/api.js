import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
class ApiClient {
    constructor() {
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "accessToken", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
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
        this.client.interceptors.response.use((response) => response, (error) => {
            // Only redirect if it's a 401 AND we aren't already on the login page
            if (error.response?.status === 401 && window.location.pathname !== "/") {
                console.warn("Unauthorized request - clearing session");
                localStorage.removeItem("accessToken");
                // Instead of window.location.href, we let the App state handle it
                // or only redirect if absolutely necessary.
                if (window.location.pathname !== "/login") {
                    window.location.href = "/";
                }
            }
            return Promise.reject(error);
        });
    }
    setAccessToken(token) {
        this.accessToken = token;
        localStorage.setItem("accessToken", token);
        // CRITICAL: This line tells axios to include the token in EVERY future request
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    clearToken() {
        this.accessToken = null;
        localStorage.removeItem("accessToken");
    }
    // Auth endpoints
    async register(email, password, specialty) {
        const response = await this.client.post("/auth/register", {
            email,
            password,
            specialty,
        });
        return response.data;
    }
    async login(email, password) {
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
    async getPatient(id) {
        const response = await this.client.get(`/patients/${id}`);
        return response.data;
    }
    async createPatient(data) {
        const response = await this.client.post("/patients", data);
        return response.data;
    }
    async updatePatient(id, data) {
        const response = await this.client.put(`/patients/${id}`, data);
        return response.data;
    }
    async deletePatient(id) {
        const response = await this.client.delete(`/patients/${id}`);
        return response.data;
    }
    // Vital endpoints
    async getVitals(patientId) {
        const response = await this.client.get(`/vitals/patient/${patientId}`);
        return response.data;
    }
    async addVital(patientId, data) {
        const response = await this.client.post(`/vitals/patient/${patientId}`, data);
        return response.data;
    }
    // Investigation endpoints
    async getInvestigations(patientId) {
        const response = await this.client.get(`/investigations/patient/${patientId}`);
        return response.data;
    }
    async createInvestigation(patientId, data) {
        const response = await this.client.post(`/investigations/patient/${patientId}`, data);
        return response.data;
    }
    async updateInvestigation(id, data) {
        const response = await this.client.put(`/investigations/${id}`, data);
        return response.data;
    }
    // Treatment endpoints
    async getTreatments(patientId) {
        const response = await this.client.get(`/treatments/patient/${patientId}`);
        return response.data;
    }
    async getActiveTreatments(patientId) {
        const response = await this.client.get(`/treatments/patient/${patientId}/active`);
        return response.data;
    }
    async addTreatment(patientId, data) {
        const response = await this.client.post(`/treatments/patient/${patientId}`, data);
        return response.data;
    }
    async updateTreatment(id, data) {
        const response = await this.client.put(`/treatments/${id}`, data);
        return response.data;
    }
    // Medicine endpoints
    async getMedicines(search, type) {
        const response = await this.client.get("/medicines", {
            params: { search, type },
        });
        return response.data;
    }
    // Diagnosis endpoints
    async generateDDx(patientId, data) {
        const response = await this.client.post(`/diagnosis/generate/${patientId}`, data);
        return response.data;
    }
    async getDiagnoses(patientId) {
        const response = await this.client.get(`/diagnosis/${patientId}`);
        return response.data;
    }
}
export const apiClient = new ApiClient();
export default apiClient;
//# sourceMappingURL=api.js.map