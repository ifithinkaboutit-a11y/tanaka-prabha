import EventEmitter from 'events';

class LiveLogger extends EventEmitter {
    constructor() {
        super();
        this.originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info
        };
        this.init();
    }

    init() {
        // Override console methods
        console.log = (...args) => this.intercept('log', ...args);
        console.error = (...args) => this.intercept('error', ...args);
        console.warn = (...args) => this.intercept('warn', ...args);
        console.info = (...args) => this.intercept('info', ...args);
    }

    intercept(level, ...args) {
        // 1. Call original console method so logs still appear in terminal
        this.originalConsole[level].apply(console, args);

        // 2. Emit event for SSE
        // fast and simple serialization
        const message = args.map(arg => {
            if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg);
                } catch (e) {
                    return String(arg);
                }
            }
            return String(arg);
        }).join(' ');

        this.emit('log', {
            timestamp: new Date().toISOString(),
            level,
            message
        });
    }
}

// Singleton instance
const liveLogger = new LiveLogger();
export default liveLogger;
