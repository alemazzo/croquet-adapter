import { View } from "@croquet/croquet";
import { Channels } from "../config/channels.js";
import { SocketMessages } from "../config/socket-messages.js";
import { Logger } from "../logger.js";

export class DynamicView extends View {

    $logger = Logger.getLogger("DynamicView")

    constructor(model, socket) {
        super(model);
        this.model = model;
        this.socket = socket;

        let applicationReadyChannel = Channels.Events.applicationReady
        this.subscribe(applicationReadyChannel.scope, applicationReadyChannel.event, this.onApplicationReady);

        let eventsChannel = Channels.Events.event;
        this.subscribe(eventsChannel.scope, eventsChannel.event, this.handleEvent);

        let localEventsChannel = Channels.Events.localEvent
        this.subscribe(localEventsChannel.scope, localEventsChannel.event, this.handleLocalEvent);

        let futureChannel = Channels.Future.tick;
        this.subscribe(futureChannel.scope, futureChannel.event, this.handleFutureTick);

        let readyMessage = SocketMessages.Server.modelReady;
        this.socket.emit(readyMessage, this.model.dataManager.data);

        this.model.setLoaded()
        this.$logger.debug("DynamicView initialized")
    }

    onApplicationReady() {
        this.$logger.debug("Received application ready event")
        let applicationReadyMessage = SocketMessages.Server.applicationReady
        this.socket.emit(applicationReadyMessage)
    }

    handleEvent(event) {
        this.$logger.debug(`Handling event: ${JSON.stringify(event)}`)
        let socketMessage = SocketMessages.Server.modelEvent
        this.socket.emit(socketMessage, event);
    }

    handleLocalEvent(event) {
        this.$logger.debug(`Handling local event: ${JSON.stringify(event)}`)
        let localEventMessage = SocketMessages.Server.localEvent
        this.socket.emit(localEventMessage, event);
    }

    handleFutureTick(future) {
        this.$logger.debug(`Handling future tick: ${JSON.stringify(future)}`)
        let socketMessage = SocketMessages.Server.modelFutureTick
        this.socket.emit(socketMessage, future.id);
    }

    updateModel(patches) {
        this.$logger.debug(`Handling update model: ${JSON.stringify(patches)}`)
        this.model.dataManager.update(patches)
    }

    publish(event) {
        this.$logger.debug(`Publishing event: ${JSON.stringify(event)}`)
        this.publish(event.scope, event.event, event);
    }

    publishLocalEvent(event) {
        this.$logger.debug(`Publishing local event: ${JSON.stringify(event)}`)
        let localEventChannel = Channels.Events.localEvent
        this.publish(localEventChannel.scope, localEventChannel.event, event);
    }
}