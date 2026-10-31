import { useState } from 'react'
import './App.css'

import { MapContainer, TileLayer, Circle } from 'react-leaflet'

function App() {
  const [playerPosition, setPlayerPosition] = useState<[number, number] | null>(null)
  const [accuracy, setAccuracy] = useState(0)

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

  return (
    <>
      <h1>Game</h1>
      <button onClick={getLocation}>Find my location</button>
      <MapContainer center={[-31.9800, 115.8179]} zoom={15} scrollWheelZoom={false} className="map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Circle center={[-31.9800, 115.8179]} color="red" weight={1} fillColor="#f03" fillOpacity={0.1} radius={500} />
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
