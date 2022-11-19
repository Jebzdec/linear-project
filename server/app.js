var express = require("express")
var cors = require("cors")
var request = require("request")
var app = express()

require("dotenv").config()
app.use(cors())
app.set("port", process.env.PORT || 3000)

app.get("/token", function (req, resp) {
  resp.header("Access-Control-Allow-Origin", "*")
  resp.header("Access-Control-Allow-Headers", "X-Requested-With")

  var client_id = "4857ae04711841ba9f7e9558fca98d99"
  var client_secret = "9ef5eca8902949898f6694d4a27a601a"

  var refresh_token = req.query.refresh_token
  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(client_id + ":" + client_secret).toString("base64"),
    },
    form: {
      grant_type: "client_credentials",
      refresh_token: refresh_token,
    },
    json: true,
  }

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      resp.send(body.access_token)
    }
  })
})

app.listen(app.get("port"), function () {
  console.log("Node app is running on port", app.get("port"))
})
