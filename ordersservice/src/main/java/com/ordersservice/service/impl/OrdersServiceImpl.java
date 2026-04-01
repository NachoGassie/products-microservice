package com.ordersservice.service.impl;

import com.ordersservice.client.ProductClient;
import com.ordersservice.dto.CreateOrdersRequest;
import com.ordersservice.dto.OrdersResponse;
import com.ordersservice.mapper.OrdersMapper;
import com.ordersservice.model.Orders;
import com.ordersservice.model.ProductSnapshot;
import com.ordersservice.repository.OrdersRepository;
import com.ordersservice.service.OrdersService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrdersServiceImpl implements OrdersService {

  private final OrdersRepository ordersRepository;
  private final ProductClient productClient;

  private final OrdersMapper ordersMapper;

  @Override
  public OrdersResponse createOrder(CreateOrdersRequest createOrdersRequest){
    List<ProductSnapshot> productsList = productClient.getManyProductsById(createOrdersRequest.productsId());
    BigDecimal totalPrice = productsList.stream().map(ProductSnapshot::getPrice).reduce(BigDecimal.ZERO, BigDecimal::add);

    Orders order = Orders.builder()
      .products(productsList)
      .totalPrice(totalPrice)
      .build();

    return ordersMapper.toResponse(ordersRepository.save(order));
  }
}
