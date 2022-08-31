import { Model } from '@croquet/croquet'
import { Logger } from '../logger.js'
import { DataManager } from './data/data-manager.js'
import { FutureManager } from './future/future-manager.js'
import { LoadingManager } from './loading/loading-manager.js'
import { SnapshotManager } from './snapshot/snapshot-manager.js'
import { SubscriptionManager } from './subscriptions/subscription-manager.js'


export class DynamicModel extends Model {

    $logger = Logger.getLogger("DynamicModel")

    $toBeTerminated = false

    init(options) {
        super.init(options)
        this.dataManager = DataManager.create(options)
        this.snapshotManager = SnapshotManager.create(options)
        this.loadingManager = LoadingManager.create({
            snapshotManager: this.snapshotManager,
        })
        this.subscriptionsManager = SubscriptionManager.create({
            subscriptions: options.subscriptions,
            loadingManager: this.loadingManager
        })
        this.futureManager = FutureManager.create({
            futures: options.futures,
            futureLoops: options.futureLoops,
            loadingManager: this.loadingManager
        })
        this.future(100).checkTermination()
        this.$logger.debug("Dynamic model initialized")
    }

    checkTermination() {
        if (this.$toBeTerminated) {
            this.dataManager.destroy()
            this.loadingManager.destroy()
            this.subscriptionsManager.destroy()
            this.futureManager.destroy()
            this.snapshotManager.destroy()
            this.destroy()
        }
        this.future(100).checkTermination()
    }

    setLoaded() {
        this.loadingManager.setLoaded()
    }

    terminate() {
        this.$toBeTerminated = true
    }
}