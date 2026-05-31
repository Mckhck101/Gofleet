package com.gofleet.controller;

import com.gofleet.dto.response.MoyenTransportResponse;
import com.gofleet.mapper.ApiMapper;
import com.gofleet.repository.MoyenTransportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/moyens-transport")
@RequiredArgsConstructor
public class MoyenTransportController {
    private final MoyenTransportRepository moyenTransportRepository;
    private final ApiMapper mapper;

    @GetMapping
    public List<MoyenTransportResponse> list() {
        return moyenTransportRepository.findAll().stream().map(mapper::moyenTransport).toList();
    }
}
