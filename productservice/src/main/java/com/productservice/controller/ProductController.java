package com.productservice.controller;

import com.productservice.dto.CreateProductRequest;
import com.productservice.dto.GetManyByIdRequest;
import com.productservice.dto.ProductResponse;
import com.productservice.dto.UpdateProductRequest;
import com.productservice.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

  private final ProductService service;

  @PostMapping
  public ResponseEntity<ProductResponse> create(@Valid @RequestBody CreateProductRequest request) {
    return ResponseEntity.ok(service.create(request));
  }

  @GetMapping
  public ResponseEntity<List<ProductResponse>> getAll() {
    return ResponseEntity.ok(service.getAll());
  }

  @GetMapping("/active")
  public ResponseEntity<List<ProductResponse>> getAllActive() {
    return ResponseEntity.ok(service.getAllActive());
  }

  @GetMapping("/{id}")
  public ResponseEntity<ProductResponse> getById(@PathVariable Long id) {
    return ResponseEntity.ok(service.getById(id));
  }

  @PostMapping("/search")
  public ResponseEntity<List<ProductResponse>> getById(@RequestBody GetManyByIdRequest getManyByIdRequest) {
    return ResponseEntity.ok(service.getManyByIds(getManyByIdRequest.ids()));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ProductResponse> update(@PathVariable Long id, @RequestBody UpdateProductRequest request) {
    return ResponseEntity.ok(service.update(id, request));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    service.delete(id);
    return ResponseEntity.noContent().build();
  }
}