export class SocketMessages {

    static Server = {

        applicationReady: "application-ready",

        modelEvent: 'model-event',
        modelFutureTick: 'model-future-tick',
        modelReady: 'model-ready',

        localEvent: 'local-event',
    }

    static Client = {

        join: 'join',
        disconnect: 'disconnect',

        updateModel: 'update-model',
        localEvent: 'local-event',
        publish: 'publish',
    }
}