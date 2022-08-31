import { Channel } from "../model/subscriptions/channel.js";

export class Channels {

    static Future = {
        tick: new Channel("future", "tick")
    }

    static Events = {
        applicationReady: new Channel("events", "application-ready"),
        event: new Channel("events", "event"),
        localEvent: new Channel("events", "localEvent")
    }

}