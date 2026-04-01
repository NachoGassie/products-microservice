package com.ordersservice.client.impl;

import com.ordersservice.client.ProductClient;
import com.ordersservice.dto.products.GetProductsByIdsRequest;
import com.ordersservice.model.ProductSnapshot;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpRequest;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductClientImpl implements ProductClient {

  @Value("${services.products.base-url}")
  private String productsBaseUrl;

  private final RestClient restClient;

  public List<ProductSnapshot> getManyProductsById(List<Long> ids) {
    GetProductsByIdsRequest request = new GetProductsByIdsRequest(ids);

    return restClient.post()
      .uri(productsBaseUrl + "/api/products/search")
      .body(request)
      .retrieve()
      .onStatus(HttpStatusCode::is4xxClientError, this::handle4xxError)
      .onStatus(HttpStatusCode::is5xxServerError, this::handle5xxError)
      .body(new ParameterizedTypeReference<>() {});
  }

  private void handle4xxError(HttpRequest req, ClientHttpResponse res ) throws IOException {
    if (res.getStatusCode().value() == 404) {
      throw new EntityNotFoundException("Some products not found");
    }
    throw new RuntimeException("Client error: " + res.getStatusCode());
  }

  private void handle5xxError(HttpRequest req, ClientHttpResponse res) throws IOException {
    throw new RuntimeException("Unexpected 5xx error response: " + res.getStatusCode());
  }
}
