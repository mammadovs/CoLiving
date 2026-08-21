import Input from '../components/Input/Input'
import Card from '../components/Card/Card'
import './Rooms.css'

function Rooms() {
  return (
    <div className="rooms-page">
      <div className="rooms-header">
        <h1>Find a Room</h1>

        <p>
          Find a comfortable place to live with other students.
        </p>

        <Input
          label="Search"
          placeholder="Search by location..."
        />
      </div>

      <h2>Available Rooms</h2>

      <div className="rooms-list">
        <Card
          title="Baku Student Apartment"
          location="Baku"
          roommates="2"
          description="Comfortable apartment close to university."
        />

        <Card
          title="Modern Student House"
          location="Baku"
          roommates="1"
          description="Modern shared house for students."
        />
      </div>
    </div>
  )
}

export default Rooms