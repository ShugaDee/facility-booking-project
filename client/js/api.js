// Since we are combining them into a single app, the frontend and backend 
// will share the same domain. We can just use an empty string.
const API_BASE_URL = '';


class ApiService {
    constructor() {
        this.baseUrl = API_BASE_URL;
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    }

    setCurrentUser(user) {
        this.currentUser = user;
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('currentUser');
        }
    }

    // Auth
    async signup(name, email, password, role) {
        const user = await this.fetchWithHandler('/users/signup', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, role })
        });
        this.setCurrentUser(user);
        return user;
    }

    async login(email, password) {
        const user = await this.fetchWithHandler('/users/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        this.setCurrentUser(user);
        return user;
    }

    async logout() {
        this.setCurrentUser(null);
    }

    async fetchWithHandler(endpoint, options = {}) {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API Error on ${endpoint}:`, error);
            throw error;
        }
    }

    // Users
    async getUsers() {
        return this.fetchWithHandler('/users');
    }

    async updateUserRole(id, role) {
        return this.fetchWithHandler(`/users/${id}/role`, {
            method: 'PATCH',
            body: JSON.stringify({ role })
        });
    }

    async deleteUser(id) {
        return this.fetchWithHandler(`/users/${id}`, {
            method: 'DELETE'
        });
    }

    // Facilities
    async getFacilities() {
        return this.fetchWithHandler('/facilities');
    }

    async getFacility(id) {
        return this.fetchWithHandler(`/facilities/${id}`);
    }

    async createFacility(name, location, capacity) {
        return this.fetchWithHandler('/facilities', {
            method: 'POST',
            body: JSON.stringify({ name, location, capacity })
        });
    }

    async deleteFacility(id) {
        return this.fetchWithHandler(`/facilities/${id}`, {
            method: 'DELETE'
        });
    }

    // Bookings
    async getBookings() {
        return this.fetchWithHandler('/bookings');
    }

    async createBooking(facilityId, date, startTime, endTime) {
        if (!this.currentUser) throw new Error("Must be logged in to book.");
        return this.fetchWithHandler('/bookings', {
            method: 'POST',
            body: JSON.stringify({
                facility_id: facilityId,
                user_id: this.currentUser.id,
                date,
                start_time: startTime,
                end_time: endTime
            })
        });
    }

    async updateBooking(id, status) {
        return this.fetchWithHandler(`/bookings/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    async cancelBooking(bookingId) {
        return this.fetchWithHandler(`/bookings/${bookingId}`, {
            method: 'DELETE'
        });
    }

    // Availability
    async checkAvailability(facilityId, date) {
        return this.fetchWithHandler(`/availability?facilityId=${facilityId}&date=${date}`);
    }
}

// Export a singleton instance
const api = new ApiService();
window.api = api;
