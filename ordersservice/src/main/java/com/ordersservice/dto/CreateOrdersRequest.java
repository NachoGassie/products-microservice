package com.ordersservice.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record CreateOrdersRequest(
  @NotEmpty
  List<Long> productsId
) {
}
