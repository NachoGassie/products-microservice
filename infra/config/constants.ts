export const SERVICES = {
  products: {
    name: 'products',
    port: 8080,
    basePath: '/api/products',
    healthCheckPath: '/health',

  },
  orders: {
    name: 'orders',
    port: 8081,
    basePath: '/api/orders',
    healthCheckPath: '/health',
  },
  postgres: {
    port: 5432,
    ordersdb: 'ordersdb',
    productsdb: 'productdb'
  }
} as const;