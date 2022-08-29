import { CroquetServer } from './src/server.js';

let port = process.argv[2] || 3000
console.log("PORT = " + port)
CroquetServer.start(port)