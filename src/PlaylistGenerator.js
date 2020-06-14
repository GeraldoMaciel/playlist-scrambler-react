import axios from "axios";

class PlaylistGenerator {
  constructor(token) {
    axios.defaults.headers.common["Authorization"] = "Bearer " + token;
  }

  generateRandomizedPlaylist = (
    selectedPlaylistArray,
    numberOfTracks,
    callBack
  ) => {
    const spreadFunction = (...res) => {
      let randomTrackList = res.reduce(function (
        alltracks,
        thisPlaylisttracks
      ) {
        alltracks.push(thisPlaylisttracks.data.items[0]);
        return alltracks;
      },
      []);

      callBack(randomTrackList);
    };

    const mapPlaylistTrack = new Map();
    let trackCount = 0;

    while (trackCount < numberOfTracks) {
      const randomPlaylist =
        selectedPlaylistArray[
          this.getRandomIntFromZeroToMax(selectedPlaylistArray.length)
        ];
      const randomTrackIndexInPlaylist = this.getRandomIntFromZeroToMax(
        randomPlaylist.tracksCount
      );

      let playListArray;
      if (mapPlaylistTrack.has(randomPlaylist.id)) {
        playListArray = mapPlaylistTrack.get(randomPlaylist.id);
      } else {
        playListArray = [];
        mapPlaylistTrack.set(randomPlaylist.id, playListArray);
      }

      if (!playListArray.includes(randomTrackIndexInPlaylist)) {
        playListArray.push(randomTrackIndexInPlaylist);
        trackCount++;
      }
    }

    const promiseArr = [];
    for (let entry of mapPlaylistTrack) {
      const playListId = entry[0];
      for (let trackIndex of entry[1]) {
        promiseArr.push(this.getPlaylistItem(playListId, trackIndex));
      }
    }

    axios
      .all(promiseArr)
      .then(axios.spread(spreadFunction))
      .catch((error) => error);
  };

  getPlaylistItem = (playListId, trackIndex) => {
    return axios.get(
      `https://api.spotify.com/v1/playlists/${playListId}/tracks?limit=1&offset=${trackIndex}`
    );
  };

  getRandomIntFromZeroToMax = (maxInt) => {
    return Math.floor(Math.random() * maxInt);
  };
}

export default PlaylistGenerator;
