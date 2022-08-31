import { Logger } from './src/logger.js';
import { CroquetServer } from './src/server/server.js';

let port = process.argv[2] || 3000

Logger.setOptions([
    "info",
    "debug"
])
CroquetServer.start(port)