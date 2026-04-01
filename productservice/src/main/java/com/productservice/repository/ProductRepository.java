package com.productservice.repository;


import com.productservice.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

  List<Product> findByActiveTrue();
  List<Product> findByIdInAndActiveTrue(List<Long> ids);
}