import * as Croquet from '@croquet/croquet'
import { CroquetAdapterConfig } from "./config.js";
import pkg from 'fast-json-patch';
import { Logger } from './logger.js';
const { applyOperation } = pkg;

/**
 * The CroquetAdapterModel is a model that is used to communicate with the Croquet framework.
 */
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

    /**
     * The interval in milliseconds of the future loop
     */
    $futureLoopMilliseconds = 10

    /**
     * The duration in milliseconds of the consume cpu 
     * function every time the future loop is called
     */
    $cpuConsumeMilliseconds = 1

    init(options) {
        super.init(options)

        // Setup data
        this.data = options.data
        this.subscriptions = options.subscriptions
        this.futures = options.futures
        this.futureLoops = options.futureLoops

        // Setup future loop
        this.future(this.$futureLoopMilliseconds).futureLoop()

        // Subscribe to events
        this.subscribe(CroquetAdapterConfig.eventsScope, CroquetAdapterConfig.eventsEvent, this.handleEvent)

    }


    /**
     * Handle events and redirect to view
     * @param {*} eventData 
     */
    handleEvent(eventData) {
        this.publish(CroquetAdapterConfig.redirectEventsScope, CroquetAdapterConfig.redirectEventsEvent, eventData)
    }

    /**
     * The future loop.
     * Consume cpu and send futures to the client.
     * Terminate if the terminate flag is set.
     */
    futureLoop() {
        if (this.$terminate) {
            this.destroy()
            return
        }
        if (this.$loaded) {
            this.consumeCPU(this.$cpuConsumeMilliseconds)
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
        this.future(this.$futureLoopMilliseconds).futureLoop()
    }

    /**
     * Consume cpu based on instructions without using Date.now
     * @param {*} milliseconds The number of milliseconds to consume cpu
     */
    consumeCPU(milliseconds) {
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
        //this.$logger.log("Pushing future - Id = " + id)
        this.$futures.push(id)
    }

    /**
     * Apply patches to the model data
     * @param {*} patches 
     */
    updateData(patches) {
        patches.forEach(patch => {
            this.data = applyOperation(this.data, patch).newDocument
        });
        //this.$logger.log("Patches applied - Data = " + JSON.stringify(this.data))
    }

    /**
     * Set the terminate flag to true
     */
    terminate() {
        this.$terminate = true
    }


}