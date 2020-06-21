import React, { Component } from "react";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "react-bootstrap/Image";

import axios from "axios";

class Player extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  startResumePlayback = () => {
    axios
      .put(`https://api.spotify.com/v1/me/player/play`, {
        device_id: this.props.deviceId,
      })
      .then()
      .catch((error) => error);
  };

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
      const style = {
        maxHeight: "480px",
        overflowY: "auto",
      };
      return (
        <Container>
          <Row>
            <Col>
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
            </Col>
            <Col>
              <ListGroup style={style}>
                {this.props.randomTrackList.map((track) => {
                  return (
                    <ListGroup.Item key={track.uri}>
                      <table>
                        <tbody>
                          <tr>
                            <td>
                              {" "}
                              <Image
                                src={track.album.images[2].url}
                                roundedCircle
                              />
                            </td>
                            <td>
                              {track.name}- {track.album.name}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            </Col>
          </Row>
        </Container>
      );
    }

    return null;
  }
}

export default Player;
