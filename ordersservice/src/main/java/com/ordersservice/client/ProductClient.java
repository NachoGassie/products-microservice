package com.ordersservice.client;

import com.ordersservice.model.ProductSnapshot;

import java.util.List;

public interface ProductClient {

  List<ProductSnapshot> getManyProductsById(List<Long> ids);

}
