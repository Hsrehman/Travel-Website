const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

/**
 * Search for flights
 * @param {Object} params Search parameters
 * @param {string} params.departureCode IATA code for departure airport
 * @param {string} params.destinationCode IATA code for destination airport
 * @param {string} params.departureDate Departure date (YYYY-MM-DD)
 * @param {string} params.returnDate Return date for round trips (YYYY-MM-DD)
 * @param {string} params.cabinClass Cabin class (E, P, B, F)
 * @param {Array} params.passengers List of passenger objects with type and age
 * @returns {Promise<Object>} Flight search results
 */
export const searchFlights = async (params) => {
  try {
    const response = await fetch(`${API_BASE_URL}/flights/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        departureCode: params.departureCode.toUpperCase(),
        destinationCode: params.destinationCode.toUpperCase(),
        departureDate: params.departureDate,
        returnDate: params.returnDate,
        cabinClass: params.cabinClass?.toUpperCase() || 'E',
        passengers: params.passengers || [],
        journeyType: params.returnDate ? 'R' : 'O'
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to search flights');
    }

    const data = await response.json();
    return {
      flights: data.flights || []
    };
  } catch (error) {
    console.error('Error searching flights:', error);
    throw error;
  }
};

export const searchAirports = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/airports/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to search airports');
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching airports:', error);
    throw error;
  }
};

export const getAirportById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/airports/${id}`);
    if (!response.ok) {
      throw new Error('Failed to get airport');
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting airport:', error);
    throw error;
  }
};

export const getCountries = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/airports/countries`);
    if (!response.ok) {
      throw new Error('Failed to get countries');
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting countries:', error);
    throw error;
  }
};
