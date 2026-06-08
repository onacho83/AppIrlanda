import { describe, it, expect } from 'vitest';
import { OrderStateMachine } from './OrderStateMachine';
import { OrderStatus } from '../entities/Order';

describe('OrderStateMachine', () => {
  it('should allow any transition without throwing errors', () => {
    // Al no haber restricciones, estas llamadas no deben fallar
    expect(() => OrderStateMachine.validateTransition(OrderStatus.RECIBIDO, OrderStatus.ENTREGADO)).not.toThrow();
    expect(() => OrderStateMachine.validateTransition(OrderStatus.TERMINADO, OrderStatus.RECIBIDO)).not.toThrow();
    expect(() => OrderStateMachine.validateTransition(OrderStatus.EN_PRODUCCION, OrderStatus.CANCELADO)).not.toThrow();
  });

  it('should return true for canTransition', () => {
    expect(OrderStateMachine.canTransition(OrderStatus.RECIBIDO, OrderStatus.EN_PRODUCCION)).toBe(true);
    expect(OrderStateMachine.canTransition(OrderStatus.ESPERANDO_DISENO, OrderStatus.TERMINADO)).toBe(true);
  });

  it('should return all states for getAllowedTransitions', () => {
    const transitions = OrderStateMachine.getAllowedTransitions(OrderStatus.RECIBIDO);
    expect(transitions).toContain(OrderStatus.RECIBIDO);
    expect(transitions).toContain(OrderStatus.ESPERANDO_DISENO);
    expect(transitions).toContain(OrderStatus.ESPERANDO_CONFIRMACION);
    expect(transitions).toContain(OrderStatus.EN_PRODUCCION);
    expect(transitions).toContain(OrderStatus.TERMINADO);
    expect(transitions).toContain(OrderStatus.ENTREGADO);
    expect(transitions).toContain(OrderStatus.CANCELADO);
  });
});
