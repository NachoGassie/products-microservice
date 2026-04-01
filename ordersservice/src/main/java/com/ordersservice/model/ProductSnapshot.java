package com.ordersservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSnapshot {

  @Column(name = "product_id", nullable = false)
  private Long id;

  @Column(name = "product_name", nullable = false)
  private String name;

  @Column(name = "product_description", nullable = false)
  private String description;

  @Column(name = "unit_price", nullable = false)
  private BigDecimal price;
}