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
const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
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
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.content {
  display: flex;
  gap: 20px;
}

/* Filters Panel */
.filters-panel {
  width: 280px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.filter-section {
  margin-bottom: 24px;
}

.filter-section:last-child {
  margin-bottom: 0;
}

/* Results List */
.results-list {
  flex: 1;
}

.flight-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.flight-card:hover {
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .content {
    flex-direction: column;
  }
  
  .filters-panel {
    width: 100%;
  }
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
