import { Model } from "@croquet/croquet";
import { Channels } from "../../config/channels.js";
import { Future } from "../future/future.js";
import { Event } from "../subscriptions/events.js";

export class LoadingManager extends Model {

    $notifyLoaded = false
    $loaded = false
    $queue = []

    init(options) {
        this.future(10).checkIfLoaded()
    }

    checkIfLoaded() {
        if (this.$notifyLoaded) {
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
        } else {
            this.future(10).checkIfLoaded()
        }
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