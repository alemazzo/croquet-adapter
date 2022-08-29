import * as Croquet from '@croquet/croquet'
import { CroquetAdapterConfig } from "./config.js";
import pkg from 'fast-json-patch';
import { Logger } from './logger.js';
const { applyOperation } = pkg;

export class CroquetAdapterModel extends Croquet.Model {

    $logger = new Logger(this.constructor.name)
    $futures = []

    init(options) {

        // Setup
        super.init(options)
        this.data = options.data

        // Subscribe to events
        this.subscribe(CroquetAdapterConfig.eventsScope, CroquetAdapterConfig.eventsEvent, this.handleEvent)

        // Subscribe to patches
        this.subscribe(CroquetAdapterConfig.patchesScope, CroquetAdapterConfig.patchesEvent, this.handleRemotePatches);

        //this.future(10).checkLocalPatches();
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

    /**
     * Notify the view that a future tick is arrived
     * @param {*} id 
     * @param {*} time 
     */
    sendFuture(id) {
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


    /*
    checkLocalPatches() {
        if (this.$patches != null && this.$patches.length > 0) {
            this.$patches.forEach(patch => {
                applyOperation(this.data, patch, true, true)
            });
            this.$patches = []
            this.modelVersion += 1
            this.publish('local-patch', 'applied')
            this.$logger.log("Local patches applied - Data = " + JSON.stringify(this.data))
        }
        //this.future(10).checkLocalPatches();
    }

    addLocalPatches(patches) {
        patches.forEach(patch => {
            applyOperation(this.data, patch, true, true)
        });
        //this.$patches = this.$patches.concat(patches)
        //this.publish('local-patch', 'applied')
    }

    */

}