import React from "react";
import Figure from 'react-bootstrap/Figure';

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
    
    console.log(data);

	return (<div style={{padding: '20px'}}><table style={{ border: 'solid 1px blue', width: '100%' }}>
		<thead>
			<tr >
				<th colSpan='2'
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
                let image = null;
                if (row.image){
                    image =   <Figure>
                    <Figure.Image
                      width={171}
                      height={180}
                      alt={row.name}
                      src={row.image.url}
                    />
                    <Figure.Caption>
                        {row.name}
                    </Figure.Caption>
                  </Figure> ;
                }
				return (
					<tr key={row.id} onClick={() => onClickCallBack(row)} style={row.checked ?checkStyle : uncheckStyle }>
                        <td>
                            {image}
                        </td>
						<td>
						{row.name}
						</td>
					</tr>
				)
			})}
		</tbody>
	</table></div>
	)

}

export default Table;