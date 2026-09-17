package br.com.agi.dogapi;

import io.qameta.allure.Description;
import io.qameta.allure.Feature;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;
import static org.hamcrest.Matchers.*;

@Feature("GET /breeds/image/random — Imagem aleatória")
class RandomImageTest extends BaseTest {

    private static final String ENDPOINT = "/breeds/image/random";
    private static final String URL_IMAGEM_REGEX =
            "^https://images\\.dog\\.ceo/breeds/.+\\.(jpg|jpeg|png|gif)$";

    @Test
    @DisplayName("Deve retornar 200 com uma URL de imagem válida")
    @Description("Valida contrato e formato: status=success e message contendo uma única URL de imagem do domínio oficial")
    void deveRetornarImagemAleatoriaValida() {
        given().spec(requestSpec)
        .when().get(ENDPOINT)
        .then().spec(respostaOkSpec)
            .body("status", equalTo("success"))
            .body("message", matchesPattern(URL_IMAGEM_REGEX))
            .body(matchesJsonSchemaInClasspath("schemas/random-image-schema.json"));
    }

    @RepeatedTest(value = 3, name = "Estabilidade — execução {currentRepetition} de {totalRepetitions}")
    @Description("Confiabilidade: chamadas consecutivas devem manter contrato e formato estáveis")
    void deveManterContratoEstavelEmChamadasConsecutivas() {
        given().spec(requestSpec)
        .when().get(ENDPOINT)
        .then().spec(respostaOkSpec)
            .body("status", equalTo("success"))
            .body("message", matchesPattern(URL_IMAGEM_REGEX));
    }
}
