import './About.css'

function About() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <h1>About CoLiving</h1>

        <p>
          CoLiving is a student housing and roommate
          platform designed to help students find a
          comfortable place to live and connect with
          suitable roommates.
        </p>
      </section>

      <section className="about-section">
        <h2>Our Mission</h2>

        <p>
          Our goal is to make finding student accommodation
          easier, safer, and more convenient.
        </p>
      </section>

      <section className="about-section">
        <h2>Why CoLiving?</h2>

        <div className="about-features">
          <div className="about-feature">
            <h3>🏠 Find a Home</h3>

            <p>
              Discover student-friendly accommodation
              that fits your needs.
            </p>
          </div>

          <div className="about-feature">
            <h3>👥 Find Roommates</h3>

            <p>
              Connect with students and find suitable
              roommates.
            </p>
          </div>

          <div className="about-feature">
            <h3>🔒 Safe & Simple</h3>

            <p>
              A simple platform designed with students
              in mind.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About