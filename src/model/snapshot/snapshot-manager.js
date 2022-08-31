import { Model } from "@croquet/croquet";
import { Logger } from "../../logger.js";

export class SnapshotManager extends Model {

    $logger = Logger.getLogger("SnapshotManager")

    $defaultInterval = 10
    $defaultConsumeDuration = 1

    init(options) {
        this.milliseconds = options.milliseconds || this.$defaultInterval
        this.future(this.milliseconds).consumeCpuLoop()
        this.$logger.debug("Start consuming cpu with interval of " + this.milliseconds + " milliseconds")
    }

    consumeCpuLoop() {
        this.consumeCPU(this.$defaultConsumeDuration)
        this.future(this.milliseconds).consumeCpuLoop()
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

}