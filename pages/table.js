import Head from 'next/head';
import { connectToDatabase } from '../util/mongodb';
import styled from 'styled-components';
import { useState, useEffect, useRef} from 'react';
import 'dotenv/config';
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
  const propertyRef = useRef();
  const toggleUpdatedAtRef = useRef(false);
  const toggleBORatioRef = useRef(false);

  const fetchData = async (properties) => {
    try {
      // Fetch updated data from MongoDB
      const response = await fetch('/api/getData');
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }

      console.log('Fetching updated data...', toggleUpdatedAtRef.current, toggleBORatioRef.current);
      const updatedProperties = await response.json();
      const parsedUpdatedProperties = JSON.parse(JSON.stringify(updatedProperties));
      if (toggleUpdatedAtRef.current) {
        sortPropertiesByUpdatedAtFromAPI(parsedUpdatedProperties);
      } else if (toggleBORatioRef.current) {
        sortPropertiesByBORatioFromAPI(parsedUpdatedProperties);
      } else {
        setProperties(parsedUpdatedProperties);
      }
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      if (!firstLoad) {
        setProperties(initial_properties);
        setFirstLoad(true);
      }
    }, 2500);
  }, [initial_properties, firstLoad]);

  useEffect(() => {
    setInterval(() => {
      fetchData();
    }, 5000);
  }, []);

  const sortPropertiesByUpdatedAt = () => {
    const sortedProperties = [...properties].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );
    toggleUpdatedAtRef.current = true;
    toggleBORatioRef.current = false;
    propertyRef.current = sortedProperties[0];
    setProperties(sortedProperties);
  };

  const sortPropertiesByBORatio = () => {
    const sortedProperties = [...properties].sort(
      (a, b) => b.b_o_ratio - a.b_o_ratio
    );
    toggleBORatioRef.current = true;
    toggleUpdatedAtRef.current = false;
    propertyRef.current = sortedProperties[0];
    setProperties(sortedProperties);
  };

  const sortPropertiesByUpdatedAtFromAPI = (updatedProperties) => {
    const sortedProperties = [...updatedProperties].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );
    const currentProperties = propertyRef.current;

    const isFirstElementSame = JSON.stringify(currentProperties) === JSON.stringify(sortedProperties[0]);

    setProperties(sortedProperties);
    propertyRef.current = sortedProperties[0];

    if (!isFirstElementSame) {
      if (sortedProperties[0].b_o_ratio > 1.4) {
        playNotificationAudio('Green');
      } else if (sortedProperties[0].b_o_ratio > 1.35) {
        playNotificationAudio('Blue');
      } else {
        playNotificationAudio('Black');
      }
    }
  };

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

  const sortPropertiesByBORatioFromAPI = (updatedProperties) => {
    const sortedProperties = [...updatedProperties].sort(
      (a, b) => b.b_o_ratio - a.b_o_ratio
    );
    setProperties(sortedProperties);
    propertyRef.current = sortedProperties[0];
  };

  const formatDateTime = (dateTimeString) => {
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };
    return new Date(dateTimeString).toLocaleString('PT', options);
  };

  const formatBORatio = (ratio) => {
    return ratio.toFixed(2);
  };

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: 'black', color: 'black' }}>
      <TableContainer style={{ backgroundColor: 'black', color: 'white' }}>
        <Button onClick={sortPropertiesByUpdatedAt}>Sort by Updated At</Button>
        <Button onClick={sortPropertiesByBORatio}>Sort by B/O Ratio</Button>

        <audio id="notificationSoundBlack">
          <source src="/Black.mp3" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
        <audio id="notificationSoundGreen">
          <source src="/Green.mp3" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
        <audio id="notificationSoundBlue">
          <source src="/Blue.mp3" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>

        <Table>
          <thead>
            <tr>
              <Th>ID</Th>
              <Th>Buff Min Price</Th>
              <Th>B/O Ratio</Th>
              <Th>Updated At</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <StyledTr
                key={property.id}
                backgroundColor={
                  property.b_o_ratio > 1.4
                    ? 'darkgreen'
                    : property.b_o_ratio > 1.35
                    ? 'darkblue'
                    : null
                }
              >
                <Td>{property.id}</Td>
                <Td>{property.buff_min_price}</Td>
                <Td>{formatBORatio(property.b_o_ratio)}</Td>
                <Td>{formatDateTime(property.updatedAt)}</Td>
                <Td>
                  <Button onClick={() => window.open(property.buffUrl)}>Buff</Button>
                  <Button onClick={() => window.open(property.steamUrl)}>Steam</Button>
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
  const { db } = await connectToDatabase();
  const data = await db.collection('Buff2Steam').find({}).toArray();
  let properties = [];
  if (data) {
    properties = JSON.parse(JSON.stringify(data));
  }

  return {
    props: { initial_properties: properties },
    revalidate: 1,
  };
}
