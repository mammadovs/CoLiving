import { useState } from 'react'

import Input from '../components/Input/Input'
import Card from '../components/Card/Card'
import Modal from '../components/Modal/Modal'

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div>
      <h1>Find Your Perfect Roommate</h1>

      <p>
        Student housing & roommate platform
      </p>

      <Input
        label="Search"
        placeholder="Find a roommate"
      />

      <Card
        title="Baku Student Apartment"
        location="Baku"
        roommates="2"
        description="Comfortable apartment for students"
        onViewDetails={() => setIsModalOpen(true)}
      />

      {isModalOpen && (
        <Modal
          title="Baku Student Apartment"
          onClose={() => setIsModalOpen(false)}
        >
          <p>📍 Location: Baku</p>
          <p>👥 Roommates: 2</p>
          <p>
            Comfortable apartment for students.
          </p>
        </Modal>
      )}
    </div>
  )
}

export default Home