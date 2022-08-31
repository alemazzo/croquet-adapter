import { Model } from "@croquet/croquet";
import { Logger } from "../../logger.js";

export class SnapshotManager extends Model {

    $logger = Logger.getLogger("SnapshotManager")

    $defaultInterval = 10
    $defaultConsumeDuration = 1

    $started = false

    init(options) {
        this.cpuConsumeInterval = options.cpuConsumeInterval || this.$defaultInterval
        this.cpuConsumeDuration = options.cpuConsumeDuration || this.$defaultConsumeDuration
        this.future(this.cpuConsumeInterval).consumeCpuLoop()
        this.$logger.debug("SnapshotManager initialized")
    }

    start() {
        this.$started = true
        this.$logger.debug("Start consuming cpu with interval of " + this.cpuConsumeInterval + " milliseconds and duration of " + this.cpuConsumeDuration + " milliseconds")
    }

    consumeCpuLoop() {
        if (this.$started) {
            this.consumeCPU(this.cpuConsumeDuration)
        }
        this.future(this.cpuConsumeInterval).consumeCpuLoop()
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