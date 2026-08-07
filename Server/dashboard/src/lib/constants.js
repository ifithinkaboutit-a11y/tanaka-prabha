// Content type enums
export const CONTENT_TYPES = {
    BANNER: "banner",
    SCHEME: "scheme",
};

// Professional categories — these are the four Connect services in the app.
//
// `value` MUST match the `category` values the app filters on (see
// Client/src/data/content/connectServices.ts) and `label` is the exact wording
// the farmer sees on the Connect screen (Client/src/i18n/en.json →
// connect.services). Keep both in sync with the app: a mismatched `value`
// silently hides the professional, and mismatched wording makes the dashboard
// describe a service by a name that appears nowhere in the app.
export const PROFESSIONAL_CATEGORIES = [
    { value: "training-guidance", label: "Training & Guidance" },
    { value: "livestock-veterinary", label: "Livestock & Veterinary" },
    { value: "market-buyers", label: "Market & Buyers" },
    { value: "government-schemes", label: "Government Schemes" },
];

// Categories written by older builds of this dashboard. They match no Connect
// service, so professionals still carrying them never appear in the app.
// Migration 010 remaps existing rows; this list drives the dashboard warning
// for any that were missed.
export const LEGACY_PROFESSIONAL_CATEGORIES = {
    doctor: "livestock-veterinary",
    veterinary: "livestock-veterinary",
    agricultural: "training-guidance",
    legal: "government-schemes",
    financial: "market-buyers",
};

// Status labels and colors
export const STATUS_CONFIG = {
    active: { label: "Active", color: "green" },
    inactive: { label: "Inactive", color: "gray" },
    published: { label: "Published", color: "green" },
    draft: { label: "Draft", color: "yellow" },
    unpublished: { label: "Unpublished", color: "gray" },
    available: { label: "Available", color: "green" },
    unavailable: { label: "Unavailable", color: "gray" },
    verified: { label: "Verified", color: "green" },
    pending: { label: "Pending", color: "amber" },
};

// India States & UTs — combined alphabetical list
export const INDIA_STATES_UTS = [
    "Andaman and Nicobar Islands",
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chandigarh",
    "Chhattisgarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jammu and Kashmir",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Ladakh",
    "Lakshadweep",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Puducherry",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
];

// Backward-compatible alias
export const INDIA_STATES = INDIA_STATES_UTS;

// Districts by state (key = state name, value = array of district names)
export const DISTRICTS_BY_STATE = {
    "Andaman and Nicobar Islands": [
        "Nicobar", "North and Middle Andaman", "South Andaman",
    ],
    "Andhra Pradesh": [
        "Alluri Sitharama Raju", "Anakapalli", "Anantapur", "Annamayya",
        "Bapatla", "Chittoor", "East Godavari", "Eluru", "Guntur",
        "Kakinada", "Konaseema", "Krishna", "Kurnool", "Nandyal",
        "NTR", "Palnadu", "Parvathipuram Manyam", "Prakasam", "Srikakulam",
        "Sri Potti Sriramulu Nellore", "Tirupati", "Visakhapatnam", "Vizianagaram",
        "West Godavari", "YSR Kadapa",
    ],
    "Arunachal Pradesh": [
        "Tawang", "West Kameng", "East Kameng", "Papum Pare", "Kurung Kumey",
        "Kra Daadi", "Lower Subansiri", "Upper Subansiri", "West Siang",
        "East Siang", "Siang", "Upper Siang", "Lower Siang", "Lower Dibang Valley",
        "Dibang Valley", "Anjaw", "Lohit", "Namsai", "Changlang", "Tirap",
        "Longding", "Kamle", "Pakke-Kessang", "Lepa Rada",
    ],
    "Assam": [
        "Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo",
        "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao",
        "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup",
        "Kamrup Metropolitan", "Karbi Anglong", "Karimganj", "Kokrajhar",
        "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar",
        "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong",
    ],
    "Bihar": [
        "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur",
        "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj",
        "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj",
        "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur",
        "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa",
        "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi",
        "Siwan", "Supaul", "Vaishali", "West Champaran",
    ],
    "Chandigarh": ["Chandigarh"],
    "Chhattisgarh": [
        "Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara",
        "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg",
        "Gariyaband", "Janjgir-Champa", "Jashpur", "Kanker", "Kawardha",
        "Kondagaon", "Korba", "Koriya", "Mahasamund", "Mungeli",
        "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma",
        "Surajpur", "Surguja",
    ],
    "Dadra and Nagar Haveli and Daman and Diu": [
        "Dadra and Nagar Haveli", "Daman", "Diu",
    ],
    "Delhi": [
        "Central Delhi", "East Delhi", "New Delhi", "North Delhi",
        "North East Delhi", "North West Delhi", "South Delhi",
        "South East Delhi", "South West Delhi", "West Delhi",
    ],
    "Goa": ["North Goa", "South Goa"],
    "Gujarat": [
        "Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha",
        "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod",
        "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath",
        "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar",
        "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal",
        "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat",
        "Surendranagar", "Tapi", "Vadodara", "Valsad",
    ],
    "Haryana": [
        "Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad",
        "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal",
        "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula",
        "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar",
    ],
    "Himachal Pradesh": [
        "Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu",
        "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una",
    ],
    "Jammu and Kashmir": [
        "Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal",
        "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch",
        "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian",
        "Srinagar", "Udhampur",
    ],
    "Jharkhand": [
        "Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum",
        "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara",
        "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu",
        "Ramgarh", "Ranchi", "Sahibganj", "Seraikela Kharsawan",
        "Simdega", "West Singhbhum",
    ],
    "Karnataka": [
        "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban",
        "Bidar", "Chamarajanagar", "Chikballapur", "Chikkamagaluru", "Chitradurga",
        "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan",
        "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya",
        "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru",
        "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir",
    ],
    "Kerala": [
        "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod",
        "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad",
        "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad",
    ],
    "Ladakh": ["Leh", "Kargil"],
    "Lakshadweep": ["Lakshadweep"],
    "Madhya Pradesh": [
        "Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat",
        "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur",
        "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori",
        "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur",
        "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur",
        "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh",
        "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol",
        "Shajapur", "Sheopur", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain",
        "Umaria", "Vidisha",
    ],
    "Maharashtra": [
        "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara",
        "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli",
        "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban",
        "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar",
        "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara",
        "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal",
    ],
    "Manipur": [
        "Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West",
        "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl",
        "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul",
    ],
    "Meghalaya": [
        "East Garo Hills", "East Jaintia Hills", "East Khasi Hills",
        "North Garo Hills", "Ri Bhoi", "South Garo Hills",
        "South West Garo Hills", "South West Khasi Hills",
        "West Garo Hills", "West Jaintia Hills", "West Khasi Hills",
    ],
    "Mizoram": [
        "Aizawl", "Champhai", "Hnahthial", "Khawzawl", "Lawngtlai",
        "Lunglei", "Mamit", "Saiha", "Saitual", "Serchhip",
    ],
    "Nagaland": [
        "Chumoukedima", "Dimapur", "Kiphire", "Kohima", "Longleng",
        "Mokokchung", "Mon", "Niuland", "Noklak", "Peren", "Phek",
        "Shamator", "Tseminyu", "Tuensang", "Wokha", "Zunheboto",
    ],
    "Odisha": [
        "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh",
        "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur",
        "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara",
        "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj",
        "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada",
        "Sambalpur", "Subarnapur", "Sundargarh",
    ],
    "Puducherry": ["Karaikal", "Mahe", "Puducherry", "Yanam"],
    "Punjab": [
        "Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib",
        "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar",
        "Kapurthala", "Ludhiana", "Mansa", "Moga", "Muktsar", "Nawanshahr",
        "Pathankot", "Patiala", "Rupnagar", "Sangrur", "SAS Nagar", "Tarn Taran",
    ],
    "Rajasthan": [
        "Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur",
        "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa",
        "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer",
        "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota",
        "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur",
        "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur",
    ],
    "Sikkim": [
        "Gangtok", "Gyalshing", "Mangan", "Namchi", "Pakyong", "Soreng",
    ],
    "Tamil Nadu": [
        "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
        "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram",
        "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
        "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
        "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
        "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
        "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai",
        "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar",
    ],
    "Telangana": [
        "Adilabad", "Bhadradri Kothagudem", "Hanumakonda", "Hyderabad",
        "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal",
        "Kamareddy", "Karimnagar", "Khammam", "Kumuram Bheem Asifabad",
        "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal Malkajgiri",
        "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal",
        "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy",
        "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy",
        "Warangal", "Yadadri Bhuvanagiri",
    ],
    "Tripura": [
        "Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala",
        "South Tripura", "Unakoti", "West Tripura",
    ],
    "Uttar Pradesh": [
        "Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya",
        "Ayodhya", "Azamgarh", "Badaun", "Baghpat", "Bahraich", "Ballia",
        "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi",
        "Bijnor", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria",
        "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad",
        "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda",
        "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun",
        "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar",
        "Kasganj", "Kaushambi", "Kushinagar", "Lakhimpur Kheri", "Lalitpur",
        "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau",
        "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit",
        "Pratapgarh", "Prayagraj", "Raebareli", "Rampur", "Saharanpur",
        "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli",
        "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur",
        "Unnao", "Varanasi",
    ],
    "Uttarakhand": [
        "Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun",
        "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag",
        "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi",
    ],
    "West Bengal": [
        "Alipurduar", "Bankura", "Basirhat", "Birbhum", "Cooch Behar",
        "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri",
        "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad",
        "Nadia", "North 24 Parganas", "Paschim Bardhaman",
        "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur",
        "Purulia", "South 24 Parganas", "Uttar Dinajpur",
    ],
};

// Assam-specific districts (primary target region) — backward compat
export const ASSAM_DISTRICTS = DISTRICTS_BY_STATE["Assam"] || [];

// Scheme categories for dropdown.
// `value` MUST match the `category` values the mobile app filters on —
// see `categoryToSchemeCategory` in Client/src/data/content/schemeCategories.ts.
// A scheme saved with any other category never appears under a category in the app.
export const SCHEME_CATEGORIES = [
    { value: "Financial Support", label: "Finance & Credit Support" },
    { value: "Agricultural Development", label: "Agricultural Development" },
    { value: "Soil Management", label: "Soil Management" },
    { value: "Crop Insurance", label: "Crop Insurance" },
    { value: "Animal Husbandry & Dairy", label: "Animal Husbandry & Dairy" },
    { value: "Training", label: "Training & Skill Development" },
    { value: "Irrigation & Water Management", label: "Irrigation & Water Management" },
    { value: "Marketing & Post-Harvest", label: "Marketing & Post-Harvest" },
    { value: "Farm Mechanization", label: "Farm Mechanization" },
    { value: "Fisheries", label: "Fisheries" },
];

// Crops offered during farmer onboarding — mirrors `cropsBySeason` in
// Client/src/data/content/onboardingOptions.ts. Values are what land_details stores.
export const CROP_OPTIONS = [
    { value: "bajra", label: "Bajra (Pearl Millet)" },
    { value: "barley", label: "Barley" },
    { value: "cotton", label: "Cotton" },
    { value: "cucumber", label: "Cucumber" },
    { value: "fruits", label: "Fruits" },
    { value: "gram", label: "Gram" },
    { value: "groundnut", label: "Groundnut" },
    { value: "jowar", label: "Jowar (Sorghum)" },
    { value: "linseed", label: "Linseed" },
    { value: "maize", label: "Maize" },
    { value: "moong_dal", label: "Moong Dal" },
    { value: "mustard", label: "Mustard" },
    { value: "muskmelon", label: "Muskmelon" },
    { value: "onion", label: "Onion" },
    { value: "peas", label: "Peas" },
    { value: "potato", label: "Potato" },
    { value: "pulses", label: "Pulses" },
    { value: "rice", label: "Rice" },
    { value: "soybean", label: "Soybean" },
    { value: "sugarcane", label: "Sugarcane" },
    { value: "tomato", label: "Tomato" },
    { value: "tur_arhar", label: "Tur/Arhar (Pigeon Pea)" },
    { value: "vegetables", label: "Vegetables" },
    { value: "watermelon", label: "Watermelon" },
    { value: "wheat", label: "Wheat" },
    { value: "other", label: "Other" },
];

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
