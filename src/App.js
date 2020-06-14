import React, { Component } from "react";

import Table from "./Table.js";
import Player from "./Player.js";

import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

import Controller from "./Controller.js";
import PlaylistGenerator from "./PlaylistGenerator";

const authEndpoint = "https://accounts.spotify.com/authorize";

const clientId = "78fffce2862d4584bcb9eb68d18fbad1";
const redirectUri = "http://localhost:3000";
const scopes = [
  "user-read-currently-playing",
  "user-read-playback-state",
  "user-modify-playback-state",
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-library-read",
  "user-library-modify",
  "playlist-read-private",
  "playlist-read-collaborative",
];

const PLAYLIST_SIZE = 20;

// Get the hash of the url
const hashmap = window.location.hash
  .substring(1)
  .split("&")
  .reduce(function (initial, item) {
    if (item) {
      var parts = item.split("=");
      initial[parts[0]] = decodeURIComponent(parts[1]);
    }
    return initial;
  }, {});

window.location.hash = "";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.wrapper = React.createRef();

    window.onSpotifyWebPlaybackSDKReady = () => {
      const token = hashmap.access_token;
      this.player = new window.Spotify.Player({
        name: "Playlist Scrambler Player",
        getOAuthToken: (cb) => {
          cb(token);
        },
      });

      // Error handling
      this.player.addListener("initialization_error", ({ message }) => {
        console.error(message);
      });
      this.player.addListener("authentication_error", ({ message }) => {
        console.error(message);
      });
      this.player.addListener("account_error", ({ message }) => {
        console.error(message);
      });
      this.player.addListener("playback_error", ({ message }) => {
        console.error(message);
      });

      // Playback status updates
      this.player.addListener("player_state_changed", (state) => {
        this.setState({ playerState: state });
      });

      // Ready
      this.player.addListener("ready", ({ device_id }) => {
        this.deviceId = device_id;
        console.log("Ready with Device ID", device_id);
      });

      // Not Ready
      this.player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });

      // Connect to the player!
      this.player.connect();
    };
  }

  componentDidMount() {
    // Set token
    let _token = hashmap.access_token;
    if (_token) {
      axios.defaults.headers.common["Authorization"] = "Bearer " + _token;
      this.token = _token;
      this.fetchUserData(_token);
    } else {
      window.location.href = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
        "%20"
      )}&response_type=token`;
    }
  }

  fetchUserData = (token) => {
    axios("https://api.spotify.com/v1/me")
      .then((result) => this.fetchPlaylists(result.data.id))
      .catch((error) => error);
  };

  fetchPlaylists = (userid) => {
    axios(`https://api.spotify.com/v1/users/${userid}/playlists?limit=50`)
      .then((result) => this.setInitialList(result.data.items))
      .catch((error) => error);
  };

  setInitialList = (items) => {
    const playListArray = items.map(({ id, name, tracks, images }) => ({
      id: id,
      name: name,
      tracksCount: tracks.total,
      image: images[0],
      checked: false,
    }));
    this.setState({ playListArray });
  };

  selectPlayList = (playList) => {
    playList.checked = !playList.checked;
    const selectedPlaylistArray = this.state.playListArray.filter(
      (playlist) => playlist.checked
    );
    this.setState({ selectedPlaylistArray });
  };

  playSomeMusic = (trackList) => {
    const randomTrackUriList = trackList.map((item) => item.track.uri);
    console.log("random track list: " + trackList);
    this.randomTrackList = trackList;
    axios
      .put(
        `https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`,
        {
          uris: randomTrackUriList,
        }
      )
      .then((result) => this.setPlayerState())
      .catch((error) => error);
  };

  generateRandomizedPlaylist = (numberOfTracks) => {
    const playListGenerator = new PlaylistGenerator(this.token);
    playListGenerator.generateRandomizedPlaylist(
      this.state.selectedPlaylistArray,
      numberOfTracks,
      this.playSomeMusic
    );
  };

  render() {
    if (!this.state.playListArray) {
      return null;
    }
    const generateButtonEnabled =
      this.state.selectedPlaylistArray &&
      this.state.selectedPlaylistArray.length > 0;

    return (
      <div className="App">
        <div>
          <h1>PLAYLIST SCRAMBLER</h1>
        </div>
        <div>
          <div style={{ width: "50%", margin: "0 auto", padding: "20px" }}>
            <Controller
              generateButtonEnabled={generateButtonEnabled}
              generateRandomizedPlaylistMethod={this.generateRandomizedPlaylist}
            />
            <Table
              data={this.state.playListArray}
              onClickCallBack={this.selectPlayList}
              playerState={this.state.playerState}
            />
            <div></div>
            <Player
              playerState={this.state.playerState}
              randomTrackList={this.randomTrackList}
              deviceId={this.deviceId}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
