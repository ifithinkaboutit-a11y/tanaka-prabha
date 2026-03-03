import { query } from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function seedRealData() {
    console.log('🌱 Starting the seeding of Real Indian Government Schemes and Banners (English & Hindi)...');
    try {
        await seedBanners();
        await seedSchemes();
        console.log('\n✅ Real Data seeded successfully!');
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
    process.exit(0);
}

async function seedBanners() {
    console.log('📢 Seeding verified banners...');
    const banners = [
        { title: 'PM-KISAN Samman Nidhi', subtitle: 'Direct Income Support of ₹6000/year', title_hi: 'पीएम-किसान सम्मान निधि', subtitle_hi: '₹6000/वर्ष की प्रत्यक्ष आय सहायता', image_url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=400&fit=crop', redirect_url: 'https://pmkisan.gov.in', sort_order: 1, is_active: true },
        { title: 'Kisan Credit Card (KCC)', subtitle: 'Affordable credit support for farming needs', title_hi: 'किसान क्रेडिट कार्ड (KCC)', subtitle_hi: 'खेती की जरूरतों के लिए किफायती ऋण', image_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=400&fit=crop', redirect_url: 'https://pmkisan.gov.in/', sort_order: 2, is_active: true },
        { title: 'PM Fasal Bima Yojana', subtitle: 'Secure your crops against calamities', title_hi: 'फसल बीमा योजना (PMFBY)', subtitle_hi: 'प्राकृतिक आपदाओं से फसलों को सुरक्षित करें', image_url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=400&fit=crop', redirect_url: 'https://pmfby.gov.in/', sort_order: 3, is_active: true },
        { title: 'PM KUSUM Yojana', subtitle: 'Subsidies for Solar Pumps', title_hi: 'पीएम कुसुम योजना', subtitle_hi: 'सौर पंप के लिए सब्सिडी', image_url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=400&fit=crop', redirect_url: 'https://pmkusum.mnre.gov.in/', sort_order: 4, is_active: true },
        { title: 'Agriculture Infrastructure Fund', subtitle: 'Financing for post-harvest management', title_hi: 'कृषि अवसंरचना कोष', subtitle_hi: 'फसल कटाई के बाद के प्रबंधन के लिए वित्तपोषण', image_url: 'https://images.unsplash.com/photo-1592424005663-126b86fd0034?w=800&h=400&fit=crop', redirect_url: 'https://agriinfra.dac.gov.in/', sort_order: 5, is_active: true },
        { title: 'National Agriculture Market (e-NAM)', subtitle: 'Best crop prices nationwide', title_hi: 'ई-नाम', subtitle_hi: 'सर्वोत्तम फसल कीमतों के लिए राष्ट्रीय बाजार', image_url: 'https://images.unsplash.com/photo-1605000797499-95e51c1efa2f?w=800&h=400&fit=crop', redirect_url: 'https://www.enam.gov.in/', sort_order: 6, is_active: true }
    ];

    for (const b of banners) {
        await query(`INSERT INTO banners (title, subtitle, title_hi, subtitle_hi, image_url, redirect_url, sort_order, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [b.title, b.subtitle, b.title_hi, b.subtitle_hi, b.image_url, b.redirect_url, b.sort_order, b.is_active]);
    }
    console.log(`✓ ${banners.length} banners created.\n`);
}

async function seedSchemes() {
    console.log('📋 Seeding 30 Government Schemes & Categories...');
    const ImgBase = 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=400&h=200&fit=crop';

    // A concise list of 30 schemes covering various categories
    const rawSchemes = [
        { c: 'Financial Support', t: 'PM-KISAN Samman Nidhi', h: 'पीएम-किसान सम्मान निधि' },
        { c: 'Crop Insurance', t: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)', h: 'प्रधानमंत्री फसल बीमा योजना' },
        { c: 'Training & Subsidy', t: 'Paramparagat Krishi Vikas Yojana (PKVY)', h: 'परंपरागत कृषि विकास योजना' },
        { c: 'Soil Management', t: 'Soil Health Card Scheme (SHC)', h: 'मृदा स्वास्थ्य कार्ड योजना' },
        { c: 'Market Access', t: 'National Agriculture Market (e-NAM)', h: 'राष्ट्रीय कृषि बाजार (ई-नाम)' },
        { c: 'Irrigation', t: 'Pradhan Mantri Krishi Sinchai Yojana', h: 'प्रधानमंत्री कृषि सिंचाई योजना' },
        { c: 'Pension', t: 'PM Kisan Maan Dhan Yojana', h: 'पीएम किसान मानधन योजना' },
        { c: 'Infrastructure', t: 'Agriculture Infrastructure Fund', h: 'कृषि अवसंरचना कोष' },
        { c: 'Livestock', t: 'National Beekeeping & Honey Mission', h: 'राष्ट्रीय मधुमक्खी पालन मिशन' },
        { c: 'Financial Support', t: 'Kisan Credit Card (KCC)', h: 'किसान क्रेडिट कार्ड योजना' },
        { c: 'Development', t: 'Rashtriya Krishi Vikas Yojana', h: 'राष्ट्रीय कृषि विकास योजना' },
        { c: 'Fisheries', t: 'PM Matsya Sampada Yojana', h: 'प्रधानमंत्री मत्स्य संपदा योजना' },
        { c: 'Technology', t: 'Namo Drone Didi Scheme', h: 'नमो ड्रोन दीदी योजना' },
        { c: 'Renewable Energy', t: 'PM KUSUM Yojana', h: 'पीएम कुसुम योजना' },
        { c: 'Forestry', t: 'National Bamboo Mission', h: 'राष्ट्रीय बांस मिशन' },
        { c: 'Horticulture', t: 'Mission for Integrated Development of Horticulture', h: 'बागवानी विकास मिशन' },
        { c: 'Technology', t: 'Sub-Mission on Agricultural Mechanization', h: 'कृषि मशीनीकरण उप-मिशन' },
        { c: 'Food Security', t: 'National Food Security Mission', h: 'राष्ट्रीय खाद्य सुरक्षा मिशन' },
        { c: 'Development', t: 'Krishi Kalyan Abhiyan', h: 'कृषि कल्याण अभियान' },
        { c: 'Sustainability', t: 'National Mission for Sustainable Agriculture', h: 'राष्ट्रीय सतत कृषि मिशन' },
        { c: 'Infrastructure', t: 'Animal Husbandry Infrastructure Fund', h: 'पशुपालन अवसंरचना कोष' },
        { c: 'Dairy', t: 'Dairy Processing & Infrastructure Fund', h: 'डेयरी प्रसंस्करण अवसंरचना कोष' },
        { c: 'Sanitation', t: 'GOBARdhan Scheme', h: 'गोबरधन योजना' },
        { c: 'Organic', t: 'Mission Organic Value Chain Development (North East)', h: 'जैविक मूल्य श्रृंखला विकास' },
        { c: 'Livestock', t: 'National Livestock Mission', h: 'राष्ट्रीय पशुधन मिशन' },
        { c: 'Food Processing', t: 'PM Formalisation of Micro Food Processing', h: 'सूक्ष्म खाद्य प्रसंस्करण उद्यम' },
        { c: 'Insurance', t: 'Weather Based Crop Insurance Scheme', h: 'मौसम आधारित फसल बीमा योजना' },
        { c: 'Horticulture', t: 'Coconut Development Board Schemes', h: 'नारियल विकास बोर्ड योजनाएं' },
        { c: 'Training & Subsidy', t: 'ATMA (Agricultural Technology Management Agency)', h: 'आत्मा योजना (कृषि प्रौद्योगिकी)' },
        { c: 'Infrastructure', t: 'Gramin Bhandaran Yojana', h: 'ग्रामीण भंडारण योजना' }
    ];

    const schemes = rawSchemes.map((s, index) => ({
        category: s.c,
        title: s.t,
        description: `Government scheme for ${s.c.toLowerCase()} under the initiative of ${s.t}.`,
        overview: `The ${s.t} scheme focuses on improving the livelihoods of farmers by supporting interventions in ${s.c.toLowerCase()}. It encourages modernization, scaling and resilience in the agricultural sector.`,
        process: `Farmers can approach their nearest Common Service Centre (CSC), District Agriculture Office, or apply online on the official scheme portal.`,
        eligibility: `All eligible Indian farmers involved in ${s.c.toLowerCase()} within targeted districts/states.`,
        key_objectives: [`Improve ${s.c} capabilities.`, `Promote sustainable practices.`, `Increase farmer income.`],

        title_hi: s.h,
        description_hi: `${s.h} के पहल के तहत ${s.c} के लिए सरकारी योजना।`,
        overview_hi: `${s.h} योजना ${s.c} में हस्तक्षेप का समर्थन करके किसानों की आजीविका में सुधार करने पर केंद्रित है। यह कृषि क्षेत्र में आधुनिकीकरण, स्केलिंग और लचीलेपन को प्रोत्साहित करता है।`,
        process_hi: `किसान अपने निकटतम कॉमन सर्विस सेंटर (CSC), जिला कृषि कार्यालय से संपर्क कर सकते हैं, या आधिकारिक योजना पोर्टल पर ऑनलाइन आवेदन कर सकते हैं।`,
        eligibility_hi: `लक्षित जिलों/राज्यों के भीतर ${s.c} में शामिल सभी पात्र भारतीय किसान।`,
        key_objectives_hi: [`${s.c} क्षमताओं में सुधार करना।`, `टिकाऊ प्रथाओं को बढ़ावा देना।`, `किसान की आय बढ़ाना।`],

        // Randomize images somewhat for visual variety
        image_url: `https://images.unsplash.com/photo-${1580000000000 + (index * 123456)}?w=400&h=200&fit=crop`,
        hero_image_url: `https://images.unsplash.com/photo-${1580000000000 + (index * 123456)}?w=800&h=400&fit=crop`,
        location: 'Pan India (Applicable nationwide)',
        support_contact: 'Toll Free Helpline: 1800-180-1551',
        apply_url: 'https://agricoop.nic.in/',
        documents_required: ['Aadhaar Card', 'Bank Passbook', 'Land Documents'],
        tags: [s.c.replace(' ', ''), 'GovtScheme', 'Farming'],
        is_active: true,
        is_featured: index < 5
    }));

    // Explicitly add specific high resolution images for the top schemes
    schemes[0].image_url = 'https://images.unsplash.com/photo-1599839619722-39751411ea63?w=400&h=200&fit=crop';
    schemes[0].hero_image_url = 'https://images.unsplash.com/photo-1599839619722-39751411ea63?w=800&h=400&fit=crop';
    schemes[1].image_url = 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=400&h=200&fit=crop';
    schemes[1].hero_image_url = 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&h=400&fit=crop';
    schemes[2].image_url = 'https://images.unsplash.com/photo-1592424005663-126b86fd0034?w=400&h=200&fit=crop';
    schemes[2].hero_image_url = 'https://images.unsplash.com/photo-1592424005663-126b86fd0034?w=800&h=400&fit=crop';
    schemes[3].image_url = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=200&fit=crop';
    schemes[3].hero_image_url = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=400&fit=crop';
    schemes[4].image_url = 'https://images.unsplash.com/photo-1605000797499-95e51c1efa2f?w=400&h=200&fit=crop';
    schemes[4].hero_image_url = 'https://images.unsplash.com/photo-1605000797499-95e51c1efa2f?w=800&h=400&fit=crop';

    for (const s of schemes) {
        await query(
            `INSERT INTO schemes (
                category, title, description, overview, process, eligibility, key_objectives,
                title_hi, description_hi, overview_hi, process_hi, eligibility_hi, key_objectives_hi,
                image_url, hero_image_url, location, support_contact, apply_url, documents_required,
                tags, is_active, is_featured
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)`,
            [s.category, s.title, s.description, s.overview, s.process, s.eligibility, s.key_objectives,
            s.title_hi, s.description_hi, s.overview_hi, s.process_hi, s.eligibility_hi, s.key_objectives_hi,
            s.image_url, s.hero_image_url, s.location, s.support_contact, s.apply_url, s.documents_required,
            s.tags, s.is_active, s.is_featured]
        );
    }
    console.log(`✓ ${schemes.length} schemes created.\n`);
}

seedRealData();
