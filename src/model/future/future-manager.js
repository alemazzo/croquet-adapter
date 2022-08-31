import { Model } from '@croquet/croquet'
import { Channels } from '../../config/channels.js'


export class FutureManager extends Model {

    init(options) {
        super.init(options)
        this.loadingManager = options.loadingManager
        this.futures = options.futures || []
        this.futureLoops = options.futureLoops || []

        this.futures.forEach((future) => {
            this.future(future.time).handleFuture(future)
        })
        this.futureLoops.forEach((future) => {
            this.future(future.time).handleFutureLoop(future)
        })
    }

    handleFuture(future) {
        this.notifyFutureTick(future)
    }

    handleFutureLoop(future) {
        this.notifyFutureTick(future)
        this.future(future.time).handleFutureLoop(future)
    }

    notifyFutureTick(future) {
        let channel = Channels.Future.tick
        if (this.loadingManager.$loaded) {
            this.publish(channel.scope, channel.event, future)
        } else {
            this.loadingManager.addFuture(future)
        }
    }

}