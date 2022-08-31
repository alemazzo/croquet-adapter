import { Model } from "@croquet/croquet";
import { Channels } from "../../config/channels.js";
import { Logger } from "../../logger.js";

export class LoadingManager extends Model {

    $logger = Logger.getLogger("LoadingManager")

    $notifyLoaded = false
    $loaded = false
    $queue = []

    init(options) {
        this.snapshotManager = options.snapshotManager
        this.future(500).checkIfLoaded()
        this.$logger.debug("LoadingManager initialized")
    }

    checkIfLoaded() {
        if (this.$notifyLoaded && !this.$loaded) {
            let eventsChannel = Channels.Events.event
            let futureChannel = Channels.Future.tick
            this.$queue.forEach((item) => {
                if (item.scope != null) {
                    this.publish(eventsChannel.scope, eventsChannel.event, item)
                } else if (item.id != null) {
                    this.publish(futureChannel.scope, futureChannel.event, item)
                }
            })
            this.$queue = []
            this.$loaded = true
            this.snapshotManager.start()
            this.$logger.debug("Loaded")
            let applicationReadyChannel = Channels.Events.applicationReady
            this.publish(applicationReadyChannel.scope, applicationReadyChannel.event)
        }
        this.future(500).checkIfLoaded()
    }

    addFuture(future) {
        this.$queue.push(future)
    }

    addEvent(event) {
        this.$queue.push(event)
    }

    setLoaded() {
        this.$notifyLoaded = true
    }
}