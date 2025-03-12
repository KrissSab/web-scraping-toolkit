import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
    const config = new DocumentBuilder()
        .setTitle('Web Scraping API')
        .setDescription('API for web scraping')
        .setVersion('1.0')
        .addApiKey(
            { type: 'apiKey', name: 'X-API-Key', in: 'header' },
            'X-API-Key',
        )
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
}
