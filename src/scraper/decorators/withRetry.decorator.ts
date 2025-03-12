import { LoggerService } from '../../logger/logger.service';
import { DELAY_MS, RETRY_AMOUNTS } from '../constants';
import {
    createFunctionWithName,
    TFunction,
} from '../../helpers/createFunctionWithName';

const logger = new LoggerService();

export function WithRetry(
    maxRetries: number = RETRY_AMOUNTS,
    delayMs: number = DELAY_MS,
) {
    return function <T, Args extends unknown[], R>(
        target: object,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<TFunction<Args, Promise<R>>>,
    ): TypedPropertyDescriptor<TFunction<Args, Promise<R>>> {
        const originalMethod = descriptor.value as TFunction<Args, Promise<R>>;

        descriptor.value = createFunctionWithName(
            propertyKey,
            async function (this: T, ...args: Args): Promise<R> {
                let attempt = 0;
                while (attempt <= maxRetries) {
                    try {
                        return await originalMethod.apply(this, args);
                    } catch (error) {
                        attempt++;

                        if (attempt > maxRetries) {
                            logger.error(
                                error,
                                `${propertyKey} - Final attempt ${attempt} failed. All retries exhausted.`,
                            );
                            throw error;
                        }

                        logger.log(
                            `Attempt ${attempt}/${maxRetries} failed for ${propertyKey}. Retrying in ${delayMs}ms...`,
                            propertyKey,
                        );

                        await new Promise<void>((resolve) => {
                            setTimeout(resolve, delayMs);
                        });
                    }
                }
                // This throw will never be reached, but TypeScript needs an explicit throw return
                throw new Error('This should never be reached');
            },
        );
        return descriptor;
    };
}
