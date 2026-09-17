package br.com.agi.dogapi;

import io.qameta.allure.Description;
import io.qameta.allure.Feature;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static io.restassured.RestAssured.given;
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

@Feature("GET /breeds/list/all — Lista de todas as raças")
class BreedsListTest extends BaseTest {

    private static final String ENDPOINT = "/breeds/list/all";

    @Test
    @DisplayName("Deve retornar 200 com status de sucesso e lista de raças não vazia")
    @Description("Valida o contrato básico: status HTTP, campo status=success e mapa de raças populado")
    void deveRetornarListaDeRacasComSucesso() {
        Map<String, Object> racas =
            given().spec(requestSpec)
            .when().get(ENDPOINT)
            .then().spec(respostaOkSpec)
                .body("status", equalTo("success"))
                .body("message", notNullValue())
            .extract().jsonPath().getMap("message");

        assertThat("A lista de raças não deve ser vazia", racas, aMapWithSize(greaterThan(0)));
    }

    @Test
    @DisplayName("Deve conter raças conhecidas e sub-raças no formato esperado")
    @Description("Valida a semântica: raças conhecidas presentes e sub-raças como lista (ex.: bulldog -> [boston, english, french])")
    void deveConterRacasConhecidasComSubRacas() {
        given().spec(requestSpec)
        .when().get(ENDPOINT)
        .then().spec(respostaOkSpec)
            .body("message", hasKey("hound"))
            .body("message", hasKey("bulldog"))
            .body("message.bulldog", instanceOf(java.util.List.class))
            .body("message.bulldog", hasItem("french"));
    }

    @Test
    @DisplayName("Deve aderir ao JSON Schema do contrato")
    @Description("Validação de contrato: o corpo da resposta deve seguir o schema (status string, message objeto de arrays)")
    void deveAderirAoJsonSchema() {
        given().spec(requestSpec)
        .when().get(ENDPOINT)
        .then().spec(respostaOkSpec)
            .body(matchesJsonSchemaInClasspath("schemas/breeds-list-schema.json"));
    }
}
