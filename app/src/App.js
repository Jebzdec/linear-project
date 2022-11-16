import "./App.css"
import React, { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "@material-ui/core"
import { CircularProgressbar } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
const App = () => {
  var Spotify = require("spotify-web-api-js")
  var spotifyApi = new Spotify()
  const [token, setToken] = useState("")
  const [analysis, setIsAnalysis] = useState(false)
  const getToken = async () => {
    await axios
      .get("https://linear-spotify-api.herokuapp.com/token", {
        crossdomain: true,
      })
      .then((response) => {
        setToken(response.data)
        spotifyApi.setAccessToken(response.data)
      })
  }
  const defaultPop = 26.747
  const [isLoading, setIsLoading] = useState("")
  const [url, setUrl] = useState("")
  const [artist, setArtist] = useState({ id: "", name: "", pop: "" })
  const [track, setTrack] = useState({
    name: "",
    energy: "",
    valence: "",
    duration_ks: "",
    pop: "",
  })
  const [fail, setFail] = useState(false)

  const handleClick = async (analysis) => {
    setIsAnalysis(analysis)
    if (analysis) {
      setIsLoading(true)
    }
  }

  useEffect(() => {
    var ur = url.substring(31, 53)
    if (analysis) {
      spotifyApi
        .getTrack(ur)
        .then(function (data) {
          var art = []
          for (let i = 0; i < data.artists.length; i++)
            art.push(data.artists[i].id)
          setTrack({ name: data.name })
          setArtist({ id: art })
        })
        .then(() => {
          spotifyApi.getAudioFeaturesForTracks(ur).then(function (data) {
            var d = data.audio_features[0]
            setTrack((prev) => ({
              ...prev,
              energy: d.energy,
              valence: d.valence,
              duration_ks: d.duration_ms / 10 ** 6,
            }))
          })
          setFail(false)
        })
        .catch((err) => {
          setIsLoading(false)
          setFail(true)
          setTrack("")
          setArtist("")
        })

      setIsAnalysis(false)
    }
  }, [analysis])

  useEffect(() => {
    if (artist.id) {
      var Name = new Array(artist.id.length)
      var Pop = 0
      for (let i = 0; i < artist.id.length; i++) {
        spotifyApi
          .getArtist(artist.id[i])
          .then(function (data) {
            Name[i] = data.name
            Pop = Math.max(data.popularity, Pop)
            // console.log(i, data.name, data.popularity)
          })
          .then(() => {
            var ListName = ""
            for (var i = 0; i < Name.length; i++) {
              // console.log(Name[i])
              ListName += Name[i]
              if (ListName.length > 0 && i != Name.length - 1) ListName += " , "
            }
            // console.log(Name)
            setArtist((prev) => ({
              ...prev,
              name: ListName,
              pop: Pop,
            }))
          })
      }

      setArtist({ id: "" })
    }
  }, [artist.id])

  useEffect(() => {
    if (artist.pop) {
      setTrack((prev) => ({
        ...prev,
        pop: (
          26.747 +
          0.655 * artist.pop -
          8.746 * track.energy +
          4.476 * track.valence -
          1.27 * track.duration_ks
        ).toFixed(2),
      }))
    }
  }, [artist.pop, track.energy, track.valence, track.duration_ks])

  useEffect(() => {
    if (track.pop > defaultPop) setIsLoading(false)
  }, [track.pop])

  return isLoading == false ? (
    <div className="App">
      <div style={{ width: "30vw" }}></div>
      <div className="content">
        <div>
          <h2>Enter url track:</h2>
        </div>
        <input
          style={{ width: "50vh", height: "20px" }}
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <div>{fail ? <div id="fail">try again</div> : <div></div>}</div>
        <Button
          style={{ height: "40px" }}
          color="secondary"
          variant="contained"
          type="submit"
          onClick={async () => {
            await getToken()
            await handleClick(true)
          }}
        >
          Analysis
        </Button>
        <div id="body">
          <div id="value">
            <div>Song : {track.name}</div>
            <div>Artist : {artist.name}</div>
            <div>Artist pop : {artist.pop}</div>
            <div>energy : {track.energy}</div>
            <div>valence : {track.valence}</div>
            <div>duration_ks : {track.duration_ks}</div>
            <div>track pop : {track.pop}</div>
          </div>

          <div
            style={{
              width: 180,
              height: 180,
            }}
          >
            <CircularProgressbar
              styles={{
                path: {
                  stroke: "#ff0050",
                },
                text: {
                  fill: "#ff0050",
                  fontSize: "16px",
                },
              }}
              value={track.pop}
              text={`${track.pop}%`}
            />
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="loader-container">
      <div className="spinner"></div>
    </div>
  )
}

export default App
