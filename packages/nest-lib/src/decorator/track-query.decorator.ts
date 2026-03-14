import { QueryContext } from '../db/prisma/query-context.js';

/**
 * Detects whether the class is a Use Case or DAO based on naming convention
 */
function detectContextType(className: string): 'uc' | 'dao' {
  if (className.endsWith('Uc') || className.endsWith('UseCase')) return 'uc';
  if (className.endsWith('Dao')) return 'dao';
  return 'uc';
}

/**
 * Wraps a method to track query context
 */
function wrapMethod(originalMethod: (...args: unknown[]) => unknown, methodName: string): (...args: unknown[]) => unknown {
  return function (this: object, ...args: unknown[]): unknown {
    const className = this.constructor.name;
    const type = detectContextType(className);

    const contextFn = type === 'uc' ? QueryContext.withUc : QueryContext.withDao;

    return contextFn.call(QueryContext, className, methodName, args, () => {
      return originalMethod.apply(this, args);
    });
  };
}

/**
 * Decorator to track UC/DAO context for slow query logging.
 * Can be used as a class decorator or method decorator.
 *
 * Class decorator usage (recommended for DAOs):
 * ```typescript
 * @TrackQuery()
 * export class UserDao extends BaseDao {
 *   public async getById(...) { ... }
 * }
 * ```
 *
 * Method decorator usage:
 * ```typescript
 * @TrackQuery()
 * public async action(params: Params): Promise<Response> {
 *   // method implementation
 * }
 * ```
 */
export function TrackQuery(): ClassDecorator & MethodDecorator {
  return function (target: object, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): void {
    // Method decorator
    if (descriptor && propertyKey) {
      const originalMethod = descriptor.value;
      const methodName = String(propertyKey);
      descriptor.value = wrapMethod(originalMethod, methodName);
      return;
    }

    // Class decorator
    const classConstructor = target as new (...args: unknown[]) => object;
    const prototype = classConstructor.prototype;
    const methodNames = Object.getOwnPropertyNames(prototype);

    for (const methodName of methodNames) {
      // Skip constructor and private methods (starting with _)
      if (methodName === 'constructor' || methodName.startsWith('_')) {
        continue;
      }

      const methodDescriptor = Object.getOwnPropertyDescriptor(prototype, methodName);
      if (!methodDescriptor || typeof methodDescriptor.value !== 'function') {
        continue;
      }

      const originalMethod = methodDescriptor.value;
      prototype[methodName] = wrapMethod(originalMethod, methodName);
    }
  };
}
