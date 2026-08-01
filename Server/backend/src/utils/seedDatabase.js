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

    // Real, currently-active Government of India schemes relevant to farmers and
    // livestock owners. Facts (launch dates, subsidy rates, helplines, official
    // URLs) reflect publicly published scheme details from the administering
    // central ministries/departments (Agriculture & Farmers Welfare, Animal
    // Husbandry & Dairying, NABARD). Verify against the official portals before
    // relying on this for anything beyond app seed/demo data.
    const schemes = [
        // ── Financial Support ─────────────────────────────────────────────
        {
            title: 'PM-KISAN Samman Nidhi',
            title_hi: 'पीएम-किसान सम्मान निधि',
            description: 'Direct income support of ₹6,000 per year to eligible farmer families, paid in three equal installments',
            description_hi: 'पात्र किसान परिवारों को प्रति वर्ष ₹6,000 की प्रत्यक्ष आय सहायता, तीन बराबर किस्तों में दी जाती है',
            category: 'Financial Support',
            image_url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=600&fit=crop',
            location: 'Ministry of Agriculture & Farmers Welfare, Government of India',
            event_date: null,
            key_objectives: [
                'Provide direct income support to landholding farmer families',
                'Supplement financial needs for procuring agricultural inputs',
                'Stabilize farmer incomes and reduce financial distress',
                'Deliver support directly via Direct Benefit Transfer (DBT)'
            ],
            overview: 'PM-KISAN is a Central Sector scheme launched on 24 February 2019 that provides income support to landholding farmer families across India to help meet their farming and household needs.',
            process: 'Register via the PM-KISAN portal (self-registration or through Common Service Centres), or apply through the local Patwari/Revenue Officer/Nodal Officer nominated by the State Government. Aadhaar-linked bank accounts are mandatory for DBT.',
            eligibility: 'All landholding farmer families, subject to exclusion criteria — institutional landholders, income-tax payees, and holders of constitutional posts, among others, are excluded.',
            documents_required: ['Aadhaar Card', 'Land ownership/revenue records', 'Bank account passbook (Aadhaar-linked)'],
            tags: ['income support', 'DBT', 'central sector scheme'],
            support_contact: 'PM-KISAN Helpline: 155261 / 1800-115-526',
            apply_url: 'https://pmkisan.gov.in/',
            is_active: true,
            is_featured: true
        },
        {
            title: 'Kisan Credit Card (KCC) Scheme',
            title_hi: 'किसान क्रेडिट कार्ड (केसीसी) योजना',
            description: 'Short-term credit up to ₹3 lakh at subsidised interest for crop production, and for animal husbandry and fisheries needs',
            description_hi: 'फसल उत्पादन तथा पशुपालन और मत्स्य पालन आवश्यकताओं के लिए ₹3 लाख तक की अल्पकालिक ऋण सुविधा, रियायती ब्याज दर पर',
            category: 'Financial Support',
            image_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&h=600&fit=crop',
            location: 'NABARD / Reserve Bank of India — via all Scheduled Commercial Banks, RRBs & Cooperative Banks',
            event_date: null,
            key_objectives: [
                'Provide timely, adequate credit for cultivation and allied activities',
                'Offer interest subvention to keep effective rates low',
                'Extend coverage to animal husbandry and fisheries farmers',
                'Simplify disbursal with a single revolving credit limit'
            ],
            overview: 'The Kisan Credit Card scheme, introduced in 1998 by NABARD and RBI, gives farmers access to timely credit for cultivation and, since the 2018-19 Budget, for animal husbandry and fisheries as well. With the 2% interest subvention and 3% prompt-repayment incentive, the effective interest rate can be as low as 4% p.a. on loans up to ₹3 lakh.',
            process: 'Apply at the nearest bank branch with KYC documents and proof of land or livestock ownership. Banks are mandated to process KCC applications within 14 days under the KCC saturation drive.',
            eligibility: 'Farmers, tenant farmers, oral lessees, sharecroppers, and livestock/fisheries owners with valid land or animal ownership records.',
            documents_required: ['Identity proof (Aadhaar/Voter ID)', 'Land ownership or lease documents', 'Passport-size photographs'],
            tags: ['credit', 'interest subvention', 'livestock financing'],
            support_contact: 'Contact your nearest bank branch',
            apply_url: 'https://www.myscheme.gov.in/',
            is_active: true,
            is_featured: true
        },
        {
            title: 'Modified Interest Subvention Scheme (MISS)',
            title_hi: 'संशोधित ब्याज सहायता योजना',
            description: '2% interest subvention and 3% prompt repayment incentive on short-term crop loans up to ₹3 lakh, bringing the effective interest rate to as low as 4% per annum',
            description_hi: '₹3 लाख तक के अल्पकालिक फसल ऋण पर 2% ब्याज सहायता और समय पर भुगतान पर 3% अतिरिक्त छूट, प्रभावी ब्याज दर घटाकर 4% प्रति वर्ष तक',
            category: 'Financial Support',
            image_url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=600&fit=crop',
            location: 'NABARD / Reserve Bank of India — via all Scheduled Commercial Banks, RRBs & Cooperative Banks',
            event_date: null,
            key_objectives: [
                'Reduce the effective cost of short-term agricultural credit',
                'Encourage timely repayment of crop loans',
                'Improve farmer access to formal, low-cost credit',
                'Reduce dependence on informal high-interest moneylenders'
            ],
            overview: 'Administered by NABARD/RBI, the Modified Interest Subvention Scheme reduces the cost of short-term crop loans for farmers by subsidising 2 percentage points off the bank rate on loans up to ₹3 lakh, with an additional 3% incentive for farmers who repay on time, making credit affordable and encouraging timely repayment.',
            process: 'The subvention is applied automatically by the lending bank at the time of loan disbursal and repayment when the loan is taken against a Kisan Credit Card or crop loan account; no separate application is required beyond availing a KCC/crop loan.',
            eligibility: 'Farmers, including tenant farmers and Self Help Group members, availing short-term crop loans up to ₹3 lakh through eligible banks. Prompt repayment within the due date is required to receive the additional 3% incentive.',
            documents_required: ['Kisan Credit Card / crop loan account', 'Land ownership or tenancy proof'],
            tags: ['interest subvention', 'crop loan', 'credit'],
            support_contact: 'Contact your nearest bank branch or NABARD regional office',
            apply_url: 'https://www.nabard.org/',
            is_active: true,
            is_featured: false
        },
        {
            title: 'Pradhan Mantri Kisan Maandhan Yojana (PM-KMY)',
            title_hi: 'प्रधानमंत्री किसान मानधन योजना',
            description: 'Voluntary contributory pension scheme guaranteeing ₹3,000 per month to small and marginal farmers after the age of 60',
            description_hi: 'लघु एवं सीमांत किसानों के लिए स्वैच्छिक अंशदायी पेंशन योजना, जो 60 वर्ष की आयु के बाद ₹3,000 प्रति माह की गारंटी देती है',
            category: 'Financial Support',
            image_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&h=600&fit=crop',
            location: 'Department of Agriculture & Farmers Welfare, Government of India',
            event_date: null,
            key_objectives: [
                'Provide social security and old-age income support to small and marginal farmers',
                'Reduce old-age financial vulnerability among the farming community',
                'Encourage long-term savings through a matched-contribution pension model',
                'Extend pension coverage to the unorganised agricultural workforce'
            ],
            overview: 'Launched on 9 August 2019, PM-KMY is a voluntary and contributory pension scheme for small and marginal farmers aged 18-40, under which the farmer contributes a monthly amount between ₹55-₹200 (matched equally by the Central Government) into the pension fund, and receives an assured monthly pension of ₹3,000 after turning 60.',
            process: 'Eligible farmers can enrol at their nearest Common Service Centre (CSC) with Aadhaar and savings bank/Jan Dhan account details, or self-register through the Maandhan portal; the monthly contribution is auto-debited from the linked bank account.',
            eligibility: 'Small and marginal farmers (landholding up to 2 hectares) aged between 18 and 40 years. Farmers already covered under PM-SYM, NPS, ESIC or EPFO, or who are income-tax payees, are not eligible.',
            documents_required: ['Aadhaar Card', 'Landholding papers (Khatauni/Khasra)', 'Savings bank or Jan Dhan account passbook'],
            tags: ['pension', 'social security', 'small and marginal farmers'],
            support_contact: 'PM-KMY Helpline: 1800-267-6888',
            apply_url: 'https://maandhan.in/',
            is_active: true,
            is_featured: false
        },
        {
            title: 'PM Formalisation of Micro Food Processing Enterprises (PM FME)',
            title_hi: 'प्रधानमंत्री सूक्ष्म खाद्य प्रसंस्करण उद्यम औपचारिकीकरण योजना',
            description: 'Credit-linked capital subsidy of 35% (up to ₹10 lakh) to help unorganised micro food-processing units, including farmer-led units, upgrade and formalise',
            description_hi: 'असंगठित सूक्ष्म खाद्य प्रसंस्करण इकाइयों, जिनमें किसान-संचालित इकाइयां भी शामिल हैं, को उन्नयन एवं औपचारिकीकरण हेतु 35% (₹10 लाख तक) की साख-संबद्ध पूंजी सब्सिडी',
            category: 'Financial Support',
            image_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&h=600&fit=crop',
            location: 'Ministry of Food Processing Industries, Government of India',
            event_date: null,
            key_objectives: [
                'Formalise and upgrade unorganised micro food-processing enterprises',
                'Increase access to credit for food processing entrepreneurs',
                'Build common infrastructure for processing, storage and marketing',
                'Strengthen farmer-linked value addition to reduce post-harvest losses'
            ],
            overview: 'Launched in June 2020 by the Ministry of Food Processing Industries, PM FME supports the unorganised micro food-processing sector — including farmer producer organisations, self-help groups, and individual entrepreneurs processing agricultural produce — with credit-linked capital subsidy, common infrastructure support, branding and marketing assistance.',
            process: 'Apply through the state Nodal Agency/District Resource Person or the PM FME online portal with a project proposal; on approval, the subsidy is credit-linked and disbursed after a bank sanctions the loan.',
            eligibility: 'Existing micro food-processing enterprises, individual entrepreneurs, FPOs, SHGs and cooperatives engaged in processing of agricultural produce, seeking to formalise or upgrade their unit.',
            documents_required: ['Business/enterprise registration or proposed unit details', 'Detailed Project Report', 'Bank account and Aadhaar details'],
            tags: ['food processing', 'capital subsidy', 'value addition'],
            support_contact: 'Contact your State Nodal Agency for PM FME',
            apply_url: 'https://pmfme.mofpi.gov.in/',
            is_active: true,
            is_featured: false
        },
        {
            title: 'Rural Infrastructure Development Fund (RIDF)',
            title_hi: 'ग्रामीण अवसंरचना विकास निधि',
            description: 'NABARD-administered fund providing low-cost loans to state governments for rural infrastructure, including irrigation, rural roads, and agri-market infrastructure',
            description_hi: 'राज्य सरकारों को ग्रामीण अवसंरचना, जिसमें सिंचाई, ग्रामीण सड़कें और कृषि-बाजार अवसंरचना शामिल है, के लिए कम लागत के ऋण प्रदान करने वाली नाबार्ड-प्रबंधित निधि',
            category: 'Financial Support',
            image_url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1200&h=600&fit=crop',
            location: 'NABARD, on behalf of State Governments',
            event_date: null,
            key_objectives: [
                'Fund completion of rural infrastructure projects across states',
                'Improve irrigation coverage and flood protection',
                'Strengthen rural connectivity through roads and bridges',
                'Build agri-marketing infrastructure such as godowns and cold storage'
            ],
            overview: 'Set up by NABARD in 1995-96, RIDF provides state governments and state-owned corporations with low-interest loans to complete rural infrastructure projects — irrigation, flood protection, rural roads and bridges, and agricultural marketing infrastructure such as godowns and cold storages — that indirectly benefit farmers by improving connectivity and market access.',
            process: 'Individual farmers do not apply directly; state governments and agencies submit project proposals to NABARD for sanction under the annual RIDF tranche, and farmers benefit from the resulting infrastructure such as irrigation canals, rural roads or market yards.',
            eligibility: 'State governments, state-owned corporations, and Panchayati Raj Institutions implementing eligible rural infrastructure projects; farmers benefit indirectly through completed infrastructure in their area.',
            documents_required: ['Not applicable for individual farmers — project proposals are submitted by implementing state agencies'],
            tags: ['rural infrastructure', 'irrigation', 'NABARD'],
            support_contact: 'Contact your State Rural Development Department or NABARD regional office',
            apply_url: 'https://www.nabard.org/',
            is_active: true,
            is_featured: false
        },
        // ── Crop Insurance ─────────────────────────────────────────────────
        {
            title: 'Pradhan Mantri Fasal Bima Yojana',
            title_hi: 'प्रधानमंत्री फसल बीमा योजना',
            description: 'Crop insurance at low premium rates — 2% for Kharif, 1.5% for Rabi, and 5% for commercial/horticulture crops',
            description_hi: 'कम प्रीमियम दरों पर फसल बीमा — खरीफ के लिए 2%, रबी के लिए 1.5%, और वाणिज्यिक/बागवानी फसलों के लिए 5%',
            category: 'Crop Insurance',
            image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&h=600&fit=crop',
            location: 'Ministry of Agriculture & Farmers Welfare, Government of India',
            event_date: null,
            key_objectives: [
                'Provide financial support to farmers suffering crop loss or damage',
                'Stabilise farm incomes and ensure continued farming',
                'Encourage adoption of modern and innovative agricultural practices',
                'Ensure flow of credit to the agriculture sector'
            ],
            overview: 'Pradhan Mantri Fasal Bima Yojana, launched on 13 January 2016, provides comprehensive insurance cover against yield losses from natural calamities, pests and diseases, at one of the lowest premium rates offered anywhere in the world.',
            process: 'Enroll through your bank, Common Service Centre, insurance company agent, or the National Crop Insurance Portal before the state-notified cut-off date each season. Loanee farmers with crop loans are enrolled automatically unless they opt out.',
            eligibility: 'All farmers, including sharecroppers and tenant farmers, growing notified crops in notified areas.',
            documents_required: ['Aadhaar Card', 'Land records or tenancy agreement', 'Bank account details', 'Sowing declaration'],
            tags: ['crop insurance', 'risk mitigation', 'premium subsidy'],
            support_contact: 'PMFBY Helpline: 14447',
            apply_url: 'https://pmfby.gov.in/',
            is_active: true,
            is_featured: true
        },
        {
            title: 'Restructured Weather Based Crop Insurance Scheme (RWBCIS)',
            title_hi: 'पुनर्गठित मौसम आधारित फसल बीमा योजना',
            description: 'Insurance cover against adverse weather conditions such as rainfall deficit, excess rainfall, temperature and humidity, using weather stations as the basis for claims',
            description_hi: 'वर्षा की कमी, अधिक वर्षा, तापमान और आर्द्रता जैसी प्रतिकूल मौसम स्थितियों के विरुद्ध बीमा कवर, दावों के आधार के रूप में मौसम केंद्रों का उपयोग करते हुए',
            category: 'Crop Insurance',
            image_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&h=600&fit=crop',
            location: 'Ministry of Agriculture & Farmers Welfare, Government of India',
            event_date: null,
            key_objectives: [
                'Provide insurance against weather-related crop losses',
                'Enable faster claim settlement using automated weather data',
                'Stabilise farm income against unseasonal weather events',
                'Encourage use of weather-based risk mitigation tools'
            ],
            overview: 'RWBCIS, implemented alongside PMFBY, insures farmers against likely financial loss from adverse weather parameters — rainfall, temperature, humidity and wind speed — recorded at notified reference weather stations, using weather indices as a proxy for crop yield losses rather than actual field-level crop cutting.',
            process: 'Enroll through your bank at the time of taking a crop loan, or voluntarily through a Common Service Centre, insurance company agent or the National Crop Insurance Portal before the state-notified cut-off date for the notified crop and area.',
            eligibility: 'All farmers, including sharecroppers and tenant farmers, growing notified crops in areas covered by a notified reference weather station.',
            documents_required: ['Aadhaar Card', 'Land records or tenancy agreement', 'Bank account details', 'Sowing declaration'],
            tags: ['weather insurance', 'crop insurance', 'risk mitigation'],
            support_contact: 'PMFBY/RWBCIS Helpline: 14447',
            apply_url: 'https://pmfby.gov.in/',
            is_active: true,
            is_featured: false
        },
        // ── Soil Management ───────────────────────────────────────────────
        {
            title: 'Soil Health Card Scheme',
            title_hi: 'मृदा स्वास्थ्य कार्ड योजना',
            description: 'Scientific soil testing every two years with crop-wise nutrient and fertiliser recommendations',
            description_hi: 'हर दो वर्ष में वैज्ञानिक मृदा परीक्षण, फसल-वार पोषक तत्व और उर्वरक अनुशंसाओं के साथ',
            category: 'Soil Management',
            image_url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1200&h=600&fit=crop',
            location: 'Department of Agriculture & Farmers Welfare, Government of India',
            event_date: null,
            key_objectives: [
                'Assess the nutrient status of every farm holding',
                'Recommend balanced and judicious use of fertilisers',
                'Improve soil fertility and long-term productivity',
                'Reduce input costs by preventing over-fertilisation'
            ],
            overview: 'Launched on 19 February 2015, the Soil Health Card Scheme gives every farmer a report on the nutrient status of their soil — covering 12 parameters including N, P, K, secondary and micronutrients, pH, EC and organic carbon — along with recommendations, once every two years.',
            process: 'Soil samples are collected on a grid basis by state agriculture department field staff or at Krishi Vigyan Kendras and tested at accredited soil-testing labs. Reports are generated and shared via the Soil Health Card portal.',
            eligibility: 'All landholding farmers; samples are collected free of cost by the state agriculture department.',
            documents_required: ['Land record / khasra number'],
            tags: ['soil testing', 'fertiliser management', 'sustainability'],
            support_contact: 'Contact your local Krishi Vigyan Kendra or district agriculture office',
            apply_url: 'https://soilhealth.dac.gov.in/',
            is_active: true,
            is_featured: false
        },
        {
            title: 'National Mission on Natural Farming (NMNF)',
            title_hi: 'राष्ट्रीय प्राकृतिक कृषि मिशन',
            description: 'Promotes chemical-free natural farming practices using on-farm resources, reducing input costs and improving soil health',
            description_hi: 'फार्म पर उपलब्ध संसाधनों का उपयोग करते हुए रसायन-मुक्त प्राकृतिक खेती को बढ़ावा, जिससे लागत घटती है और मिट्टी का स्वास्थ्य सुधरता है',
            category: 'Soil Management',
            image_url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1200&h=600&fit=crop',
            location: 'Department of Agriculture & Farmers Welfare, Government of India',
            event_date: null,
            key_objectives: [
                'Reduce dependence on chemical fertilisers and pesticides',
                'Lower input costs for farmers through on-farm resource use',
                'Improve soil health and long-term fertility',
                'Build a cadre of trained Krishi Sakhis for farmer handholding'
            ],
            overview: 'Approved as a standalone Centrally Sponsored Scheme in 2023, the National Mission on Natural Farming promotes natural farming — using on-farm inputs like jeevamrit and beejamrit instead of chemical fertilisers and pesticides — to cut cultivation costs, restore soil fertility, and build climate resilience, with model demonstration farms and trained Krishi Sakhis in Gram Panchayat clusters.',
            process: 'Farmers can join through cluster-based demonstrations organised by the state agriculture department; Krishi Sakhis (community resource persons) provide hands-on training and handholding support at the village level.',
            eligibility: 'All farmers willing to adopt natural farming practices, with priority given to farmers in identified clusters along river banks and in Gram Panchayats covered under the mission.',
            documents_required: ['Land record / khasra number'],
            tags: ['natural farming', 'soil health', 'sustainability'],
            support_contact: 'Contact your local Krishi Sakhi or district agriculture office',
            apply_url: 'https://naturalfarming.dac.gov.in/',
            is_active: true,
            is_featured: false
        },
        // ── Agricultural Development ─────────────────────────────────────
        {
            title: 'Rashtriya Krishi Vikas Yojana (RKVY-RAFTAAR)',
            title_hi: 'राष्ट्रीय कृषि विकास योजना (आरकेवीवाई-रफ्तार)',
            description: 'Centrally sponsored scheme giving states flexibility to plan and fund agriculture and allied-sector development projects',
            description_hi: 'केंद्र प्रायोजित योजना जो राज्यों को कृषि एवं संबद्ध क्षेत्र की विकास परियोजनाओं की योजना बनाने और उन्हें वित्तपोषित करने की स्वतंत्रता देती है',
            category: 'Agricultural Development',
            image_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&h=600&fit=crop',
            location: 'Department of Agriculture & Farmers Welfare, Government of India',
            event_date: null,
            key_objectives: [
                'Incentivise states to increase investment in agriculture and allied sectors',
                'Provide flexibility to states to plan projects as per local priorities',
                'Promote agri-entrepreneurship and value chain development',
                'Bridge critical infrastructure and technology gaps'
            ],
            overview: 'RKVY has supported state-driven agricultural growth since 2007. Since 2017-18 it operates as RKVY-RAFTAAR (Remunerative Approaches for Agriculture and Allied sector Rejuvenation), funded 60:40 between Centre and State (90:10 for North-Eastern and Himalayan states).',
            process: 'Implemented through State Agriculture Departments via State-level Approval Committees against approved State Annual Action Plans; individual farmers apply for specific sub-schemes through the relevant state department.',
            eligibility: 'Varies by sub-scheme/project; generally open to farmers, FPOs, and agri-entrepreneurs within the approved state action plan.',
            documents_required: ['Land or enterprise records as specified by the state scheme component'],
            tags: ['infrastructure', 'state scheme', 'agri-entrepreneurship'],
            support_contact: 'Contact your State Department of Agriculture',
            apply_url: 'https://rkvy.nic.in/',
            is_active: true,
            is_featured: false
        },
        {
            title: 'National Mission for Sustainable Agriculture (NMSA)',
            title_hi: 'राष्ट्रीय सतत कृषि मिशन (एनएमएसए)',
            description: 'Promotes climate-resilient, sustainable farming through rainfed area development, soil and water conservation',
            description_hi: 'वर्षा आधारित क्षेत्र विकास, मृदा एवं जल संरक्षण के माध्यम से जलवायु-अनुकूल, सतत कृषि को बढ़ावा',
            category: 'Agricultural Development',
            image_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&h=600&fit=crop',
            location: 'Department of Agriculture & Farmers Welfare, Government of India',
            event_date: null,
            key_objectives: [
                'Promote climate-resilient agricultural practices',
                'Develop rainfed farming areas through integrated approaches',
                'Improve soil health and water use efficiency',
                'Conserve natural resources for sustainable production'
            ],
            overview: 'NMSA is one of the eight missions under the National Action Plan on Climate Change (NAPCC), focused on making agriculture more productive, sustainable and climate-resilient through integrated farming, soil and water conservation, and efficient resource use.',
            process: 'Implemented through state agriculture departments; farmers can apply through district-level agriculture offices for components such as Rainfed Area Development and Soil Health Management.',
            eligibility: 'Farmers in identified rainfed and resource-constrained areas as notified by the state implementing agency.',
            documents_required: ['Land record / khasra number'],
            tags: ['climate resilience', 'rainfed farming', 'sustainability'],
            support_contact: 'Contact your district agriculture office',
            apply_url: 'https://www.myscheme.gov.in/',
            is_active: true,
            is_featured: false
        },
        {
            title: 'Paramparagat Krishi Vikas Yojana (PKVY)',
            title_hi: 'परंपरागत कृषि विकास योजना',
            description: 'Cluster-based organic farming scheme supporting certification, branding and marketing for farmer groups converting to organic practices',
            description_hi: 'जैविक खेती अपनाने वाले किसान समूहों के लिए प्रमाणीकरण, ब्रांडिंग और विपणन सहायता प्रदान करने वाली समूह-आधारित योजना',
            category: 'Agricultural Development',
            image_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&h=600&fit=crop',
            location: 'Department of Agriculture & Farmers Welfare, Government of India',
            event_date: null,
            key_objectives: [
                'Promote cluster-based organic farming across the country',
                'Support Participatory Guarantee System certification for organic produce',
                'Improve soil health through elimination of chemical inputs',
                'Enable branding and market linkage for certified organic produce'
            ],
            overview: 'Launched in 2015, PKVY promotes organic farming through a cluster approach, where groups of farmers (each cluster of about 20 hectares/50 farmers) are supported with financial assistance for organic inputs, Participatory Guarantee System (PGS) certification, and marketing of certified organic produce under the PGS-India logo.',
            process: 'Farmers form or join a registered cluster through their state agriculture department or an implementing agency, undergo PGS certification training, and receive conversion support over three years along with marketing linkage.',
            eligibility: 'Groups of farmers willing to form a cluster and convert to organic farming practices for a minimum of three years, as coordinated by the state implementing agency.',
            documents_required: ['Land record / khasra number', 'Cluster/group registration through implementing agency'],
            tags: ['organic farming', 'PGS certification', 'cluster farming'],
            support_contact: 'Contact your district agriculture office',
            apply_url: 'https://pgsindia-ncof.gov.in/',
            is_active: true,
            is_featured: false
        },
        {
            title: 'National Food Security Mission (NFSM)',
            title_hi: 'राष्ट्रीय खाद्य सुरक्षा मिशन',
            description: 'Provides seed subsidy, farm demonstrations and inputs to boost production of rice, wheat, pulses, coarse cereals and nutri-cereals',
            description_hi: 'चावल, गेहूं, दलहन, मोटे अनाज और पोषक-अनाज के उत्पादन को बढ़ावा देने हेतु बीज सब्सिडी, फार्म प्रदर्शन और आदान उपलब्ध कराना',
            category: 'Agricultural Development',
            image_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&h=600&fit=crop',
            location: 'Department of Agriculture & Farmers Welfare, Government of India',
            event_date: null,
            key_objectives: [
                'Increase production of rice, wheat, pulses and coarse cereals',
                'Promote nutri-cereals/millets for nutritional security',
                'Restore soil fertility through balanced input use',
                'Enhance farm-level income through better productivity'
            ],
            overview: 'Running since 2007, NFSM aims to increase production of rice, wheat, pulses, coarse cereals (including nutri-cereals/millets), and commercial crops like cotton and jute through area expansion, productivity enhancement, and distribution of quality seeds, farm demonstrations, and need-based farm inputs to farmers in identified districts.',
            process: 'Benefits are delivered through the state agriculture department at the district level; farmers can approach their block/district agriculture office to enrol for seed subsidy or demonstration plots under the mission.',
            eligibility: 'Farmers in NFSM-identified districts cultivating the target crops; specific components have varying eligibility as notified by the state implementing department.',
            documents_required: ['Land record / khasra number'],
            tags: ['food security', 'seed subsidy', 'productivity enhancement'],
            support_contact: 'Contact your district agriculture office',
            apply_url: 'https://nfsm.gov.in/',
            is_active: true,
            is_featured: false
        },
        {
            title: 'Mission for Integrated Development of Horticulture (MIDH)',
            title_hi: 'बागवानी के समेकित विकास हेतु मिशन',
            description: 'Financial and technical support for fruits, vegetables, spices, flowers and plantation crops, covering planting material, protected cultivation and post-harvest infrastructure',
            description_hi: 'फल, सब्जी, मसाले, फूल और वृक्षारोपण फसलों के लिए वित्तीय एवं तकनीकी सहायता, जिसमें रोपण सामग्री, संरक्षित खेती और फसलोपरांत अवसंरचना शामिल है',
            category: 'Agricultural Development',
            image_url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1200&h=600&fit=crop',
            location: 'Department of Agriculture & Farmers Welfare, Government of India',
            event_date: null,
            key_objectives: [
                'Promote holistic growth of the horticulture sector',
                'Improve availability of quality planting material',
                'Support protected cultivation and post-harvest infrastructure',
                'Enhance productivity and farmer income from horticulture crops'
            ],
            overview: 'A Centrally Sponsored Scheme since 2014-15, MIDH provides holistic support to the horticulture sector — fruits, vegetables, spices, flowers, plantation crops, medicinal and aromatic plants — covering nurseries, planting material, protected cultivation (polyhouses/shade-net houses), organic farming, and post-harvest management and cold chain infrastructure.',
            process: 'Apply through the state Horticulture Department with a project proposal for the relevant component (nursery, protected cultivation, etc.); subsidy is typically credit-linked or released as back-ended assistance after physical verification.',
            eligibility: 'Farmers, farmer groups, FPOs and entrepreneurs undertaking horticulture crop cultivation or allied infrastructure as per the notified component guidelines.',
            documents_required: ['Land record / khasra number', 'Project proposal for the specific component'],
            tags: ['horticulture', 'protected cultivation', 'post-harvest'],
            support_contact: 'Contact your State Horticulture Department',
            apply_url: 'https://midh.gov.in/',
            is_active: true,
            is_featured: false
        },
        {
            title: 'Formation and Promotion of 10,000 Farmer Producer Organisations (FPOs)',
            title_hi: '10,000 कृषक उत्पादक संगठनों (एफपीओ) का गठन एवं संवर्धन',
            description: 'Support to form new Farmer Producer Organisations, with financial assistance up to ₹18 lakh per FPO over three years and equity/credit guarantee support',
            description_hi: 'नए कृषक उत्पादक संगठनों के गठन हेतु सहायता, प्रति एफपीओ तीन वर्षों में ₹18 लाख तक की वित्तीय सहायता, इक्विटी और क्रेडिट गारंटी सहायता के साथ',
            category: 'Agricultural Development',
            image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=600&fit=crop',
            location: 'Department of Agriculture & Farmers Welfare, Government of India',
            event_date: null,
            key_objectives: [
                'Aggregate small and marginal farmers into economically viable producer organisations',
                'Improve farmers collective bargaining power for input and output markets',
                'Provide equity grant and credit guarantee support to FPOs',
                'Build farmer-owned infrastructure for processing and value addition'
            ],
            overview: 'Launched in 2020 with an outlay of ₹6,865 crore, this Central Sector Scheme supports the formation and three-year handholding of 10,000 new Farmer Producer Organisations across the country through Implementing Agencies such as NABARD, SFAC and NCDC, giving small and marginal farmers collective bargaining power for inputs, credit and market access.',
            process: 'Groups of farmers approach an empanelled Cluster-Based Business Organisation (CBBO) or Implementing Agency in their district to form an FPO; once registered, the FPO receives phased financial support, equity grant, and access to the Credit Guarantee Fund.',
            eligibility: 'Groups of small and marginal farmers (minimum member thresholds vary by region — typically 300 members in plains, 100 in hilly/North-Eastern areas) willing to form a registered Farmer Producer Organisation.',
            documents_required: ['Group/farmer list for FPO formation', 'Land records of member farmers'],
            tags: ['FPO', 'collectivisation', 'market access'],
            support_contact: 'Contact your nearest NABARD, SFAC or NCDC office',
            apply_url: 'https://sfacindia.com/',
            is_active: true,
            is_featured: true
        },
        {
            title: 'National Beekeeping and Honey Mission (NBHM)',
            title_hi: 'राष्ट्रीय मधुमक्खी पालन एवं शहद मिशन',
            description: 'Support for setting up bee colonies, honey extraction and processing units, and market linkage for beekeepers under a mini-mission of Atmanirbhar Bharat',
            description_hi: 'मधुमक्खी पालकों के लिए मधुमक्खी कालोनी स्थापना, शहद निष्कर्षण एवं प्रसंस्करण इकाइयों तथा बाजार संपर्क हेतु सहायता, आत्मनिर्भर भारत के मिनी-मिशन के अंतर्गत',
            category: 'Agricultural Development',
            image_url: 'https://images.unsplash.com/photo-1584935385075-2a0d0b0dcbb7?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1584935385075-2a0d0b0dcbb7?w=1200&h=600&fit=crop',
            location: 'National Bee Board, Department of Agriculture & Farmers Welfare',
            event_date: null,
            key_objectives: [
                'Promote scientific beekeeping as a supplementary income source',
                'Improve honey productivity and quality standards',
                'Support beekeeping infrastructure and market linkage',
                'Enhance crop pollination and yields through managed beekeeping'
            ],
            overview: 'Implemented since 2020 under the Atmanirbhar Bharat Abhiyan, NBHM promotes scientific beekeeping as a supplementary income source for farmers, supporting bee colonies, hives, honey extraction equipment, and integrated beekeeping development centres, alongside quality testing labs to support export-quality honey production.',
            process: 'Interested farmers and beekeepers can apply through the National Bee Board (NBB) or the state horticulture/agriculture department implementing the mission in their district.',
            eligibility: 'Farmers, beekeepers and entrepreneurs interested in taking up or scaling beekeeping activities, subject to the component-specific guidelines of the implementing state agency.',
            documents_required: ['Aadhaar Card', 'Land record where applicable'],
            tags: ['beekeeping', 'honey production', 'supplementary income'],
            support_contact: 'Contact the National Bee Board or your state horticulture department',
            apply_url: 'https://nbb.gov.in/',
            is_active: true,
            is_featured: false
        },
        // ── Training ───────────────────────────────────────────────────────
        {
            title: 'Krishi Vigyan Kendra (KVK) Farmer Training Programmes',
            title_hi: 'कृषि विज्ञान केंद्र (केवीके) किसान प्रशिक्षण कार्यक्रम',
            description: 'Free, hands-on vocational training for farmers and rural youth at your district Krishi Vigyan Kendra',
            description_hi: 'आपके जिला कृषि विज्ञान केंद्र पर किसानों और ग्रामीण युवाओं के लिए निःशुल्क, व्यावहारिक व्यावसायिक प्रशिक्षण',
            category: 'Training',
            image_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&h=600&fit=crop',
            location: 'Krishi Vigyan Kendra (ICAR), your district',
            event_date: null,
            key_objectives: [
                'Build practical skills through on-farm and hands-on training',
                'Demonstrate improved crop and livestock technologies',
                'Support rural youth entrepreneurship in agriculture and allied sectors',
                'Provide season-specific and location-specific advisory training'
            ],
            overview: 'Krishi Vigyan Kendras (Farm Science Centres), established by the Indian Council of Agricultural Research (ICAR) with nearly one in almost every district, run vocational and skill-development training programmes for farmers, farm women, and rural youth in agriculture, horticulture, animal husbandry, and allied enterprises.',
            process: 'Contact or visit your district Krishi Vigyan Kendra to check the current training calendar and register for upcoming batches. Many KVKs also publish schedules through the state agriculture department and local Panchayat offices.',
            eligibility: 'Farmers, farm women, and rural youth in the KVK\'s home district; most trainings are free of cost.',
            documents_required: ['Aadhaar Card (for registration at most KVKs)'],
            tags: ['training', 'skill development', 'extension services'],
            support_contact: 'Contact your district Krishi Vigyan Kendra',
            apply_url: 'https://icar.org.in/',
            is_active: true,
            is_featured: false
        },
        {
            title: 'ICAR Farmer FIRST Programme',
            title_hi: 'आईसीएआर किसान फर्स्ट कार्यक्रम',
            description: 'Farmer-scientist interaction programme connecting farmers directly with agricultural researchers for technology training',
            description_hi: 'कृषि शोधकर्ताओं के साथ किसानों को सीधे जोड़ने वाला किसान-वैज्ञानिक संवाद कार्यक्रम, तकनीकी प्रशिक्षण हेतु',
            category: 'Training',
            image_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&h=600&fit=crop',
            location: 'Indian Council of Agricultural Research (ICAR), via partner State Agricultural Universities',
            event_date: null,
            key_objectives: [
                'Strengthen direct farmer-scientist interaction and feedback',
                'Enhance farmer knowledge of location-specific technologies',
                'Diversify farm income through integrated farming system training',
                'Build farmer collectives for shared learning and market linkage'
            ],
            overview: 'Farmer FIRST (Farmer-First for Innovation, Research, Synthesis and Technology transfer) is an ICAR programme launched in 2016 that moves beyond one-way technology transfer to a farmer-centric, participatory model of training and knowledge exchange, delivered through ICAR institutes and State Agricultural Universities.',
            process: 'Enrollment is coordinated through participating ICAR institutes and State Agricultural Universities in the operational districts; contact your nearest Krishi Vigyan Kendra to check if Farmer FIRST activities are running in your area.',
            eligibility: 'Farmers in districts covered by an ICAR institute or State Agricultural University running the programme.',
            documents_required: ['Aadhaar Card (for registration where required)'],
            tags: ['training', 'farmer-scientist interaction', 'technology transfer'],
            support_contact: 'Contact your nearest ICAR institute or Krishi Vigyan Kendra',
            apply_url: 'https://icar.org.in/',
            is_active: true,
            is_featured: false
        },
        {
            title: 'Attracting and Retaining Youth in Agriculture (ARYA)',
            title_hi: 'कृषि में युवाओं को आकर्षित एवं बनाए रखना (आर्या)',
            description: 'ICAR programme providing skill training and entrepreneurship support to help rural youth start agri-based enterprises in their own villages',
            description_hi: 'ग्रामीण युवाओं को अपने ही गांव में कृषि-आधारित उद्यम शुरू करने में सहायता हेतु आईसीएआर कार्यक्रम, कौशल प्रशिक्षण और उद्यमिता सहायता के साथ',
            category: 'Training',
            image_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&h=600&fit=crop',
            location: 'Indian Council of Agricultural Research (ICAR), via Krishi Vigyan Kendras',
            event_date: null,
            key_objectives: [
                'Attract and retain rural youth in agriculture-based livelihoods',
                'Provide hands-on training in profitable agri-enterprises',
                'Support entrepreneurship development at the village level',
                'Reduce rural-to-urban migration through local income opportunities'
            ],
            overview: 'Implemented by ICAR through Krishi Vigyan Kendras since 2015-16, ARYA aims to attract and retain rural youth in agriculture and allied enterprises by providing skill training, technology backstopping, and support to set up profitable agri-enterprises such as mushroom cultivation, dairy, poultry, and value addition units close to their villages.',
            process: 'Interested youth can register at their district Krishi Vigyan Kendra to check enrolment for the current ARYA batch and available enterprise modules.',
            eligibility: 'Rural youth aged 18-35 in districts where a Krishi Vigyan Kendra is implementing the ARYA project.',
            documents_required: ['Aadhaar Card', 'Proof of residence in the KVK operational district'],
            tags: ['youth entrepreneurship', 'skill training', 'rural livelihoods'],
            support_contact: 'Contact your district Krishi Vigyan Kendra',
            apply_url: 'https://icar.org.in/',
            is_active: true,
            is_featured: false
        },
        {
            title: 'Mahila Kisan Sashaktikaran Pariyojana (MKSP)',
            title_hi: 'महिला किसान सशक्तिकरण परियोजना',
            description: 'Sub-component of DAY-NRLM building the technical and livelihood capacity of women farmers through training in sustainable agriculture practices',
            description_hi: 'महिला किसानों की तकनीकी और आजीविका क्षमता को सतत कृषि पद्धतियों में प्रशिक्षण के माध्यम से बढ़ाने वाली डे-एनआरएलएम की उप-योजना',
            category: 'Training',
            image_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&h=600&fit=crop',
            location: 'Ministry of Rural Development, via State Rural Livelihoods Missions',
            event_date: null,
            key_objectives: [
                'Strengthen the technical and livelihood capacity of women farmers',
                'Promote sustainable and climate-resilient agriculture practices',
                'Improve household food and nutritional security',
                'Build women-led collectives for farming and allied activities'
            ],
            overview: 'MKSP, a sub-component of the Deendayal Antyodaya Yojana-National Rural Livelihoods Mission (DAY-NRLM), builds the agricultural knowledge and skills of women farmers organised in Self Help Groups, training them in sustainable, climate-resilient farming practices, seed production, and livestock management to improve household food and livelihood security.',
            process: 'Women farmers can join through their local Self Help Group federation under DAY-NRLM; the State Rural Livelihoods Mission (SRLM) coordinates training batches with resource organisations.',
            eligibility: 'Women farmers, particularly small and marginal farmers, who are members of a Self Help Group under DAY-NRLM.',
            documents_required: ['Self Help Group membership details', 'Aadhaar Card'],
            tags: ['women farmers', 'SHG', 'sustainable agriculture'],
            support_contact: 'Contact your State Rural Livelihoods Mission office',
            apply_url: 'https://aajeevika.gov.in/',
            is_active: true,
            is_featured: false
        },
        // ── Animal Husbandry & Dairy ──────────────────────────────────────
        {
            title: 'Rashtriya Gokul Mission',
            title_hi: 'राष्ट्रीय गोकुल मिशन',
            description: 'Conservation and genetic improvement of indigenous cattle and buffalo breeds to boost milk productivity',
            description_hi: 'दूध उत्पादकता बढ़ाने के लिए देशी गाय और भैंस नस्लों का संरक्षण और आनुवंशिक सुधार',
            category: 'Animal Husbandry & Dairy',
            image_url: 'https://images.unsplash.com/photo-1584935385075-2a0d0b0dcbb7?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1584935385075-2a0d0b0dcbb7?w=1200&h=600&fit=crop',
            location: 'Department of Animal Husbandry & Dairying, Ministry of Fisheries, Animal Husbandry and Dairying',
            event_date: null,
            key_objectives: [
                'Conserve and develop indigenous bovine breeds',
                'Enhance milk production and productivity',
                'Upgrade nondescript cattle using high genetic merit indigenous breeds',
                'Distribute disease-free, high genetic merit bulls for natural service'
            ],
            overview: 'Launched in December 2014 under the National Programme for Bovine Breeding and Dairy Development, the Rashtriya Gokul Mission focuses on conserving and developing indigenous cattle and buffalo breeds scientifically, using tools like artificial insemination, IVF and sex-sorted semen.',
            process: 'Farmers can avail artificial insemination and breed-improvement services through State Animal Husbandry Departments, Gokul Grams, and empanelled AI technicians under the National Artificial Insemination Programme.',
            eligibility: 'Cattle and buffalo owners; benefits are delivered through state animal husbandry departments and cooperative dairy networks.',
            documents_required: ['Animal ownership / ear-tag registration under Pashu Aadhaar (INAPH)'],
            tags: ['dairy', 'cattle breeding', 'artificial insemination'],
            support_contact: 'Contact your District Animal Husbandry Office',
            apply_url: 'https://dahd.nic.in/',
            is_active: true,
            is_featured: true
        },
        {
            title: 'National Livestock Mission',
            title_hi: 'राष्ट्रीय पशुधन मिशन',
            description: 'Supports entrepreneurship development in poultry, sheep, goat, and piggery for sustainable livestock growth',
            description_hi: 'सतत पशुधन विकास के लिए मुर्गीपालन, भेड़, बकरी और सूकर पालन में उद्यमिता विकास हेतु सहायता',
            category: 'Animal Husbandry & Dairy',
            image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=600&fit=crop',
            location: 'Department of Animal Husbandry & Dairying, Ministry of Fisheries, Animal Husbandry and Dairying',
            event_date: null,
            key_objectives: [
                'Generate self-employment and entrepreneurship in the livestock sector',
                'Increase availability of quality feed and fodder',
                'Improve productivity of small ruminants, poultry and pigs',
                'Provide risk cover to livestock and livestock-related activities'
            ],
            overview: 'The National Livestock Mission (revamped for 2021-22 onwards) supports entrepreneurs through capital subsidy and credit-linked back-ended subsidy for poultry, sheep, goat, and piggery ventures, along with fodder and feed development.',
            process: 'Apply through the Udyami Mitra portal or your State Animal Husbandry Department with a detailed project report; eligible entrepreneurs receive subsidy support routed through participating banks/NABARD.',
            eligibility: 'Individual entrepreneurs, farmer producer organisations, self-help groups, and companies engaged in the livestock sector.',
            documents_required: ['Detailed Project Report', 'Land/shed ownership or lease proof', 'Bank loan sanction letter'],
            tags: ['livestock entrepreneurship', 'poultry', 'sheep and goat'],
            support_contact: 'Contact your State Animal Husbandry Department',
            apply_url: 'https://dahd.nic.in/',
            is_active: true,
            is_featured: false
        },
        {
            title: 'Animal Husbandry Infrastructure Development Fund (AHIDF)',
            title_hi: 'पशुपालन अवसंरचना विकास निधि (एएचआईडीएफ)',
            description: '₹15,000 crore fund offering 3% interest subvention on loans for dairy, meat processing and animal feed plants',
            description_hi: 'डेयरी, मांस प्रसंस्करण और पशु आहार संयंत्रों के लिए ऋण पर 3% ब्याज छूट देने वाली ₹15,000 करोड़ की निधि',
            category: 'Animal Husbandry & Dairy',
            image_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&h=600&fit=crop',
            location: 'Department of Animal Husbandry & Dairying, Ministry of Fisheries, Animal Husbandry and Dairying',
            event_date: null,
            key_objectives: [
                'Incentivise private investment in dairy and meat processing infrastructure',
                'Support setting up of animal feed plants',
                'Improve access to quality processing and value-addition facilities',
                'Create employment opportunities in rural areas'
            ],
            overview: 'Launched in 2020, AHIDF incentivises investment by individual entrepreneurs, FPOs, MSMEs, Section 8 companies and dairy/milk cooperatives in dairy processing, meat processing, and animal feed plants, with a 3% interest subvention on eligible loans.',
            process: 'Submit a project proposal with a Detailed Project Report to a participating scheduled bank or NABARD/NCDC; the subsidy is credit-linked and released after loan disbursement.',
            eligibility: 'Individual entrepreneurs, private companies, MSMEs, FPOs, Section 8 companies, and dairy cooperatives investing in eligible processing infrastructure.',
            documents_required: ['Detailed Project Report', 'Company/entity registration', 'Bank loan sanction letter'],
            tags: ['dairy processing', 'meat processing', 'interest subvention'],
            support_contact: 'Contact your nearest NABARD office or participating bank',
            apply_url: 'https://dahd.nic.in/',
            is_active: true,
            is_featured: false
        },
        {
            title: 'National Animal Disease Control Programme (NADCP)',
            title_hi: 'राष्ट्रीय पशु रोग नियंत्रण कार्यक्रम (एनएडीसीपी)',
            description: 'Free, 100% centrally-funded vaccination of livestock against Foot and Mouth Disease and Brucellosis',
            description_hi: 'खुरपका-मुंहपका रोग और ब्रुसेलोसिस के विरुद्ध पशुधन का निःशुल्क, 100% केंद्र-वित्तपोषित टीकाकरण',
            category: 'Animal Husbandry & Dairy',
            image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&h=600&fit=crop',
            location: 'Department of Animal Husbandry & Dairying, Ministry of Fisheries, Animal Husbandry and Dairying',
            event_date: null,
            key_objectives: [
                'Control and eventually eradicate Foot and Mouth Disease (FMD)',
                'Control Brucellosis in bovine population',
                'Vaccinate 100% of cattle, buffalo, sheep, goat and pig population for FMD',
                'Improve livestock productivity and enable export competitiveness'
            ],
            overview: 'Launched in September 2019 with an outlay of ₹13,343 crore, NADCP is a 100% centrally-funded programme to vaccinate the entire susceptible livestock population against FMD, and female bovine calves against Brucellosis, delivered through state veterinary departments in coordinated vaccination rounds.',
            process: 'No individual application needed — vaccination is delivered free of cost through scheduled camps organised by state Animal Husbandry Departments and local veterinary staff.',
            eligibility: 'All cattle, buffalo, sheep, goat and pig owners; vaccination is provided free regardless of herd size.',
            documents_required: ['Animal ear-tag / Pashu Aadhaar (INAPH) registration, where available'],
            tags: ['vaccination', 'disease control', 'FMD', 'brucellosis'],
            support_contact: 'Contact your District Veterinary Officer',
            apply_url: 'https://dahd.nic.in/',
            is_active: true,
            is_featured: false
        },
        {
            title: 'Livestock Insurance Scheme',
            title_hi: 'पशुधन बीमा योजना',
            description: 'Subsidised insurance cover for cattle, buffalo and other milch/draught animals against death due to disease, accident or natural calamity',
            description_hi: 'बीमारी, दुर्घटना या प्राकृतिक आपदा के कारण मृत्यु के विरुद्ध गाय, भैंस और अन्य दुधारू/कृषि कार्य में उपयोग होने वाले पशुओं के लिए रियायती बीमा कवर',
            category: 'Animal Husbandry & Dairy',
            image_url: 'https://images.unsplash.com/photo-1584935385075-2a0d0b0dcbb7?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1584935385075-2a0d0b0dcbb7?w=1200&h=600&fit=crop',
            location: 'Department of Animal Husbandry & Dairying, Ministry of Fisheries, Animal Husbandry and Dairying',
            event_date: null,
            key_objectives: [
                'Protect farmers from financial loss due to livestock mortality',
                'Provide affordable, subsidised insurance premiums',
                'Encourage scientific animal identification and record-keeping',
                'Reduce farmer distress from unexpected loss of productive animals'
            ],
            overview: 'Implemented as a component of the National Livestock Mission\'s Risk Management and Insurance sub-scheme, the Livestock Insurance Scheme protects farmers against the financial loss of losing a milch or draught animal, with premium subsidy of up to 50% (higher for SC/ST and BPL farmers) to keep the cover affordable.',
            process: 'Apply through your District Animal Husbandry Office or an empanelled insurance company with animal identification (ear-tag) and a veterinary health certificate; the animal is valued and tagged before the policy is issued.',
            eligibility: 'Owners of milch and draught cattle, buffalo, and other notified livestock, with the animal identified through an approved ear-tag/microchip.',
            documents_required: ['Animal ear-tag / Pashu Aadhaar (INAPH) registration', 'Veterinary health certificate', 'Ownership proof'],
            tags: ['livestock insurance', 'risk cover', 'dairy animals'],
            support_contact: 'Contact your District Animal Husbandry Office',
            apply_url: 'https://dahd.nic.in/',
            is_active: true,
            is_featured: false
        },
        {
            title: 'Pashu Kisan Credit Card',
            title_hi: 'पशु किसान क्रेडिट कार्ड',
            description: 'State-level extension of the Kisan Credit Card that provides low-interest working capital loans against cattle, buffalo, goat, sheep and poultry holdings',
            description_hi: 'राज्य-स्तरीय विस्तार जो गाय, भैंस, बकरी, भेड़ और मुर्गी पालन के विरुद्ध कम ब्याज पर कार्यशील पूंजी ऋण प्रदान करता है',
            category: 'Animal Husbandry & Dairy',
            image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=600&fit=crop',
            location: 'State Animal Husbandry Department, Uttar Pradesh and other participating states',
            event_date: null,
            key_objectives: [
                'Extend affordable working-capital credit to livestock owners',
                'Cover farmers who may not own agricultural land',
                'Reduce dependence on informal, high-interest credit for animal husbandry',
                'Improve feed, health and maintenance investment in livestock'
            ],
            overview: 'Rolled out by several state governments (including Uttar Pradesh) building on the Union Budget 2018-19 extension of KCC to animal husbandry and fisheries, the Pashu Kisan Credit Card gives livestock owners a revolving credit limit calculated per animal to meet feed, healthcare and maintenance costs, at KCC-linked subsidised interest rates.',
            process: 'Apply at your nearest bank branch or through the State Animal Husbandry Department with proof of livestock ownership; the loan limit is fixed based on the number and type of animals owned, following the same interest subvention benefits as the regular KCC.',
            eligibility: 'Cattle, buffalo, goat, sheep and poultry owners, including those without land ownership, who can furnish proof of livestock ownership via veterinary/Pashu Aadhaar records.',
            documents_required: ['Identity proof (Aadhaar/Voter ID)', 'Animal ownership / Pashu Aadhaar (INAPH) record', 'Passport-size photographs'],
            tags: ['livestock credit', 'KCC', 'dairy financing'],
            support_contact: 'Contact your nearest bank branch or District Animal Husbandry Office',
            apply_url: 'https://upagriculture.com/',
            is_active: true,
            is_featured: false
        },
        // ── Irrigation & Water Management ────────────────────────────────
        {
            title: 'Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)',
            title_hi: 'प्रधानमंत्री कृषि सिंचाई योजना',
            description: '"Har Khet Ko Pani" mission expanding irrigation coverage and providing subsidy for drip and sprinkler micro-irrigation under "Per Drop More Crop"',
            description_hi: '"हर खेत को पानी" मिशन जो सिंचाई कवरेज का विस्तार करता है और "पर ड्रॉप मोर क्रॉप" के तहत ड्रिप एवं स्प्रिंकलर सूक्ष्म सिंचाई हेतु सब्सिडी प्रदान करता है',
            category: 'Irrigation & Water Management',
            image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&h=600&fit=crop',
            location: 'Department of Agriculture & Farmers Welfare, Government of India',
            event_date: null,
            key_objectives: [
                'Expand assured irrigation coverage across farms',
                'Promote water-use efficiency through micro-irrigation',
                'Provide capital subsidy for drip and sprinkler systems',
                'Improve crop productivity per unit of water used'
            ],
            overview: 'Launched in 2015, PMKSY converges irrigation-related investments through a "Har Khet Ko Pani" approach to expand cultivable area under assured irrigation, while its "Per Drop More Crop" component provides capital subsidy — typically 55% for small/marginal farmers and 45% for others — on drip and sprinkler micro-irrigation systems to improve water use efficiency.',
            process: 'Apply through the state Horticulture/Agriculture Department or Micro Irrigation implementing agency; on field verification, subsidy is released directly to the farmer\'s bank account or credited against the equipment vendor invoice.',
            eligibility: 'All farmers, with priority given to small and marginal farmers, water-scarce and drought-prone districts, for installation of micro-irrigation systems or eligible irrigation infrastructure.',
            documents_required: ['Land record / khasra number', 'Water source proof (borewell/canal connection)', 'Bank account details'],
            tags: ['irrigation', 'micro-irrigation', 'water use efficiency'],
            support_contact: 'Contact your district Agriculture or Horticulture Department',
            apply_url: 'https://pmksy.gov.in/',
            is_active: true,
            is_featured: true
        },
        {
            title: 'Atal Bhujal Yojana (Atal Jal)',
            title_hi: 'अटल भूजल योजना',
            description: 'Community-led groundwater management scheme in water-stressed areas, promoting demand-side water conservation alongside supply-side interventions',
            description_hi: 'जल-संकटग्रस्त क्षेत्रों में सामुदायिक भूजल प्रबंधन योजना, जो आपूर्ति-पक्ष के हस्तक्षेपों के साथ-साथ मांग-पक्ष जल संरक्षण को बढ़ावा देती है',
            category: 'Irrigation & Water Management',
            image_url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1200&h=600&fit=crop',
            location: 'Ministry of Jal Shakti, Government of India',
            event_date: null,
            key_objectives: [
                'Improve community-led management of groundwater resources',
                'Promote sustainable cropping patterns in water-scarce areas',
                'Strengthen convergence of water conservation with irrigation schemes',
                'Build long-term groundwater sustainability data and monitoring'
            ],
            overview: 'A World Bank-supported Central Sector Scheme launched in 2020 across water-stressed areas of seven states, Atal Bhujal Yojana strengthens community institutions (Water User Associations) to prepare and implement local Water Security Plans, promoting crop diversification, micro-irrigation, and demand management alongside conventional recharge structures.',
            process: 'Village-level Water User Associations and Gram Panchayats, facilitated by the state Ground Water Department, prepare Water Security Plans; farmers participate through these community institutions and benefit from convergence with schemes like PMKSY for on-ground works.',
            eligibility: 'Farmers and communities in the identified water-stressed Gram Panchayats covered under the scheme in the participating states.',
            documents_required: ['Village/Gram Panchayat identification', 'Land record where applicable'],
            tags: ['groundwater management', 'water conservation', 'community irrigation'],
            support_contact: 'Contact your district Ground Water Department',
            apply_url: 'https://ataljal.mowr.gov.in/',
            is_active: true,
            is_featured: false
        },
        {
            title: 'Micro Irrigation Fund (MIF)',
            title_hi: 'सूक्ष्म सिंचाई निधि',
            description: 'NABARD-managed ₹5,000 crore corpus offering states low-interest loans to expand micro-irrigation coverage beyond regular PMKSY subsidy limits',
            description_hi: 'नाबार्ड-प्रबंधित ₹5,000 करोड़ की निधि जो राज्यों को नियमित पीएमकेएसवाई सब्सिडी सीमा से आगे सूक्ष्म सिंचाई कवरेज बढ़ाने हेतु कम ब्याज पर ऋण प्रदान करती है',
            category: 'Irrigation & Water Management',
            image_url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=600&fit=crop',
            location: 'NABARD, on behalf of State Governments',
            event_date: null,
            key_objectives: [
                'Expand micro-irrigation coverage beyond standard subsidy limits',
                'Support state-level cluster-based micro-irrigation projects',
                'Provide additional cost support for small and marginal farmers',
                'Accelerate adoption of water-efficient irrigation technology'
            ],
            overview: 'Set up with NABARD in 2018-19, the Micro Irrigation Fund provides state governments with concessional loans to fund additional facilitation activities — beyond the individual farmer subsidy under PMKSY — to expand drip and sprinkler irrigation coverage, including cluster-based projects and cost top-ups for small and marginal farmers.',
            process: 'State governments avail loans from the fund for state-wide micro-irrigation expansion projects; individual farmers benefit through their state\'s micro-irrigation mission, which channels top-up subsidy or cluster support funded through MIF.',
            eligibility: 'State governments and their implementing agencies; farmers benefit indirectly through state-run micro-irrigation projects funded via MIF.',
            documents_required: ['Not applicable for individual farmers — accessed via state micro-irrigation projects'],
            tags: ['micro-irrigation', 'NABARD', 'water efficiency'],
            support_contact: 'Contact your state Micro Irrigation Mission office',
            apply_url: 'https://www.nabard.org/',
            is_active: true,
            is_featured: false
        },
        {
            title: 'Command Area Development and Water Management (CADWM)',
            title_hi: 'कमान क्षेत्र विकास एवं जल प्रबंधन',
            description: 'On-farm development works — field channels, land levelling and warabandi (water-turn scheduling) — to close the gap between irrigation potential created and actually utilised',
            description_hi: 'सिंचाई क्षमता के सृजन और वास्तविक उपयोग के बीच के अंतर को कम करने हेतु खेत-स्तरीय विकास कार्य — फील्ड चैनल, भूमि समतलीकरण और वारबंदी',
            category: 'Irrigation & Water Management',
            image_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&h=600&fit=crop',
            location: 'State Water Resources / Irrigation Department, under PMKSY',
            event_date: null,
            key_objectives: [
                'Improve last-mile water delivery efficiency to individual farms',
                'Reduce the gap between irrigation potential created and utilised',
                'Support equitable water distribution through warabandi',
                'Strengthen farmer Water User Associations for local water management'
            ],
            overview: 'A component of PMKSY, CADWM funds on-farm development works under major, medium and select minor irrigation projects — construction of field channels, land levelling and shaping, and warabandi (rotational water-turn scheduling) — so that water reaching the outlet is efficiently distributed to each farmer\'s field.',
            process: 'Implemented through the state Water Resources/Irrigation Department in notified command areas; farmer Water User Associations participate in planning field channel alignment and warabandi schedules for their outlet.',
            eligibility: 'Farmers with land in the command area of a notified major, medium or minor irrigation project undergoing CADWM works.',
            documents_required: ['Land record within the notified command area'],
            tags: ['command area development', 'field channels', 'water distribution'],
            support_contact: 'Contact your state Irrigation/Water Resources Department',
            apply_url: 'https://pmksy.gov.in/',
            is_active: true,
            is_featured: false
        },
        // ── Marketing & Post-Harvest ─────────────────────────────────────
        {
            title: 'National Agriculture Market (e-NAM)',
            title_hi: 'राष्ट्रीय कृषि बाजार (ई-नाम)',
            description: 'Pan-India electronic trading platform networking APMC mandis to give farmers transparent price discovery and access to more buyers',
            description_hi: 'एपीएमसी मंडियों को जोड़ने वाला अखिल भारतीय इलेक्ट्रॉनिक व्यापार मंच, जो किसानों को पारदर्शी मूल्य खोज और अधिक खरीदारों तक पहुंच प्रदान करता है',
            category: 'Marketing & Post-Harvest',
            image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=600&fit=crop',
            location: 'Department of Agriculture & Farmers Welfare, Government of India',
            event_date: null,
            key_objectives: [
                'Create a unified national market for agricultural produce',
                'Improve price transparency through online bidding',
                'Expand farmer access to buyers beyond the local mandi',
                'Reduce post-harvest transaction costs and delays'
            ],
            overview: 'Launched in April 2016, e-NAM is an online trading portal that networks existing APMC mandis to create a unified national market for agricultural commodities, enabling farmers to get better price discovery through online bidding, reduced information asymmetry, and access to buyers beyond their local mandi.',
            process: 'Register free of cost at your nearest e-NAM-integrated mandi with basic KYC details; produce is quality-assayed on arrival and farmers can track live bidding and receive payment directly into their bank account.',
            eligibility: 'All farmers bringing produce to any of the e-NAM-integrated mandis; no landholding restriction applies.',
            documents_required: ['Aadhaar Card', 'Bank account details', 'Mandi gate-pass/entry at an e-NAM mandi'],
            tags: ['agri marketing', 'price discovery', 'e-trading'],
            support_contact: 'e-NAM Helpline: 1800-270-0224',
            apply_url: 'https://enam.gov.in/',
            is_active: true,
            is_featured: true
        },
        {
            title: 'Agriculture Infrastructure Fund (AIF)',
            title_hi: 'कृषि अवसंरचना निधि',
            description: '₹1 lakh crore financing facility with 3% interest subvention for building post-harvest infrastructure like warehouses, cold storage and processing units',
            description_hi: 'गोदाम, कोल्ड स्टोरेज और प्रसंस्करण इकाइयों जैसी फसलोपरांत अवसंरचना बनाने हेतु 3% ब्याज छूट के साथ ₹1 लाख करोड़ की वित्तपोषण सुविधा',
            category: 'Marketing & Post-Harvest',
            image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&h=600&fit=crop',
            location: 'Department of Agriculture & Farmers Welfare, Government of India',
            event_date: null,
            key_objectives: [
                'Build viable post-harvest management infrastructure closer to the farm gate',
                'Reduce post-harvest losses through better storage and processing',
                'Provide affordable, interest-subsidised project financing',
                'Strengthen farmer-owned community farming assets'
            ],
            overview: 'Launched in 2020 with a ₹1 lakh crore corpus, AIF provides medium to long-term debt financing with a 3% interest subvention (up to ₹2 crore per project) and credit guarantee support for building community farming assets and post-harvest management infrastructure such as warehouses, cold chains, sorting and grading units, and primary processing centres.',
            process: 'Apply through the online AIF portal, selecting an eligible participating bank/NBFC; the project proposal is appraised by the lending institution and, on sanction, benefits from interest subvention and credit guarantee cover.',
            eligibility: 'Farmers, FPOs, Primary Agricultural Credit Societies, Self Help Groups, agri-entrepreneurs, Start-ups and state/central agencies setting up eligible post-harvest infrastructure projects.',
            documents_required: ['Detailed Project Report', 'Entity/FPO registration', 'Land or lease documents for the proposed infrastructure'],
            tags: ['post-harvest infrastructure', 'interest subvention', 'warehousing'],
            support_contact: 'AIF Helpline: 1800-180-1551',
            apply_url: 'https://agriinfra.dac.gov.in/',
            is_active: true,
            is_featured: false
        },
        {
            title: 'Pradhan Mantri Kisan Sampada Yojana',
            title_hi: 'प्रधानमंत्री किसान संपदा योजना',
            description: 'Umbrella food processing scheme supporting mega food parks, cold chains and agro-processing clusters to link farm produce directly to markets',
            description_hi: 'मेगा फूड पार्क, कोल्ड चेन और कृषि-प्रसंस्करण समूहों का समर्थन करने वाली छत्र खाद्य प्रसंस्करण योजना, जो कृषि उत्पाद को सीधे बाजारों से जोड़ती है',
            category: 'Marketing & Post-Harvest',
            image_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&h=600&fit=crop',
            location: 'Ministry of Food Processing Industries, Government of India',
            event_date: null,
            key_objectives: [
                'Reduce farm-to-market wastage of perishable produce',
                'Build integrated cold chain and food processing infrastructure',
                'Create direct backward linkages between farmers and processors',
                'Generate rural employment through the food processing sector'
            ],
            overview: 'Implemented by the Ministry of Food Processing Industries since 2017 (distinct from the irrigation-focused Krishi Sinchayee Yojana of a similar name), this scheme funds mega food parks, integrated cold chain infrastructure, agro-processing clusters, and backward/forward linkages so farm produce moves efficiently from farm gate to retail with minimal wastage.',
            process: 'Entrepreneurs, FPOs and cooperatives apply through the Ministry\'s SAMPADA online portal with a project proposal for the relevant component (cold chain, food park, processing unit); grant-in-aid is released in phases on project milestones.',
            eligibility: 'Individual entrepreneurs, FPOs, cooperatives, NGOs, SHGs, and state/central government agencies setting up eligible food processing or cold chain infrastructure.',
            documents_required: ['Detailed Project Report', 'Entity registration', 'Land documents for the proposed unit'],
            tags: ['food processing', 'cold chain', 'agro-processing'],
            support_contact: 'Contact the Ministry of Food Processing Industries regional office',
            apply_url: 'https://sampada.mofpi.gov.in/',
            is_active: true,
            is_featured: false
        },
        {
            title: 'Operation Greens (TOP to TOTAL)',
            title_hi: 'ऑपरेशन ग्रीन्स (टॉप टू टोटल)',
            description: 'Price stabilisation and value-chain support for Tomato, Onion and Potato, extended to all fruits and vegetables, including 50% subsidy on transport and storage',
            description_hi: 'टमाटर, प्याज और आलू के लिए मूल्य स्थिरीकरण और मूल्य-श्रृंखला सहायता, जो अब सभी फलों और सब्जियों तक विस्तारित है, परिवहन एवं भंडारण पर 50% सब्सिडी सहित',
            category: 'Marketing & Post-Harvest',
            image_url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1200&h=600&fit=crop',
            location: 'Ministry of Food Processing Industries, Government of India',
            event_date: null,
            key_objectives: [
                'Stabilise prices of perishable fruits and vegetables for farmers and consumers',
                'Subsidise transport of surplus produce to deficit markets',
                'Reduce post-harvest losses through storage and value-chain investment',
                'Prevent distress sales during peak harvest gluts'
            ],
            overview: 'Launched in 2018 for Tomato, Onion and Potato (TOP) and expanded in 2021 to all fruits and vegetables (TOTAL), Operation Greens supports price stabilisation for producers and consumers by subsidising 50% of transportation from surplus to deficit markets and 50% of storage costs, alongside investment in value chain infrastructure to reduce post-harvest losses.',
            process: 'Eligible FPOs, cooperatives and processors apply through the Ministry of Food Processing Industries for the transport/storage subsidy component during identified surplus-season windows, or for value chain project grants under the annual component.',
            eligibility: 'FPOs, cooperatives, individual entrepreneurs and processors engaged in transportation and storage of eligible fruits and vegetables from surplus to deficit markets.',
            documents_required: ['Entity/FPO registration', 'Transport and storage invoices for subsidy claims'],
            tags: ['price stabilisation', 'perishables', 'transport subsidy'],
            support_contact: 'Contact the Ministry of Food Processing Industries',
            apply_url: 'https://sampada.mofpi.gov.in/',
            is_active: true,
            is_featured: false
        },
        {
            title: 'Integrated Scheme for Agricultural Marketing (ISAM)',
            title_hi: 'कृषि विपणन के लिए समेकित योजना',
            description: 'Supports rural haats, grading and standardisation infrastructure, and market information services like Agmarknet to strengthen agricultural marketing',
            description_hi: 'ग्रामीण हाट, ग्रेडिंग एवं मानकीकरण अवसंरचना, तथा एग्मार्कनेट जैसी बाजार सूचना सेवाओं का समर्थन करके कृषि विपणन को सुदृढ़ करना',
            category: 'Marketing & Post-Harvest',
            image_url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=600&fit=crop',
            location: 'Department of Agriculture & Farmers Welfare, via State Agricultural Marketing Boards',
            event_date: null,
            key_objectives: [
                'Strengthen rural primary market and haat infrastructure',
                'Provide farmers with real-time mandi price information',
                'Improve grading and standardisation of agricultural produce',
                'Reduce farmer dependence on middlemen for price discovery'
            ],
            overview: 'ISAM supports the creation of agricultural marketing infrastructure — rural primary markets/haats, grading and standardisation facilities — and runs the Agmarknet portal that publishes daily mandi prices for hundreds of commodities across thousands of markets, helping farmers make informed selling decisions.',
            process: 'Infrastructure grants are routed through state Agricultural Marketing Boards for eligible projects; farmers can freely access daily price information through the Agmarknet website or affiliated mobile apps without any registration.',
            eligibility: 'State Agricultural Marketing Boards, Panchayats, cooperatives and private entrepreneurs for infrastructure grants; price information services are open to all farmers.',
            documents_required: ['Not required for accessing Agmarknet price information; infrastructure grants need project proposals'],
            tags: ['market infrastructure', 'price information', 'grading standards'],
            support_contact: 'Contact your State Agricultural Marketing Board',
            apply_url: 'https://agmarknet.gov.in/',
            is_active: true,
            is_featured: false
        },
        // ── Farm Mechanization ────────────────────────────────────────────
        {
            title: 'Sub-Mission on Agricultural Mechanization (SMAM)',
            title_hi: 'कृषि यंत्रीकरण उप-मिशन',
            description: 'Subsidy of 40-50% on farm machinery purchase and support for Custom Hiring Centres so small farmers can access tractors and implements affordably',
            description_hi: 'कृषि यंत्र खरीद पर 40-50% सब्सिडी और कस्टम हायरिंग सेंटरों हेतु सहायता, ताकि छोटे किसान ट्रैक्टर एवं उपकरणों तक किफायती पहुंच पा सकें',
            category: 'Farm Mechanization',
            image_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&h=600&fit=crop',
            location: 'Department of Agriculture & Farmers Welfare, Government of India',
            event_date: null,
            key_objectives: [
                'Increase farm mechanization, especially among small and marginal farmers',
                'Reduce drudgery and labour dependence in farm operations',
                'Establish Custom Hiring Centres for shared machinery access',
                'Promote precision farming equipment and residue management machinery'
            ],
            overview: 'Running since 2014-15, SMAM promotes farm mechanization by subsidising the purchase of tractors, power tillers, and a wide range of implements (typically 40-50% subsidy, higher for SC/ST, women and small/marginal farmers), and by supporting Custom Hiring Centres and Farm Machinery Banks so farmers who cannot afford their own equipment can rent it affordably.',
            process: 'Apply through the state Agriculture Department\'s mechanization portal (often DBT-based) by selecting the desired machinery from empanelled manufacturers/dealers; subsidy is credited directly to the farmer\'s bank account after purchase verification.',
            eligibility: 'Individual farmers, FPOs, SHGs, and entrepreneurs for machinery purchase subsidy; a higher subsidy slab applies to SC/ST, women and small/marginal farmers.',
            documents_required: ['Aadhaar Card', 'Land record / khasra number', 'Bank account details', 'Caste certificate (for higher subsidy slabs, if applicable)'],
            tags: ['farm machinery', 'custom hiring centre', 'mechanization subsidy'],
            support_contact: 'Contact your district Agriculture Department',
            apply_url: 'https://agrimachinery.nic.in/',
            is_active: true,
            is_featured: false
        },
        {
            title: 'Crop Residue Management (CRM) Scheme',
            title_hi: 'फसल अवशेष प्रबंधन योजना',
            description: '50-80% subsidy on machinery like Happy Seeder, Super Seeder and balers to manage crop residue in-situ instead of burning it',
            description_hi: 'फसल अवशेष को जलाने के बजाय उसी स्थान पर प्रबंधित करने हेतु हैप्पी सीडर, सुपर सीडर और बेलर जैसी मशीनरी पर 50-80% सब्सिडी',
            category: 'Farm Mechanization',
            image_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&h=600&fit=crop',
            location: 'Department of Agriculture & Farmers Welfare, in notified stubble-affected states',
            event_date: null,
            key_objectives: [
                'Reduce crop residue/stubble burning and associated air pollution',
                'Promote in-situ residue management to improve soil organic matter',
                'Provide subsidised access to residue-management machinery',
                'Support Custom Hiring Centres for shared machinery access'
            ],
            overview: 'Running since 2018 in Punjab, Haryana, Uttar Pradesh, Delhi-NCR and other affected regions, the CRM scheme provides individual farmers up to 50% subsidy and Custom Hiring Centres up to 80% subsidy on residue-management machinery such as the Happy Seeder, Super Seeder, Rotavator, and balers, to curb stubble burning and improve soil health through in-situ residue management.',
            process: 'Apply through the state Agriculture Department\'s DBT-based mechanization portal, selecting the required residue-management machine from empanelled dealers; verification and subsidy disbursal follow purchase.',
            eligibility: 'Individual farmers, FPOs, cooperatives and Custom Hiring Centres in the notified stubble-affected states seeking residue-management machinery.',
            documents_required: ['Aadhaar Card', 'Land record / khasra number', 'Bank account details'],
            tags: ['stubble management', 'residue management', 'mechanization subsidy'],
            support_contact: 'Contact your district Agriculture Department',
            apply_url: 'https://agrimachinery.nic.in/',
            is_active: true,
            is_featured: false
        },
        // ── Fisheries ──────────────────────────────────────────────────────
        {
            title: 'Pradhan Mantri Matsya Sampada Yojana (PMMSY)',
            title_hi: 'प्रधानमंत्री मत्स्य संपदा योजना',
            description: 'Flagship fisheries scheme with ₹20,050 crore outlay supporting pond construction, hatcheries, cold chain and insurance for fish farmers',
            description_hi: 'तालाब निर्माण, हैचरी, कोल्ड चेन और मछली पालकों के लिए बीमा का समर्थन करने वाली ₹20,050 करोड़ की प्रमुख मत्स्य पालन योजना',
            category: 'Fisheries',
            image_url: 'https://images.unsplash.com/photo-1584935385075-2a0d0b0dcbb7?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1584935385075-2a0d0b0dcbb7?w=1200&h=600&fit=crop',
            location: 'Department of Fisheries, Ministry of Fisheries, Animal Husbandry and Dairying',
            event_date: null,
            key_objectives: [
                'Enhance fish production and productivity across inland and marine sectors',
                'Modernise fisheries value chain and post-harvest infrastructure',
                'Double fisher and fish farmer incomes through better market access',
                'Generate employment in aquaculture and allied fisheries activities'
            ],
            overview: 'Launched in 2020 as the largest-ever investment in the fisheries sector, PMMSY supports the entire value chain — new pond and hatchery construction, fingerling rearing, cage culture, cold chain and processing infrastructure, and boats/nets for marine fishers — with capital subsidy typically at 40% for general category and 60% for SC/ST, women and island/hilly-area beneficiaries.',
            process: 'Apply through the State Fisheries Department or the National Fisheries Digital Platform with a project proposal for the desired component (new pond, hatchery, cage culture, etc.); subsidy is released after technical appraisal and physical verification.',
            eligibility: 'Fish farmers, fisher cooperatives, FPOs, entrepreneurs and fishing communities, including landless and traditional fishers, subject to component-specific guidelines.',
            documents_required: ['Aadhaar Card', 'Land/water body ownership or lease proof', 'Detailed Project Report for infrastructure components'],
            tags: ['fisheries', 'aquaculture', 'capital subsidy'],
            support_contact: 'Contact your State Fisheries Department',
            apply_url: 'https://pmmsy.dof.gov.in/',
            is_active: true,
            is_featured: true
        },
        {
            title: 'Fisheries and Aquaculture Infrastructure Development Fund (FIDF)',
            title_hi: 'मत्स्य पालन एवं जलीय कृषि अवसंरचना विकास निधि',
            description: '₹7,500 crore fund offering concessional loans with interest subvention for building fisheries harbours, cold storage and aquaculture infrastructure',
            description_hi: 'मत्स्य बंदरगाह, कोल्ड स्टोरेज और जलीय कृषि अवसंरचना के निर्माण हेतु ब्याज छूट के साथ रियायती ऋण प्रदान करने वाली ₹7,500 करोड़ की निधि',
            category: 'Fisheries',
            image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=600&fit=crop',
            location: 'Department of Fisheries, via NABARD, NCDC and National Fisheries Development Board',
            event_date: null,
            key_objectives: [
                'Bridge critical infrastructure gaps in the fisheries sector',
                'Provide concessional financing for fisheries harbours and cold chains',
                'Support modernisation of aquaculture infrastructure',
                'Improve post-harvest handling to reduce fish wastage'
            ],
            overview: 'Set up in 2018-19 with a ₹7,500 crore corpus managed through NABARD, NCDC and the National Fisheries Development Board, FIDF provides eligible entities concessional-interest loans (with 3% interest subvention) to build fisheries harbours, landing centres, cold chain, and modern aquaculture infrastructure, filling the critical infrastructure gap identified in the fisheries sector.',
            process: 'Submit a project proposal with a Detailed Project Report to a Nodal Loaning Entity (NABARD, NCDC or a scheduled bank); on loan sanction, the interest subvention is applied over the loan tenure.',
            eligibility: 'State governments/entities, cooperatives, individual entrepreneurs, and companies investing in eligible fisheries and aquaculture infrastructure projects.',
            documents_required: ['Detailed Project Report', 'Entity/company registration', 'Land documents for the proposed infrastructure'],
            tags: ['fisheries infrastructure', 'concessional loan', 'aquaculture'],
            support_contact: 'Contact your nearest NABARD or NCDC office',
            apply_url: 'https://dof.gov.in/',
            is_active: true,
            is_featured: false
        },
        {
            title: 'Kisan Credit Card for Fisheries',
            title_hi: 'मत्स्य पालन हेतु किसान क्रेडिट कार्ड',
            description: 'Working capital credit up to ₹2 lakh for fish farmers and fishers to meet operational costs like feed, seed and boat maintenance, at KCC-subsidised rates',
            description_hi: 'मछली पालकों और मछुआरों के लिए फ़ीड, बीज और नाव रखरखाव जैसी परिचालन लागतों को पूरा करने हेतु ₹2 लाख तक की कार्यशील पूंजी ऋण, केसीसी-रियायती दरों पर',
            category: 'Fisheries',
            image_url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=400&fit=crop',
            hero_image_url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1200&h=600&fit=crop',
            location: 'NABARD / Reserve Bank of India, via State Fisheries Department and Scheduled Banks',
            event_date: null,
            key_objectives: [
                'Provide affordable working-capital credit to fish farmers and fishers',
                'Extend KCC interest subvention benefits to the fisheries sector',
                'Reduce dependence on informal high-interest credit',
                'Support timely investment in feed, seed and equipment maintenance'
            ],
            overview: 'Extended to fisheries and aquaculture farmers in the 2018-19 Union Budget, the Kisan Credit Card for Fisheries provides fish farmers and traditional fishers with a revolving credit limit for working capital needs — feed, fingerlings, boat and net maintenance — at the same subsidised interest rates (as low as 4% with prompt repayment) available to crop-growing KCC holders.',
            process: 'Apply at the nearest bank branch or through the State Fisheries Department with proof of pond/water body ownership or fishing rights; the credit limit is fixed based on the scale of the fish farming or fishing operation.',
            eligibility: 'Fish farmers, traditional and inland fishers, and aquaculture entrepreneurs with valid water body ownership, lease, or fishing rights documentation.',
            documents_required: ['Identity proof (Aadhaar/Voter ID)', 'Water body ownership, lease or fishing rights proof', 'Passport-size photographs'],
            tags: ['fisheries credit', 'KCC', 'working capital'],
            support_contact: 'Contact your nearest bank branch or State Fisheries Department',
            apply_url: 'https://pmmsy.dof.gov.in/',
            is_active: true,
            is_featured: false
        }
    ];

    for (const scheme of schemes) {
        await query(
            `INSERT INTO schemes (
                title, title_hi, description, description_hi, category,
                image_url, hero_image_url, location, event_date,
                key_objectives, overview, process, eligibility,
                documents_required, tags, support_contact, apply_url,
                is_active, is_featured
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
            [
                scheme.title, scheme.title_hi, scheme.description, scheme.description_hi, scheme.category,
                scheme.image_url, scheme.hero_image_url, scheme.location, scheme.event_date,
                scheme.key_objectives, scheme.overview, scheme.process, scheme.eligibility,
                scheme.documents_required, scheme.tags, scheme.support_contact, scheme.apply_url,
                scheme.is_active, scheme.is_featured
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
