import { View } from "@croquet/croquet";
import { Channels } from "../config/channels.js";
import { SocketMessages } from "../config/socket-messages.js";

export class DynamicView extends View {

    constructor(model, socket) {
        super(model);
        this.model = model;
        this.socket = socket;

        let eventsChannel = Channels.Events.event;
        this.subscribe(eventsChannel.scope, eventsChannel.event, this.handleEvent);

        let localEventsChannel = Channels.Events.localEvent
        this.subscribe(localEventsChannel.scope, localEventsChannel.event, this.handleLocalEvent);

        let futureChannel = Channels.Future.tick;
        this.subscribe(futureChannel.scope, futureChannel.event, this.handleFutureTick);

        let readyMessage = SocketMessages.Server.modelReady;
        this.socket.emit(readyMessage, this.model.dataManager.data);

        this.model.setLoaded()
    }


    handleEvent(event) {
        let socketMessage = SocketMessages.Server.modelEvent
        this.socket.emit(socketMessage, event);
    }

    handleLocalEvent(event) {
        let localEventMessage = SocketMessages.Server.localEvent
        this.socket.emit(localEventMessage, event);
    }

    handleFutureTick(future) {
        let socketMessage = SocketMessages.Server.modelFutureTick
        this.socket.emit(socketMessage, future);
    }

    updateModel(patches) {
        this.model.dataManager.update(patches)
    }

    publish(event) {
        this.publish(event.scope, event.event, event);
    }

    publishLocalEvent(event) {
        let localEventChannel = Channels.Events.localEvent
        this.publish(localEventChannel.scope, localEventChannel.event, event);
    }
}