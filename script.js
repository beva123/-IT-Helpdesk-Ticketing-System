// Ticket Management System
class HelpdeskSystem {
    constructor() {
        this.tickets = this.loadTickets();
        this.currentFilter = 'all';
        this.currentTicketId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateStats();
        this.renderTickets();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('ticketForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createTicket();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderTickets();
            });
        });

        // Search functionality
        document.getElementById('searchTickets').addEventListener('input', (e) => {
            this.searchTickets(e.target.value);
        });

        // Modal close
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        window.addEventListener('click', (e) => {
            if (e.target.id === 'ticketModal') {
                this.closeModal();
            }
        });

        // Modal actions
        document.getElementById('updateStatus').addEventListener('click', () => {
            this.updateTicketStatus();
        });

        document.getElementById('deleteTicket').addEventListener('click', () => {
            this.deleteTicket();
        });

        document.getElementById('addComment').addEventListener('click', () => {
            this.addComment();
        });
    }

    createTicket() {
        const ticket = {
            id: this.generateTicketId(),
            userName: document.getElementById('userName').value,
            userEmail: document.getElementById('userEmail').value,
            department: document.getElementById('department').value,
            issueType: document.getElementById('issueType').value,
            priority: document.getElementById('priority').value,
            description: document.getElementById('description').value,
            status: 'Open',
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString(),
            comments: []
        };

        this.tickets.unshift(ticket);
        this.saveTickets();
        this.updateStats();
        this.renderTickets();
        
        // Reset form
        document.getElementById('ticketForm').reset();
        
        // Show success message
        this.showNotification(`Ticket ${ticket.id} created successfully!`, 'success');
    }

    generateTicketId() {
        const prefix = 'TKT';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        return `${prefix}-${timestamp}${random}`;
    }

    updateStats() {
        const stats = {
            open: this.tickets.filter(t => t.status === 'Open').length,
            progress: this.tickets.filter(t => t.status === 'In Progress').length,
            resolved: this.tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length,
            total: this.tickets.length
        };

        document.getElementById('openCount').textContent = stats.open;
        document.getElementById('progressCount').textContent = stats.progress;
        document.getElementById('resolvedCount').textContent = stats.resolved;
        document.getElementById('totalCount').textContent = stats.total;
    }

    renderTickets() {
        const ticketsList = document.getElementById('ticketsList');
        let filteredTickets = this.tickets;

        if (this.currentFilter !== 'all') {
            filteredTickets = this.tickets.filter(t => t.status === this.currentFilter);
        }

        if (filteredTickets.length === 0) {
            ticketsList.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No tickets found</p>';
            return;
        }

        ticketsList.innerHTML = filteredTickets.map(ticket => `
            <div class="ticket-card" onclick="helpdeskSystem.openTicketModal('${ticket.id}')">
                <div class="ticket-header">
                    <span class="ticket-id">${ticket.id}</span>
                    <span class="ticket-status status-${ticket.status.toLowerCase().replace(' ', '-')}">${ticket.status}</span>
                </div>
                <div class="ticket-info">
                    <div class="ticket-info-item">
                        <strong>User:</strong> ${ticket.userName}
                    </div>
                    <div class="ticket-info-item">
                        <strong>Department:</strong> ${ticket.department}
                    </div>
                    <div class="ticket-info-item">
                        <strong>Issue Type:</strong> ${ticket.issueType}
                    </div>
                    <div class="ticket-info-item">
                        <strong>Priority:</strong> <span class="priority-${ticket.priority.toLowerCase()}">${ticket.priority}</span>
                    </div>
                </div>
                <div class="ticket-description">
                    ${this.truncateText(ticket.description, 100)}
                </div>
                <div style="margin-top: 10px; font-size: 0.85em; color: #999;">
                    Created: ${this.formatDate(ticket.createdDate)}
                </div>
            </div>
        `).join('');
    }

    searchTickets(query) {
        const ticketsList = document.getElementById('ticketsList');
        const searchQuery = query.toLowerCase();

        const filteredTickets = this.tickets.filter(ticket => {
            return ticket.id.toLowerCase().includes(searchQuery) ||
                   ticket.userName.toLowerCase().includes(searchQuery) ||
                   ticket.description.toLowerCase().includes(searchQuery) ||
                   ticket.issueType.toLowerCase().includes(searchQuery) ||
                   ticket.department.toLowerCase().includes(searchQuery);
        });

        if (filteredTickets.length === 0) {
            ticketsList.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No tickets found matching your search</p>';
            return;
        }

        ticketsList.innerHTML = filteredTickets.map(ticket => `
            <div class="ticket-card" onclick="helpdeskSystem.openTicketModal('${ticket.id}')">
                <div class="ticket-header">
                    <span class="ticket-id">${ticket.id}</span>
                    <span class="ticket-status status-${ticket.status.toLowerCase().replace(' ', '-')}">${ticket.status}</span>
                </div>
                <div class="ticket-info">
                    <div class="ticket-info-item">
                        <strong>User:</strong> ${ticket.userName}
                    </div>
                    <div class="ticket-info-item">
                        <strong>Department:</strong> ${ticket.department}
                    </div>
                    <div class="ticket-info-item">
                        <strong>Issue Type:</strong> ${ticket.issueType}
                    </div>
                    <div class="ticket-info-item">
                        <strong>Priority:</strong> <span class="priority-${ticket.priority.toLowerCase()}">${ticket.priority}</span>
                    </div>
                </div>
                <div class="ticket-description">
                    ${this.truncateText(ticket.description, 100)}
                </div>
                <div style="margin-top: 10px; font-size: 0.85em; color: #999;">
                    Created: ${this.formatDate(ticket.createdDate)}
                </div>
            </div>
        `).join('');
    }

    openTicketModal(ticketId) {
        this.currentTicketId = ticketId;
        const ticket = this.tickets.find(t => t.id === ticketId);
        
        if (!ticket) return;

        const modal = document.getElementById('ticketModal');
        const detailsDiv = document.getElementById('ticketDetails');

        detailsDiv.innerHTML = `
            <div class="detail-row">
                <strong>Ticket ID:</strong>
                <span>${ticket.id}</span>
            </div>
            <div class="detail-row">
                <strong>Status:</strong>
                <span class="ticket-status status-${ticket.status.toLowerCase().replace(' ', '-')}">${ticket.status}</span>
            </div>
            <div class="detail-row">
                <strong>User Name:</strong>
                <span>${ticket.userName}</span>
            </div>
            <div class="detail-row">
                <strong>Email:</strong>
                <span>${ticket.userEmail}</span>
            </div>
            <div class="detail-row">
                <strong>Department:</strong>
                <span>${ticket.department}</span>
            </div>
            <div class="detail-row">
                <strong>Issue Type:</strong>
                <span>${ticket.issueType}</span>
            </div>
            <div class="detail-row">
                <strong>Priority:</strong>
                <span class="priority-${ticket.priority.toLowerCase()}">${ticket.priority}</span>
            </div>
            <div class="detail-row">
                <strong>Created:</strong>
                <span>${this.formatDate(ticket.createdDate)}</span>
            </div>
            <div class="detail-row">
                <strong>Last Updated:</strong>
                <span>${this.formatDate(ticket.updatedDate)}</span>
            </div>
            <div class="detail-row" style="flex-direction: column; align-items: flex-start;">
                <strong style="margin-bottom: 10px;">Description:</strong>
                <span style="line-height: 1.6;">${ticket.description}</span>
            </div>
        `;

        document.getElementById('statusUpdate').value = ticket.status;
        this.renderComments(ticket.comments);
        modal.style.display = 'block';
    }

    closeModal() {
        document.getElementById('ticketModal').style.display = 'none';
        this.currentTicketId = null;
    }

    updateTicketStatus() {
        const newStatus = document.getElementById('statusUpdate').value;
        const ticket = this.tickets.find(t => t.id === this.currentTicketId);
        
        if (ticket) {
            ticket.status = newStatus;
            ticket.updatedDate = new Date().toISOString();
            this.saveTickets();
            this.updateStats();
            this.renderTickets();
            this.closeModal();
            this.showNotification(`Ticket ${ticket.id} status updated to ${newStatus}`, 'success');
        }
    }

    deleteTicket() {
        if (confirm('Are you sure you want to delete this ticket?')) {
            this.tickets = this.tickets.filter(t => t.id !== this.currentTicketId);
            this.saveTickets();
            this.updateStats();
            this.renderTickets();
            this.closeModal();
            this.showNotification('Ticket deleted successfully', 'success');
        }
    }

    addComment() {
        const commentText = document.getElementById('commentText').value.trim();
        
        if (!commentText) {
            alert('Please enter a comment');
            return;
        }

        const ticket = this.tickets.find(t => t.id === this.currentTicketId);
        
        if (ticket) {
            const comment = {
                text: commentText,
                date: new Date().toISOString(),
                author: 'IT Support'
            };
            
            ticket.comments.push(comment);
            ticket.updatedDate = new Date().toISOString();
            this.saveTickets();
            this.renderComments(ticket.comments);
            document.getElementById('commentText').value = '';
            this.showNotification('Comment added successfully', 'success');
        }
    }

    renderComments(comments) {
        const commentsList = document.getElementById('commentsList');
        
        if (comments.length === 0) {
            commentsList.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No comments yet</p>';
            return;
        }

        commentsList.innerHTML = comments.map(comment => `
            <div class="comment-item">
                <div class="comment-meta">
                    <strong>${comment.author}</strong> - ${this.formatDate(comment.date)}
                </div>
                <div class="comment-text">${comment.text}</div>
            </div>
        `).join('');
    }

    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    showNotification(message, type) {
        // Simple notification system
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    saveTickets() {
        localStorage.setItem('helpdeskTickets', JSON.stringify(this.tickets));
    }

    loadTickets() {
        const saved = localStorage.getItem('helpdeskTickets');
        return saved ? JSON.parse(saved) : this.getSampleTickets();
    }

    getSampleTickets() {
        return [
            {
                id: 'TKT-100001',
                userName: 'Sarah Johnson',
                userEmail: 'sarah.j@company.com',
                department: 'Finance',
                issueType: 'Software',
                priority: 'High',
                description: 'Unable to access QuickBooks. Error message: "Connection timeout". Urgent - need to process payroll today.',
                status: 'Open',
                createdDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                updatedDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                comments: []
            },
            {
                id: 'TKT-100002',
                userName: 'Michael Chen',
                userEmail: 'michael.c@company.com',
                department: 'Sales',
                issueType: 'Hardware',
                priority: 'Critical',
                description: 'Laptop won\'t turn on. Tried holding power button but no response. Have important client presentation in 2 hours.',
                status: 'In Progress',
                createdDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                updatedDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                comments: [
                    {
                        text: 'Received your ticket. Checking power adapter and battery.',
                        date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                        author: 'IT Support'
                    }
                ]
            },
            {
                id: 'TKT-100003',
                userName: 'Emily Rodriguez',
                userEmail: 'emily.r@company.com',
                department: 'HR',
                issueType: 'Password',
                priority: 'Medium',
                description: 'Need password reset for HR management system. Account locked after multiple failed login attempts.',
                status: 'Resolved',
                createdDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                updatedDate: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
                comments: [
                    {
                        text: 'Password has been reset. Temporary password sent to your email.',
                        date: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
                        author: 'IT Support'
                    }
                ]
            }
        ];
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the system
const helpdeskSystem = new HelpdeskSystem();
