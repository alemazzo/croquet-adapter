import * as Croquet from '@croquet/croquet'
import { CroquetAdapterConfig } from "./config.js";
import pkg from 'fast-json-patch';
import { Logger } from './logger.js';
const { applyOperation } = pkg;

export class CroquetAdapterModel extends Croquet.Model {

    /**
     * The logger for the adapter model
     */
    $logger = new Logger(this.constructor.name)

    /**
     * The queue of futures to be sent to the client by the view
     */
    $futures = []

    /**
     * Check if the model has to be terminated
     */
    $terminate = false

    /**
     * Check if the model is loaded in order to start consuming cpu
     */
    $loaded = false

    init(options) {
        super.init(options)

        // Setup data
        this.data = options.data
        this.futures = options.futures
        this.futureLoops = options.futureLoops

        // Setup future loop
        this.future(10).futureLoop()

        // Subscribe to events
        this.subscribe(CroquetAdapterConfig.eventsScope, CroquetAdapterConfig.eventsEvent, this.handleEvent)

        // Subscribe to patches
        this.subscribe(CroquetAdapterConfig.patchesScope, CroquetAdapterConfig.patchesEvent, this.handleRemotePatches);
    }

    /**
     * Handle events and redirect to view
     * @param {*} eventData 
     */
    handleEvent(eventData) {
        this.publish(CroquetAdapterConfig.redirectEventsScope, CroquetAdapterConfig.redirectEventsEvent, eventData)
    }

    /**
     * Handle patches and update model data
     * @param {*} patches 
     */
    handleRemotePatches(patches) {
        patches.forEach(patch => {
            this.data = applyOperation(this.data, patch).newDocument
        });
        this.$logger.log("Handle remote patches applied - Data = " + JSON.stringify(this.data))
    }

    futureLoop() {
        if (this.$terminate) {
            this.destroy()
            return
        }
        if (this.$loaded) {
            this.consumeCPU(2)
        }
        this.futures.forEach(future => {
            if (this.now() % future.time == 0) {
                this.pushFutures(future.id, future.time)
                this.futures.splice(this.futures.indexOf(future), 1)
            }
        })
        this.futureLoops.forEach(future => {
            if (this.now() % future.time == 0) {
                this.pushFutures(future.id, future.time)
            }
        })
        this.future(10).futureLoop()
    }


    consumeCPU(milliseconds = 1) {
        // Consume cpu based on instructions without using Date.now
        let start = performance.now()
        while (performance.now() - start < milliseconds) {
            let a = 1 + 1
        }
    }

    /**
     * Push a future to the queue
     * @param {*} id 
     * @param {*} time 
     */
    pushFutures(id) {
        this.$logger.log("PUSHING FUTURE FOR ID = " + id)
        this.$futures.push(id)
    }

    /**
     * Apply local patches to the model data
     * @param {*} patches 
     */
    applyLocalPatches(patches) {
        patches.forEach(patch => {
            this.data = applyOperation(this.data, patch).newDocument
        });
        this.$logger.log("Apply patches applied - Data = " + JSON.stringify(this.data))
    }

    terminate() {
        this.$terminate = true
    }


}