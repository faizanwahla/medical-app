declare class ApiClient {
    private client;
    private accessToken;
    constructor();
    setAccessToken(token: string): void;
    clearToken(): void;
    register(email: string, password: string, specialty: string): Promise<any>;
    login(email: string, password: string): Promise<any>;
    getCurrentUser(): Promise<any>;
    getPatients(page?: number, pageSize?: number): Promise<any>;
    getPatient(id: string): Promise<any>;
    createPatient(data: any): Promise<any>;
    updatePatient(id: string, data: any): Promise<any>;
    deletePatient(id: string): Promise<any>;
    getVitals(patientId: string): Promise<any>;
    addVital(patientId: string, data: any): Promise<any>;
    getInvestigations(patientId: string): Promise<any>;
    createInvestigation(patientId: string, data: any): Promise<any>;
    updateInvestigation(id: string, data: any): Promise<any>;
    getTreatments(patientId: string): Promise<any>;
    getActiveTreatments(patientId: string): Promise<any>;
    addTreatment(patientId: string, data: any): Promise<any>;
    updateTreatment(id: string, data: any): Promise<any>;
    getMedicines(search?: string, type?: string): Promise<any>;
    generateDDx(patientId: string, data: any): Promise<any>;
    getDiagnoses(patientId: string): Promise<any>;
}
export declare const apiClient: ApiClient;
export default apiClient;
//# sourceMappingURL=api.d.ts.map