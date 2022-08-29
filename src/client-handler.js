import * as Croquet from '@croquet/croquet'
import { CroquetAdapterModel } from "./adapter-model.js"
import { CroquetAdapterView } from './adapter-view.js'
import { Logger } from "./logger.js"

export class ClientHandler {

    logger = new Logger(this.constructor.name)

    constructor(socket, disconnectCallback) {
        this.socket = socket
        this.disconnectCallback = disconnectCallback
        this.setup()
    }

    setup() {
        this.socket.on('join', (apiKey, appId, name, password, data, futures) => {
            this.onJoinMessage(apiKey, appId, name, password, data, futures)
        })
        this.socket.on('subscribe', (scope, event) => {
            this.onSubscribeMessage(scope, event)
        })
        this.socket.on('unsubscribe', (scope, event) => {
            this.onUnsubscribeMessage(scope, event)
        })
        this.socket.on('event', (scope, event, data) => {
            this.onEventMessage(scope, event, data)
        })
        this.socket.on('patch', (patches) => {
            this.onPatchesMessage(patches)
        })
        this.socket.on('update-data', (patches) => {
            this.model.addLocalPatches(patches)
            this.socket.emit('update-data-ack')
        })
        this.socket.on('disconnect', () => {
            this.onDisconnection()
        })
    }

    joinSession(model, apiKey, appId, name, password, data) {
        return Croquet.Session.join({
            apiKey: apiKey,
            appId: appId,
            name,
            password,
            model: model,
            step: "manual",
            options: {
                data: data
            },
            debug: "snapshot"
        })
    }

    onJoin(id, step, model, leave) {
        setInterval(step, 100)
        this.model = model
        this.view = new CroquetAdapterView(model, this.socket, () => {
            this.logger.log("Session id = " + id)
            this.logger.log("Data = " + JSON.stringify(this.model.data))
            console.log("PREV EVENTS = " + this.model.$prevFutures.length)
            this.socket.emit('ready', this.model.data)
        })

    }

    onJoinMessage(apiKey, appId, name, password, data, futures) {

        class CroquetAdapterModelWithFuture extends CroquetAdapterModel {
            init(options) {
                super.init(options)
                futures.forEach(element => {
                    this.future(element.time).sendFuture(element.id, element.time)
                });
            }
        }

        CroquetAdapterModelWithFuture.register("CroquetAdapterModelWithFuture")
        if (typeof(data) == "string") {
            data = JSON.parse(data)
        }
        this.joinSession(CroquetAdapterModelWithFuture, apiKey, appId, name, password, data)
            .then(({ id, step, model, view, leave }) => {
                this.onJoin(id, step, model, view, leave)
            })
    }

    onSubscribeMessage(scope, event) {
        this.logger.log('Subscription to: ' + scope + ":" + event)
        this.view.addSubscription(scope, event, (data) => {
            this.socket.emit('event', scope, event, data)
        })
    }

    onUnsubscribeMessage(scope, event) {
        this.logger.log('Remove subscription from: ' + scope + ":" + event)
        this.view.removeSubscription(scope, event)
    }

    onEventMessage(scope, event, data) {
        this.logger.log('Publishing event to: ' + scope + ":" + event + " with data:" + data)
        this.view.publish(scope, event, data)
    }

    onPatchesMessage(patches) {
        this.logger.log("Received patches: " + JSON.stringify(patches))
        this.view.publishPatches(patches)
    }

    onDisconnection() {
        this.model.unsubscribeAll()
        this.view.detach()
        this.disconnectCallback()
    }



}