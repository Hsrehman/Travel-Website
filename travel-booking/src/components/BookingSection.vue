<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="bg-white p-6 rounded-lg shadow-sm space-y-6">
        <!-- Trip Type Buttons -->
        <div class="flex space-x-2 mb-4">
          <button 
            @click="setTripType('oneWay')"
            :class="[
              'px-3 py-1 text-sm border rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
              tripType === 'oneWay' 
                ? 'bg-blue-500 text-white border-blue-500' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            ]"
          >One Way</button>
          <button 
            @click="setTripType('return')"
            :class="[
              'px-3 py-1 text-sm border rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
              tripType === 'return' 
                ? 'bg-blue-500 text-white border-blue-500' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            ]"
          >Return</button>
          <button 
            @click="setTripType('multiCity')"
            :class="[
              'px-3 py-1 text-sm border rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
              tripType === 'multiCity' 
                ? 'bg-blue-500 text-white border-blue-500' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            ]"
          >Multi City</button>
        </div>
        <!-- Search Form -->
        <div class="space-y-4">
          <div class="flex items-center space-x-4">
            <!-- From Field -->
            <div class="flex-[0.8] relative">
              <label class="block text-sm font-medium text-gray-700 mb-1">From</label>
              <div class="relative">
                <input
                  type="text"
                  v-model="fromQuery"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="City or Airport"
                  @focus="showFromResults = true"
                  @blur="setTimeout(() => showFromResults = false, 200)"
                >
                <div v-if="showFromResults && fromResults.length > 0" class="search-results">
                  <div
                    v-for="result in fromResults"
                    :key="result.iataCode"
                    class="search-result-item"
                    @mousedown="selectFromLocation(result)"
                  >
                    <div class="flex items-center space-x-3">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.64 14.26l2.86.95 4.02-4.02-8-4.59 1.16-1.16c.1-.1.26-.14.41-.1l9.3 2.98c1.58-1.58 3.15-3.2 4.77-4.75.31-.33.7-.58 1.16-.73.45-.16.94-.2 1.42-.13.48.07.94.26 1.34.53.4.28.73.64.97 1.07.24.42.37.89.38 1.37.01.48-.1.95-.32 1.38-.22.43-.54.79-.92 1.06l-4.82 4.83 2.97 9.29c.05.15 0 .31-.1.41l-1.17 1.16-4.57-8.02L8.8 17.5l.95 2.84L8.3 21.8l-2.5-5.5-5.5-2.5 1.34-1.34z"/>
                      </svg>
                      <div>
                        <div class="text-[11px] font-medium text-gray-900">{{ result.mainLine }}</div>
                        <div class="text-[10px] text-gray-500">{{ result.subLine }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Switch Button -->
            <div class="flex items-center justify-center relative z-10">
              <button 
                @click="switchLocations"
                class="p-2 bg-white rounded-full shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
            </div>

            <!-- To Field -->
            <div class="flex-[0.8] relative">
              <label class="block text-sm font-medium text-gray-700 mb-1">To</label>
              <div class="relative">
                <input
                  type="text"
                  v-model="toQuery"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="City or Airport"
                  @focus="showToResults = true"
                  @blur="setTimeout(() => showToResults = false, 200)"
                >
                <div v-if="showToResults && toResults.length > 0" class="search-results">
                  <div
                    v-for="result in toResults"
                    :key="result.iataCode"
                    class="search-result-item"
                    @mousedown="selectToLocation(result)"
                  >
                    <div class="flex items-center space-x-3">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.64 14.26l2.86.95 4.02-4.02-8-4.59 1.16-1.16c.1-.1.26-.14.41-.1l9.3 2.98c1.58-1.58 3.15-3.2 4.77-4.75.31-.33.7-.58 1.16-.73.45-.16.94-.2 1.42-.13.48.07.94.26 1.34.53.4.28.73.64.97 1.07.24.42.37.89.38 1.37.01.48-.1.95-.32 1.38-.22.43-.54.79-.92 1.06l-4.82 4.83 2.97 9.29c.05.15 0 .31-.1.41l-1.17 1.16-4.57-8.02L8.8 17.5l.95 2.84L8.3 21.8l-2.5-5.5-5.5-2.5 1.34-1.34z"/>
                      </svg>
                      <div>
                        <div class="text-[11px] font-medium text-gray-900">{{ result.mainLine }}</div>
                        <div class="text-[10px] text-gray-500">{{ result.subLine }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Date Fields Container -->
            <div class="flex-[1.4] relative">
              <div class="flex space-x-4">
                <!-- Departure Date -->
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Departure</label>
                  <div
                    @click="openDatePicker('departure')"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 focus:outline-none"
                  >
                    <div class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span class="text-gray-700">{{ departureDate || 'Select' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Return Date (only shown for return trips) -->
                <div v-if="tripType !== 'oneWay'" class="flex-1">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Return</label>
                  <div
                    @click="openDatePicker('return')"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 focus:outline-none"
                  >
                    <div class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span class="text-gray-700">{{ returnDate || 'Select' }}</span>
                    </div>
                  </div>
                </div>
                <!-- Spacer div when in one-way mode to maintain layout -->
                <div v-else class="flex-1"></div>
              </div>

              <!-- Date Picker Overlay -->
              <Transition name="fade">
                <div v-if="showDatePicker" class="date-picker-wrapper">
                  <div class="date-picker-container">
                    <Datepicker
                      v-model="dates"
                      :range="tripType !== 'oneWay'"
                      :enable-time-picker="false"
                      :min-date="new Date()"
                      auto-apply
                      inline
                      :month-change-on-scroll="false"
                      :two-months="tripType !== 'oneWay'"
                      :multi-calendars="tripType !== 'oneWay'"
                      :calendar-cell-class-name="'dp__calendar-item'"
                      @closed="closeDatePicker"
                      @update:model-value="handleDateSelection"
                    />
                  </div>
                </div>
              </Transition>

              <!-- Overlay Background -->
              <Transition name="fade">
                <div v-if="showDatePicker" class="fixed inset-0 bg-black bg-opacity-30 z-40" @click="closeDatePicker"></div>
              </Transition>
            </div>
          </div>

          <!-- Search Button -->
          <div class="flex justify-center mt-6">
            <button
              @click="handleSearch"
              class="px-12 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-medium"
            >
              Search Flights
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { searchAirports } from '../utils/airportData';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

// Search form data
const fromQuery = ref('');
const toQuery = ref('');
const dates = ref(null); // Initialize as null to avoid default date
const tripType = ref('return'); // Default to return trip

// Format date for display
function formatDate(date) {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

// Computed properties for departure and return dates
const departureDate = computed(() => {
  if (tripType.value === 'oneWay') {
    // For one-way trips, dates.value is a single date object
    if (!dates.value || dates.value.getTime() === 0) return '';
    return formatDate(dates.value);
  } else {
    // For return trips, dates.value is an array of dates
    if (!dates.value?.[0] || (dates.value[0] && dates.value[0].getTime() === 0)) return '';
    return formatDate(dates.value[0]);
  }
});

const returnDate = computed(() => {
  if (tripType.value === 'oneWay') {
    return ''; // No return date for one-way trips
  } else {
    if (!dates.value?.[1] || (dates.value[1] && dates.value[1].getTime() === 0)) return '';
    return formatDate(dates.value[1]);
  }
});

// Search results and loading states
const fromResults = ref([]);
const toResults = ref([]);
const showFromResults = ref(false);
const showToResults = ref(false);
const isLoadingFrom = ref(false);
const isLoadingTo = ref(false);

// Selected locations
const selectedFromLocation = ref(null);
const selectedToLocation = ref(null);

// Date picker state
const showDatePicker = ref(false);
const activeDateInput = ref(null);
const datePickerPosition = ref({});

// Date picker handlers
function openDatePicker(type) {
  activeDateInput.value = type;
  showDatePicker.value = true;
}

function closeDatePicker() {
  showDatePicker.value = false;
  activeDateInput.value = null;
}

function handleDateSelection(selectedDates) {
  if (tripType.value === 'oneWay') {
    // For one-way trips, we get a single date
    if (selectedDates) {
      // Don't modify computed values directly, just update the dates ref
      // The computed properties will handle the display
      dates.value = selectedDates;
      closeDatePicker();
    }
  } else {
    // For return trips, we get an array of two dates
    if (selectedDates && selectedDates.length === 2) {
      // Don't modify computed values directly, just update the dates ref
      // The computed properties will handle the display
      dates.value = selectedDates;
      closeDatePicker();
    }
  }
}

// Function to set trip type
function setTripType(type) {
  tripType.value = type;
  
  // Reset dates when changing trip type
  if (type === 'oneWay') {
    // For one-way, convert to single date if we had a range before
    if (Array.isArray(dates.value) && dates.value.length > 0) {
      dates.value = dates.value[0];
      // If the date is invalid (Jan 1, 1970), set to null
      if (dates.value && dates.value.getTime() === 0) {
        dates.value = null;
      }
    }
  } else if (type === 'return') {
    // For return, convert to array if we had a single date
    if (!Array.isArray(dates.value)) {
      if (dates.value) {
        // If the date is invalid (Jan 1, 1970), set to null
        if (dates.value.getTime() === 0) {
          dates.value = [null, null];
        } else {
          dates.value = [dates.value, null];
        }
      } else {
        dates.value = [null, null];
      }
    }
  } else if (type === 'multiCity') {
    // For multi-city, we'd implement additional logic here
    // This is a placeholder for future implementation
    alert('Multi-city booking is not implemented yet');
    tripType.value = 'return'; // Fallback to return for now
  }
}

// Debounced search for From field
let fromSearchTimeout;
watch(fromQuery, async (newQuery) => {
  clearTimeout(fromSearchTimeout);
  if (newQuery.length < 2) {
    fromResults.value = [];
    return;
  }
  
  isLoadingFrom.value = true;
  fromSearchTimeout = setTimeout(async () => {
    try {
      const results = await searchAirports(newQuery);
      fromResults.value = results;
    } catch (error) {
      console.error('Error searching airports:', error);
      fromResults.value = [];
    } finally {
      isLoadingFrom.value = false;
    }
  }, 300);
});

// Debounced search for To field
let toSearchTimeout;
watch(toQuery, async (newQuery) => {
  clearTimeout(toSearchTimeout);
  if (newQuery.length < 2) {
    toResults.value = [];
    return;
  }
  
  isLoadingTo.value = true;
  toSearchTimeout = setTimeout(async () => {
    try {
      const results = await searchAirports(newQuery);
      toResults.value = results;
    } catch (error) {
      console.error('Error searching airports:', error);
      toResults.value = [];
    } finally {
      isLoadingTo.value = false;
    }
  }, 300);
});

// Select location handlers
function selectFromLocation(location) {
  selectedFromLocation.value = location;
  fromQuery.value = `${location.cityName} (${location.iataCode})`;
  showFromResults.value = false;
}

function selectToLocation(location) {
  selectedToLocation.value = location;
  toQuery.value = `${location.cityName} (${location.iataCode})`;
  showToResults.value = false;
}

// Switch locations function
const switchLocations = () => {
  // Switch the queries
  const tempQuery = fromQuery.value;
  fromQuery.value = toQuery.value;
  toQuery.value = tempQuery;

  // Switch the selected locations
  const tempLocation = selectedFromLocation.value;
  selectedFromLocation.value = selectedToLocation.value;
  selectedToLocation.value = tempLocation;
};

// Search handler
function handleSearch() {
  if (!selectedFromLocation.value || !selectedToLocation.value || !departureDate.value) {
    alert('Please fill in all required fields');
    return;
  }

  console.log('Searching with:', {
    from: selectedFromLocation.value,
    to: selectedToLocation.value,
    departureDate: departureDate.value,
    returnDate: returnDate.value,
    travelers: travelers.value,
    class: travelClass.value
  });
}
</script>

<style>
.booking-section {
  background-color: #ffffff;
  border-radius: 12px;
}

.loading {
  opacity: 0.7;
  pointer-events: none;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  margin-top: 0.25rem;
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 50;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.search-result-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.2s;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background-color: #f3f4f6;
  transform: translateX(4px);
}

/* Emoji and icon styles */
.search-result-item :deep(span) {
  display: inline-block;
  margin-right: 0.25rem;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Date picker customization */
.date-picker-wrapper {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 50;
  margin-top: 8px;
}

.date-picker-container {
  position: relative;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  min-width: 518px;
}

:deep(.dp__input_wrap) {
  display: none;  /* Hide the default input */
}

:deep(.dp__main) {
  border: none;
  width: 100%;
}

:deep(.dp__menu) {
  box-shadow: none !important;
  border: none !important;
  position: static !important;
  transform: none !important;
  width: 100% !important;
  padding: 16px !important;
}

:deep(.dp__flex_display) {
  display: flex !important;
  gap: 24px !important;
  justify-content: flex-start !important;
  padding-left: 16px !important;
}

:deep(.dp__calendar) {
  width: 220px !important;
}

:deep(.dp__calendar_item) {
  width: 28px !important;
  height: 28px !important;
  font-size: 13px !important;
  margin: 1px !important;
}

:deep(.dp__month_year_row) {
  margin: 8px 0 !important;
}

:deep(.dp__month_year_wrap) {
  width: 100% !important;
  justify-content: center !important;
}

:deep(.dp__month_year_select) {
  font-weight: 600 !important;
}

:deep(.dp__today) {
  border: 1px solid #2563eb !important;
}

:deep(.dp__active_date) {
  background: #2563eb !important;
}

:deep(.dp__range_between) {
  background: #e5edff !important;
  color: #2563eb !important;
}

:deep(.dp__range_start, .dp__range_end) {
  background: #2563eb !important;
  color: white !important;
}

:deep(.dp__action_buttons) {
  display: none !important;
}

/* Scrollbar styles */
.search-results::-webkit-scrollbar {
  width: 6px;
}

.search-results::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.search-results::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.search-results::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
