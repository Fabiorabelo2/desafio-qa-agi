package br.com.agi.dogapi;

import io.qameta.allure.restassured.AllureRestAssured;
import io.restassured.RestAssured;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.builder.ResponseSpecBuilder;
import io.restassured.filter.log.LogDetail;
import io.restassured.http.ContentType;
import io.restassured.specification.RequestSpecification;
import io.restassured.specification.ResponseSpecification;
import org.junit.jupiter.api.BeforeAll;

import java.util.concurrent.TimeUnit;

/**
 * Configuração comum a todos os testes da Dog API.
 * Centraliza base URI, content-type esperado, SLA de tempo de resposta
 * e integração com o relatório Allure.
 */
public abstract class BaseTest {

    protected static RequestSpecification requestSpec;
    protected static ResponseSpecification respostaOkSpec;

    /** SLA de resposta adotado para a API pública (generoso, evita flakiness). */
    protected static final long SLA_MS = 5000L;

    @BeforeAll
    static void configurarRestAssured() {
        RestAssured.baseURI = System.getProperty("api.base.uri", "https://dog.ceo/api");

        requestSpec = new RequestSpecBuilder()
                .setAccept(ContentType.JSON)
                .addFilter(new AllureRestAssured())
                .log(LogDetail.URI)
                .build();

        respostaOkSpec = new ResponseSpecBuilder()
                .expectStatusCode(200)
                .expectContentType(ContentType.JSON)
                .expectResponseTime(org.hamcrest.Matchers.lessThan(SLA_MS), TimeUnit.MILLISECONDS)
                .build();

        RestAssured.enableLoggingOfRequestAndResponseIfValidationFails();
    }
}
