import { Model } from "@croquet/croquet";
import { Channels } from "../../config/channels.js";
import { Logger } from "../../logger.js";

export class SubscriptionManager extends Model {

    $logger = Logger.getLogger("SubscriptionManager")

    init(options) {
        super.init(options);
        this.loadingManager = options.loadingManager
        this.subscriptions = options.subscriptions || []
        this.subscriptions.forEach((subscription) => {
            this.subscribe(subscription.scope, subscription.event, this.handleEvent)
        })
        this.$logger.debug("SubscriptionManager initialized")
    }

    handleEvent(event) {
        let channel = Channels.Events.event
        if (this.loadingManager.$loaded) {
            this.$logger.debug(`Notified event: ${JSON.stringify(event)}`)
            this.publish(channel.scope, channel.event, event)
        } else {
            this.$logger.debug(`Added event to loading manager: ${JSON.stringify(event)}`)
            this.loadingManager.addEvent(event)
        }

    }

}