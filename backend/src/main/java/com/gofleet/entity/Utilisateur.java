package com.gofleet.entity;

import com.gofleet.enums.Role;
import com.gofleet.enums.Sexe;
import com.gofleet.enums.StatutVerification;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "utilisateurs")
public class Utilisateur implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    private String telephone;

    @Column(nullable = false)
    private String motDePasse;

    private LocalDate dateNaissance;

    @Enumerated(EnumType.STRING)
    private Sexe sexe;

    private String photoProfilUrl;

    @Column(unique = true)
    private String numeroCni;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatutVerification statutVerification = StatutVerification.NON_VERIFIE;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Role role = Role.USER;

    @CreationTimestamp
    private LocalDateTime dateCreation;

    @OneToMany(mappedBy = "utilisateur")
    @Builder.Default
    private List<Reservation> reservations = new ArrayList<>();

    @OneToMany(mappedBy = "utilisateur")
    @Builder.Default
    private List<Avis> avis = new ArrayList<>();

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return motDePasse;
    }

    @Override
    public String getUsername() {
        return email;
    }
}
