import { useState, useEffect } from 'react'
import './App.css'

import { MapContainer, TileLayer, Circle } from 'react-leaflet'

function App() {
  const [playerPosition, setPlayerPosition] = useState<[number, number] | null>(null)
  const [accuracy, setAccuracy] = useState(0)
  const [zone, setZone] = useState<{center: [number, number], radius: number} | null>(null)
  const [nextZone, setNextZone] = useState<{center: [number, number], radius: number} | null>(null)

  function getLocation() {
    if (!navigator.geolocation) {
      alert('Location not enabled!')
      return
    }

    navigator.geolocation.getCurrentPosition(success, error)
  }

  function success(position: GeolocationPosition) {
    const { latitude, longitude, accuracy } = position.coords
    console.log('Position: ', position)
    setPlayerPosition([latitude, longitude])
    setAccuracy(accuracy)
  }

  function error() {
    alert('Location enabled but no location detected')
  }

  useEffect(() => {
    const fetchData = async () => {
      try{
        const response = await fetch("http://127.0.0.1:5000/");

        if(!response.ok){
          console.log(`Error ${response.status}`)
          throw new Error(`HTTP Error. Status: ${response.status}`);
        }

        const json = await response.json();

        setZone(json.zone);
        setNextZone(json.next_zone);
      } catch(err) {
        console.log(`Error ${err}`);
      }
    }
    setInterval(fetchData, 1000);
  }, [])


  

  return (
    <>
      <h1>Game</h1>
      <button onClick={getLocation}>Find my location</button>
      <MapContainer center={[-31.9800, 115.8179]} zoom={15} scrollWheelZoom={false} className="map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {zone && ( 
          <Circle 
            center={zone.center} 
            color="red" 
            weight={1} 
            fillColor="#f03" 
            fillOpacity={0.1} 
            radius={zone.radius} />
        )}
        {nextZone && ( 
          <Circle 
            center={nextZone.center} 
            color="black" 
            weight={1} 
            fillOpacity={0} 
            radius={nextZone.radius} />
        )}
        {playerPosition && (
          <Circle
            center={playerPosition}
            color="blue"
            fillColor="#99f"
            fillOpacity={0.5}
            radius={accuracy}
          />
        )}
      </MapContainer>
    </>
  )
}

export default App
