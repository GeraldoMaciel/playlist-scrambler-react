import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";

class Controller extends Component {
  constructor(props) {
    super(props);
    this.state = {
      numberOfTracksBasedGenetarion: true,
      durationBasedGeneration: false,
      numberOfTracks: 20,
      duration: 30,
    };
  }

  toggleTypeOfGeneration = () => {
    const numberOfTracksBasedGenetarion = !this.state
      .numberOfTracksBasedGenetarion;
    const durationBasedGeneration = !this.state.durationBasedGeneration;
    this.setState({ numberOfTracksBasedGenetarion, durationBasedGeneration });
  };

  setTrackNumber = (event) => {
    this.setState({ numberOfTracks: event.target.value });
  };

  setDuration = (event) => {
    this.setState({ duration: event.target.value });
  };

  render() {
    const {
      generateButtonEnabled,
      generateRandomizedPlaylistMethod,
    } = this.props;
    return (
      <Container>
        <Row>
          {" "}
          <Col>
            <Button
              size="lg"
              onClick={() =>
                generateRandomizedPlaylistMethod(this.state.numberOfTracks)
              }
              disabled={!generateButtonEnabled}
              block
            >
              Generate randomized playlist
            </Button>
          </Col>
        </Row>
        <Row>
          {" "}
          <Col>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Checkbox
                  checked={this.state.numberOfTracksBasedGenetarion}
                  onChange={this.toggleTypeOfGeneration}
                  aria-label="Checkbox for following text input"
                />
              </InputGroup.Prepend>
              <FormControl
                value={this.state.numberOfTracks}
                onChange={this.setTrackNumber}
                aria-label="Text input with checkbox"
              />
              <InputGroup.Append>
                <InputGroup.Text># Musics</InputGroup.Text>
              </InputGroup.Append>
            </InputGroup>
          </Col>
          <Col>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Checkbox
                  checked={this.state.durationBasedGeneration}
                  onChange={this.toggleTypeOfGeneration}
                  aria-label="Checkbox for following text input"
                />
              </InputGroup.Prepend>
              <FormControl
                onChange={this.setDuration}
                value={this.state.duration}
                aria-label="Text input with checkbox"
              />
              <InputGroup.Append>
                <InputGroup.Text>Minuts</InputGroup.Text>
              </InputGroup.Append>
            </InputGroup>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Controller;
