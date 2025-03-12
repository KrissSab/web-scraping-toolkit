export type TFunction<TArgs extends unknown[], TResult> = (
    ...args: TArgs
) => TResult;

export const createFunctionWithName = <TArgs extends unknown[], TResult>(
    name: string,
    fnBody: TFunction<TArgs, TResult>,
): TFunction<TArgs, TResult> => {
    const wrappedMethodHolder = {
        [name](...args: TArgs) {
            return fnBody.apply(this, args);
        },
    };

    return wrappedMethodHolder[name];
};
