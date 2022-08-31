import { Model } from '@croquet/croquet'
import { DataManager } from './data/data-manager.js'
import { FutureManager } from './future/future-manager.js'
import { LoadingManager } from './loading/loading-manager.js'
import { SnapshotManager } from './snapshot/snapshot-manager.js'
import { SubscriptionManager } from './subscriptions/subscription-manager.js'



export class DynamicModel extends Model {

    init(options) {
        super.init(options)
        this.dataManager = DataManager.create({
            data: options.data,
        })
        this.loadingManager = LoadingManager.create()
        this.subscriptionsManager = SubscriptionManager.create({
            subscriptions: options.subscriptions || [],
            loadingManager: this.loadingManager
        })
        this.futureManager = FutureManager.create({
            futures: options.futures || [],
            futureLoops: options.futureLoops || [],
            loadingManager: this.loadingManager
        })
        this.snapshotManager = SnapshotManager.create(options)
    }

    setLoaded() {
        this.loadingManager.setLoaded()
    }

}