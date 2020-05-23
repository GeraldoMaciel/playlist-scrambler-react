import React, { Component } from "react";

import logo from "./logo.svg";
import "./App.css";
import axios from 'axios';
import DualListBox from 'react-dual-listbox';
import 'react-dual-listbox/lib/react-dual-listbox.css';


export const authEndpoint = 'https://accounts.spotify.com/authorize';
// Replace with your app's client ID, redirect URI and desired scopes
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
  "playlist-read-private"
];
// Get the hash of the url
const hashmap = window.location.hash
  .substring(1)
  .split("&")
  .reduce(function(initial, item) {
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
	        this.state = {selectedList: []};
	        
	        this.fetchUserData = this.fetchUserData.bind(this);
	        this.fetchPlaylists = this.fetchPlaylists.bind(this);
	        this.setInitialList = this.setInitialList.bind(this);
	        this.onChangeSelectedList = this.onChangeSelectedList.bind(this);
	        this.generateRandomizedPlaylist = this.generateRandomizedPlaylist.bind(this);
	        this.spreadFunction = this.spreadFunction.bind(this);
	        this.playSomeMusic = this.playSomeMusic.bind(this);
	        
   
	    }
	
  componentDidMount() {
    // Set token
    let _token = hashmap.access_token;
    if (_token) {
    	
    	axios.defaults.headers.common['Authorization'] = 'Bearer '+ _token;    	
    	this.token = _token;
    	this.fetchUserData(_token);
    	    	      
    }else{    	
    	 window.location.href = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&response_type=token&show_dialog=true`;    	
    }
    
  }
  
  fetchUserData(token) {
      axios("https://api.spotify.com/v1/me")
      .then(result =>  this.fetchPlaylists(result.data.id))
      .catch(error => error);
  }
  
  fetchPlaylists(userid){
	  axios(`https://api.spotify.com/v1/users/${userid}/playlists`)
      .then(result =>  this.setInitialList(result.data.items))
      .catch(error => error);
  }
  
  setInitialList(items){
	  let initialList = items.map(({id,name, tracks}) =>  ({value: id, label: name , tracksCount: tracks.total}));
	  console.log(initialList);
      this.setState({initialList});
  }
  
  onChangeSelectedList = (selectedList) => {
      this.setState({ selectedList });
  };
  
  generateRandomizedPlaylist(){
	
	  let promiseArr = this.state.selectedList.map( (playlistid) => this.getPlaylistItems(playlistid));
	  
	  axios.all(promiseArr)
      .then(axios.spread(this.spreadFunction))
      .catch(error => error);
  }
  
  
  spreadFunction(...res) {
	  console.log(res);
	  let totalTracks = res.reduce( function (alltracks , thisPlaylisttracks) {    		   
		 return  alltracks.concat(thisPlaylisttracks.data.items); 
		  } , [] );
	      	  
	  var randomTrackList = [];   	  
	  for (let i=0 ; i < 5 ; i++){
		  randomTrackList.push(totalTracks[Math.floor(Math.random() * totalTracks.length)].track.uri)
	  }
	  	
	  console.log(randomTrackList);
	//  this.setState({ randomTrackList });
	  
	  
	  axios('https://api.spotify.com/v1/me/player')
      .then(result =>  this.playSomeMusic(result.data.device.id , randomTrackList))
      .catch(error => error);
  }      
    
  getPlaylistItems(playlistId){
	  return axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`);
  }
  
  playSomeMusic(deviceid, trackList){
	  axios.put(`https://api.spotify.com/v1/me/player/play?device_id=${deviceid}` , { uris : trackList })
	  .then(result => console.log(result))
	  .catch(error => error);
  }
  
  
render() {
	 if (!this.state.initialList){
		 return null;
	 }	
	 
	
	 let response;
	 
	 if (!this.state.randomTrackList){
		response =		 
				 <div className="App"><div><h1>PLAYLIST SCRAMBLER</h1></div>
		         <div className="container"> <DualListBox options={this.state.initialList} selected={this.state.selectedList} onChange={this.onChangeSelectedList}/>
		         <button type="button" disabled={this.state.selectedList.length === 0} onClick={() => this.generateRandomizedPlaylist()}> Generate randomized playlist </button>
		         </div></div>
		         
	 }else{
	    response = 
			  <h1>lalaal</h1>
			  	  
			  
	}
	 
	 return response;
	 
  }
  
  
}


export default App;