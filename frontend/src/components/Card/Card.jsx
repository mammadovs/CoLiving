import { MapPin, Users, ArrowRight } from 'lucide-react'

import Button from '../Button/Button'

import './Card.css'

function Card({
  title,
  location,
  roommates,
  description,
  image,
  onViewDetails
}) {
  return (
    <div className="card">

      <div className="card-image">
        <img
          src={image}
          alt={title}
        />
      </div>

      <div className="card-content">

        <h2>{title}</h2>

        <div className="card-info">

          <div className="card-info-item">
            <MapPin size={18} strokeWidth={2} />
            <span>{location}</span>
          </div>

          <div className="card-info-item">
            <Users size={18} strokeWidth={2} />
            <span>{roommates === 0 ? 'No roommates yet' : `${roommates} roommate${roommates === 1 ? '' : 's'}`}</span>
          </div>

        </div>

        <p className="card-description">
          {description}
        </p>

        <Button variant="secondary" onClick={onViewDetails} className="card-button">
          View Details
          <ArrowRight size={18} className="card-button-icon" />
        </Button>

      </div>

    </div>
  )
}

export default Card