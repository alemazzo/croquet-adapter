import * as Croquet from '@croquet/croquet'
import { CroquetAdapterModel } from "./adapter-model.js"
import { CroquetAdapterView } from './adapter-view.js'
import { CroquetSocketConfig } from './config.js'
import { Logger } from "./logger.js"

var registered = false

/**
 * The single client handler of the adapter
 */
export class ClientHandler {

    /**
     * Logger
     */
    logger = new Logger(this.constructor.name)

    constructor(socket, disconnectCallback) {
        this.socket = socket
        this.disconnectCallback = disconnectCallback
        this.setup()
    }

    /**
     * Setup all the callback of the socket
     */
    setup() {
        this.socket
            .on(CroquetSocketConfig.Client.join,
                (apiKey, appId, name, password, data, subscriptions, futures, futureLoops) => {
                    this.onJoinMessage(apiKey, appId, name, password, data, subscriptions, futures, futureLoops)
                }
            )
            .on(
                CroquetSocketConfig.Client.subscribe,
                (scope, event) => this.onSubscribeMessage(scope, event)
            )
            .on(
                CroquetSocketConfig.Client.unsubscribe,
                (scope, event) => this.onUnsubscribeMessage(scope, event)
            )
            .on(
                CroquetSocketConfig.Client.publish,
                (scope, event, data) => this.onPublishMessage(scope, event, data)
            )
            .on(
                CroquetSocketConfig.Client.updateModel,
                (patches) => this.onUpdateModelMessage(patches)
            )
            .on(
                CroquetSocketConfig.Client.disconnect,
                () => this.onDisconnection()
            )
    }

    /**
     * Join the session and return the promise of the session
     * @param {*} model 
     * @param {*} apiKey 
     * @param {*} appId 
     * @param {*} name 
     * @param {*} password 
     * @param {*} data 
     * @param {*} futures 
     * @param {*} futureLoops 
     * @returns the promise of the session
     */
    joinSession(model, apiKey, appId, name, password, data, futures, futureLoops) {
        return Croquet.Session.join({
            apiKey: apiKey,
            appId: appId,
            name,
            password,
            model: model,
            step: "manual",
            options: {
                data: data,
                futures: futures,
                futureLoops: futureLoops
            },
            debug: "snapshot"
        })
    }

    /**
     * Called when the session is started
     * @param {*} id 
     * @param {*} step 
     * @param {*} model 
     */
    onJoin(id, step, model) {
        setInterval(step, 100)
        this.model = model
        this.view = new CroquetAdapterView(model, this.socket, () => {
            this.subscriptions.forEach(element => {
                this.onSubscribeMessage(element.scope, element.event)
            })
            this.logger.log("Session id = " + id)
            this.logger.log("Data = " + JSON.stringify(this.model.data))
            this.model.$loaded = true
            this.socket.emit(CroquetSocketConfig.Server.ready, this.model.data)
        })

    }

    /**
     * Handle the join of the socket
     * @param {*} apiKey 
     * @param {*} appId 
     * @param {*} name 
     * @param {*} password 
     * @param {*} data 
     * @param {*} subscriptions 
     * @param {*} futures 
     * @param {*} futureLoops 
     */
    onJoinMessage(apiKey, appId, name, password, data, subscriptions, futures, futureLoops) {
        if (typeof(subscriptions) == "string") {
            subscriptions = JSON.parse(subscriptions)
        }
        if (typeof(futures) == "string") {
            futures = JSON.parse(futures)
        }
        if (typeof(futureLoops) == "string") {
            futureLoops = JSON.parse(futureLoops)
        }
        if (typeof(data) == "string") {
            data = JSON.parse(data)
        }
        this.subscriptions = subscriptions
        this.joinSession(CroquetAdapterModel, apiKey, appId, name, password, data, futures, futureLoops)
            .then(({ id, step, model, view, leave }) => {
                this.onJoin(id, step, model, view, leave)
            })
    }

    /**
     * Handle the subscriptions of the events by the socket
     * @param {*} scope 
     * @param {*} event 
     */
    onSubscribeMessage(scope, event) {
        this.logger.log('Subscription to: ' + scope + ":" + event)
        this.view.addSubscription(scope, event, (data) => {
            this.socket.emit(CroquetSocketConfig.Server.event, scope, event, data)
        })
    }

    /**
     * Handle the unsubscriptions of the events by the socket
     * @param {*} scope 
     * @param {*} event 
     */
    onUnsubscribeMessage(scope, event) {
        this.logger.log('Remove subscription from: ' + scope + ":" + event)
        this.view.removeSubscription(scope, event)
    }

    /**
     * Handle the publish of the events by the socket
     * @param {*} scope 
     * @param {*} event 
     * @param {*} data 
     */
    onPublishMessage(scope, event, data) {
        this.logger.log('Publishing event to: ' + scope + ":" + event + " with data:" + data)
        this.view.publish(scope, event, data)
    }

    /**
     * Handle the update of the model by the socket
     * @param {*} patches 
     */
    onUpdateModelMessage(patches) {
        if (typeof(patches) == "string") {
            patches = JSON.parse(patches)
        }
        this.model.updateData(patches)
    }

    /**
     * Handle the disconnection of the socket
     */
    onDisconnection() {
        this.model.terminate()
        this.view.detach()
        this.disconnectCallback()
        delete this.model
    }

}