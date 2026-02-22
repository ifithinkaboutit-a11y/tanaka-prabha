import { query } from '../config/db.js';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';

dotenv.config();

const DISTRICT_COORDS = {
    'Baksa': [26.6525, 91.2038], 'Barpeta': [26.3250, 91.1167], 'Biswanath': [26.7269, 93.1669],
    'Bongaigaon': [26.4765, 90.5535], 'Cachar': [24.7979, 92.8676], 'Charaideo': [26.9859, 94.8077],
    'Chirang': [26.4847, 90.4714], 'Darrang': [26.4469, 91.9785], 'Dhemaji': [27.4718, 94.5717],
    'Dhubri': [26.0180, 89.9759], 'Dibrugarh': [27.4782, 94.9146], 'Dima Hasao': [25.1167, 93.0167],
    'Goalpara': [26.1739, 90.6228], 'Golaghat': [26.5203, 93.9759], 'Hailakandi': [24.6758, 92.5588],
    'Hojai': [26.0000, 92.8500], 'Jorhat': [26.7500, 94.2167], 'Kamrup': [26.1434, 91.7362],
    'Kamrup Metropolitan': [26.1445, 91.7362], 'Karbi Anglong': [26.1000, 93.6000],
    'Karimganj': [24.8677, 92.3540], 'Kokrajhar': [26.4008, 90.2715], 'Lakhimpur': [27.2342, 94.1007],
    'Majuli': [26.9500, 94.1667], 'Morigaon': [26.2624, 92.3468], 'Nagaon': [26.3451, 92.6847],
    'Nalbari': [26.4470, 91.4406], 'Sivasagar': [26.9831, 94.6358], 'Sonitpur': [26.6352, 92.7979],
    'South Salmara-Mankachar': [25.7333, 89.8667], 'Tinsukia': [27.4893, 95.3579],
    'Udalguri': [26.7522, 92.0906], 'West Karbi Anglong': [25.9625, 92.8000],
    'Delhi': [28.6139, 77.2090], 'Mumbai': [19.0760, 72.8777], 'Kolkata': [22.5726, 88.3639],
    'Chennai': [13.0827, 80.2707], 'Bangalore': [12.9716, 77.5946], 'Hyderabad': [17.3850, 78.4867],
};

const districts = Object.keys(DISTRICT_COORDS);
const NUM_USERS = 1000;

async function seedUsers() {
    console.log(`🌱 Seeding ${NUM_USERS} dummy users with Faker...`);
    try {
        for (let i = 0; i < NUM_USERS; i++) {
            const district = faker.helpers.arrayElement(districts);
            const [baseLat, baseLng] = DISTRICT_COORDS[district];

            // Randomly jitter the location slightly so they don't overlap completely
            const lat = baseLat + faker.number.float({ min: -0.1, max: 0.1 });
            const lng = baseLng + faker.number.float({ min: -0.1, max: 0.1 });

            const mobile = faker.string.numeric(10);
            const aadhaar = faker.string.numeric(12);

            const userText = `
                INSERT INTO public.users (
                    name, age, gender, photo_url, mobile_number, aadhaar_number,
                    village, district, state, location, created_at
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, ST_SetSRID(ST_MakePoint($10, $11), 4326), $12
                ) RETURNING id
            `;
            const created_at = faker.date.past({ years: 1 });
            const vals = [
                faker.person.fullName(),
                faker.number.int({ min: 18, max: 80 }),
                faker.helpers.arrayElement(['male', 'female', 'other']),
                faker.image.avatar(),
                mobile, aadhaar,
                faker.location.city(), district, 'Assam', lng, lat, created_at
            ];

            const userRes = await query(userText, vals);
            const userId = userRes.rows[0].id;

            // Add Land Details
            const totalLand = faker.number.float({ min: 1, max: 50, fractionDigits: 2 });
            await query(
                `INSERT INTO public.land_details (user_id, total_land_area, rabi_crop, kharif_crop, zaid_crop) VALUES ($1, $2, $3, $4, $5)`,
                [userId, totalLand, faker.helpers.arrayElement(['Wheat', 'Mustard', 'Gram']), faker.helpers.arrayElement(['Rice', 'Maize', 'Cotton']), faker.helpers.arrayElement(['Vegetables', 'Moong', 'Watermelon'])]
            );

            // Add Livestock Details
            await query(
                `INSERT INTO public.livestock_details (user_id, cow, buffalo, goat, sheep, poultry) VALUES ($1, $2, $3, $4, $5, $6)`,
                [userId, faker.number.int({ min: 0, max: 5 }), faker.number.int({ min: 0, max: 3 }), faker.number.int({ min: 0, max: 10 }), faker.number.int({ min: 0, max: 5 }), faker.number.int({ min: 0, max: 50 })]
            );
        }
        console.log(`✅ Successfully seeded ${NUM_USERS} users along with their land and livestock details!`);
    } catch (e) {
        console.error("❌ Seed error:", e);
    }
}

seedUsers()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
