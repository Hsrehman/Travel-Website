<template>
  <div class="flight-results">
    <!-- Filters and Sort -->
    <div class="controls">
      <div class="sort-options">
        <label>Sort by:</label>
        <select v-model="sortBy" class="sort-select">
          <option value="price">Price (Low to High)</option>
          <option value="-price">Price (High to Low)</option>
          <option value="duration">Duration (Shortest)</option>
          <option value="departure">Departure (Earliest)</option>
        </select>
      </div>
      
      <button class="filter-toggle" @click="showFilters = !showFilters">
        {{ showFilters ? 'Hide Filters' : 'Show Filters' }}
      </button>
    </div>

    <div class="content">
      <!-- Filters Panel -->
      <transition name="slide">
        <aside v-show="showFilters" class="filters-panel">
          <h3>Filters</h3>
          
          <!-- Price Range -->
          <div class="filter-section">
            <h4>Price Range</h4>
            <div class="price-range">
              <input 
                type="range" 
                v-model="filters.maxPrice" 
                :min="minPrice" 
                :max="maxPrice"
                step="10"
              />
              <div class="price-labels">
                <span>${{ minPrice }}</span>
                <span>${{ filters.maxPrice }}</span>
              </div>
            </div>
          </div>

          <!-- Airlines -->
          <div class="filter-section" v-if="availableAirlines.length">
            <h4>Airlines</h4>
            <div class="airline-list">
              <label 
                v-for="airline in availableAirlines" 
                :key="airline.code"
                class="checkbox-label"
              >
                <input 
                  type="checkbox" 
                  v-model="filters.airlines"
                  :value="airline.code"
                />
                <span>{{ airline.name }} ({{ airline.count }})</span>
              </label>
            </div>
          </div>

          <!-- Stops -->
          <div class="filter-section">
            <h4>Stops</h4>
            <div class="stops-options">
              <label class="radio-label">
                <input 
                  type="radio" 
                  v-model="filters.stops"
                  :value="null"
                />
                <span>Any</span>
              </label>
              <label class="radio-label">
                <input 
                  type="radio" 
                  v-model="filters.stops"
                  :value="0"
                />
                <span>Non-stop only</span>
              </label>
              <label class="radio-label">
                <input 
                  type="radio" 
                  v-model="filters.stops"
                  :value="1"
                />
                <span>1 stop max</span>
              </label>
            </div>
          </div>

          <!-- Time of Day -->
          <div class="filter-section">
            <h4>Departure Time</h4>
            <div class="time-slots">
              <button 
                v-for="slot in timeSlots"
                :key="slot.value"
                :class="['time-slot', { active: filters.departureTime === slot.value }]"
                @click="filters.departureTime = slot.value"
              >
                {{ slot.label }}
              </button>
            </div>
          </div>
        </aside>
      </transition>

      <!-- Results List -->
      <div class="results-list">
        <div v-if="!filteredFlights.length" class="no-results">
          <p>No flights match your current filters.</p>
          <button @click="resetFilters" class="reset-btn">Reset Filters</button>
        </div>

        <div v-else class="flight-cards">
          <div 
            v-for="flight in sortedFlights" 
            :key="flight.id" 
            class="flight-card"
          >
            <!-- Airline Info -->
            <div class="airline-info">
              <img 
                :src="getAirlineLogo(flight.airlineCode)" 
                :alt="flight.airlineName"
                class="airline-logo"
              />
              <div class="airline-details">
                <span class="airline-name">{{ flight.airlineName }}</span>
                <span class="flight-number">{{ flight.flightNumber }}</span>
              </div>
              <div class="price">
                <span class="amount">${{ flight.price }}</span>
                <span class="type">per person</span>
              </div>
            </div>

            <!-- Flight Route -->
            <div class="flight-route">
              <div class="departure">
                <time class="time">{{ formatTime(flight.departureTime) }}</time>
                <div class="airport">{{ flight.departureAirport }}</div>
              </div>

              <div class="route-info">
                <div class="duration">{{ formatDuration(flight.duration) }}</div>
                <div class="route-line">
                  <span 
                    class="stops-indicator"
                    :class="{ 'non-stop': flight.stops === 0 }"
                  >
                    {{ flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}` }}
                  </span>
                </div>
              </div>

              <div class="arrival">
                <time class="time">{{ formatTime(flight.arrivalTime) }}</time>
                <div class="airport">{{ flight.arrivalAirport }}</div>
              </div>
            </div>

            <!-- Flight Details -->
            <div class="flight-details">
              <div class="detail-item">
                <span class="label">Aircraft:</span>
                <span>{{ flight.aircraft }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Baggage:</span>
                <span>{{ flight.baggage }}</span>
              </div>
            </div>

            <button 
              class="select-btn"
              @click="selectFlight(flight)"
            >
              Select Flight
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  flights: {
    type: Array,
    required: true,
    default: () => []
  },
  searchParams: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['flight-selected']);

// State
const showFilters = ref(true);
const sortBy = ref('price');
const filters = ref({
  maxPrice: Infinity,
  airlines: [],
  stops: null,
  departureTime: 'any'
});

// Time slot options
const timeSlots = [
  { value: 'any', label: 'Any Time' },
  { value: 'morning', label: 'Morning (6AM-12PM)' },
  { value: 'afternoon', label: 'Afternoon (12PM-6PM)' },
  { value: 'evening', label: 'Evening (After 6PM)' }
];

// Computed
const minPrice = computed(() => {
  if (!props.flights.length) return 0;
  return Math.min(...props.flights.map(f => f.price));
});

const maxPrice = computed(() => {
  if (!props.flights.length) return 1000;
  return Math.max(...props.flights.map(f => f.price));
});

const availableAirlines = computed(() => {
  const airlines = new Map();
  props.flights.forEach(flight => {
    const count = airlines.get(flight.airlineCode)?.count || 0;
    airlines.set(flight.airlineCode, {
      code: flight.airlineCode,
      name: flight.airlineName,
      count: count + 1
    });
  });
  return Array.from(airlines.values());
});

const filteredFlights = computed(() => {
  return props.flights.filter(flight => {
    // Price filter
    if (flight.price > filters.value.maxPrice) return false;
    
    // Airline filter
    if (filters.value.airlines.length && 
        !filters.value.airlines.includes(flight.airlineCode)) {
      return false;
    }
    
    // Stops filter
    if (filters.value.stops !== null && flight.stops !== filters.value.stops) {
      return false;
    }
    
    // Time filter
    if (filters.value.departureTime !== 'any') {
      const hour = new Date(flight.departureTime).getHours();
      switch (filters.value.departureTime) {
        case 'morning':
          if (hour < 6 || hour >= 12) return false;
          break;
        case 'afternoon':
          if (hour < 12 || hour >= 18) return false;
          break;
        case 'evening':
          if (hour < 18) return false;
          break;
      }
    }
    
    return true;
  });
});

const sortedFlights = computed(() => {
  const direction = sortBy.value.startsWith('-') ? -1 : 1;
  const field = sortBy.value.replace('-', '');
  
  return [...filteredFlights.value].sort((a, b) => {
    switch (field) {
      case 'price':
        return (a.price - b.price) * direction;
      case 'duration':
        return a.duration - b.duration;
      case 'departure':
        return new Date(a.departureTime) - new Date(b.departureTime);
      default:
        return 0;
    }
  });
});

// Methods
const formatTime = (timeValue) => {
  if (!timeValue) return 'N/A';
  
  // Handle time-only strings (HH:MM)
  if (typeof timeValue === 'string' && /^\d{1,2}:\d{2}(:\d{2})?$/.test(timeValue)) {
    const [hours, minutes] = timeValue.split(':').map(Number);
    
    // Return in 24-hour format
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  
  // For full date strings (existing code path)
  let date;
  
  try {
    // Check if it's ISO format
    if (typeof timeValue === 'string' && timeValue.includes('T')) {
      date = new Date(timeValue);
    } 
    // Check if it's a timestamp
    else if (!isNaN(Number(timeValue))) {
      date = new Date(Number(timeValue));
    }
    // Handle date string without time
    else if (typeof timeValue === 'string' && timeValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      date = new Date(`${timeValue}T00:00:00`);
    }
    // Default case
    else {
      date = new Date(timeValue);
    }
    
    // Validate the date
    if (isNaN(date.getTime())) {
      console.warn('Invalid date format:', timeValue);
      return 'N/A';
    }
    
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (err) {
    console.error('Error formatting time:', err);
    return 'N/A';
  }
};

const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const getAirlineLogo = (code) => {
  return `https://www.gstatic.com/flights/airline_logos/70px/${code}.png`;
};

const selectFlight = (flight) => {
  emit('flight-selected', flight);
};

const resetFilters = () => {
  filters.value = {
    maxPrice: maxPrice.value,
    airlines: [],
    stops: null,
    departureTime: 'any'
  };
};

// Initialize maxPrice filter
if (props.flights.length) {
  filters.value.maxPrice = maxPrice.value;
}
</script>

<style scoped>
.flight-results {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #333;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sort-options label {
  font-weight: 500;
  color: #4b5563;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background-color: white;
  font-size: 14px;
  min-width: 180px;
  color: #374151;
  outline: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.sort-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.filter-toggle {
  padding: 8px 16px;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  color: #4b5563;
  transition: all 0.2s ease;
}

.filter-toggle:hover {
  background-color: #e5e7eb;
}

.content {
  display: flex;
  gap: 24px;
}

/* Filters Panel */
.filters-panel {
  width: 280px;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  height: fit-content;
  border: 1px solid #f3f4f6;
}

.filters-panel h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.filter-section {
  margin-bottom: 24px;
}

.filter-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.filter-section:last-child {
  margin-bottom: 0;
}

.price-range {
  margin-top: 16px;
}

.price-range input[type="range"] {
  width: 100%;
  accent-color: #3b82f6;
}

.price-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 13px;
  color: #6b7280;
}

.airline-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 6px;
}

.checkbox-label, .radio-label {
  display: flex;
  align-items: center;
  font-size: 14px;
  cursor: pointer;
  color: #4b5563;
}

.checkbox-label input, .radio-label input {
  margin-right: 8px;
  accent-color: #3b82f6;
}

.time-slots {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.time-slot {
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 12px;
  text-align: center;
  cursor: pointer;
  background-color: white;
  transition: all 0.2s;
}

.time-slot.active {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.time-slot:hover:not(.active) {
  background-color: #f9fafb;
}

/* Results List */
.results-list {
  flex: 1;
}

.no-results {
  text-align: center;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.reset-btn {
  margin-top: 16px;
  padding: 8px 24px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reset-btn:hover {
  background-color: #2563eb;
}

.flight-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.flight-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  border: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.flight-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.airline-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.airline-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.airline-details {
  flex: 1;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
}

.airline-name {
  font-weight: 600;
  color: #111827;
}

.flight-number {
  font-size: 13px;
  color: #6b7280;
}

.price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.amount {
  font-weight: 700;
  font-size: 20px;
  color: #111827;
}

.type {
  font-size: 12px;
  color: #6b7280;
}

.flight-route {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.departure, .arrival {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100px;
}

.time {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.airport {
  font-size: 14px;
  color: #4b5563;
  margin-top: 4px;
}

.route-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px;
}

.duration {
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 8px;
}

.route-line {
  width: 100%;
  position: relative;
  height: 2px;
  background-color: #e5e7eb;
}

.route-line::before,
.route-line::after {
  content: "";
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #3b82f6;
  top: 50%;
  transform: translateY(-50%);
}

.route-line::before {
  left: 0;
}

.route-line::after {
  right: 0;
}

.stops-indicator {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: white;
  padding: 0 8px;
  font-size: 12px;
  color: #6b7280;
}

.stops-indicator.non-stop {
  color: #059669;
  font-weight: 500;
}

.flight-details {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px 0;
  border-top: 1px solid #f3f4f6;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.label {
  font-size: 13px;
  color: #6b7280;
}

.select-btn {
  padding: 10px 20px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  align-self: flex-end;
  cursor: pointer;
  transition: background-color 0.2s;
}

.select-btn:hover {
  background-color: #2563eb;
}

/* Responsive Design */
@media (max-width: 768px) {
  .content {
    flex-direction: column;
  }
  
  .filters-panel {
    width: 100%;
  }
  
  .flight-route {
    flex-direction: column;
    gap: 16px;
  }
  
  .departure, .arrival {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
  }
  
  .route-info {
    padding: 16px 0;
  }
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>

 