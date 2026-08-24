import { useState } from 'react'

import {
  ShieldCheck,
  Users,
  Home as HomeIcon,
  Search
} from 'lucide-react'

import room1 from '../assets/room1.jpg'
import room2 from '../assets/room2.jpg'
import room3 from '../assets/room3.jpg'
import room4 from '../assets/room4.jpg'

import Input from '../components/Input/Input'
import Card from '../components/Card/Card'
import Modal from '../components/Modal/Modal'

import './Home.css'

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)

  const rooms = [
    {
      id: 1,
      title: 'Baku Student Apartment',
      location: 'Baku',
      roommates: '2',
      description:
        'Comfortable apartment close to university and public transport.',
      image: room1
    },

    {
      id: 2,
      title: 'Modern Student House',
      location: 'Baku',
      roommates: '1',
      description:
        'Modern shared house in a quiet and student-friendly neighborhood.',
      image: room2
    },

    {
      id: 3,
      title: 'Cozy Downtown Room',
      location: 'Baku',
      roommates: '2',
      description:
        'Cozy private room located near cafes, shops and city center.',
      image: room3
    },

    {
      id: 4,
      title: 'Bright Student Home',
      location: 'Baku',
      roommates: '3',
      description:
        'Bright and spacious home with a friendly student community.',
      image: room4
    }
  ]

  const handleViewDetails = (room) => {
    setSelectedRoom(room)
    setIsModalOpen(true)
  }

  return (
    <div className="home-page">

      {/* HERO */}

      <section className="home-hero">

        <div className="home-hero-content">

          <span className="home-badge">
            Student Housing Made Simple
          </span>

          <h1>
            Find a place you'll love to{' '}
            <span>call home.</span>
          </h1>

          <p>
            Discover comfortable student homes and
            connect with roommates who match your lifestyle.
          </p>

          <div className="home-search">

            <Input
              label="Search"
              placeholder="Search by location..."
            />

            <button
              type="button"
              className="hero-search-button"
            >
              <Search size={18} />
              Search
            </button>

          </div>

        </div>

      </section>


      {/* FEATURED ROOMS */}

      <section className="home-card-section">

        <div className="section-heading">

          <div>

            <h2>
              Featured Rooms
            </h2>

            <p>
              Explore places students love.
            </p>

          </div>

        </div>


        <div className="home-room-grid">

          {rooms.map((room) => (
            <Card
              key={room.id}
              title={room.title}
              location={room.location}
              roommates={room.roommates}
              description={room.description}
              image={room.image}
              onViewDetails={() =>
                handleViewDetails(room)
              }
            />
          ))}

        </div>

      </section>


      {/* FEATURES */}

      <section className="home-features">

        <div className="features-heading">

          <span>
            WHY COLIVING
          </span>

          <h2>
            Everything you need to find
            the right place.
          </h2>

        </div>


        <div className="features-grid">

          <div className="feature-item">

            <div className="feature-icon">
              <HomeIcon size={24} />
            </div>

            <h3>
              Find a Home
            </h3>

            <p>
              Discover student-friendly homes
              that fit your needs and budget.
            </p>

          </div>


          <div className="feature-item">

            <div className="feature-icon">
              <Users size={24} />
            </div>

            <h3>
              Find Roommates
            </h3>

            <p>
              Connect with students and find
              roommates who match your lifestyle.
            </p>

          </div>


          <div className="feature-item">

            <div className="feature-icon">
              <ShieldCheck size={24} />
            </div>

            <h3>
              Safe & Simple
            </h3>

            <p>
              A simple platform designed to make
              student housing easier and safer.
            </p>

          </div>

        </div>

      </section>


      {/* FOOTER */}

      <footer className="home-footer">

        <div className="footer-brand">

          <h3>
            CoLiving
          </h3>

          <p>
            Find your place. Find your people.
          </p>

        </div>


        <div className="footer-links">

          <a href="/">
            Home
          </a>

          <a href="/rooms">
            Find a Room
          </a>

          <a href="/about">
            About
          </a>

        </div>


        <p className="footer-copy">
          © 2026 CoLiving. All rights reserved.
        </p>

      </footer>


      {/* MODAL */}

      {isModalOpen && selectedRoom && (

        <Modal
          title={selectedRoom.title}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedRoom(null)
          }}
        >

          <p>
            Location: {selectedRoom.location}
          </p>

          <p>
            Roommates: {selectedRoom.roommates}
          </p>

          <p>
            {selectedRoom.description}
          </p>

        </Modal>

      )}

    </div>
  )
}

export default Home