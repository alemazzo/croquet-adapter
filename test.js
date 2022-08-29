import * as Croquet from '@croquet/croquet'
import { config } from 'dotenv'
config()
const apiKey = process.env.API_KEY
const appId = process.env.APP_ID

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

const name = process.argv[2] || "nonameadsads";
const password = process.argv[3] || "nopassword";

Croquet.Session.join({
    apiKey: apiKey,
    appId: appId,
    name,
    password,
    step: "manual",
    model: MyModel,
    debug: "snapshot",
    options: {
        func: function() {
            console.log("A")
        }
    }
}).then(({ id, model, view, step, leave }) => {
    console.log("COUNTER AFTER JOIN = " + model.data.counter)
    view.subscribe("counter", "update", () => {
        console.log(model.data.counter)
    });
});