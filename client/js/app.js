/**
 * Application state and UI logic
 */

class App {
    constructor() {
        this.state = {
            view: window.api.currentUser ? 'facilities-view' : 'auth-view',
            authMode: 'login', // 'login' or 'signup'
            facilities: [],
            bookings: [],
            allBookings: [], // for admin
            selectedFacility: null,
            selectedDate: this.getTodayDateString(),
            selectedSlot: null
        };

        this.init();
    }

    async init() {
        this.setupEventListeners();

        if (window.api.currentUser) {
            this.updateHeaderProfile();
            if (window.api.currentUser.role === 'admin') {
                this.showView('admin-view');
            } else {
                await this.loadFacilities();
                this.showView('facilities-view');
            }
        } else {
            this.showView('auth-view');
        }

        // Default to today for booking
        const dateInput = document.getElementById('booking-date');
        if (dateInput) dateInput.value = this.state.selectedDate;
    }

    setupEventListeners() {
        // Navigation clicks
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                if (!view) return;
                this.showView(view);
            });
        });

        // Date selection change
        const dateInput = document.getElementById('booking-date');
        if (dateInput) {
            dateInput.addEventListener('change', (e) => {
                this.state.selectedDate = e.target.value;
                this.state.selectedSlot = null; // reset selection
                this.updateBookingConfirmation();
                if (this.state.selectedFacility) {
                    this.loadAvailability(this.state.selectedFacility.id, this.state.selectedDate);
                }
            });
        }

        // Confirm booking
        const confirmBtn = document.getElementById('confirm-booking-btn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.handleBookingSubmit());
        }

        // --- AUTH EVENTS ---
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');

                this.state.authMode = e.target.dataset.mode;
                const isSignup = this.state.authMode === 'signup';

                document.querySelectorAll('.signup-only').forEach(el => {
                    if (isSignup) el.classList.remove('hidden');
                    else el.classList.add('hidden');
                });

                const btn = document.querySelector('#auth-form button[type="submit"]');
                btn.textContent = isSignup ? 'Create Account' : 'Login';
            });
        });

        const authForm = document.getElementById('auth-form');
        if (authForm) {
            authForm.addEventListener('submit', (e) => this.handleAuthSubmit(e));
        }

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                api.logout();
                this.updateHeaderProfile();
                this.showView('auth-view');
            });
        }

        // --- ADMIN EVENTS ---
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');

                document.querySelectorAll('.admin-panel').forEach(p => p.classList.add('hidden'));
                document.getElementById(e.target.dataset.target).classList.remove('hidden');
            });
        });

        const addFacilityBtn = document.getElementById('add-facility-btn');
        if (addFacilityBtn) {
            addFacilityBtn.addEventListener('click', () => {
                document.getElementById('add-facility-form-container').classList.remove('hidden');
            });
        }

        const addFacilityForm = document.getElementById('add-facility-form');
        if (addFacilityForm) {
            addFacilityForm.addEventListener('submit', (e) => this.handleAddFacilitySubmit(e));
        }
    }

    updateHeaderProfile() {
        const user = window.api.currentUser;
        const profileContainer = document.getElementById('profile-container');
        const logoutBtn = document.getElementById('logout-btn');
        const adminNav = document.getElementById('nav-admin');
        const navBtns = document.querySelectorAll('.nav-btn');

        if (user) {
            profileContainer.classList.remove('hidden');
            logoutBtn.classList.remove('hidden');

            document.getElementById('profile-name').textContent = user.name;
            document.getElementById('profile-avatar').textContent = user.name.substring(0, 2).toUpperCase();

            navBtns.forEach(btn => {
                const view = btn.dataset.view;
                if (!view) return;

                if (view === 'facilities-view' || view === 'history-view') {
                    if (user.role === 'admin') btn.classList.add('hidden');
                    else btn.classList.remove('hidden');
                } else if (view === 'admin-view') {
                    if (user.role === 'admin') btn.classList.remove('hidden');
                    else btn.classList.add('hidden');
                }
            });
        } else {
            profileContainer.classList.add('hidden');
            logoutBtn.classList.add('hidden');
            if (adminNav) adminNav.classList.add('hidden');
        }
    }

    async handleAuthSubmit(e) {
        e.preventDefault();

        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Processing...';

        try {
            if (this.state.authMode === 'login') {
                await api.login(email, password);
                this.showToast('Welcome back!', 'success');
            } else {
                const name = document.getElementById('auth-name').value;
                const role = document.getElementById('auth-role').value;
                await api.signup(name, email, password, role);
                this.showToast('Account created successfully!', 'success');
            }

            this.updateHeaderProfile();
            if (window.api.currentUser.role === 'admin') {
                this.showView('admin-view');
            } else {
                await this.loadFacilities();
                this.showView('facilities-view');
            }
        } catch (error) {
            this.showToast(error.message || 'Authentication failed', 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    }

    // --- View Management ---

    showView(viewId) {
        this.state.view = viewId;

        const appContainer = document.querySelector('.app-container');
        if (viewId === 'auth-view') {
            appContainer.classList.add('auth-mode');
        } else {
            appContainer.classList.remove('auth-mode');
        }

        // Update Nav Menu UI
        document.querySelectorAll('.nav-btn').forEach(btn => {
            if (btn.dataset.view === viewId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update Sections
        document.querySelectorAll('.view-section').forEach(section => {
            if (section.id === viewId) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });

        // Setup particular views
        const titleEl = document.getElementById('current-view-title');
        if (viewId === 'facilities-view') {
            titleEl.textContent = 'Facilities Overview';
            this.state.selectedFacility = null;
        } else if (viewId === 'history-view') {
            titleEl.textContent = 'My Bookings';
            this.loadHistory();
        } else if (viewId === 'booking-view') {
            titleEl.textContent = 'Schedule Reservation';
            // Wait for facility to be selected first from facilities-view
        } else if (viewId === 'admin-view') {
            titleEl.textContent = 'Admin Control Center';
            this.loadAdminData();
        }
    }

    // --- Admin Functions ---

    async loadAdminData() {
        if (!window.api.currentUser || window.api.currentUser.role !== 'admin') return;

        // Ensure facilities are loaded
        if (this.state.facilities.length === 0) await this.loadFacilities();

        try {
            const usersResponse = await api.getUsers();
            this.state.allUsers = Array.isArray(usersResponse) ? usersResponse : (usersResponse.data || []);

            const bookingsResponse = await api.getBookings();
            this.state.allBookings = Array.isArray(bookingsResponse) ? bookingsResponse : (bookingsResponse.data || []);

            this.renderAdminBookings();
            this.renderAdminUsers();
            this.renderAdminFacilities();
        } catch (e) {
            console.error("Failed to load admin data", e);
        }
    }

    renderAdminBookings() {
        const listEl = document.getElementById('admin-bookings-list');
        listEl.innerHTML = '';

        if (!this.state.allBookings || this.state.allBookings.length === 0) {
            listEl.innerHTML = `<p class="subtitle">No reservations found in the system.</p>`;
            return;
        }

        const sorted = [...this.state.allBookings].sort((a, b) => new Date(b.date) - new Date(a.date));

        let tableHTML = `
            <div class="admin-table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Facility</th>
                            <th>User</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        sorted.forEach(booking => {
            const fac = this.state.facilities.find(f => f.id == booking.facility_id) || { name: 'Unknown' };
            const customerName = booking.user ? booking.user.name : `User #${booking.user_id}`;
            const dateStr = new Date(booking.date).toLocaleDateString();

            let statusClass = 'status-pending';
            if (booking.status === 'confirmed') statusClass = 'status-confirmed';
            if (booking.status === 'cancelled') statusClass = 'status-cancelled';

            let actions = '';
            if (booking.status === 'pending') {
                actions += `<button class="btn-primary btn-small" onclick="app.updateBookingStatus(${booking.id}, 'confirmed')">Approve</button>`;
            }
            if (booking.status !== 'cancelled') {
                actions += `<button class="btn-danger btn-small" onclick="app.updateBookingStatus(${booking.id}, 'cancelled')" style="margin-left: 8px;">Cancel</button>`;
            }

            tableHTML += `
                <tr>
                    <td style="font-weight: 500; color: var(--clr-primary);">${this.escapeHTML(fac.name)}</td>
                    <td>${this.escapeHTML(customerName)}</td>
                    <td>${dateStr}</td>
                    <td>${booking.start_time.substring(0, 5)} - ${booking.end_time.substring(0, 5)}</td>
                    <td><span class="br-status ${statusClass}">${booking.status}</span></td>
                    <td style="white-space: nowrap;">${actions}</td>
                </tr>
            `;
        });

        tableHTML += `</tbody></table></div>`;
        listEl.innerHTML = tableHTML;
    }

    async updateBookingStatus(id, newStatus) {
        try {
            await api.updateBooking(id, newStatus);
            this.showToast(`Booking ${newStatus}.`, 'success');
            this.loadAdminData();
        } catch (e) {
            this.showToast('Failed to update booking status.', 'error');
        }
    }

    renderAdminUsers() {
        const listEl = document.getElementById('admin-users-list');
        listEl.innerHTML = '';

        if (!this.state.allUsers || this.state.allUsers.length === 0) {
            listEl.innerHTML = `<p class="subtitle">No users found in the system.</p>`;
            return;
        }

        const sorted = [...this.state.allUsers].sort((a, b) => a.id - b.id);

        let tableHTML = `
            <div class="admin-table-container">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>User ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role / Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    `;

        sorted.forEach(user => {
            let statusClass = 'status-pending';
            if (user.role === 'admin') statusClass = 'status-active';
            else if (user.role === 'user') statusClass = 'status-confirmed';
            else if (user.role === 'blocked') statusClass = 'status-cancelled';

            let actions = '';
            if (user.role !== 'blocked' && user.id !== window.api.currentUser.id) {
                actions += `<button class="btn-danger btn-small" onclick="app.updateUserRole(${user.id}, 'blocked')" style="background: transparent; border-color: var(--clr-warning); color: var(--clr-warning)">Block</button>`;
            } else if (user.role === 'blocked') {
                actions += `<button class="btn-primary btn-small" onclick="app.updateUserRole(${user.id}, 'user')">Unblock</button>`;
            }

            if (user.id !== window.api.currentUser.id) {
                actions += `<button class="btn-danger btn-small" onclick="app.adminDeleteUser(${user.id})" style="margin-left: 8px;">Delete</button>`;
            }

            tableHTML += `
                    <tr>
                        <td style="font-weight: 500; color: var(--clr-text-muted);">#${user.id}</td>
                        <td style="font-weight: 500; color: var(--clr-primary);">${this.escapeHTML(user.name)}</td>
                        <td>${this.escapeHTML(user.email)}</td>
                        <td><span class="br-status ${statusClass}">${user.role}</span></td>
                        <td style="white-space: nowrap;">${actions}</td>
                    </tr>
                    `;
        });

        tableHTML += `</tbody></table></div>`;
        listEl.innerHTML = tableHTML;
    }

    async updateUserRole(id, newRole) {
        try {
            await api.updateUserRole(id, newRole);
            this.showToast(`User status updated to ${newRole}.`, 'success');
            this.loadAdminData();
        } catch (e) {
            this.showToast('Failed to update user status.', 'error');
        }
    }

    async adminDeleteUser(id) {
        if (!confirm('Are you certain? This will remove the user permanently.')) return;

        try {
            await api.deleteUser(id);
            this.showToast('User deleted.', 'success');
            this.loadAdminData();
        } catch (e) {
            this.showToast('Failed to delete user.', 'error');
        }
    }

    renderAdminFacilities() {
        const grid = document.getElementById('admin-facilities-list');
        grid.innerHTML = '';

        this.state.facilities.forEach(fac => {
            const card = document.createElement('div');
            card.className = 'facility-card';
            card.innerHTML = `
                <div class="fc-header">
                    <h4 class="fc-name">${this.escapeHTML(fac.name)}</h4>
                    <span class="fc-capacity">${fac.capacity}</span>
                </div>
                <div class="fc-location" style="margin-bottom: 1rem;">${this.escapeHTML(fac.location)}</div>
                <button class="btn-danger" style="width:100%" onclick="app.adminDeleteFacility(${fac.id})">Remove Facility</button>
            `;
            grid.appendChild(card);
        });
    }

    async handleAddFacilitySubmit(e) {
        e.preventDefault();
        const name = document.getElementById('af-name').value;
        const location = document.getElementById('af-location').value;
        const capacity = document.getElementById('af-capacity').value;

        try {
            await api.createFacility(name, location, capacity);
            this.showToast('Facility added successfully!', 'success');

            // clear and hide form
            e.target.reset();
            document.getElementById('add-facility-form-container').classList.add('hidden');

            // Reload and re-render
            await this.loadFacilities();
            this.renderAdminFacilities();
        } catch (e) {
            this.showToast(e.message || 'Failed to add facility', 'error');
        }
    }

    async adminDeleteFacility(id) {
        if (!confirm('Are you certain? This will remove the facility permanently.')) return;

        try {
            await api.deleteFacility(id);
            this.showToast('Facility deleted.', 'success');
            await this.loadFacilities();
            this.renderAdminFacilities();
        } catch (e) {
            this.showToast('Failed to delete facility. Ensure no active bookings remain.', 'error');
        }
    }

    // --- Facilities ---

    async loadFacilities() {
        try {
            const facilities = await api.getFacilities();
            this.state.facilities = facilities;
            this.renderFacilities();
        } catch (error) {
            this.showToast('Failed to load facilities.', 'error');
        }
    }

    renderFacilities() {
        const grid = document.getElementById('facilities-grid');
        grid.innerHTML = '';

        if (this.state.facilities.length === 0) {
            grid.innerHTML = `<p class="subtitle" style="grid-column: 1/-1;">No facilities found.</p>`;
            return;
        }

        this.state.facilities.forEach(fac => {
            const card = document.createElement('div');
            card.className = 'facility-card';
            card.innerHTML = `
                <div class="fc-header">
                    <h4 class="fc-name">${this.escapeHTML(fac.name)}</h4>
                    <span class="fc-capacity">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        ${fac.capacity}
                    </span>
                </div>
                <div class="fc-location">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    ${this.escapeHTML(fac.location)}
                </div>
            `;

            card.addEventListener('click', () => {
                this.selectFacility(fac);
            });

            grid.appendChild(card);
        });
    }

    // --- Booking Creation ---

    selectFacility(facility) {
        this.state.selectedFacility = facility;
        this.state.selectedSlot = null;

        // Render details
        const detailsEl = document.getElementById('selected-facility-details');
        detailsEl.innerHTML = `
            <h3>${this.escapeHTML(facility.name)}</h3>
            <div class="detail-item">
                <div class="detail-label">Location</div>
                <div>${this.escapeHTML(facility.location)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Max Capacity</div>
                <div>${facility.capacity} People</div>
            </div>
            <div class="detail-item" style="color: var(--clr-primary); margin-top: 1rem; font-size: 0.9rem;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Select a 30-minute slot on the right to reserve.
            </div>
            `;

        this.updateBookingConfirmation();
        this.showView('booking-view');
        this.loadAvailability(facility.id, this.state.selectedDate);
    }

    async loadAvailability(facilityId, date) {
        const slotsGrid = document.getElementById('time-slots-grid');
        slotsGrid.innerHTML = `<div>Loading availability...</div>`;

        try {
            const response = await api.checkAvailability(facilityId, date);
            const availableSlots = response.availableSlots || [];

            slotsGrid.innerHTML = '';

            if (availableSlots.length === 0) {
                slotsGrid.innerHTML = `<p class="subtitle" style="grid-column: 1/-1">No time slots available for this date.</p>`;
                return;
            }

            availableSlots.forEach(slotStartTime => {
                // Generate end time (+30 min)
                let [hr, min] = slotStartTime.split(':').map(Number);
                let endMin = min + 30;
                let endHr = hr;
                if (endMin >= 60) {
                    endHr++;
                    endMin -= 60;
                }
                const endStr = `${String(endHr).padStart(2, '0')}:${String(endMin).padStart(2, '0')} `;

                const slotEl = document.createElement('div');
                slotEl.className = 'time-slot';
                slotEl.textContent = slotStartTime;

                slotEl.addEventListener('click', () => {
                    // clear old selection
                    document.querySelectorAll('.time-slot.selected').forEach(el => el.classList.remove('selected'));
                    slotEl.classList.add('selected');
                    this.state.selectedSlot = { start: slotStartTime, end: endStr };
                    this.updateBookingConfirmation();
                });

                slotsGrid.appendChild(slotEl);
            });

        } catch (error) {
            slotsGrid.innerHTML = `<div style="color:var(--clr-danger)">Error loading times. Try again.</div>`;
            console.error(error);
        }
    }

    updateBookingConfirmation() {
        const panel = document.getElementById('booking-confirmation-panel');
        const text = document.getElementById('booking-summary-text');

        if (this.state.selectedFacility && this.state.selectedDate && this.state.selectedSlot) {
            panel.classList.remove('hidden');
            text.innerHTML = `Reserving <strong>${this.escapeHTML(this.state.selectedFacility.name)}</strong> on <strong>${this.state.selectedDate}</strong> from <strong>${this.state.selectedSlot.start}</strong> to <strong>${this.state.selectedSlot.end}</strong>.`;
        } else {
            panel.classList.add('hidden');
        }
    }

    async handleBookingSubmit() {
        const { selectedFacility, selectedDate, selectedSlot } = this.state;
        if (!selectedFacility || !selectedSlot) return;

        try {
            const btn = document.getElementById('confirm-booking-btn');
            btn.disabled = true;
            btn.textContent = 'Processing...';

            await api.createBooking(selectedFacility.id, selectedDate, selectedSlot.start, selectedSlot.end);

            this.showToast('Reservation successful!', 'success');

            // Clean up and jump to history
            this.state.selectedSlot = null;
            btn.textContent = 'Confirm Reservation';
            btn.disabled = false;

            this.showView('history-view');
        } catch (err) {
            this.showToast(err.message || 'Failed to create booking.', 'error');
            const btn = document.getElementById('confirm-booking-btn');
            btn.disabled = false;
            btn.textContent = 'Confirm Reservation';
        }
    }

    // --- History View ---

    async loadHistory() {
        const listEl = document.getElementById('bookings-list');
        listEl.innerHTML = `<p>Loading records...</p>`;

        if (!api.currentUser) {
            listEl.innerHTML = `<p class="subtitle">Please login to view history.</p>`;
            return;
        }

        try {
            const bookingsResponse = await api.getBookings();

            // Wait, the API returns a 'bookings' array inside the response according to standard MVC?
            // Actually, depends on how the controller was written. Let's handle both.
            let bookings = Array.isArray(bookingsResponse) ? bookingsResponse : (bookingsResponse.data || []);

            // Filter for current user (ID 2: John Fordj) 
            const myBookings = bookings.filter(b => b.user_id == api.currentUser.id);

            listEl.innerHTML = '';

            if (myBookings.length === 0) {
                listEl.innerHTML = `<p class="subtitle">You have no upcoming or past reservations.</p>`;
                return;
            }

            // Sort by date desc
            myBookings.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Wait, we need facility names. We should have them in this.state.facilities by now.
            myBookings.forEach(booking => {
                const fac = this.state.facilities.find(f => f.id == booking.facility_id) || { name: 'Unknown Facility' };

                const card = document.createElement('div');
                card.className = 'booking-record';

                // Format date string beautifully
                const dateObj = new Date(booking.date);
                const dateStr = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

                // Ensure times look like HH:MM
                const startStr = booking.start_time.substring(0, 5);
                const endStr = booking.end_time.substring(0, 5);

                let statusClass = 'status-pending';
                if (booking.status === 'confirmed') statusClass = 'status-confirmed';
                if (booking.status === 'cancelled') statusClass = 'status-cancelled';

                card.innerHTML = `
                    <div class="br-info">
                        <h4>${this.escapeHTML(fac.name)}</h4>
                        <div class="br-details">
                            <span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: text-bottom"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                ${dateStr}
                            </span>
                            <span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: text-bottom"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                ${startStr} - ${endStr}
                            </span>
                        </div>
                    </div>
                <div>
                    <span class="br-status ${statusClass}">${booking.status}</span>
                    ${booking.status !== 'cancelled' ? `<button class="btn-danger" style="margin-left:1rem" data-id="${booking.id}">Cancel</button>` : ''}
                </div>
            `;

                const cancelBtn = card.querySelector('.btn-danger');
                if (cancelBtn) {
                    cancelBtn.addEventListener('click', () => this.cancelBooking(booking.id));
                }

                listEl.appendChild(card);
            });

        } catch (error) {
            listEl.innerHTML = `<p class="subtitle" style="color:var(--clr-danger)">Failed to load bookings.</p>`;
            console.error(error);
        }
    }

    async cancelBooking(bookingId) {
        if (!confirm('Are you sure you want to cancel this reservation?')) return;

        try {
            await api.cancelBooking(bookingId);
            this.showToast('Reservation cancelled.', 'success');
            this.loadHistory(); // reload UI
        } catch (err) {
            this.showToast('Failed to cancel.', 'error');
        }
    }

    // --- Utils ---

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type} `;
        toast.textContent = message;

        container.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, 3000);
    }

    getTodayDateString() {
        const d = new Date();
        // Return YYYY-MM-DD
        return d.toISOString().split('T')[0];
    }

    escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
