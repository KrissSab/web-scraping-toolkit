import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

interface LoggableArguments {
    [key: string]: unknown;
}

export interface LogEntry {
    timestamp: string;
    level: 'ERROR' | 'INFO';
    message: string;
    context?: string;
    functionArguments?: LoggableArguments;
    stack?: string;
    [key: string]: unknown;
}

@Injectable()
export class LoggerService {
    constructor() {}

    error(
        error: Error,
        context: string,
        functionArguments?: LoggableArguments,
    ): string {
        const logEntry: LogEntry = {
            timestamp: new Date().toISOString(),
            level: 'ERROR',
            message: error.message,
            context,
            functionArguments,
            stack: error.stack ? error.stack.replace(/\n/g, '\\n') : undefined,
        };

        const serializedLog = JSON.stringify(logEntry);
        console.error(serializedLog);
        return serializedLog;
    }

    log(
        message: string,
        context?: string,
        metadata?: Record<string, unknown>,
    ): string {
        const logEntry: LogEntry = {
            timestamp: new Date().toISOString(),
            level: 'INFO',
            message,
            context,
            ...metadata,
        };

        const serializedLog = JSON.stringify(logEntry);
        console.log(serializedLog);
        return serializedLog;
    }

    writeToFile(logEntry: string, filePath: string): void {
        try {
            fs.appendFileSync(filePath, logEntry + '\n');
        } catch (error) {
            console.error(
                JSON.stringify({
                    timestamp: new Date().toISOString(),
                    level: 'ERROR',
                    message: 'Failed to write log to file',
                    error:
                        error instanceof Error ? error.message : String(error),
                    filePath,
                }),
            );
        }
    }
}
