import {
  Home,
  Users,
  ShieldCheck
} from 'lucide-react'

import './About.css'

function About() {
  return (
    <div className="about-page">

      <section className="about-hero">

        <span className="about-badge">
          ABOUT COLIVING
        </span>

        <h1>
          Finding a place to live
          should feel simple.
        </h1>

        <p>
          CoLiving helps students find comfortable
          places to live and people they can feel
          at home with.
        </p>

      </section>


      <section className="about-story">

        <div className="about-story-text">

          <span className="section-label">
            OUR STORY
          </span>

          <h2>
            Made for students,
            built around community.
          </h2>

          <p>
            Moving to a new city for university can
            be exciting, but finding the right place
            to live is not always easy.
          </p>

          <p>
            CoLiving brings accommodation and
            roommates together in one simple place,
            so students can spend less time searching
            and more time settling into their new home.
          </p>

        </div>


        <div className="about-story-card">

          <div className="story-icon">
            <Home size={30} />
          </div>

          <h3>
            Your next home
          </h3>

          <p>
            Comfortable spaces, suitable roommates,
            and a simpler way to find where you belong.
          </p>

        </div>

      </section>


      <section className="about-section">

        <div className="about-section-heading">

          <span className="section-label">
            WHY COLIVING
          </span>

          <h2>
            Everything you need,
            in one place.
          </h2>

        </div>


        <div className="about-features">

          <div className="about-feature">

            <div className="about-feature-icon">
              <Home size={24} />
            </div>

            <h3>
              Find a Home
            </h3>

            <p>
              Browse student-friendly places and
              find a home that works for you.
            </p>

          </div>


          <div className="about-feature">

            <div className="about-feature-icon">
              <Users size={24} />
            </div>

            <h3>
              Meet Roommates
            </h3>

            <p>
              Find people to share a space with
              and make living away from home easier.
            </p>

          </div>


          <div className="about-feature">

            <div className="about-feature-icon">
              <ShieldCheck size={24} />
            </div>

            <h3>
              Keep It Simple
            </h3>

            <p>
              Everything is designed to make the
              search for student housing less stressful.
            </p>

          </div>

        </div>

      </section>

    </div>
  )
}

export default About