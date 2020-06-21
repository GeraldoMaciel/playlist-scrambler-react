import axios from "axios";

class PlaylistGenerator {
  constructor(token) {
    axios.defaults.headers.common["Authorization"] = "Bearer " + token;
  }

  async generateRandomizedPlaylist(
    selectedPlaylistArray,
    generationConfig,
    callBack
  ) {
    console.log(generationConfig);

    let checkNewPlaylistGenerationFinished = null;
    let runTrackAcceptance = null;
    let trackCount = 0;
    let totalPlaylistTime = 0;
    let loopCount = 0;
    const generatedPlayList = [];

    if (generationConfig.numberOfTracksBasedGenetarion) {
      checkNewPlaylistGenerationFinished = () => {
        return (
          trackCount === generationConfig.numberOfTracks || loopCount > 100
        );
      };

      runTrackAcceptance = (track) => {
        trackCount++;
        totalPlaylistTime = totalPlaylistTime + track.duration_ms;
        generatedPlayList.push(track);
      };
    } else {
      checkNewPlaylistGenerationFinished = () => {
        return (
          Math.abs(totalPlaylistTime - generationConfig.duration * 60000) <
            60000 || loopCount > 100
        );
      };

      runTrackAcceptance = (track) => {
        const newDuration = totalPlaylistTime + track.duration_ms;
        if (generationConfig.duration * 60000 - newDuration > -60000) {
          totalPlaylistTime = newDuration;
          trackCount++;
          generatedPlayList.push(track);
        }
      };
    }

    const mapPlaylistTrack = new Map();

    while (!checkNewPlaylistGenerationFinished()) {
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
        const result = await axios.get(
          `https://api.spotify.com/v1/playlists/${randomPlaylist.id}/tracks?limit=1&offset=${randomTrackIndexInPlaylist}`
        );
        console.log(result);
        runTrackAcceptance(result.data.items[0].track);
      }
      loopCount++;
    }

    console.log(
      `playlist generation finished. totalTrackCount: ${trackCount} , totalDuration: ${totalPlaylistTime}`
    );
    callBack(generatedPlayList);
  }

  getRandomIntFromZeroToMax = (maxInt) => {
    return Math.floor(Math.random() * maxInt);
  };
}

export default PlaylistGenerator;
