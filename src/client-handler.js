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
        this.socket
            .on('join', (apiKey, appId, name, password, data, subscriptions, futures, futuresLoop) => {
                this.onJoinMessage(apiKey, appId, name, password, data, subscriptions, futures, futuresLoop)
            }).on('subscribe', (scope, event) => {
                this.onSubscribeMessage(scope, event)
            }).on('unsubscribe', (scope, event) => {
                this.onUnsubscribeMessage(scope, event)
            }).on('event', (scope, event, data) => {
                this.onEventMessage(scope, event, data)
            }).on('patch', (patches) => {
                this.onPatchesMessage(patches)
            }).on('local-patch', (patches) => {
                this.onLocalPatchMessage(patches)
            }).on('disconnect', () => {
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

    onJoin(id, step, model) {
        setInterval(step, 100)
        this.model = model
        this.view = new CroquetAdapterView(model, this.socket, () => {
            this.subscriptions.forEach(element => {
                this.onSubscribeMessage(element.scope, element.event)
            })
            this.logger.log("Session id = " + id)
            this.logger.log("Data = " + JSON.stringify(this.model.data))
            this.socket.emit('ready', this.model.data)
        })

    }

    onJoinMessage(apiKey, appId, name, password, data, subscriptions, futures, futuresLoop) {
        if (typeof(subscriptions) == "string") {
            subscriptions = JSON.parse(subscriptions)
        }
        if (typeof(futures) == "string") {
            futures = JSON.parse(futures)
        }
        if (typeof(futuresLoop) == "string") {
            futuresLoop = JSON.parse(futuresLoop)
        }
        this.subscriptions = subscriptions
        class CroquetAdapterModelWithFuture extends CroquetAdapterModel {

            modelVersion = 0

            init(options) {
                super.init(options)
                this.futures = futures
                this.futuresLoop = futuresLoop
                this.future(10).futureLoop()
            }


            consumeCPU(milliseconds = 1) {
                // Consume cpu based on instructions without using Date.now
                let start = performance.now()
                while (performance.now() - start < milliseconds) {
                    let a = 1 + 1
                }
            }

            futureLoop() {
                this.consumeCPU(2)
                this.futures.forEach(future => {
                    if (this.now() % future.time == 0) {
                        this._sendFuture(future.id, future.time)
                        this.futures.splice(this.futures.indexOf(future), 1)
                    }
                })
                this.futuresLoop.forEach(future => {
                    if (this.now() % future.time == 0) {
                        this._sendFuture(future.id, future.time)
                    }
                })
                this.future(10).futureLoop()
            }


            _sendFuture(id, time) {
                this.modelVersion++;
                this.sendFuture(id, time)
            }

            _sendFutureLoop(id, time) {
                this.modelVersion++;
                this.sendFutureLoop(id, time)
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

    onLocalPatchMessage(patches) {
        if (typeof(patches) == "string") {
            patches = JSON.parse(patches)
        }
        this.model.applyLocalPatches(patches)
    }

    onDisconnection() {
        //this.model.unsubscribeAll()
        this.view.detach()
        this.disconnectCallback()
    }



}