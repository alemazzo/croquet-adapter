import * as Croquet from '@croquet/croquet'
import { CroquetAdapterConfig, CroquetSocketConfig } from "./config.js";
import { Logger } from './logger.js';

/**
 * The CroquetAdapterView is a view that is used to communicate with the Croquet framework.
 */
export class CroquetAdapterView extends Croquet.View {

    /**
     * The logger for the adapter view
     */
    logger = new Logger(this.constructor.name)

    /**
     * The subscriptions map
     */
    subscriptions = {}

    /**
     * The interval in milliseconds of the future loop
     */
    $futureLoopMilliseconds = 10

    constructor(model, socket, onReady) {
        super(model)
        this.model = model
        this.socket = socket

        // Notify Ready
        onReady()

        // Listen for events redirect from Model
        this.subscribe(CroquetAdapterConfig.redirectEventsScope, CroquetAdapterConfig.redirectEventsEvent, this.handleEvent)

        // Start future loop
        this.future(this.$futureLoopMilliseconds).futureLoop()
    }

    /**
     * Redirect future command to client
     */
    futureLoop() {
        while (this.model.$futures.length > 0) {
            this.socket.emit(CroquetSocketConfig.Server.future, this.model.$futures.shift())
        }
        this.future(this.$futureLoopMilliseconds).futureLoop()
    }

    /**
     * Call the listener for the event
     * @param {*} data 
     */
    handleEvent(data) {
        this.logger.log("Handling event: " + JSON.stringify(data))
        let scope = data["scope"]
        let event = data["event"]
        let content = data["content"]
        this.subscriptions[scope][event](content)
    }

    /**
     * Redirect future command to client
     * @param {*} id 
     */
    handleFuture(id) {
        this.logger.log("Emit " + id)
    }

    /**
     * Add a subscription and register the handler
     * @param {*} scope 
     * @param {*} event 
     * @param {*} handler 
     */
    addSubscription(scope, event, handler) {
        this.logger.log("Adding subscription to " + scope + ":" + event)
        if (!(Object.keys(this.subscriptions).includes(scope))) {
            this.subscriptions[scope] = {}
        }
        this.subscriptions[scope][event] = handler
    }

    /**
     * Remove a subscription
     * @param {*} scope 
     * @param {*} event 
     */
    removeSubscription(scope, event) {
        delete this.subscriptions[scope][event]
    }

    /**
     * Publish an event
     * @param {*} scope 
     * @param {*} event 
     * @param {*} data 
     */
    publish(scope, event, data) {
        let packet = {
            scope: scope,
            event: event,
            content: data
        }
        super.publish(CroquetAdapterConfig.eventsScope, CroquetAdapterConfig.eventsEvent, packet)
    }

}