package com.gofleet.service.impl;

import com.gofleet.dto.request.AvisRequest;
import com.gofleet.dto.response.AvisResponse;
import com.gofleet.dto.response.PageResponse;
import com.gofleet.entity.Avis;
import com.gofleet.entity.Utilisateur;
import com.gofleet.exception.ResourceNotFoundException;
import com.gofleet.mapper.ApiMapper;
import com.gofleet.repository.AgenceRepository;
import com.gofleet.repository.AvisRepository;
import com.gofleet.repository.UtilisateurRepository;
import com.gofleet.service.AvisService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AvisServiceImpl implements AvisService {
    private final AvisRepository avisRepository;
    private final AgenceRepository agenceRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ApiMapper mapper;

    @Override
    @Transactional
    public AvisResponse creer(AvisRequest request, Utilisateur utilisateurConnecte) {
        Utilisateur utilisateur = request.utilisateurId() != null
                ? utilisateurRepository.findById(request.utilisateurId()).orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"))
                : utilisateurConnecte;
        var agence = agenceRepository.findById(request.agenceId()).orElseThrow(() -> new ResourceNotFoundException("Agence introuvable"));
        Avis avis = Avis.builder()
                .utilisateur(utilisateur)
                .agence(agence)
                .note(request.note())
                .commentaire(request.commentaire())
                .build();
        return mapper.avis(avisRepository.save(avis));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AvisResponse> byAgence(Long agenceId, Pageable pageable) {
        if (!agenceRepository.existsById(agenceId)) {
            throw new ResourceNotFoundException("Agence introuvable");
        }
        return PageResponse.from(avisRepository.findByAgenceId(agenceId, pageable).map(mapper::avis));
    }
}
