import { io } from "socket.io-client";
import pkg from 'fast-json-patch';
import { Socket } from "socket.io";
const { applyOperation, observe, generate } = pkg;

import { config } from 'dotenv'
config()
const apiKey = process.env.API_KEY
const appId = process.env.APP_ID

let port = process.argv[2] || 3000

const socket = io("ws://localhost:" + port, { forceNew: true });

const name = "first-app-10"
const password = "none"

let model = {
    counter: 0
}

let observer = observe(model)

function notifyChange() {
    let patches = generate(observer)
    socket.emit('patch', patches).wa
}

function increment() {
    model.counter += 1
        //notifyChange()
    console.log("New counter value: " + model.counter)
}

/*
socket.on('completed-restore', () => {
    socket.emit('completed-restore')
})

socket.on('future-restore', (id) => {
    //console.log("received future command with Time = " + Date.now())
    increment()
    socket.emit('future-restore-ack')
})

socket.on('event', (scope, event, data) => {
    console.log("Event received = " + scope + " : " + event + " : " + data)
    if (scope == 'counter' && event == 'increment') {
        model.counter += 1
        notifyChange()
        console.log("New counter value: " + model.counter)
    }
})
*/

socket.on('future', (id) => {
    increment()
})


socket.on('ready', (data) => {
    model = data
    observer = observe(model)
    console.log("READY WITH MODEL = " + JSON.stringify(model) + " with Time = " + Date.now())
})


socket.emit('join', apiKey, appId, name, password, model, [{ id: 'aa', time: 1000 }])