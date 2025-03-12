export const getRandomDelayInRange = (
    minSeconds: number,
    maxSeconds: number,
): number => {
    const toMs = (sec: number) => sec * 1000;
    return (
        Math.random() * (toMs(maxSeconds) - toMs(minSeconds)) + toMs(minSeconds)
    );
};
