package com.productservice.mapper;

import com.productservice.dto.CreateProductRequest;
import com.productservice.dto.ProductResponse;
import com.productservice.dto.UpdateProductRequest;
import com.productservice.model.Product;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface ProductMapper {

  Product toEntity(CreateProductRequest request);

  ProductResponse toResponse(Product product);

  @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
  void updateProductFromDto(UpdateProductRequest dto, @MappingTarget Product entity);
}
