import * as Croquet from '@croquet/croquet'
import { Logger } from "../logger.js"
import { SocketMessages } from "../config/socket-messages.js"
import { DynamicModel } from '../model/dynamic-model.js'
import { DynamicView } from '../view/dynamic-view.js'
import { Event } from '../model/subscriptions/events.js'
/**
 * The single client handler of the adapter
 */
export class ClientHandler {

    /**
     * Logger
     */
    logger = Logger.getLogger("ClientHandler")

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
            .on(SocketMessages.Client.disconnect,
                () => this.onDisconnection()
            )
            .on(SocketMessages.Client.join,
                (apiKey, appId, name, password, data, subscriptions, futures, futureLoops) => {
                    this.onJoinMessage(apiKey, appId, name, password, data, subscriptions, futures, futureLoops)
                }
            )
            .on(SocketMessages.Client.updateModel,
                (patches) => this.onUpdateModelMessage(patches)
            )
            .on(SocketMessages.Client.localEvent,
                (scope, event, data) => this.onLocalEventMessage(scope, event, data)
            )
            .on(SocketMessages.Client.publish,
                (scope, event, data) => this.onPublishMessage(scope, event, data)
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
    joinSession(model, apiKey, appId, name, password, data, subscriptions, futures, futureLoops) {
        return Croquet.Session.join({
            apiKey: apiKey,
            appId: appId,
            name: name,
            password: password,
            model: model,
            step: "manual",
            options: {
                data: data,
                futures: futures,
                futureLoops: futureLoops,
                subscriptions: subscriptions
            },
            debug: [
                //"session",
                //"messages",
                //"sends",
                //"snapshot",
                //"data",
                //"hashing",
                //"subscribe",
                //"classes",
                //"ticks"
            ]
        })
    }

    /**
     * Called when the session is started
     * @param {*} id 
     * @param {*} step 
     * @param {*} model 
     */
    onJoin(id, step, model, leave) {
        setInterval(step, 10)
        this.logger.info("Joined session " + id)
        this.leave = leave
        this.model = model
        this.view = new DynamicView(model, this.socket)
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
        subscriptions = typeof(subscriptions) == "string" ? JSON.parse(subscriptions) : subscriptions
        futures = typeof(futures) == "string" ? JSON.parse(futures) : futures
        futureLoops = typeof(futureLoops) == "string" ? JSON.parse(futureLoops) : futureLoops
        data = typeof(data) == "string" ? JSON.parse(data) : data
        this.joinSession(DynamicModel, apiKey, appId, name, password, data, subscriptions, futures, futureLoops)
            .then(({ id, step, model, view, leave }) => {
                view.detach()
                this.onJoin(id, step, model, leave)
            })
    }

    /**
     * Handle the publish of the events by the socket
     * @param {*} scope 
     * @param {*} event 
     * @param {*} data 
     */
    onPublishMessage(scope, event, data) {
        let eventObject = new Event(scope, event, data)
        this.view.publish(eventObject)
            //this.logger.debug("Published event " + eventObject.toString())
    }

    /**
     * Handle the publish of a local message: Model -> View
     * @param {*} scope
     * @param {*} event
     * @param {*} data
     */
    onLocalEventMessage(scope, event, data) {
        let eventObject = Event(scope, event, data)
        this.view.publishLocalEvent(eventObject)
            //this.logger.debug("Published local event " + eventObject.toString())
    }

    /**
     * Handle the update of the model by the socket
     * @param {*} patches 
     */
    onUpdateModelMessage(patches) {
        patches = typeof(patches) == "string" ? JSON.parse(patches) : patches
        this.view.updateModel(patches)
            //this.logger.debug("Updated model with patches " + JSON.stringify(patches))
    }

    /**
     * Handle the disconnection of the socket
     */
    onDisconnection() {
        // this.view.detach()
        this.model.terminate()
        this.leave()
        setTimeout(this.disconnectCallback, 100)
        this.logger.info("Disconnected")
    }

}