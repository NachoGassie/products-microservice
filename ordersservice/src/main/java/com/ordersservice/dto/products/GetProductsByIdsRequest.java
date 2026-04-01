package com.ordersservice.dto.products;

import java.util.List;

public record GetProductsByIdsRequest(
    List<Long> ids
) {}