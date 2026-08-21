import './Card.css'

function Card({
  title,
  location,
  roommates,
  description,
  onViewDetails
}) {
  return (
    <div className="card">
      <div className="card-image">
        Property Image
      </div>

      <div className="card-content">
        <h2>{title}</h2>

        <p>📍 {location}</p>

        <p>👥 {roommates} roommates</p>

        <p>{description}</p>

        <button
          className="card-button"
          onClick={onViewDetails}
        >
          View Details
        </button>
      </div>
    </div>
  )
}

export default Card