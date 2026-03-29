import jwt from 'jsonwebtoken';
import Event from '../models/Event.js';
import EventParticipant from '../models/EventParticipant.js';
import User from '../models/User.js';

export const createEvent = async (req, res) => {
    try {
        const {
            title, description, date, start_time, end_time,
            location_name, location_address, instructors,
            guidelines_and_rules, requirements, hero_image_url, status,
            outcome, media_urls
        } = req.body;

        const eventData = {
            title, description, date, start_time, end_time,
            location_name, location_address, instructors,
            guidelines_and_rules, requirements, hero_image_url, status,
            outcome,
            // Ensure media_urls is passed as an array for the TEXT[] column
            media_urls: Array.isArray(media_urls) ? media_urls : (media_urls ? [media_urls] : null)
        };

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
        const {
            title, description, date, start_time, end_time,
            location_name, location_address, instructors,
            guidelines_and_rules, requirements, hero_image_url, status,
            outcome, media_urls
        } = req.body;

        // Build eventData with only the fields that were provided
        const eventData = {};
        const fields = {
            title, description, date, start_time, end_time,
            location_name, location_address, instructors,
            guidelines_and_rules, requirements, hero_image_url, status,
            outcome,
            // Ensure media_urls is passed as an array for the TEXT[] column
            media_urls: Array.isArray(media_urls) ? media_urls : (media_urls ? [media_urls] : undefined)
        };
        Object.keys(fields).forEach(key => {
            if (fields[key] !== undefined) eventData[key] = fields[key];
        });

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
        const { mobile_number, name, token } = req.body;

        // QR token flow: validate the signed JWT when a token is provided
        if (token !== undefined) {
            const secret = process.env.QR_TOKEN_SECRET || process.env.JWT_SECRET;
            if (!secret) {
                return res.status(500).json({ status: 'error', message: 'Server configuration error' });
            }

            let payload;
            try {
                payload = jwt.verify(token, secret);
            } catch (err) {
                return res.status(401).json({
                    status: 'error',
                    message: err.name === 'TokenExpiredError'
                        ? 'QR token has expired'
                        : 'Invalid QR token'
                });
            }

            // Ensure the token was issued for this event
            if (String(payload.eventId) !== String(id) || payload.purpose !== 'attendance-qr') {
                return res.status(401).json({ status: 'error', message: 'Invalid QR token for this event' });
            }

            // Derive mobile_number from the authenticated user when using QR flow
            const userMobile = req.user?.mobile_number || mobile_number;
            if (!userMobile) {
                return res.status(400).json({ status: 'error', message: 'mobile_number is required' });
            }

            // 409 if already attended
            const existing = await EventParticipant.findAttendance(id, userMobile);
            if (existing && existing.status === 'attended') {
                return res.status(409).json({ status: 'error', message: 'Attendance already recorded' });
            }

            // Register (upsert) then mark attended
            let finalUserId = req.user?.userId || null;
            let finalName = name;
            if (!finalUserId && userMobile) {
                const existingUser = await User.findByMobile(userMobile);
                if (existingUser) {
                    finalUserId = existingUser.id;
                    finalName = existingUser.name || name;
                }
            }

            await EventParticipant.register(id, finalUserId, userMobile, finalName);
            const participant = await EventParticipant.markAttendance(id, userMobile);

            return res.status(200).json({ status: 'success', data: { participant } });
        }

        // Admin / legacy flow (no token): existing behaviour preserved
        let participant = await EventParticipant.markAttendance(id, mobile_number);

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

export const generateQrToken = async (req, res) => {
    try {
        const { id } = req.params;

        // Verify the event exists
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ status: 'error', message: 'Event not found' });
        }

        const secret = process.env.QR_TOKEN_SECRET || process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({ status: 'error', message: 'Server configuration error' });
        }

        // Sign a JWT with 24-hour expiry; keep payload minimal
        const token = jwt.sign(
            { eventId: id, purpose: 'attendance-qr' },
            secret,
            { expiresIn: '24h' }
        );

        const deepLink = `tanakprabha://attendance?eventId=${id}&token=${token}`;

        res.status(200).json({
            status: 'success',
            data: { token, deepLink }
        });
    } catch (error) {
        console.error('Error generating QR token:', error);
        res.status(500).json({ status: 'error', message: 'Failed to generate QR token' });
    }
};
