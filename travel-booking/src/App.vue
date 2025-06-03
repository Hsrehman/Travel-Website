<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Navigation -->
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-blue-600">TravelEase</h1>
          </div>
          <div class="flex items-center space-x-4">
            <a href="#" class="text-gray-700 hover:text-blue-600">Home</a>
            <a href="#" class="text-gray-700 hover:text-blue-600">Flights</a>
            <a href="#" class="text-gray-700 hover:text-blue-600">Hotels</a>
            <a href="#" class="text-gray-700 hover:text-blue-600">Contact</a>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <div class="relative">
      <div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-90"></div>
      <div class="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <div class="text-center">
          <h2 class="text-4xl font-extrabold text-white sm:text-5xl">
            Find Your Perfect Trip
          </h2>
          <p class="mt-4 text-xl text-white">
            Discover amazing destinations and book your next adventure
          </p>
        </div>

        <BookingSection class="mt-10" />
      </div>
    </div>

    <!-- Featured Destinations -->
    <div class="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <h3 class="text-2xl font-bold text-gray-900 mb-8">Popular Destinations</h3>
      <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div v-for="destination in destinations" :key="destination.name" class="rounded-lg overflow-hidden shadow-lg">
          <img :src="destination.image" :alt="destination.name" class="w-full h-48 object-cover">
          <div class="p-4">
            <h4 class="text-xl font-semibold">{{ destination.name }}</h4>
            <p class="text-gray-600">{{ destination.description }}</p>
            <p class="mt-2 text-blue-600 font-semibold">From ${{ destination.price }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import BookingSection from './components/BookingSection.vue'

const destinations = [
  {
    name: 'Paris, France',
    description: 'The city of lights and romance',
    price: 799,
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=500'
  },
  {
    name: 'Bali, Indonesia',
    description: 'Tropical paradise with stunning beaches',
    price: 899,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=500'
  },
  {
    name: 'Dubai, UAE',
    description: 'Modern luxury in the desert',
    price: 999,
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=500'
  }
]
</script>
