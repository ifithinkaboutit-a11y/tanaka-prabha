import { query } from '../config/db.js';
import { generateOTP, generateOTPExpiry, isOTPExpired } from '../utils/otp.js';

class OTP {
    /**
     * Create or update OTP for a phone number
     */
    static async createOTP(mobile_number) {
        const otp = generateOTP();
        const expires_at = generateOTPExpiry(10); // 10 minutes expiry
        
        // Delete any existing OTPs for this number
        await query('DELETE FROM public.otps WHERE mobile_number = $1', [mobile_number]);
        
        const text = `
            INSERT INTO public.otps (mobile_number, otp, expires_at)
            VALUES ($1, $2, $3)
            RETURNING id, mobile_number, otp, expires_at, created_at
        `;
        
        const result = await query(text, [mobile_number, otp, expires_at]);
        return result.rows[0];
    }

    /**
     * Verify OTP for a phone number
     */
    static async verifyOTP(mobile_number, otp) {
        const text = `
            SELECT * FROM public.otps
            WHERE mobile_number = $1 AND otp = $2
            ORDER BY created_at DESC
            LIMIT 1
        `;
        
        const result = await query(text, [mobile_number, otp]);
        
        if (result.rows.length === 0) {
            return { valid: false, message: 'Invalid OTP' };
        }
        
        const otpRecord = result.rows[0];
        
        // Check if OTP is expired
        if (isOTPExpired(otpRecord.expires_at)) {
            // Delete expired OTP
            await this.deleteOTP(mobile_number);
            return { valid: false, message: 'OTP has expired' };
        }
        
        // Check if OTP is already verified
        if (otpRecord.is_verified) {
            return { valid: false, message: 'OTP already used' };
        }
        
        // Mark OTP as verified
        await query(
            'UPDATE public.otps SET is_verified = true WHERE id = $1',
            [otpRecord.id]
        );
        
        return { valid: true, message: 'OTP verified successfully', otpRecord };
    }

    /**
     * Delete OTP for a phone number
     */
    static async deleteOTP(mobile_number) {
        const text = 'DELETE FROM public.otps WHERE mobile_number = $1';
        await query(text, [mobile_number]);
    }

    /**
     * Get OTP record by phone number
     */
    static async getOTP(mobile_number) {
        const text = `
            SELECT * FROM public.otps
            WHERE mobile_number = $1
            ORDER BY created_at DESC
            LIMIT 1
        `;
        
        const result = await query(text, [mobile_number]);
        return result.rows[0];
    }

    /**
     * Clean up expired OTPs (can be run as a cron job)
     */
    static async cleanupExpiredOTPs() {
        const text = `
            DELETE FROM public.otps
            WHERE expires_at < timezone('utc', now())
        `;
        
        const result = await query(text);
        return { deleted: result.rowCount };
    }

    /**
     * Get OTP attempts count for a phone number in last X minutes
     */
    static async getRecentAttempts(mobile_number, minutes = 60) {
        const text = `
            SELECT COUNT(*) as count
            FROM public.otps
            WHERE mobile_number = $1
            AND created_at > timezone('utc', now()) - INTERVAL '${minutes} minutes'
        `;
        
        const result = await query(text, [mobile_number]);
        return parseInt(result.rows[0].count);
    }
}

export default OTP;
