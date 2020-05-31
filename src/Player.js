import React, { Component } from "react";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";

import axios from "axios";

class Player extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.startResumePlayback = this.startResumePlayback.bind(this);
  }

  startResumePlayback() {
    axios
      .put(`https://api.spotify.com/v1/me/player/play`, {
        device_id: this.props.deviceId,
      })
      .then()
      .catch((error) => error);
  }

  pausePlayback() {
    axios
      .put(`https://api.spotify.com/v1/me/player/pause`, {
        device_id: this.props.deviceId,
      })
      .then()
      .catch((error) => error);
  }

  skipToNextPlayback() {
    axios
      .post(`https://api.spotify.com/v1/me/player/next`, {
        device_id: this.props.deviceId,
      })
      .then()
      .catch((error) => error);
  }

  skipToPreviousPlayback() {
    axios
      .post(`https://api.spotify.com/v1/me/player/previous`, {
        device_id: this.props.deviceId,
      })
      .then()
      .catch((error) => error);
  }

  render() {
    if (this.props.playerState) {
      let button;
      if (this.props.playerState.paused) {
        button = (
          <Button variant="primary" onClick={() => this.startResumePlayback()}>
            Play
          </Button>
        );
      } else {
        button = (
          <Button variant="primary" onClick={() => this.pausePlayback()}>
            Pause
          </Button>
        );
      }
      return (
        <div>
          <table>
            <tbody>
              <tr>
                <td>
                  <Card>
                    <Card.Img
                      variant="top"
                      src={
                        this.props.playerState.track_window.current_track.album
                          .images[0].url
                      }
                    />
                    <Card.Body>
                      <Card.Title>
                        {this.props.playerState.track_window.current_track.name}
                      </Card.Title>
                      <Button
                        variant="primary"
                        onClick={() => this.skipToPreviousPlayback()}
                      >
                        {" "}
                        &lt;&lt;{" "}
                      </Button>
                      {button}
                      <Button
                        variant="primary"
                        onClick={() => this.skipToNextPlayback()}
                      >
                        {" "}
                        &gt;&gt;{" "}
                      </Button>
                    </Card.Body>
                  </Card>
                </td>
                <td>
                  <ListGroup>
                    {this.props.randomTrackList.map((item) => {
                      return (
                        <ListGroup.Item key={item.track.uri}>
                          {item.track.album.name} - {item.track.name}
                        </ListGroup.Item>
                      );
                    })}
                  </ListGroup>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    return null;
  }
}

export default Player;
