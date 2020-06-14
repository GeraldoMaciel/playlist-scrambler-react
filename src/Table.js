import React from "react";
import Figure from "react-bootstrap/Figure";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

function Table({ data, onClickCallBack, playerState }) {
  if (playerState) {
    return null;
  }

  const chunck = (array, size) => {
    const chunked_arr = [];
    let index = 0;
    while (index < array.length) {
      chunked_arr.push(array.slice(index, size + index));
      index += size;
    }
    return chunked_arr;
  };

  const chunkedPlayListArray = chunck(data, 5);

  return (
    <div>
      <Container>
        {chunkedPlayListArray.map((row) => {
          return (
            <Row key={row[0].id}>
              {row.map((item) => {
                let imageSrc;
                if (item.image) {
                  imageSrc = item.image.url;
                } else {
                  imageSrc = "/spotify-default.jpg";
                }

                let style;
                if (item.checked) {
                  style = {
                    paddingRight: "0px",
                    paddingLeft: "0px",
                    borderStyle: "solid",
                    borderWidth: "15px",
                    borderColor: "darkkhaki",
                  };
                } else {
                  style = {
                    paddingRight: "0px",
                    paddingLeft: "0px",
                    borderStyle: "solid",
                    borderWidth: "15px",
                    borderColor: "white",
                  };
                }

                return (
                  <Col key={item.id} style={style}>
                    <Figure onClick={() => onClickCallBack(item)}>
                      <Figure.Image
                        width={171}
                        height={180}
                        alt="171x180"
                        src={imageSrc}
                      />
                      <Figure.Caption>{item.name}</Figure.Caption>
                    </Figure>
                  </Col>
                );
              })}
            </Row>
          );
        })}
      </Container>
    </div>
  );
}

export default Table;
