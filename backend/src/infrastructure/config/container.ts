import { prisma } from '../database/prisma/prismaClient';

// Importar todos los repositorios
import { PrismaUserRepository } from '../database/repositories/PrismaUserRepository';
import { PrismaClientRepository } from '../database/repositories/PrismaClientRepository';
import { PrismaProductRepository } from '../database/repositories/PrismaProductRepository';
import { PrismaOrderRepository } from '../database/repositories/PrismaOrderRepository';
import { PrismaQuoteRepository } from '../database/repositories/PrismaQuoteRepository';
import { PrismaPaymentRepository } from '../database/repositories/PrismaPaymentRepository';
import { PrismaAccountMovementRepository } from '../database/repositories/PrismaAccountMovementRepository';
import { PrismaInvoiceRepository } from '../database/prisma/PrismaInvoiceRepository';
import { PrismaBusinessConfigRepository } from '../database/prisma/PrismaBusinessConfigRepository';

// Importar servicios
import { OrderStateMachine } from '../../domain/services/OrderStateMachine';
import { AccountService } from '../../domain/services/AccountService';
import { AfipInvoicingService } from '../services/AfipInvoicingService';

// Importar Use Cases
import { LoginUseCase } from '../../application/use-cases/auth/LoginUseCase';
import { CreateClientUseCase } from '../../application/use-cases/clients/CreateClientUseCase';
import { UpdateClientUseCase } from '../../application/use-cases/clients/UpdateClientUseCase';
import { ListClientsUseCase } from '../../application/use-cases/clients/ListClientsUseCase';
import { GetClientDetailUseCase } from '../../application/use-cases/clients/GetClientDetailUseCase';
import { CreateProductUseCase } from '../../application/use-cases/products/CreateProductUseCase';
import { UpdateProductUseCase } from '../../application/use-cases/products/UpdateProductUseCase';
import { ListProductsUseCase } from '../../application/use-cases/products/ListProductsUseCase';
import { ListCategoriesUseCase } from '../../application/use-cases/products/ListCategoriesUseCase';
import { CreateCategoryUseCase } from '../../application/use-cases/products/CreateCategoryUseCase';
import { CreateOrderUseCase } from '../../application/use-cases/orders/CreateOrderUseCase';
import { UpdateOrderStatusUseCase } from '../../application/use-cases/orders/UpdateOrderStatusUseCase';
import { ListOrdersUseCase } from '../../application/use-cases/orders/ListOrdersUseCase';
import { GetOrderDetailUseCase } from '../../application/use-cases/orders/GetOrderDetailUseCase';
import { CreateQuoteUseCase } from '../../application/use-cases/quotes/CreateQuoteUseCase';
import { ListQuotesUseCase } from '../../application/use-cases/quotes/ListQuotesUseCase';
import { GetQuoteUseCase } from '../../application/use-cases/quotes/GetQuoteUseCase';
import { ConvertQuoteToOrderUseCase } from '../../application/use-cases/quotes/ConvertQuoteToOrderUseCase';
import { RegisterPaymentUseCase } from '../../application/use-cases/payments/RegisterPaymentUseCase';
import { UpdatePaymentUseCase } from '../../application/use-cases/payments/UpdatePaymentUseCase';
import { GetClientStatementUseCase } from '../../application/use-cases/accounts/GetClientStatementUseCase';
import { GenerateInvoiceUseCase } from '../../application/use-cases/invoices/GenerateInvoiceUseCase';
import { GenerateCreditNoteUseCase } from '../../application/use-cases/invoices/GenerateCreditNoteUseCase';

// Repositorios
export const userRepository = new PrismaUserRepository(prisma);
export const clientRepository = new PrismaClientRepository(prisma);
export const productRepository = new PrismaProductRepository(prisma);
export const orderRepository = new PrismaOrderRepository(prisma);
export const quoteRepository = new PrismaQuoteRepository(prisma);
export const paymentRepository = new PrismaPaymentRepository(prisma);
export const accountMovementRepository = new PrismaAccountMovementRepository(prisma);
export const invoiceRepository = new PrismaInvoiceRepository(prisma);
export const businessConfigRepository = new PrismaBusinessConfigRepository(prisma);

// Domain Services
export const orderStateMachine = new OrderStateMachine();
export const accountService = new AccountService(accountMovementRepository, paymentRepository, orderRepository, clientRepository);
export const invoicingService = new AfipInvoicingService(businessConfigRepository);

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

// Payments & Accounts UseCases
export const registerPaymentUseCase = new RegisterPaymentUseCase(accountService);
export const updatePaymentUseCase = new UpdatePaymentUseCase(accountService);
export const getClientStatementUseCase = new GetClientStatementUseCase(accountMovementRepository, clientRepository);

// Invoices UseCases
export const generateInvoiceUseCase = new GenerateInvoiceUseCase(invoiceRepository, invoicingService, prisma);
export const generateCreditNoteUseCase = new GenerateCreditNoteUseCase(invoiceRepository, invoicingService, prisma);

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
    invoiceRepository,
    businessConfigRepository,
  },
  services: {
    accountService,
    orderStateMachine,
    invoicingService,
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
    updatePaymentUseCase,
    getClientStatementUseCase,
    generateInvoiceUseCase,
    generateCreditNoteUseCase
  },
  resolve(key: string) {
    const dependencies: any = {
      ...this.repositories,
      ...this.services,
      ...this.useCases,
    };
    return dependencies[key];
  }
};
