package com.productservice.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record GetManyByIdRequest(
  @NotEmpty
  List<Long> ids
) {
}
