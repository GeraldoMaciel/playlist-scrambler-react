import React, { Component } from "react";
import Button from 'react-bootstrap/Button';
import Table from './Table.js';
import Player from './Player.js';



import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
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
		let playListArray = items.map(({ id, name, tracks, images }) => ({ id: id, name: name, tracksCount: tracks.total, image: images[0], checked: false }));
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
		this.randomTrackList = res.reduce( function (alltracks , thisPlaylisttracks) {
			alltracks.push(thisPlaylisttracks.data.items[0]);		   
		    return  alltracks; 
			} , [] );

		

		const randomTrackUriList = this.randomTrackList.map(item =>  item.track.uri);
		

		this.playSomeMusic(this.deviceId , randomTrackUriList)									  
	} 

	getPlaylistItem(playListId, trackIndex){
		return axios.get(`https://api.spotify.com/v1/playlists/${playListId}/tracks?limit=1&offset=${trackIndex}`);
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
		const generateButtonEnabled = this.state.selectedPlaylistArray && this.state.selectedPlaylistArray.length > 0;
		let button;
		if(generateButtonEnabled){
			button = <Button size="lg" onClick={() => this.generateRandomizedPlaylist()} block>Generate randomized playlist</Button>
		}else{
			button = <Button size="lg" variant="secondary" disabled block>Generate randomized playlist</Button>
		}

		return (
			<div className="App">
				<div><h1>PLAYLIST SCRAMBLER</h1></div>
				<div>
					<div style={{width : '30%' , margin: '0 auto' , padding: '20px'}}> 
						{button}

						<Table data={this.state.playListArray} onClickCallBack={this.selectPlayList} />
						
					<div>
					</div>
						<Player playerState={this.state.playerState} randomTrackList={this.randomTrackList} deviceId={this.deviceId}  />				
					</div>
				</div>
			</div>
			

		)


	}


}



export default App;