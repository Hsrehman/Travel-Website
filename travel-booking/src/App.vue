<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Navigation -->
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <a href="/" class="text-2xl font-bold text-blue-600">TravelEase</a>
          </div>
          <div class="flex items-center space-x-4">
            <a href="/" class="text-gray-700 hover:text-blue-600">Home</a>
            <a href="/flights" class="text-gray-700 hover:text-blue-600">Flights</a>
            <a href="#" class="text-gray-700 hover:text-blue-600">Hotels</a>
            <a href="#" class="text-gray-700 hover:text-blue-600">Contact</a>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main>
      <!-- Debug Message -->
      <div class="bg-blue-500 text-white p-4 mb-4">
        Debug: Navigation and Booking
      </div>

      <!-- Booking Section -->
      <div class="py-8">
        <BookingSection />
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import BookingSection from './components/BookingSection.vue'

onMounted(() => {
  console.log('App mounted with BookingSection')
})
</script>
