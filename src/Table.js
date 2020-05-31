import React from "react";
import Figure from "react-bootstrap/Figure";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

function Table({ data, onClickCallBack }) {
  console.log(data);

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

  console.log(chunkedPlayListArray);

  return (
    <Container>
      {chunkedPlayListArray.map((row) => {
        return (
          <Row>
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
                  "padding-right": "0px",
                  "padding-left": "0px",
                  "border-style": "solid",
                  "border-width": "15px",
                  "border-color": "darkkhaki",
                };
              } else {
                style = {
                  "padding-right": "0px",
                  "padding-left": "0px",
                  "border-style": "solid",
                  "border-width": "15px",
                  "border-color": "white",
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
  );
}

export default Table;
