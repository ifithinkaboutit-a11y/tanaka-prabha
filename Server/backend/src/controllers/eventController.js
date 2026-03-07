import Event from '../models/Event.js';
import EventParticipant from '../models/EventParticipant.js';
import User from '../models/User.js';

export const createEvent = async (req, res) => {
    try {
        const eventData = req.body;
        const newEvent = await Event.create(eventData);

        res.status(201).json({
            status: 'success',
            data: { event: newEvent }
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ status: 'error', message: 'Failed to create event' });
    }
};

export const getEvents = async (req, res) => {
    try {
        const { limit = 200, offset = 0 } = req.query;
        const events = await Event.findAll(parseInt(limit), parseInt(offset));

        res.status(200).json({
            status: 'success',
            data: { events }
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch events' });
    }
};

export const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({ status: 'error', message: 'Event not found' });
        }

        res.status(200).json({
            status: 'success',
            data: { event }
        });
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch event' });
    }
};

export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const eventData = req.body;

        const updatedEvent = await Event.update(id, eventData);

        if (!updatedEvent) {
            return res.status(404).json({ status: 'error', message: 'Event not found' });
        }

        res.status(200).json({
            status: 'success',
            data: { event: updatedEvent }
        });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ status: 'error', message: 'Failed to update event' });
    }
};

export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        await Event.delete(id);

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ status: 'error', message: 'Failed to delete event' });
    }
};

export const registerParticipant = async (req, res) => {
    try {
        const { id } = req.params;
        const { mobile_number, name } = req.body;
        const userId = req.user ? req.user.userId : null;

        // If no user context, we might lookup user by phone number
        let finalUserId = userId;
        let finalName = name;

        if (!finalUserId && mobile_number) {
            const existingUser = await User.findByMobile(mobile_number);
            if (existingUser) {
                finalUserId = existingUser.id;
                finalName = existingUser.name;
            }
        }

        const participant = await EventParticipant.register(id, finalUserId, mobile_number, finalName);

        res.status(201).json({
            status: 'success',
            data: { participant }
        });
    } catch (error) {
        console.error('Error registering participant for event:', error);
        if (error.code === '23505') {
            return res.status(400).json({ status: 'error', message: 'User is already registered for this event' });
        }
        res.status(500).json({ status: 'error', message: 'Failed to register participant' });
    }
};

export const getEventParticipants = async (req, res) => {
    try {
        const { id } = req.params;
        const participants = await EventParticipant.findByEventId(id);

        res.status(200).json({
            status: 'success',
            data: { participants }
        });
    } catch (error) {
        console.error('Error fetching participants for event:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch participants' });
    }
};

export const markAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const { mobile_number, name } = req.body;

        // Mark attendance by registering if not present, and then updating state
        // Register handles it gracefully due to ON CONFLICT UPDATE
        let participant = await EventParticipant.markAttendance(id, mobile_number);

        // If participant didn't exist in DB, create it and mark attended
        if (!participant) {
            let finalUserId = null;
            let finalName = name;

            const existingUser = await User.findByMobile(mobile_number);
            if (existingUser) {
                finalUserId = existingUser.id;
                finalName = existingUser.name || name;
            }

            await EventParticipant.register(id, finalUserId, mobile_number, finalName);
            participant = await EventParticipant.markAttendance(id, mobile_number);
        }

        res.status(200).json({
            status: 'success',
            data: { participant }
        });
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ status: 'error', message: 'Failed to mark attendance' });
    }
};

export const getMyEvents = async (req, res) => {
    try {
        const userId = req.user.userId;
        const events = await EventParticipant.findByUserId(userId);

        res.status(200).json({
            status: 'success',
            data: { events }
        });
    } catch (error) {
        console.error('Error fetching my events:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch my events' });
    }
};
