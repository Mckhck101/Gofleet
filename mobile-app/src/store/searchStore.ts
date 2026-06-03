import { create } from "zustand";
import { RechercheVoyageParams, TypeClasse } from "@/types/voyage";

interface SearchState {
    // ─── Paramètres de recherche ──────────────────
    villeDepart: string;
    villeArrivee: string;
    dateDepart: string;
    typeClasse: TypeClasse | undefined;
    prixMin: number | undefined;
    prixMax: number | undefined;
    tri: RechercheVoyageParams["tri"];

    // ─── Actions ──────────────────────────────────
    setVilleDepart: (ville: string) => void;
    setVilleArrivee: (ville: string) => void;
    setDateDepart: (date: string) => void;
    setTypeClasse: (classe: TypeClasse | undefined) => void;
    setPrixMin: (prix: number | undefined) => void;
    setPrixMax: (prix: number | undefined) => void;
    setTri: (tri: RechercheVoyageParams["tri"]) => void;
    getParams: () => RechercheVoyageParams;
    reset: () => void;
}

const initialState = {
    villeDepart: "",
    villeArrivee: "",
    dateDepart: "",
    typeClasse: undefined,
    prixMin: undefined,
    prixMax: undefined,
    tri: "heureAsc" as RechercheVoyageParams["tri"],
};

export const useSearchStore = create<SearchState>((set, get) => ({
    ...initialState,

    setVilleDepart: (ville) => set({ villeDepart: ville }),
    setVilleArrivee: (ville) => set({ villeArrivee: ville }),
    setDateDepart: (date) => set({ dateDepart: date }),
    setTypeClasse: (classe) => set({ typeClasse: classe }),
    setPrixMin: (prix) => set({ prixMin: prix }),
    setPrixMax: (prix) => set({ prixMax: prix }),
    setTri: (tri) => set({ tri }),

    getParams: (): RechercheVoyageParams => {
        const state = get();
        return {
            villeDepart: state.villeDepart,
            villeArrivee: state.villeArrivee,
            dateDepart: state.dateDepart,
            typeClasse: state.typeClasse,
            prixMin: state.prixMin,
            prixMax: state.prixMax,
            tri: state.tri,
            page: 0,
            taille: 10,
        };
    },

    reset: () => set(initialState),
}));
