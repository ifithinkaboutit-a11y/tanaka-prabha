import Appointment from '../models/Appointment.js';
import Professional from '../models/Professional.js';
import Connection from '../models/Connection.js';

/**
 * Get appointments for current user
 */
export const getMyAppointments = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { limit = 50, offset = 0, status, upcoming_only } = req.query;

        const appointments = await Appointment.findByUserId(userId, {
            limit: parseInt(limit),
            offset: parseInt(offset),
            status,
            upcoming_only: upcoming_only === 'true'
        });

        res.status(200).json({
            status: 'success',
            message: 'Appointments retrieved successfully',
            data: {
                appointments,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    count: appointments.length
                }
            }
        });
    } catch (error) {
        console.error('Error fetching user appointments:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch appointments',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get appointments for a specific professional
 */
export const getByProfessional = async (req, res) => {
    try {
        const { professional_id } = req.params;
        const { limit = 50, offset = 0, date, status } = req.query;

        // Verify professional exists
        const professional = await Professional.findById(professional_id);
        if (!professional) {
            return res.status(404).json({
                status: 'error',
                message: 'Professional not found'
            });
        }

        const appointments = await Appointment.findByProfessionalId(professional_id, {
            limit: parseInt(limit),
            offset: parseInt(offset),
            date,
            status
        });

        res.status(200).json({
            status: 'success',
            message: 'Appointments retrieved successfully',
            data: {
                appointments,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    count: appointments.length
                }
            }
        });
    } catch (error) {
        console.error('Error fetching professional appointments:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch appointments',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get appointment by ID
 */
export const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({
                status: 'error',
                message: 'Appointment not found'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Appointment retrieved successfully',
            data: { appointment }
        });
    } catch (error) {
        console.error('Error fetching appointment:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch appointment',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Create a new appointment
 */
export const createAppointment = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { professionalId, date, time, notes } = req.body;

        // Validate required fields
        if (!professionalId || !date || !time) {
            return res.status(400).json({
                status: 'error',
                message: 'Professional ID, date, and time are required'
            });
        }

        // Verify professional exists and is available
        const professional = await Professional.findById(professionalId);
        if (!professional) {
            return res.status(404).json({
                status: 'error',
                message: 'Professional not found'
            });
        }

        if (!professional.is_available) {
            return res.status(400).json({
                status: 'error',
                message: 'This professional is currently not available for appointments'
            });
        }

        // Check if the date is fully booked
        const isFullyBooked = await Appointment.isFullyBooked(professionalId, date);
        if (isFullyBooked) {
            return res.status(400).json({
                status: 'error',
                message: `This professional has reached the maximum appointments for ${date} (${Appointment.MAX_PER_DAY} per day)`
            });
        }

        // Check if the specific time slot is available
        const isSlotAvailable = await Appointment.isSlotAvailable(professionalId, date, time);
        if (!isSlotAvailable) {
            return res.status(400).json({
                status: 'error',
                message: `The time slot ${time} on ${date} is already booked`
            });
        }

        // Create the appointment
        const appointment = await Appointment.create({
            user_id: userId,
            professional_id: professionalId,
            appointment_date: date,
            appointment_time: time,
            notes
        });

        // Also log this as a connection for analytics
        try {
            await Connection.create({
                user_id: userId,
                professional_id: professionalId,
                method: 'appointment'
            });
        } catch (connError) {
            console.warn('Failed to log connection:', connError);
            // Don't fail the appointment creation if connection logging fails
        }

        res.status(201).json({
            status: 'success',
            message: 'Appointment created successfully',
            data: { appointment }
        });
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create appointment',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Cancel an appointment
 */
export const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        // Get the appointment
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({
                status: 'error',
                message: 'Appointment not found'
            });
        }

        // Verify ownership
        if (appointment.user_id !== userId) {
            return res.status(403).json({
                status: 'error',
                message: 'You can only cancel your own appointments'
            });
        }

        // Check if already cancelled
        if (appointment.status === 'cancelled') {
            return res.status(400).json({
                status: 'error',
                message: 'Appointment is already cancelled'
            });
        }

        // Check if already completed
        if (appointment.status === 'completed') {
            return res.status(400).json({
                status: 'error',
                message: 'Cannot cancel a completed appointment'
            });
        }

        // Cancel the appointment
        const updatedAppointment = await Appointment.cancel(id);

        res.status(200).json({
            status: 'success',
            message: 'Appointment cancelled successfully',
            data: { appointment: updatedAppointment }
        });
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to cancel appointment',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Update appointment status (for admin/professional use)
 */
export const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                status: 'error',
                message: 'Status is required'
            });
        }

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({
                status: 'error',
                message: 'Appointment not found'
            });
        }

        const updatedAppointment = await Appointment.update(id, { status });

        res.status(200).json({
            status: 'success',
            message: `Appointment ${status} successfully`,
            data: { appointment: updatedAppointment }
        });
    } catch (error) {
        console.error('Error updating appointment status:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update appointment status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get available time slots for a professional on a date
 */
export const getAvailableSlots = async (req, res) => {
    try {
        const { professional_id, date } = req.params;

        // Verify professional exists
        const professional = await Professional.findById(professional_id);
        if (!professional) {
            return res.status(404).json({
                status: 'error',
                message: 'Professional not found'
            });
        }

        const availableSlots = await Appointment.getAvailableSlots(professional_id, date);
        const appointmentCount = await Appointment.getCountForDate(professional_id, date);
        const isFullyBooked = appointmentCount >= Appointment.MAX_PER_DAY;

        res.status(200).json({
            status: 'success',
            message: 'Available slots retrieved successfully',
            data: {
                date,
                professional_id: professional.id,
                professional_name: professional.name,
                available_slots: availableSlots,
                total_slots: Appointment.TIME_SLOTS,
                booked_count: appointmentCount,
                max_per_day: Appointment.MAX_PER_DAY,
                is_fully_booked: isFullyBooked
            }
        });
    } catch (error) {
        console.error('Error fetching available slots:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch available slots',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get appointment count for a professional on a date
 */
export const getCountForDate = async (req, res) => {
    try {
        const { professional_id, date } = req.params;

        const count = await Appointment.getCountForDate(professional_id, date);

        res.status(200).json({
            status: 'success',
            message: 'Appointment count retrieved successfully',
            data: {
                professional_id,
                date,
                count,
                max_per_day: Appointment.MAX_PER_DAY,
                is_fully_booked: count >= Appointment.MAX_PER_DAY
            }
        });
    } catch (error) {
        console.error('Error fetching appointment count:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch appointment count',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get all appointments (admin only) — returns full list with farmer and professional names joined
 */
export const getAllAppointmentsAdmin = async (req, res) => {
    try {
        const { limit = 50, offset = 0, status, date_from, date_to } = req.query;

        const appointments = await Appointment.findAll({ limit, offset, status, date_from, date_to });

        res.status(200).json({
            status: 'success',
            message: 'Appointments retrieved successfully',
            data: {
                appointments,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    count: appointments.length
                }
            }
        });
    } catch (error) {
        console.error('Error fetching all appointments (admin):', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch appointments',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Delete an appointment (admin only)
 */
export const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({
                status: 'error',
                message: 'Appointment not found'
            });
        }

        await Appointment.delete(id);

        res.status(200).json({
            status: 'success',
            message: 'Appointment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete appointment',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
