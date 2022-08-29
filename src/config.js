/**
 * The events configs
 */
export class CroquetAdapterConfig {

    // Scope for publishing and subscribing to events
    static eventsScope = 'croquet-adapter-events-scope'

    // Event for publishing and subscribing to events
    static eventsEvent = 'croquet-adapter-events-event'

    // Scope for redirecting events from Model to View
    static redirectEventsScope = 'croquet-adapter-redirect-events-scope'

    // Event for redirecting events from Model to View
    static redirectEventsEvent = 'croquet-adapter-redirect-events-event'

}

/**
 * The socket configs
 */
export class CroquetSocketConfig {

    /**
     * Message types sent by the client to the server
     */
    static Client = {
        join: 'join',
        subscribe: 'subscribe',
        unsubscribe: 'unsubscribe',
        publish: 'publish',
        updateModel: 'update-model',
        disconnect: 'disconnect'
    }

    /**
     * Message types sent by the server to the client
     */
    static Server = {
        ready: 'ready',
        event: 'event',
        future: 'future'
    }

}