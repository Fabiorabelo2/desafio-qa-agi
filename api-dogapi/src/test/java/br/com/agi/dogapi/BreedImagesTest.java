package br.com.agi.dogapi;

import io.qameta.allure.Description;
import io.qameta.allure.Feature;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.List;

import static io.restassured.RestAssured.given;
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

@Feature("GET /breed/{breed}/images — Imagens por raça")
class BreedImagesTest extends BaseTest {

    private static final String URL_IMAGEM_REGEX =
            "^https://images\\.dog\\.ceo/breeds/.+\\.(jpg|jpeg|png|gif)$";

    @ParameterizedTest(name = "Deve retornar imagens válidas para a raça \"{0}\"")
    @ValueSource(strings = {"hound", "pug", "labrador"})
    @Description("Data-driven: para raças válidas, retorna lista não vazia de URLs de imagem do domínio oficial")
    void deveRetornarImagensParaRacaValida(String raca) {
        List<String> imagens =
            given().spec(requestSpec)
                .pathParam("breed", raca)
            .when().get("/breed/{breed}/images")
            .then().spec(respostaOkSpec)
                .body("status", equalTo("success"))
                .body("message", not(empty()))
                .body(matchesJsonSchemaInClasspath("schemas/breed-images-schema.json"))
            .extract().jsonPath().getList("message", String.class);

        assertThat("Toda URL deve apontar para uma imagem do domínio images.dog.ceo",
                imagens, everyItem(matchesPattern(URL_IMAGEM_REGEX)));
        assertThat("As URLs devem pertencer à raça consultada",
                imagens, everyItem(containsString("/" + raca)));
    }

    @Test
    @DisplayName("Deve retornar 404 com mensagem de erro para raça inexistente")
    @Description("Cenário negativo: raça inválida retorna 404, status=error e mensagem explicativa da API")
    void deveRetornarErroParaRacaInexistente() {
        given().spec(requestSpec)
            .pathParam("breed", "racainexistente123")
        .when().get("/breed/{breed}/images")
        .then()
            .statusCode(404)
            .body("status", equalTo("error"))
            .body("message", containsStringIgnoringCase("not found"))
            .body("code", equalTo(404));
    }
}
