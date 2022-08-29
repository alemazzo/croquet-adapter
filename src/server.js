import { Server } from "socket.io"
import { CroquetAdapterModel } from "./adapter-model.js"
import { ClientHandler } from './client-handler.js'

export class CroquetServer {

    static start(port = 3000) {
        let server = new CroquetServer(port)
        server.run()
    }

    constructor(port = 3000) {
        this.port = port
        this.clients = []
    }

    run() {
        this.server = new Server(this.port)
        this.server.on('connection', (socket) => {
            this.clients.push(new ClientHandler(socket, () => {
                this.clients.splice(this.clients.indexOf(socket), 1)
            }))
        })
    }

}