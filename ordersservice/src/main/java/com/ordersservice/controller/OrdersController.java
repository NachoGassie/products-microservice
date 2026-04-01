package com.ordersservice.controller;

import com.ordersservice.dto.CreateOrdersRequest;
import com.ordersservice.dto.OrdersResponse;
import com.ordersservice.service.OrdersService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrdersController {

  private final OrdersService ordersService;

  @PostMapping
  public ResponseEntity<OrdersResponse> create(@RequestBody @Valid CreateOrdersRequest createOrdersRequest) {
    return ResponseEntity.ok(ordersService.createOrder(createOrdersRequest));
  }
}
