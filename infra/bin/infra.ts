import * as cdk from 'aws-cdk-lib';
import { SERVICES } from '../config/constants';
import { DEFAULT_ENV } from '../config/env';
import { AlbStack } from '../lib/stacks/AlbStack';
import { ClusterStack } from '../lib/stacks/ClusterStack';
import { NetworkStack } from '../lib/stacks/NetworkStack';
import { OrdersDataStack } from '../lib/stacks/orders-stacks/OrdersDataStack';
import { OrdersServiceStack } from '../lib/stacks/orders-stacks/OrdersServiceStack';
import { ProductDataStack } from '../lib/stacks/product-stacks/ProductDataStack';
import { ProductServiceStack } from '../lib/stacks/product-stacks/ProductServiceStack';
import { ServiceEcrStack } from '../lib/stacks/ServiceEcrStack';
import { WafStack } from '../lib/stacks/WafStack';

const app = new cdk.App();

const imageTag = app.node.tryGetContext('imageTag') ?? 'latest';

const networkStack = new NetworkStack(app, 'NetworkStack', {
  env: DEFAULT_ENV,
});

const clusterStack = new ClusterStack(app, 'ClusterStack', {
  env: DEFAULT_ENV,
  vpc: networkStack.vpc,
});

const productEcrStack = new ServiceEcrStack(app, 'ProductEcrStack', {
  env: DEFAULT_ENV,
  serviceName: SERVICES.products.name
});

const ordersEcrStack = new ServiceEcrStack(app, 'OrdersEcrStack', {
  env: DEFAULT_ENV,
  serviceName: SERVICES.orders.name
});

const productDataStack = new ProductDataStack(app, 'ProductDataStack', {
  env: DEFAULT_ENV,
  vpc: networkStack.vpc,
  databaseSecurityGroup: networkStack.productsRdsSecurityGroup,
});

const ordersDataStack = new OrdersDataStack(app, 'OrdersDataStack', {
  env: DEFAULT_ENV,
  vpc: networkStack.vpc,
  databaseSecurityGroup: networkStack.ordersRdsSecurityGroup,
});

const productServiceStack = new ProductServiceStack(app, 'ProductServiceStack', {
  env: DEFAULT_ENV,
  cluster: clusterStack.cluster,
  repository: productEcrStack.repository,
  productsSecurityGroup: networkStack.productsEcsSecurityGroup,
  databaseEndpoint: productDataStack.productDatabase.dbInstanceEndpointAddress,
  databaseSecret: productDataStack.productDatabase.secret!,
  imageTag: imageTag,
});

const ordersServiceStack = new OrdersServiceStack(app, 'OrdersServiceStack', {
  env: DEFAULT_ENV,
  cluster: clusterStack.cluster,
  repository: ordersEcrStack.repository,
  ordersSecurityGroup: networkStack.ordersEcsSecurityGroup,
  databaseEndpoint: ordersDataStack.ordersDatabase.dbInstanceEndpointAddress,
  databaseSecret: ordersDataStack.ordersDatabase.secret!,
  imageTag: imageTag,
});

const albStack = new AlbStack(app, 'AlbStack', {
  env: DEFAULT_ENV,
  vpc: networkStack.vpc,
  albSecurityGroup: networkStack.albSecurityGroup,
  productService: productServiceStack.service,
  ordersService: ordersServiceStack.service,
});

new WafStack(app, 'WafStack', {
  env: DEFAULT_ENV,
  alb: albStack.alb
});