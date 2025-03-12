import { Page } from 'playwright';

interface RouteConfig {
    pattern: string;
    shouldHandle?: (urlParams: URLSearchParams) => boolean;
}

export interface RouteHandlerResult<T> {
    waitForData: () => Promise<T>;
}

export async function createRouteHandler<T>(
    page: Page,
    config: RouteConfig,
): Promise<RouteHandlerResult<T>> {
    let resolveData: (value: T) => void;
    let rejectData: (reason: unknown) => void;
    const dataPromise = new Promise<T>((resolve, reject) => {
        resolveData = resolve;
        rejectData = reject;
    });

    page.route(config.pattern, async (route) => {
        try {
            if (config.shouldHandle) {
                const url = route.request().url();
                const urlParams = new URL(url).searchParams;

                if (!config.shouldHandle(urlParams)) {
                    await route.continue();
                    return;
                }
            }

            const response = await route.fetch();
            const json = await response.json();
            resolveData(json);

            await route.fulfill({
                status: response.status(),
                headers: response.headers(),
                body: JSON.stringify(json),
            });
        } catch (error) {
            rejectData(error);
            await route.abort('failed');
        }
    });

    return {
        waitForData: () => dataPromise,
    };
}
