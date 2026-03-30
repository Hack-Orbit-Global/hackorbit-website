import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import WhatWeDo from './components/WhatWeDo'
import Projects from './components/Projects'
import Contribute from './components/Contribute'
import Community from './components/Community'
import OrbitIdentitySection from './components/OrbitIdentitySection'
import Footer from './components/Footer'

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <About />
      <WhatWeDo />
      <Projects />
      <Contribute />
      <Community />
      <OrbitIdentitySection />
      <Footer />
    </main>
  )
}
