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
        this.handlers = []
    }

    run() {
        CroquetAdapterModel.register("CroquetAdapterModel")
        this.server = new Server(this.port)
        this.server.on('connection', (socket) => {
            let handler = new ClientHandler(socket, () => {
                this.handlers.splice(this.handlers.indexOf(handler), 1)
            })
            this.handlers.push(handler)
        })
    }

}