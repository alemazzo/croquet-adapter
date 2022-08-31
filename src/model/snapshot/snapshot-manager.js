import { Model } from "@croquet/croquet";

export class SnapshotManager extends Model {

    $defaultInterval = 10
    $defaultConsumeDuration = 1

    init(options) {
        this.milliseconds = options.milliseconds || this.$defaultInterval
        this.future(this.milliseconds).consumeCpuLoop()
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