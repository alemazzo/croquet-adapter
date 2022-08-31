export class Logger {
    constructor(serviceName) {
        this.serviceName = serviceName
    }

    log(event) {
        console.log(`[${this.serviceName}]: ${event}`)
    }
}