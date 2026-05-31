package com.gofleet.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class RootRedirectController {

    @GetMapping("/")
    public String redirectToSwagger() {
        return "redirect:/api/v1/swagger-ui.html";
    }
}
