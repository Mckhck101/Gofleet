import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { voyagesApi } from "@/api/voyages";
import { RechercheVoyageParams } from "@/types/voyage";

export const voyagesKeys = {
    all: ["voyages"] as const,
    recherche: (params: RechercheVoyageParams) =>
        [...voyagesKeys.all, "recherche", params] as const,
    detail: (id: number) => [...voyagesKeys.all, "detail", id] as const,
    sieges: (id: number) => [...voyagesKeys.all, "sieges", id] as const,
    moyensTransport: () => [...voyagesKeys.all, "moyens-transport"] as const,
};

export function useRechercheVoyages(
    params: RechercheVoyageParams,
    enabled: boolean = true
) {
    return useInfiniteQuery({
        queryKey: voyagesKeys.recherche(params),
        queryFn: ({ pageParam = 0 }) =>
            voyagesApi.rechercher({ ...params, page: pageParam }),
        getNextPageParam: (lastPage) => {
            if (lastPage.pageActuelle < lastPage.totalPages - 1) {
                return lastPage.pageActuelle + 1;
            }
            return undefined;
        },
        initialPageParam: 0,
        enabled:
            enabled &&
            !!params.villeDepart &&
            !!params.villeArrivee &&
            !!params.dateDepart,
    });
}

export function useVoyageDetail(id: number) {
    return useQuery({
        queryKey: voyagesKeys.detail(id),
        queryFn: () => voyagesApi.getById(id),
        enabled: !!id,
    });
}

export function useSiegesVoyage(id: number) {
    return useQuery({
        queryKey: voyagesKeys.sieges(id),
        queryFn: () => voyagesApi.getSieges(id),
        enabled: !!id,
    });
}

export function useMoyensTransport() {
    return useQuery({
        queryKey: voyagesKeys.moyensTransport(),
        queryFn: () => voyagesApi.getMoyensTransport(),
        staleTime: 1000 * 60 * 60, // 1 heure (données stables)
    });
}