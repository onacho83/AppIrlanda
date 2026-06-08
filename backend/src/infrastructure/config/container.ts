import { PrismaClient } from '@prisma/client';
import { prisma } from '../database/prisma/prismaClient';

import { PrismaUserRepository } from '../database/repositories/PrismaUserRepository';
import { PrismaClientRepository } from '../database/repositories/PrismaClientRepository';
import { PrismaProductRepository } from '../database/repositories/PrismaProductRepository';
import { PrismaOrderRepository } from '../database/repositories/PrismaOrderRepository';
import { PrismaQuoteRepository } from '../database/repositories/PrismaQuoteRepository';

import { LoginUseCase } from '../../application/use-cases/auth/LoginUseCase';

// Clients UseCases
import { CreateClientUseCase } from '../../application/use-cases/clients/CreateClientUseCase';
import { UpdateClientUseCase } from '../../application/use-cases/clients/UpdateClientUseCase';
import { ListClientsUseCase } from '../../application/use-cases/clients/ListClientsUseCase';
import { GetClientDetailUseCase } from '../../application/use-cases/clients/GetClientDetailUseCase';

// Products UseCases
import { CreateProductUseCase } from '../../application/use-cases/products/CreateProductUseCase';
import { UpdateProductUseCase } from '../../application/use-cases/products/UpdateProductUseCase';
import { ListProductsUseCase } from '../../application/use-cases/products/ListProductsUseCase';
import { ListCategoriesUseCase } from '../../application/use-cases/products/ListCategoriesUseCase';
import { CreateCategoryUseCase } from '../../application/use-cases/products/CreateCategoryUseCase';

// Orders UseCases
import { CreateOrderUseCase } from '../../application/use-cases/orders/CreateOrderUseCase';
import { UpdateOrderStatusUseCase } from '../../application/use-cases/orders/UpdateOrderStatusUseCase';
import { ListOrdersUseCase } from '../../application/use-cases/orders/ListOrdersUseCase';
import { GetOrderDetailUseCase } from '../../application/use-cases/orders/GetOrderDetailUseCase';

// Quotes UseCases
import { CreateQuoteUseCase } from '../../application/use-cases/quotes/CreateQuoteUseCase';
import { ListQuotesUseCase } from '../../application/use-cases/quotes/ListQuotesUseCase';
import { GetQuoteUseCase } from '../../application/use-cases/quotes/GetQuoteUseCase';
import { ConvertQuoteToOrderUseCase } from '../../application/use-cases/quotes/ConvertQuoteToOrderUseCase';

// Domain Services
import { OrderStateMachine } from '../../domain/services/OrderStateMachine';

// Repositorios
export const userRepository = new PrismaUserRepository(prisma);
export const clientRepository = new PrismaClientRepository(prisma);
export const productRepository = new PrismaProductRepository(prisma);
export const orderRepository = new PrismaOrderRepository(prisma);
export const quoteRepository = new PrismaQuoteRepository(prisma);

// Domain Services no necesitan instanciarse si son estáticos

// Auth UseCases
export const loginUseCase = new LoginUseCase(userRepository);

// Clients UseCases
export const createClientUseCase = new CreateClientUseCase(clientRepository);
export const updateClientUseCase = new UpdateClientUseCase(clientRepository);
export const listClientsUseCase = new ListClientsUseCase(clientRepository);
export const getClientDetailUseCase = new GetClientDetailUseCase(clientRepository, orderRepository);

// Products UseCases
export const createProductUseCase = new CreateProductUseCase(productRepository);
export const updateProductUseCase = new UpdateProductUseCase(productRepository);
export const listProductsUseCase = new ListProductsUseCase(productRepository);
export const listCategoriesUseCase = new ListCategoriesUseCase(productRepository);
export const createCategoryUseCase = new CreateCategoryUseCase(productRepository);

// Orders UseCases
export const createOrderUseCase = new CreateOrderUseCase(orderRepository, clientRepository, productRepository);
export const updateOrderStatusUseCase = new UpdateOrderStatusUseCase(orderRepository);
export const listOrdersUseCase = new ListOrdersUseCase(orderRepository);
export const getOrderDetailUseCase = new GetOrderDetailUseCase(orderRepository);

// Quotes UseCases
export const createQuoteUseCase = new CreateQuoteUseCase(quoteRepository, clientRepository, productRepository);
export const listQuotesUseCase = new ListQuotesUseCase(quoteRepository);
export const getQuoteUseCase = new GetQuoteUseCase(quoteRepository, clientRepository);
export const convertQuoteToOrderUseCase = new ConvertQuoteToOrderUseCase(quoteRepository, orderRepository);

import { PrismaPaymentRepository } from '../database/repositories/PrismaPaymentRepository';
import { PrismaAccountMovementRepository } from '../database/repositories/PrismaAccountMovementRepository';

import { AccountService } from '../../domain/services/AccountService';

import { RegisterPaymentUseCase } from '../../application/use-cases/payments/RegisterPaymentUseCase';
import { GetClientStatementUseCase } from '../../application/use-cases/accounts/GetClientStatementUseCase';

// Repositorios
export const paymentRepository = new PrismaPaymentRepository(prisma);
export const accountMovementRepository = new PrismaAccountMovementRepository(prisma);

// Domain Services
export const accountService = new AccountService(accountMovementRepository, paymentRepository, orderRepository, clientRepository);

// UseCases
export const registerPaymentUseCase = new RegisterPaymentUseCase(accountService);
export const getClientStatementUseCase = new GetClientStatementUseCase(accountMovementRepository, clientRepository);

export const container = {
  prisma,
  repositories: {
    userRepository,
    clientRepository,
    productRepository,
    orderRepository,
    quoteRepository,
    paymentRepository,
    accountMovementRepository,
  },
  services: {
    accountService,
  },
  useCases: {
    loginUseCase,
    createClientUseCase,
    updateClientUseCase,
    listClientsUseCase,
    getClientDetailUseCase,
    createProductUseCase,
    updateProductUseCase,
    listProductsUseCase,
    listCategoriesUseCase,
    createCategoryUseCase,
    createOrderUseCase,
    updateOrderStatusUseCase,
    listOrdersUseCase,
    getOrderDetailUseCase,
    createQuoteUseCase,
    listQuotesUseCase,
    getQuoteUseCase,
    convertQuoteToOrderUseCase,
    registerPaymentUseCase,
    getClientStatementUseCase,
  },
};

