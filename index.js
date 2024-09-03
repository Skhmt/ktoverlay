// const uws = require('uWebSockets.js/uws')
import uws from 'uWebSockets.js'
import fs from 'node:fs'
const port = 8702
const controlFile = 'public/index.html'
const overlayFile = 'public/overlay.html'

let state = {
    p1name: '',
    p1team: '',
    p1vp: '',
    p1cp: '',
    p1taco: '',
    p2name: '',
    p2team: '',
    p2vp: '',
    p2cp: '',
    p2taco: '',
    mission: '',
    tp: '',
}

uws.App()
    .get('/overlay', (res) => {
        res.end(fs.readFileSync(overlayFile))
    })
    .get('/', (res) => {
        res.end(fs.readFileSync(controlFile))
    })
    .ws('/*', {
        open(ws) {
            console.log('ws connected')
            ws.subscribe('state')
            ws.send(JSON.stringify(state))
        },
        message(ws, message, isBinary) {
            if (message && !isBinary) {
                const txt = new TextDecoder().decode(message)
                try {
                    state = {...state, ...JSON.parse(txt)}
                    ws.publish('state', JSON.stringify(state))
                    console.log(state)
                } catch (e) {
                    console.error(`Received message ("${txt}") was not recognized as .json`)
                }
            }
        },
        drain(ws) {
            // doing nothing
        },
        close(ws, code, message) {
        console.log('ws disconnected')
        },
    })
    .listen(port, (token) => {
        if (token) {
            console.log(`Overlay: localhost:${port}/overlay`)
            console.log(`Controller: localhost:${port}`)
            console.log('Ctrl+C to exit')
        }
        else {
            console.log('Failed to listen to port ' + port)
        }
    })