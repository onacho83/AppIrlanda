import { OrderStatus } from '../entities/Order';
import { ValidationError } from '../../shared/errors/AppError';

/**
 * Máquina de estados para pedidos.
 * A pedido del usuario, no hay restricciones de transición.
 * Cualquier estado puede ir a cualquier otro estado.
 */
export class OrderStateMachine {
  /**
   * Verifica si una transición de estado es válida.
   * Ahora siempre retorna true.
   */
  static canTransition(from: OrderStatus, to: OrderStatus): boolean {
    return true; // Sin restricciones
  }

  /**
   * Valida una transición de estado y lanza un error si no es válida.
   * Al no haber restricciones, este método no arrojará error.
   */
  static validateTransition(from: OrderStatus, to: OrderStatus): void {
    if (!this.canTransition(from, to)) {
      throw new ValidationError(
        `Transición de estado inválida: ${from} → ${to}.`
      );
    }
  }

  /**
   * Obtiene los estados destino permitidos desde un estado dado.
   * Ahora retorna todos los estados.
   */
  static getAllowedTransitions(from: OrderStatus): readonly OrderStatus[] {
    return Object.values(OrderStatus);
  }
}
