import {BEAM_AUTH_TOKEN} from '$env/static/private'
import { json } from '@sveltejs/kit'

export async function POST({ request }) {

    const req = await request.json()

    return fetch("https://sqwi2.apps.beam.cloud", {
        "method": "POST",
        "headers": {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate",
            "Authorization": "Basic " + BEAM_AUTH_TOKEN + "=",
            "Content-Type": "application/json"
        },
        "body": JSON.stringify(req)
    })
    .then(response => response.text())
    .then(text => json(text))
    .catch(console.error("New image POST request error"))     
}

export async function GET({ url }) {

     const task = url.searchParams.get('task')

     if(task) {
        return fetch("https://api.beam.cloud/v1/task/" + task + "/status/", {
                "method": "GET",
                "headers": {
                    "Authorization": "Basic " + BEAM_AUTH_TOKEN + "=",
                    "Content-Type": "application/json"
            },
        })
        .then(response => response.text())
        .then(text => {
            return json(text)
        })
        .catch(err => {})
     } else {
        return json('Please specify a task')
     }
}