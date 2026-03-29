import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Header, Hero, CarListing, Newsletter, About, Reviews, Contact, Footer } from './components'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Login } from './pages/Login'
import { Admin } from './pages/Admin'
import { CarDetail } from './pages/CarDetail'

function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <main>
        <CarListing />
        <Newsletter />
        <Reviews />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cars/:id" element={<CarDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
