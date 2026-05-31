package com.gofleet.util;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.UUID;

@Component
public class CodeGenerator {
    public String referenceTransaction() {
        return "PAY-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
    }

    public String numeroFacture() {
        return "FAC-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public String codeTicket(LocalDate dateDepart, String numeroSiege) {
        return "TKT-" + dateDepart.format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + numeroSiege + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public String fakeQrCodeBase64(String value) {
        return Base64.getEncoder().encodeToString(("QR:" + value).getBytes(StandardCharsets.UTF_8));
    }
}
