import * as Croquet from '@croquet/croquet'
import { CroquetAdapterConfig } from "./config.js";
import { Logger } from './logger.js';

export class CroquetAdapterView extends Croquet.View {

    logger = new Logger(this.constructor.name)
    subscriptions = {}

    constructor(model, socket, onReady) {
        super(model)
        this.model = model
        this.socket = socket

        // Listen for events redirect from Model
        this.subscribe(CroquetAdapterConfig.redirectEventsScope, CroquetAdapterConfig.redirectEventsEvent, this.handleEvent)

        // List for future events
        this.subscribe('future', 'command', this.handleFuture)

        /*
        this.subscribe('local-patch', 'applied', () => {
            this.logger.log("Local Patch Applied received")
        })
        if (this.model.$prevFutures.length > 0) {
            this.restore()
        }
        socket.on('completed-restore', () => {
            console.log("COMPLETED")
            onReady()
        })
        */
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
        this.socket.emit('future', id)
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

    /**
     * Publish a patch
     * @param {*} patches 
     */
    publishPatches(patches) {
        super.publish(CroquetAdapterConfig.patchesScope, CroquetAdapterConfig.patchesEvent, patches)
    }



    /*
    _restore(index) {
        this.socket.emit('future-restore', this.model.$prevFutures[index])
    }
    restore() {
        var index = 0
        this.socket.on('future-restore-ack', () => {
            let nextIndex = index++;
            if (nextIndex == this.model.$prevFutures.length) {
                this.socket.emit('completed-restore')
            } else {
                this._restore(nextIndex)
            }
        })
        this._restore(index)
    }
    */

}