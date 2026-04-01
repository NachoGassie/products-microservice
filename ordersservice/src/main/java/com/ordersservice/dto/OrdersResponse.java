package com.ordersservice.dto;

import com.ordersservice.model.ProductSnapshot;

import java.math.BigDecimal;
import java.util.List;

public record OrdersResponse(
    Long id,
    List<ProductSnapshot> products,
    BigDecimal totalPrice
) {
}
