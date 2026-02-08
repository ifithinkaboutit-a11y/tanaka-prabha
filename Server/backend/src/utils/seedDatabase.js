import { query } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Seed database with initial data
 */
async function seedDatabase() {
    console.log('🌱 Starting database seed...\n');

    try {
        // Clear existing data (optional - comment out if you want to preserve)
        await clearTables();

        // Seed in order of dependencies
        await seedBanners();
        await seedSchemes();
        await seedProfessionals();

        console.log('\n✅ Database seeded successfully!');
    } catch (error) {
        console.error('❌ Seed error:', error);
        throw error;
    }
}

async function clearTables() {
    console.log('🗑️  Clearing existing data...');

    // Clear in reverse order of dependencies
    await query('DELETE FROM connections');
    await query('DELETE FROM notifications');
    await query('DELETE FROM professionals');
    await query('DELETE FROM schemes');
    await query('DELETE FROM banners');

    console.log('✓ Tables cleared\n');
}

async function seedBanners() {
    console.log('📢 Seeding banners...');

    const banners = [
        {
            title: 'PM Kisan Awareness Drive',
            subtitle: 'FEB 2026',
            image_url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=400&fit=crop',
            redirect_url: 'https://pmkisan.gov.in',
            sort_order: 1,
            is_active: true
        },
        {
            title: 'Digital Agriculture Revolution',
            subtitle: 'Join the Smart Farming Initiative',
            image_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=400&fit=crop',
            redirect_url: 'https://example.com/programs',
            sort_order: 2,
            is_active: true
        },
        {
            title: 'Connect with Agricultural Experts',
            subtitle: 'Get personalized guidance for your farm',
            image_url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=400&fit=crop',
            redirect_url: 'https://example.com/connect',
            sort_order: 3,
            is_active: true
        },
        {
            title: 'Soil Health Card Scheme',
            subtitle: 'Free soil testing for farmers',
            image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=400&fit=crop',
            redirect_url: 'https://soilhealth.dac.gov.in',
            sort_order: 4,
            is_active: true
        }
    ];

    for (const banner of banners) {
        await query(
            `INSERT INTO banners (title, subtitle, image_url, redirect_url, sort_order, is_active)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [banner.title, banner.subtitle, banner.image_url, banner.redirect_url, banner.sort_order, banner.is_active]
        );
    }

    console.log(`✓ ${banners.length} banners created\n`);
}

async function seedSchemes() {
    console.log('📋 Seeding schemes...');

    const schemes = [
        // Financial Support Schemes
        {
            title: 'PM-KISAN Samman Nidhi',
            description: 'Direct income support scheme providing ₹6,000 per year to farmer families',
            category: 'Financial Support',
            image_url: 'https://via.placeholder.com/400x200/386641/FFFFFF?text=PM-KISAN',
            hero_image_url: 'https://via.placeholder.com/800x400/386641/FFFFFF?text=PM-KISAN+Hero',
            location: 'Barabanki Krishi Kendra, Uttar Pradesh',
            event_date: '2026-03-15',
            key_objectives: [
                'Provide direct income support to farmer families',
                'Supplement financial needs for procuring inputs',
                'Stabilize farmer incomes and reduce distress',
                'Encourage sustainable agricultural practices'
            ],
            overview: 'PM-KISAN is a Central Sector scheme launched on 24th February 2019 to supplement the financial needs of the Small and Marginal Farmers (SMF) in procuring various inputs to ensure proper crop health and appropriate yields.',
            process: 'Farmers can apply through the PM-KISAN portal or through their respective State Governments. The scheme provides income support of ₹6,000 per year in three equal installments of ₹2,000 each.',
            support_contact: 'PM-KISAN helpline: 155261 or visit nearest Krishi Kendra',
            apply_url: 'https://pmkisan.gov.in/',
            is_active: true
        },
        {
            title: 'Kisan Credit Card',
            description: 'Credit facility for farmers at subsidized interest rates',
            category: 'Financial Support',
            image_url: 'https://via.placeholder.com/400x200/2E7D32/FFFFFF?text=KCC',
            hero_image_url: 'https://via.placeholder.com/800x400/2E7D32/FFFFFF?text=KCC+Hero',
            location: 'State Bank of India, Regional Office',
            event_date: '2026-04-01',
            key_objectives: [
                'Provide timely credit to farmers',
                'Offer subsidized interest rates',
                'Support crop production and allied activities',
                'Enable post-harvest expenses'
            ],
            overview: 'Kisan Credit Card (KCC) scheme provides affordable credit to farmers for their cultivation and other needs.',
            process: 'Apply at your nearest bank branch with land documents, identity proof, and passport photos.',
            support_contact: 'Contact your bank branch or call KCC helpline',
            apply_url: 'https://pmkisan.gov.in/',
            is_active: true
        },
        // Agricultural Development
        {
            title: 'Krishi Samriddhi Yojana',
            description: 'Comprehensive agricultural development program for sustainable farming',
            category: 'Agricultural Development',
            image_url: 'https://via.placeholder.com/400x200/4CAF50/FFFFFF?text=Krishi+Samriddhi',
            hero_image_url: 'https://via.placeholder.com/800x400/4CAF50/FFFFFF?text=Krishi+Samriddhi+Hero',
            location: 'Lucknow Agricultural University, Uttar Pradesh',
            event_date: '2026-04-22',
            key_objectives: [
                'Promote sustainable agricultural practices',
                'Improve crop yield and quality',
                'Provide affordable agricultural inputs',
                'Enhance market access for farmers'
            ],
            overview: 'Krishi Samriddhi Yojana aims to transform agriculture through sustainable practices, modern technology adoption, and improved market linkages.',
            process: 'Farmers can enroll through local agricultural extension offices. The program provides training, subsidized inputs, and technical support.',
            support_contact: 'Contact your local Krishi Kendra for enrollment and support.',
            apply_url: 'https://krishi.up.gov.in/',
            is_active: true
        },
        {
            title: 'National Mission for Sustainable Agriculture',
            description: 'Promoting sustainable agriculture practices across India',
            category: 'Agricultural Development',
            image_url: 'https://via.placeholder.com/400x200/558B2F/FFFFFF?text=NMSA',
            hero_image_url: 'https://via.placeholder.com/800x400/558B2F/FFFFFF?text=NMSA+Hero',
            location: 'Ministry of Agriculture, New Delhi',
            event_date: '2026-05-01',
            key_objectives: [
                'Promote climate-resilient agriculture',
                'Conserve natural resources',
                'Adopt sustainable farming practices',
                'Enhance water use efficiency'
            ],
            overview: 'NMSA focuses on integrated farming, soil health management, and water conservation for sustainable agricultural growth.',
            process: 'Apply through District Agriculture Office or online portal.',
            support_contact: 'NMSA Helpline: 1800-180-1551',
            apply_url: 'https://nmsa.dac.gov.in/',
            is_active: true
        },
        // Soil Management
        {
            title: 'Soil Health Card Scheme',
            description: 'Scientific soil testing and nutrient management program',
            category: 'Soil Management',
            image_url: 'https://via.placeholder.com/400x200/FF9800/FFFFFF?text=Soil+Health+Card',
            hero_image_url: 'https://via.placeholder.com/800x400/FF9800/FFFFFF?text=Soil+Health+Card+Hero',
            location: 'Kanpur Soil Testing Lab, Uttar Pradesh',
            event_date: '2026-03-10',
            key_objectives: [
                'Provide soil health assessment to farmers',
                'Recommend balanced nutrient application',
                'Improve soil fertility and productivity',
                'Promote sustainable soil management practices'
            ],
            overview: 'The Soil Health Card Scheme provides every farmer with a Soil Health Card that carries crop-wise recommendations of nutrients and fertilizers.',
            process: 'Soil samples are collected and tested in accredited labs. Customized fertilizer recommendations are provided through the Soil Health Card.',
            support_contact: 'Free soil testing services available at all Krishi Kendras.',
            apply_url: 'https://soilhealth.dac.gov.in/',
            is_active: true
        },
        // Crop Insurance
        {
            title: 'Pradhan Mantri Fasal Bima Yojana',
            description: 'Comprehensive crop insurance scheme for risk mitigation',
            category: 'Crop Insurance',
            image_url: 'https://via.placeholder.com/400x200/9C27B0/FFFFFF?text=PMFBY',
            hero_image_url: 'https://via.placeholder.com/800x400/9C27B0/FFFFFF?text=PMFBY+Hero',
            location: 'Gorakhpur Insurance Office, Uttar Pradesh',
            event_date: '2026-06-05',
            key_objectives: [
                'Provide financial support against crop loss',
                'Stabilize farm incomes',
                'Encourage crop diversification',
                'Promote sustainable farming practices'
            ],
            overview: 'Pradhan Mantri Fasal Bima Yojana (PMFBY) provides financial support to farmers suffering crop loss due to unforeseen events.',
            process: 'Farmers can enroll during the sowing season through banks, CSC centers, or insurance companies.',
            support_contact: 'PMFBY Helpline: 1800-200-7710',
            apply_url: 'https://pmfby.gov.in/',
            is_active: true
        },
        // Training Programs
        {
            title: 'Organic Farming Training Program',
            description: 'Comprehensive training on organic farming techniques and certification',
            category: 'Training',
            image_url: 'https://via.placeholder.com/400x200/8BC34A/FFFFFF?text=Organic+Farming',
            hero_image_url: 'https://via.placeholder.com/800x400/8BC34A/FFFFFF?text=Organic+Farming+Hero',
            location: 'Nandurbar Training Center, Maharashtra',
            event_date: '2026-03-18',
            key_objectives: [
                'Learn organic farming techniques',
                'Understand certification processes',
                'Practice sustainable agriculture',
                'Reduce chemical input costs'
            ],
            overview: 'This training program covers all aspects of organic farming including composting, pest management, and certification requirements.',
            process: 'Register at your local Krishi Vigyan Kendra. Training is provided free of cost.',
            support_contact: 'Contact nearest KVK for registration',
            apply_url: 'https://organicfarming.nabard.org/',
            is_active: true
        },
        {
            title: 'Modern Irrigation Techniques',
            description: 'Training on drip irrigation, sprinkler systems, and water management',
            category: 'Training',
            image_url: 'https://via.placeholder.com/400x200/03A9F4/FFFFFF?text=Irrigation',
            hero_image_url: 'https://via.placeholder.com/800x400/03A9F4/FFFFFF?text=Irrigation+Hero',
            location: 'Agricultural University, Varanasi',
            event_date: '2026-04-25',
            key_objectives: [
                'Learn drip irrigation setup',
                'Understand sprinkler systems',
                'Master water conservation techniques',
                'Improve irrigation efficiency'
            ],
            overview: 'This program teaches modern irrigation methods to help farmers conserve water and improve crop yields.',
            process: 'Online registration available. Hands-on training provided at the center.',
            support_contact: 'Email: irrigation@agri.up.gov.in',
            apply_url: 'https://pmksy.gov.in/',
            is_active: true
        },
        {
            title: 'Livestock Management Workshop',
            description: 'Practical training on animal husbandry and dairy farming',
            category: 'Training',
            image_url: 'https://via.placeholder.com/400x200/795548/FFFFFF?text=Livestock',
            hero_image_url: 'https://via.placeholder.com/800x400/795548/FFFFFF?text=Livestock+Hero',
            location: 'Veterinary College, Lucknow',
            event_date: '2026-05-10',
            key_objectives: [
                'Learn animal nutrition basics',
                'Understand disease prevention',
                'Practice dairy management',
                'Improve livestock productivity'
            ],
            overview: 'Comprehensive workshop covering cattle care, dairy operations, and poultry management.',
            process: 'Register at the district animal husbandry office.',
            support_contact: 'Animal Husbandry Dept: 1800-180-1234',
            apply_url: 'https://dahd.nic.in/',
            is_active: true
        }
    ];

    for (const scheme of schemes) {
        await query(
            `INSERT INTO schemes (title, description, category, image_url, hero_image_url, location, event_date, key_objectives, overview, process, support_contact, apply_url, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            [
                scheme.title, scheme.description, scheme.category, scheme.image_url, scheme.hero_image_url,
                scheme.location, scheme.event_date, scheme.key_objectives, scheme.overview,
                scheme.process, scheme.support_contact, scheme.apply_url, scheme.is_active
            ]
        );
    }

    console.log(`✓ ${schemes.length} schemes created\n`);
}

async function seedProfessionals() {
    console.log('👨‍⚕️ Seeding professionals...');

    const professionals = [
        // Livestock & Veterinary
        {
            name: 'Dr. Pankaj Shukla',
            role: 'Animal Doctor',
            department: 'Animal Husbandry Department',
            category: 'livestock-veterinary',
            image_url: 'https://randomuser.me/api/portraits/men/32.jpg',
            phone_number: '+919876543210',
            district: 'Lucknow',
            service_area: { district: 'Lucknow', blocks: ['Bakshi Ka Talab', 'Malihabad', 'Sarojini Nagar'], state: 'Uttar Pradesh' },
            specializations: ['Cattle health', 'Goat & Sheep treatment', 'Poultry disease management'],
            is_available: true
        },
        {
            name: 'Dr. Meera Verma',
            role: 'Veterinary Specialist',
            department: 'Animal Husbandry Department',
            category: 'livestock-veterinary',
            image_url: 'https://randomuser.me/api/portraits/women/44.jpg',
            phone_number: '+919876543211',
            district: 'Lucknow',
            service_area: { district: 'Lucknow', blocks: ['Chinhat', 'Mohanlalganj', 'Gosainganj'], state: 'Uttar Pradesh' },
            specializations: ['Dairy cattle care', 'Buffalo health', 'Vaccination programs'],
            is_available: true
        },
        {
            name: 'Dr. Rajesh Kumar',
            role: 'Senior Veterinarian',
            department: 'Animal Husbandry Department',
            category: 'livestock-veterinary',
            image_url: 'https://randomuser.me/api/portraits/men/22.jpg',
            phone_number: '+919876543212',
            district: 'Kanpur',
            service_area: { district: 'Kanpur', blocks: ['Bilhaur', 'Ghatampur', 'Kalyanpur'], state: 'Uttar Pradesh' },
            specializations: ['Large animal surgery', 'Reproductive health', 'Emergency care'],
            is_available: false
        },
        // Government Schemes
        {
            name: 'Shri Anil Sharma',
            role: 'Scheme Coordinator',
            department: 'Agriculture Department',
            category: 'government-schemes',
            image_url: 'https://randomuser.me/api/portraits/men/45.jpg',
            phone_number: '+919876543213',
            district: 'Lucknow',
            service_area: { district: 'Lucknow', blocks: ['All blocks'], state: 'Uttar Pradesh' },
            specializations: ['PM-KISAN', 'Kisan Credit Card', 'Crop Insurance'],
            is_available: true
        },
        {
            name: 'Smt. Priya Singh',
            role: 'District Program Officer',
            department: 'Agriculture Department',
            category: 'government-schemes',
            image_url: 'https://randomuser.me/api/portraits/women/28.jpg',
            phone_number: '+919876543214',
            district: 'Varanasi',
            service_area: { district: 'Varanasi', blocks: ['All blocks'], state: 'Uttar Pradesh' },
            specializations: ['PMFBY', 'Soil Health Card', 'Agricultural subsidies'],
            is_available: true
        },
        // Training & Guidance
        {
            name: 'Dr. Suresh Yadav',
            role: 'Agriculture Extension Officer',
            department: 'Krishi Vigyan Kendra',
            category: 'training-guidance',
            image_url: 'https://randomuser.me/api/portraits/men/55.jpg',
            phone_number: '+919876543215',
            district: 'Lucknow',
            service_area: { district: 'Lucknow', blocks: ['All blocks'], state: 'Uttar Pradesh' },
            specializations: ['Organic farming', 'Crop rotation', 'Soil management'],
            is_available: true
        },
        {
            name: 'Dr. Kavita Mishra',
            role: 'Senior Scientist',
            department: 'Agricultural Research Institute',
            category: 'training-guidance',
            image_url: 'https://randomuser.me/api/portraits/women/55.jpg',
            phone_number: '+919876543216',
            district: 'Kanpur',
            service_area: { district: 'Kanpur', blocks: ['All blocks'], state: 'Uttar Pradesh' },
            specializations: ['Modern irrigation', 'Pest management', 'Seed technology'],
            is_available: true
        },
        // Market & Buyers
        {
            name: 'Shri Vinod Gupta',
            role: 'Market Liaison Officer',
            department: 'Agricultural Marketing Board',
            category: 'market-buyers',
            image_url: 'https://randomuser.me/api/portraits/men/65.jpg',
            phone_number: '+919876543217',
            district: 'Lucknow',
            service_area: { district: 'Lucknow', blocks: ['All blocks'], state: 'Uttar Pradesh' },
            specializations: ['Mandi prices', 'Direct marketing', 'Export opportunities'],
            is_available: true
        },
        {
            name: 'Shri Ramesh Tiwari',
            role: 'Procurement Officer',
            department: 'FCI Regional Office',
            category: 'market-buyers',
            image_url: 'https://randomuser.me/api/portraits/men/75.jpg',
            phone_number: '+919876543218',
            district: 'Gorakhpur',
            service_area: { district: 'Gorakhpur', blocks: ['All blocks'], state: 'Uttar Pradesh' },
            specializations: ['Wheat procurement', 'Rice procurement', 'MSP guidance'],
            is_available: false
        }
    ];

    for (const prof of professionals) {
        await query(
            `INSERT INTO professionals (name, role, department, category, image_url, phone_number, district, service_area, specializations, is_available)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
                prof.name, prof.role, prof.department, prof.category, prof.image_url,
                prof.phone_number, prof.district, JSON.stringify(prof.service_area),
                JSON.stringify(prof.specializations), prof.is_available
            ]
        );
    }

    console.log(`✓ ${professionals.length} professionals created\n`);
}

// Run seed
seedDatabase()
    .then(() => {
        console.log('🎉 Seed complete!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Seed failed:', error);
        process.exit(1);
    });
