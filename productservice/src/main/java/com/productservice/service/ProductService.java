package com.productservice.service;


import com.productservice.dto.CreateProductRequest;
import com.productservice.dto.ProductResponse;
import com.productservice.dto.UpdateProductRequest;

import java.util.List;

public interface ProductService {

  ProductResponse create(CreateProductRequest request);

  List<ProductResponse> getAll();

  List<ProductResponse> getAllActive();

  ProductResponse getById(Long id);

  List<ProductResponse> getManyByIds(List<Long> ids);

  ProductResponse update(Long id, UpdateProductRequest request);

  void delete(Long id);
}
