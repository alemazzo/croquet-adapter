import { Server } from "socket.io"
import { DataManager } from "../model/data/data-manager.js"
import { DynamicModel } from "../model/dynamic-model.js"
import { FutureManager } from "../model/future/future-manager.js"
import { LoadingManager } from "../model/loading/loading-manager.js"
import { SnapshotManager } from "../model/snapshot/snapshot-manager.js"
import { SubscriptionManager } from "../model/subscriptions/subscription-manager.js"
import { CroquetAdapterModel } from "../old/adapter-model.js"
import { ClientHandler } from '../old/client-handler.js'

export class CroquetServer {

    static registerModels() {
        DataManager.register("DataManager")
        LoadingManager.register("LoadingManager")
        SubscriptionManager.register("SubscriptionManager")
        FutureManager.register("FutureManager")
        SnapshotManager.register("SnapshotManager")
        DynamicModel.register("DynamicModel");
    }

    static start(port = 3000) {
        CroquetServer.registerModels()
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