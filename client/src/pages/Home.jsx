import React from 'react'
import Products from '../components/Product'
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';

function Home() {
    const {user, status} = useSelector((state) => state.auth)

    if (status === "loading") {
        return <p>Loading...</p>
    }

  return (
    <div>
    <Navbar/>
    <Products />
  </div>
  )
}

export default Home