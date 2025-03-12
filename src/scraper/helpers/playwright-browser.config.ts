export const browserConfiguration = {
    headless: true,
    viewport: {
        width: 1920,
        height: 1080,
    },
    deviceScaleFactor: 1,
    userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-site-isolation-trials',
        '--disable-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-service-autorun',
        '--password-store=basic',
        '--disable-notifications',
        '--window-size=1920,1080',
        '--lang=en-US,en',
    ],
    permissions: ['geolocation', 'notifications'],

    colorScheme: null,
    reducedMotion: null,

    hasTouch: false,
    isMobile: false,

    javaScriptEnabled: true,
    bypassCSP: true,
    ignoreHTTPSErrors: true,
    acceptDownloads: false,
};
