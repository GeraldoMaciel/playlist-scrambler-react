import React, { Component } from "react";


import logo from "./logo.svg";
import "./App.css";
import axios from 'axios';



const authEndpoint = 'https://accounts.spotify.com/authorize';

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
	"playlist-read-collaborative"
];

const PLAYLIST_SIZE = 10;

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
		this.state = { };

		

		this.fetchUserData = this.fetchUserData.bind(this);
		this.fetchPlaylists = this.fetchPlaylists.bind(this);
		this.setInitialList = this.setInitialList.bind(this);
		this.generateRandomizedPlaylist = this.generateRandomizedPlaylist.bind(this);
		this.selectPlayList = this.selectPlayList.bind(this);
		this.spreadFunction = this.spreadFunction.bind(this);
		this.playSomeMusic = this.playSomeMusic.bind(this);
		

		window.onSpotifyWebPlaybackSDKReady = () => {
			const token = hashmap.access_token;
			this.player = new window.Spotify.Player({
			  name: 'Playlist Scrambler Player',
			  getOAuthToken: cb => { cb(token); }
			});
		  
			// Error handling
			this.player.addListener('initialization_error', ({ message }) => { console.error(message); });
			this.player.addListener('authentication_error', ({ message }) => { console.error(message); });
			this.player.addListener('account_error', ({ message }) => { console.error(message); });
			this.player.addListener('playback_error', ({ message }) => { console.error(message); });
		  
			// Playback status updates
			this.player.addListener('player_state_changed', state => { this.setState({playerState : state}) });
		  
			// Ready
			this.player.addListener('ready', ({ device_id }) => {
			  this.deviceId = device_id;
			  console.log('Ready with Device ID', device_id);
			});
		  
			// Not Ready
			this.player.addListener('not_ready', ({ device_id }) => {
			  console.log('Device ID has gone offline', device_id);
			});
		  
			// Connect to the player!
			this.player.connect();
		  };


	}



	componentDidMount() {
		// Set token
		let _token = hashmap.access_token;
		if (_token) {

			axios.defaults.headers.common['Authorization'] = 'Bearer ' + _token;
			this.token = _token;
			this.fetchUserData(_token);

		} else {
			window.location.href = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&response_type=token`;
		}

	}

	fetchUserData(token) {
		axios("https://api.spotify.com/v1/me")
			.then(result => this.fetchPlaylists(result.data.id))
			.catch(error => error);
	}

	fetchPlaylists(userid) {
		axios(`https://api.spotify.com/v1/users/${userid}/playlists?limit=50`)
			.then(result => this.setInitialList(result.data.items))
			.catch(error => error);
	}

	setInitialList(items) {
		let playListArray = items.map(({ id, name, tracks }) => ({ id: id, name: name, tracksCount: tracks.total, checked: false }));
		this.setState({ playListArray });
	}

	selectPlayList(playList){
		playList.checked = !playList.checked;
		const selectedPlaylistArray = this.state.playListArray.filter(playlist => playlist.checked);
		this.setState({selectedPlaylistArray});
	}


	generateRandomizedPlaylist(){

		const mapPlaylistTrack = new Map();
		let trackCount = 0;
		
		while (trackCount < PLAYLIST_SIZE){
			const randomPlaylist = this.state.selectedPlaylistArray[this.getRandomIntFromZeroToMax(this.state.selectedPlaylistArray.length)];
			const randomTrackIndexInPlaylist = this.getRandomIntFromZeroToMax(randomPlaylist.tracksCount);

			let playListArray;
			if (mapPlaylistTrack.has(randomPlaylist.id)){
				playListArray = mapPlaylistTrack.get(randomPlaylist.id);
			}else{
				playListArray = [];
				mapPlaylistTrack.set(randomPlaylist.id ,playListArray );
			}

			if (!playListArray.includes(randomTrackIndexInPlaylist)){
				playListArray.push( randomTrackIndexInPlaylist );
				trackCount ++;
			}
	
		}

		const promiseArr = [];
		for (let entry of mapPlaylistTrack) {
			const playListId = entry[0];
			for (let trackIndex of entry[1]){
				promiseArr.push(this.getPlaylistItem(playListId,trackIndex));
			}
		}		

		axios.all(promiseArr)
		.then(axios.spread(this.spreadFunction))
		.catch(error => error);

		
		
	}

	spreadFunction(...res) {
		let randomTrackList = res.reduce( function (alltracks , thisPlaylisttracks) {
			alltracks.push(thisPlaylisttracks.data.items[0].track.uri);		   
		    return  alltracks; 
			} , [] );

			this.playSomeMusic(this.deviceId , randomTrackList)									  
	} 

	getPlaylistItem(playListId, trackIndex){
		return axios.get(`https://api.spotify.com/v1/playlists/${playListId}/tracks?limit=1&offset=${trackIndex}&fields=items(track(uri))`);
	}

	
	getRandomIntFromZeroToMax(maxInt){
		return Math.floor(Math.random() * (maxInt));
	}
	
  
	
	playSomeMusic(deviceid, trackList){
		axios.put(`https://api.spotify.com/v1/me/player/play?device_id=${deviceid}` , { uris : trackList })
		.then(result => this.setPlayerState())
		.catch(error => error);
	}






	render() {
		if (!this.state.playListArray) {
			return null;
		}

		return (
			<div className="App">
				<div><h1>PLAYLIST SCRAMBLER</h1></div>
				<div className="container"> 
					<Table data={this.state.playListArray} onClickCallBack={this.selectPlayList} />
					<button type="button" disabled={!this.state.selectedPlaylistArray || this.state.selectedPlaylistArray.length < 1}  
						onClick={() => this.generateRandomizedPlaylist()}> Generate randomized playlist </button>
				<div>
			</div>
			</div>
				<Player playerState={this.state.playerState} />				
			</div>

		)


	}


}

function Player({playerState}){
	if (playerState){
		return (
		<div>
		<div>Now Playing: {playerState.track_window.current_track.name}</div>
		Next:
		{playerState.track_window.next_tracks.map(webtrack => webtrack.name )}
			
		</div>
			
		)
	}

	return null;
}

function Table({ data, onClickCallBack }) {

	

	const uncheckStyle = {
		padding: '10px',
		border: 'solid 1px gray',
		background: 'papayawhip',
	}

	const checkStyle = {
		padding: '10px',
		border: 'solid 1px gray',
		background: 'red',
	}

	return (<table style={{ border: 'solid 1px blue' }}>
		<thead>
			<tr >
				<th
					style={{
						borderBottom: 'solid 3px red',
						background: 'aliceblue',
						color: 'black',
						fontWeight: 'bold',
					}}
				>
					Playlist
	               </th>
			</tr>
		</thead>
		<tbody >
			{data.map(row => {
				return (
					<tr key={row.id} onClick={() => onClickCallBack(row)}>
						<td style={row.checked ?checkStyle : uncheckStyle }>
						{row.name}
						</td>
					</tr>
				)
			})}
		</tbody>
	</table>
	)

}


export default App;