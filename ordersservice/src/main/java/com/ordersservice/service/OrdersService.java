package com.ordersservice.service;

import com.ordersservice.dto.CreateOrdersRequest;
import com.ordersservice.dto.OrdersResponse;

public interface OrdersService {
  OrdersResponse createOrder(CreateOrdersRequest createOrdersRequest);
}
