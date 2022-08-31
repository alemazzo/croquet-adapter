export class Logger {

    static options = ["info"]
    static logger = []

    static setOptions(options) {
        Logger.options = options
    }

    static getLogger(serviceName) {
        return new Logger(serviceName, Logger.options)
    }

    constructor(serviceName, options) {
        this.serviceName = serviceName
        this.options = options
    }

    info(event) {
        this._log(event, "info")
    }

    debug(event) {
        this._log(event, "debug")
    }

    _log(event, level) {
        if (this.options.includes(level)) {
            console.log(`[${this.serviceName}]: ${event}`)
        }
    }
}