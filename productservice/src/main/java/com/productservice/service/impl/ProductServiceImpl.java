package com.productservice.service.impl;

import com.productservice.dto.CreateProductRequest;
import com.productservice.dto.ProductResponse;
import com.productservice.dto.UpdateProductRequest;
import com.productservice.mapper.ProductMapper;
import com.productservice.model.Product;
import com.productservice.repository.ProductRepository;
import com.productservice.service.ProductService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

  private final ProductRepository repository;
  private final ProductMapper mapper;

  @Override
  public ProductResponse create(CreateProductRequest request) {
    Product product = mapper.toEntity(request);
    return mapper.toResponse(repository.save(product));
  }

  @Override
  public List<ProductResponse> getAll() {
    return repository.findAll().stream().map(mapper::toResponse).toList();
  }

  @Override
  public List<ProductResponse> getAllActive() {
    return repository.findByActiveTrue().stream().map(mapper::toResponse).toList();
  }

  @Override
  public ProductResponse getById(Long id) {
    Product product = repository.findById(id)
      .orElseThrow(() -> new RuntimeException("Product not found"));
    return mapper.toResponse(product);
  }

  public List<ProductResponse> getManyByIds(List<Long> ids) {
    List<Product> products = repository.findByIdInAndActiveTrue(ids);

    if (products.size() != ids.size()) {
      throw new EntityNotFoundException("Some products not found");
    }

    return products.stream().map(mapper::toResponse).toList();
  }

  @Override
  public ProductResponse update(Long id, UpdateProductRequest request) {
    Product product = repository.findById(id)
      .orElseThrow(() -> new RuntimeException("Product not found"));

    mapper.updateProductFromDto(request, product);

    Product updated = repository.save(product);
    return mapper.toResponse(updated);
  }

  @Override
  public void delete(Long id) {
    if (!repository.existsById(id)) {
      throw new RuntimeException("Product not found");
    }
    repository.deleteById(id);
  }
}
