export interface ApiError {
    code: string;
    message: string;
    details: string[] | null;
    timestamp: string;
    chemin: string;
}

export interface ApiSuccess {
    message: string;
    timestamp: string;
}

export interface PageResponse<T> {
    contenu: T[];
    pageActuelle: number;
    totalPages: number;
    totalElements: number;
}