package com.ordersservice.mapper;

import com.ordersservice.dto.OrdersResponse;
import com.ordersservice.model.Orders;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface OrdersMapper {
  OrdersResponse toResponse(Orders orders);
}
