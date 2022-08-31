import * as Croquet from '@croquet/croquet'
import { config } from 'dotenv'
import { Channels } from './src/config/channels.js'
import { DataManager } from './src/model/data/data-manager.js'
import { DynamicModel } from './src/model/dynamic-model.js'
import { FutureManager } from './src/model/future/future-manager.js'
import { Future } from './src/model/future/future.js'
import { LoadingManager } from './src/model/loading/loading-manager.js'
import { SnapshotManager } from './src/model/snapshot/snapshot-manager.js'
import { Channel } from './src/model/subscriptions/channel.js'
import { Event } from './src/model/subscriptions/events.js'
import { SubscriptionManager } from './src/model/subscriptions/subscription-manager.js'
config()
const apiKey = process.env.API_KEY
const appId = process.env.APP_ID

/*
class MyModel extends Croquet.Model {

    init(options) {
        this.data = {
            counter: 0
        };
        this.future(1000).tick();
    }

    tick() {
        this.data.counter++;
        this.publish("counter", "update");
        this.future(1000).tick();
    }

}
MyModel.register("MyModel");
*/
const name = process.argv[2] || "nonameadsads";
const password = process.argv[3] || "nopassword";

DataManager.register("DataManager")
LoadingManager.register("LoadingManager")
SubscriptionManager.register("SubscriptionManager")
FutureManager.register("FutureManager")
SnapshotManager.register("SnapshotManager")
DynamicModel.register("DynamicModel");


Croquet.Session.join({
    apiKey: apiKey,
    appId: appId,
    name,
    password,
    step: "manual",
    model: DynamicModel,
    debug: "snapshot",
    options: {
        subscriptions: [
            new Channel("test", "test")
        ],
        futures: [
            new Future("future", 500),
        ],
        futureLoops: [
            new Future("futureLoop", 1000),
        ]
    }
}).then(({ id, model, view, step, leave }) => {
    console.log("Start = ")
    let futureTickChannel = Channels.Future.tick
    let eventsChannel = Channels.Events.event
    view.subscribe(eventsChannel.scope, eventsChannel.event, (event) => {
        console.log("Event = " + JSON.stringify(event))
    })
    view.subscribe(futureTickChannel.scope, futureTickChannel.event, (future) => {
        console.log("Tick for future: " + JSON.stringify(future))
    });
    model.setLoaded()
    setInterval(() => {
        view.publish("test", "test", Event("test", "test", "test"))
    }, 2000)
});