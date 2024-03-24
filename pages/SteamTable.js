import Head from 'next/head';
import styled from 'styled-components';
import { useState, useEffect, useRef} from 'react';
import 'dotenv/config';
import { format, isValid } from 'date-fns';
import fetch from 'isomorphic-unfetch';


const TableContainer = styled.div`
  margin-right: 200px;
  margin-left: 200px;
  margin-top: 50px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  border: 1px solid #fff;
  padding: 8px;
  text-align: center;
  background-color: #; /* light gray background for header */
`;

const Td = styled.td`
  border: 1px solid #fff;
  padding: 8px;
  text-align: center;
`;

const Button = styled.button`
  margin-right: 10px;
  margin-left: 10px;
`;

// Add a new styled component for conditional row styling
const StyledTr = styled.tr`
  background-color: ${(props) => props.backgroundColor || 'inherit'};
`;


export default function Home({ initial_properties }) {
  const [firstLoad, setFirstLoad] = useState(false);
  const [properties, setProperties] = useState([]);
  const currentTopProperty = useRef(null);

  const fetchData = async (properties) => {
    try {
      // Fetch updated data from MongoDB
      const response = await fetch('/api/getDataSteam');

      const updatedProperties = await response.json();

      const parsedUpdatedProperties = JSON.parse(JSON.stringify(updatedProperties));

      const isFirstElementSame = JSON.stringify(currentTopProperty) === JSON.stringify(parsedUpdatedProperties[0]);

      if (!isFirstElementSame) {
        if (parsedUpdatedProperties[0].currency !== 'SOLD') {
          playNotificationAudio('Black');
        }
      }

      currentTopProperty.current = parsedUpdatedProperties[0];
        
      setProperties(parsedUpdatedProperties);
      
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      if (!firstLoad) {
        setProperties(initial_properties);
        fetchData();
        setFirstLoad(true);
      }
    }, 2500);
  }, [initial_properties, firstLoad]);

  useEffect(() => {
    setInterval(() => {
      fetchData();
    }, 60000);
  }, []);


  const playNotificationAudio = (color) => {
    // Assuming you have an audio element with an id of "notificationSound"
    let audioElement;
    if (color === 'Green') {
      audioElement = document.getElementById('notificationSoundGreen');
    } else if (color === 'Blue') {
      audioElement = document.getElementById('notificationSoundBlue');
    } else {
      audioElement = document.getElementById('notificationSoundBlack');
    }
  
    // Check if the audio element exists
    if (audioElement) {
      // Play the audio
      audioElement.play();
    } else {
      console.error('Audio element not found!');
    }
  };
  
  const formatDateTime = (dateTimeString) => {
    const parsedDate = new Date(dateTimeString);
  
    if (!isValid(parsedDate)) {
      console.error('Invalid date string:', dateTimeString);
      return 'Invalid Date';
    }
  
    const formattedDate = format(parsedDate, "yyyy-MM-dd HH:mm:ss");
    return formattedDate;
  };
  

  const formatBORatio = (ratio) => {
    return ratio.toFixed(2);
  };

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: 'black', color: 'black' }}>
      <TableContainer style={{ backgroundColor: 'black', color: 'white' }}>
        <Button onClick={sortPropertiesByUpdatedAt}>Sort by Updated At</Button>
        {/* <Button onClick={sortPropertiesByBORatio}>Sort by B/O Ratio</Button> */}

        <audio id="notificationSoundBlack">
          <source src="/Black.mp3" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>

        <Table>
          <thead>
            <tr>
              <Th>Id</Th>
              <Th>Steam Price</Th>
              <Th>Currency</Th>
              <Th>Float Value</Th>
              <Th>Updated At</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <StyledTr
                key={property.id}
              >
                <Td>{property.id}</Td>
                <Td>{property.price.toFixed(2)}</Td>
                <Td>{property.currency}</Td>
                <Td>{property.float_value}</Td>
                <Td>{formatDateTime(property.updatedat)}</Td>
                <Td>
                  <Button onClick={() => window.open(property.link)}>Steam</Button>
                </Td>
              </StyledTr>
            ))}
          </tbody>
        </Table>
      </TableContainer>
    </div>
  );
}

export async function getStaticProps({ params }) {
  // data = [];
  let properties = [];
  // if (data) {
  //   properties = JSON.parse(JSON.stringify(data));
  // }

  return {
    props: { initial_properties: properties },
    revalidate: 1,
  };
}
