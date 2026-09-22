/**
 * seedData.js — Seed real courses and livelihoods into MongoDB (Expanded to 30+)
 * Run: node src/scripts/seedData.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const Livelihood = require('../models/Livelihood');

const courses = [
  // Previous 12
  { title: 'Self Employed Tailor', titleHi: 'स्व-रोज़गार दर्ज़ी', sector: 'Apparel', nsqfLevel: 4, minEducation: '5th', durationHours: 600, jobRoles: ['Tailor', 'Garment Maker', 'Boutique Owner'], tags: ['tailoring', 'sewing', 'silai', 'fashion'], sourceName: 'NSDC', verified: true },
  { title: 'Assistant Electrician', titleHi: 'सहायक बिजली मिस्त्री', sector: 'Electronics & Hardware', nsqfLevel: 3, minEducation: '8th', durationHours: 400, jobRoles: ['Electrician Helper', 'Wiring Technician'], tags: ['electrical', 'wiring', 'bijli'], sourceName: 'NSDC', verified: true },
  { title: 'Organic Farmer', titleHi: 'जैविक किसान', sector: 'Agriculture', nsqfLevel: 3, minEducation: '5th', durationHours: 300, jobRoles: ['Organic Farm Manager', 'Agriculture Worker'], tags: ['farming', 'agriculture', 'kheti', 'organic'], sourceName: 'NSDC', verified: true },
  { title: 'Beauty Therapist', titleHi: 'ब्यूटी थेरेपिस्ट', sector: 'Beauty & Wellness', nsqfLevel: 4, minEducation: '8th', durationHours: 500, jobRoles: ['Beauty Parlour Assistant', 'Makeup Artist'], tags: ['beauty', 'parlour', 'makeup', 'wellness'], sourceName: 'NSDC', verified: true },
  { title: 'Plumber General', titleHi: 'प्लंबर (सामान्य)', sector: 'Plumbing', nsqfLevel: 3, minEducation: '5th', durationHours: 400, jobRoles: ['Plumber', 'Pipe Fitter'], tags: ['plumbing', 'pipe', 'nalkoop'], sourceName: 'NSDC', verified: true },
  { title: 'Mobile Phone Hardware Repair Technician', titleHi: 'मोबाइल फोन रिपेयर तकनीशियन', sector: 'Electronics & Hardware', nsqfLevel: 4, minEducation: '10th', durationHours: 450, jobRoles: ['Mobile Repair Technician', 'Phone Service Engineer'], tags: ['mobile', 'repair', 'phone', 'hardware', 'electronics'], sourceName: 'NSDC', verified: true },
  { title: 'Dairy Farmer / Entrepreneur', titleHi: 'डेयरी किसान / उद्यमी', sector: 'Agriculture', nsqfLevel: 3, minEducation: '5th', durationHours: 300, jobRoles: ['Dairy Farmer', 'Milk Producer', 'Cattle Manager'], tags: ['dairy', 'milk', 'dudh', 'cattle', 'animal husbandry'], sourceName: 'NSDC', verified: true },
  { title: 'Computer Operator & Programming Assistant (COPA)', titleHi: 'कंप्यूटर ऑपरेटर', sector: 'IT-ITeS', nsqfLevel: 4, minEducation: '10th', durationHours: 960, jobRoles: ['Computer Operator', 'Data Entry Operator', 'Office Assistant'], tags: ['computer', 'IT', 'typing', 'data entry', 'office'], sourceName: 'NSDC', verified: true },
  { title: 'Mason (General)', titleHi: 'राजमिस्त्री (सामान्य)', sector: 'Construction', nsqfLevel: 3, minEducation: 'none', durationHours: 400, jobRoles: ['Mason', 'Construction Worker', 'Bricklayer'], tags: ['masonry', 'construction', 'building', 'eet', 'cement'], sourceName: 'NSDC', verified: true },
  { title: 'Food Processing (Pickle & Papad Making)', titleHi: 'खाद्य प्रसंस्करण (अचार एवं पापड़)', sector: 'Food Processing', nsqfLevel: 3, minEducation: '5th', durationHours: 250, jobRoles: ['Food Processor', 'Home-based Food Business Owner'], tags: ['food', 'pickle', 'papad', 'cooking', 'achar', 'khana'], sourceName: 'NSDC', verified: true },
  { title: 'Two Wheeler Mechanic', titleHi: 'दोपहिया वाहन मैकेनिक', sector: 'Automotive', nsqfLevel: 3, minEducation: '8th', durationHours: 400, jobRoles: ['Bike Mechanic', 'Two-Wheeler Service Technician'], tags: ['mechanic', 'bike', 'motorcycle', 'vehicle', 'repair', 'gaadi'], sourceName: 'NSDC', verified: true },
  { title: 'Handloom Weaver', titleHi: 'हथकरघा बुनकर', sector: 'Textile & Handloom', nsqfLevel: 3, minEducation: 'none', durationHours: 500, jobRoles: ['Weaver', 'Handloom Worker', 'Textile Artisan'], tags: ['weaving', 'handloom', 'textile', 'bunai', 'cloth'], sourceName: 'NSDC', verified: true },

  // New 18
  { title: 'Retail Sales Associate', titleHi: 'रिटेल सेल्स एसोसिएट', sector: 'Retail', nsqfLevel: 4, minEducation: '10th', durationHours: 280, jobRoles: ['Sales Executive', 'Shop Assistant'], tags: ['sales', 'shop', 'retail', 'dukaan'], sourceName: 'NSDC', verified: true },
  { title: 'Domestic Data Entry Operator', titleHi: 'डेटा एंट्री ऑपरेटर', sector: 'IT-ITeS', nsqfLevel: 4, minEducation: '10th', durationHours: 400, jobRoles: ['Data Entry Operator'], tags: ['computer', 'typing', 'data entry'], sourceName: 'NSDC', verified: true },
  { title: 'Customer Care Executive', titleHi: 'कस्टमर केयर एक्जीक्यूटिव', sector: 'Telecom', nsqfLevel: 4, minEducation: '12th', durationHours: 400, jobRoles: ['Call Center Agent', 'BPO Executive'], tags: ['call center', 'bpo', 'telecaller', 'customer service'], sourceName: 'NSDC', verified: true },
  { title: 'Welder (Gas & Electric)', titleHi: 'वेल्डर (गैस और इलेक्ट्रिक)', sector: 'Capital Goods', nsqfLevel: 3, minEducation: '8th', durationHours: 350, jobRoles: ['Welder', 'Fabricator'], tags: ['welding', 'iron', 'loha', 'fabrication'], sourceName: 'NSDC', verified: true },
  { title: 'General Duty Assistant (Healthcare)', titleHi: 'नर्सिंग सहायक (जनरल ड्यूटी)', sector: 'Healthcare', nsqfLevel: 4, minEducation: '10th', durationHours: 600, jobRoles: ['Ward Boy', 'Nursing Assistant'], tags: ['hospital', 'nurse', 'medical', 'clinic', 'health'], sourceName: 'NSDC', verified: true },
  { title: 'Solar PV Installer (Suryamitra)', titleHi: 'सोलर पैनल इंस्टॉलर', sector: 'Green Jobs', nsqfLevel: 4, minEducation: '10th', durationHours: 300, jobRoles: ['Solar Technician', 'Installer'], tags: ['solar', 'energy', 'bijli', 'sun'], sourceName: 'NSDC', verified: true },
  { title: 'Carpentry (General)', titleHi: 'बढ़ई (सामान्य)', sector: 'Furniture & Fittings', nsqfLevel: 3, minEducation: 'none', durationHours: 400, jobRoles: ['Carpenter', 'Woodworker'], tags: ['carpenter', 'wood', 'furniture', 'badhai', 'lakdi'], sourceName: 'NSDC', verified: true },
  { title: 'Tractor Mechanic', titleHi: 'ट्रैक्टर मैकेनिक', sector: 'Automotive', nsqfLevel: 4, minEducation: '8th', durationHours: 450, jobRoles: ['Agricultural Machinery Mechanic'], tags: ['mechanic', 'tractor', 'farming', 'repair'], sourceName: 'NSDC', verified: true },
  { title: 'Mushroom Grower', titleHi: 'मशरूम उत्पादक', sector: 'Agriculture', nsqfLevel: 3, minEducation: 'none', durationHours: 200, jobRoles: ['Mushroom Farmer'], tags: ['farming', 'mushroom', 'agriculture'], sourceName: 'NSDC', verified: true },
  { title: 'Field Technician - Air Conditioner', titleHi: 'एसी मैकेनिक', sector: 'Electronics & Hardware', nsqfLevel: 4, minEducation: '8th', durationHours: 350, jobRoles: ['AC Mechanic', 'Cooling Technician'], tags: ['ac', 'fridge', 'repair', 'mechanic'], sourceName: 'NSDC', verified: true },
  { title: 'Hand Embroiderer', titleHi: 'हाथ की कढ़ाई करने वाला', sector: 'Apparel', nsqfLevel: 3, minEducation: 'none', durationHours: 250, jobRoles: ['Embroidery Artisan'], tags: ['embroidery', 'kadhai', 'fashion', 'sewing'], sourceName: 'NSDC', verified: true },
  { title: 'CCTV Installation Technician', titleHi: 'सीसीटीवी इंस्टॉलेशन तकनीशियन', sector: 'Electronics', nsqfLevel: 4, minEducation: '10th', durationHours: 300, jobRoles: ['CCTV Technician'], tags: ['cctv', 'camera', 'security', 'installation'], sourceName: 'NSDC', verified: true },
  { title: 'Housekeeping Attendant', titleHi: 'हाउसकीपिंग अटेंडेंट', sector: 'Tourism & Hospitality', nsqfLevel: 3, minEducation: '5th', durationHours: 250, jobRoles: ['Cleaner', 'Hotel Staff'], tags: ['hotel', 'cleaning', 'safai', 'housekeeping'], sourceName: 'NSDC', verified: true },
  { title: 'Security Guard', titleHi: 'सुरक्षा गार्ड', sector: 'Private Security', nsqfLevel: 3, minEducation: '8th', durationHours: 160, jobRoles: ['Security Guard', 'Watchman'], tags: ['security', 'guard', 'watchman', 'chowkidaar'], sourceName: 'NSDC', verified: true },
  { title: 'Driver (Light Motor Vehicle)', titleHi: 'ड्राइवर (कार)', sector: 'Logistics', nsqfLevel: 3, minEducation: '8th', durationHours: 300, jobRoles: ['Taxi Driver', 'Chauffeur'], tags: ['driving', 'car', 'driver', 'transport'], sourceName: 'NSDC', verified: true },
  { title: 'Animal Health Worker', titleHi: 'पशु स्वास्थ्य कार्यकर्ता', sector: 'Agriculture', nsqfLevel: 4, minEducation: '10th', durationHours: 400, jobRoles: ['Veterinary Assistant'], tags: ['animal', 'cow', 'vet', 'pashu', 'health'], sourceName: 'NSDC', verified: true },
  { title: 'Bakery Artisan', titleHi: 'बेकरी कारीगर', sector: 'Food Processing', nsqfLevel: 3, minEducation: '5th', durationHours: 300, jobRoles: ['Baker'], tags: ['bakery', 'bread', 'cake', 'food', 'cooking'], sourceName: 'NSDC', verified: true },
  { title: 'Baking & Confectionery', titleHi: 'बेकिंग और कन्फेक्शनरी', sector: 'Tourism & Hospitality', nsqfLevel: 4, minEducation: '8th', durationHours: 350, jobRoles: ['Pastry Chef'], tags: ['baking', 'sweet', 'food'], sourceName: 'NSDC', verified: true }
];

const livelihoods = [
  // Previous 10
  { title: 'Village Level Tailoring Business', titleHi: 'गाँव स्तरीय सिलाई व्यवसाय', sector: 'Apparel', type: 'self-employment', minEducation: '5th', requiredSkills: ['tailoring', 'sewing'], demandSignal: 'high', description: 'Start a small tailoring shop in your village. High demand for blouse, petticoat, and school uniform stitching.' },
  { title: 'Mobile Repair Shop', titleHi: 'मोबाइल रिपेयर दुकान', sector: 'Electronics', type: 'self-employment', minEducation: '10th', requiredSkills: ['mobile repair', 'electronics'], demandSignal: 'high', description: 'Open a mobile phone repair shop. Every village and town needs one.' },
  { title: 'Small Dairy Farm', titleHi: 'छोटी डेयरी फार्म', sector: 'Agriculture', type: 'self-employment', minEducation: 'none', requiredSkills: ['cattle care', 'dairy', 'animal husbandry'], demandSignal: 'high', description: 'Start with 2-3 cows or buffaloes. Sell milk to local collection centres.' },
  { title: 'Construction Labour (Skilled)', titleHi: 'कुशल निर्माण श्रमिक', sector: 'Construction', type: 'wage', minEducation: 'none', requiredSkills: ['masonry', 'construction'], demandSignal: 'high', description: 'Skilled masons earn ₹600-800/day. PMAY housing scheme creating huge demand.' },
  { title: 'Beauty Parlour at Home', titleHi: 'घर पर ब्यूटी पार्लर', sector: 'Beauty & Wellness', type: 'self-employment', minEducation: '8th', requiredSkills: ['beauty', 'makeup', 'grooming'], demandSignal: 'medium', description: 'Start a small beauty parlour from home. Low investment, growing demand in rural areas.' },
  { title: 'Electrician Work', titleHi: 'बिजली मिस्त्री का काम', sector: 'Electronics', type: 'wage', minEducation: '8th', requiredSkills: ['electrical', 'wiring'], demandSignal: 'high', description: 'House wiring, appliance repair. Every new house needs an electrician.' },
  { title: 'Organic Vegetable Farming', titleHi: 'जैविक सब्जी की खेती', sector: 'Agriculture', type: 'self-employment', minEducation: 'none', requiredSkills: ['farming', 'agriculture'], demandSignal: 'high', description: 'Grow organic vegetables and sell at local mandis or to urban buyers via WhatsApp.' },
  { title: 'Pickle & Papad Business', titleHi: 'अचार एवं पापड़ का व्यवसाय', sector: 'Food Processing', type: 'self-employment', minEducation: '5th', requiredSkills: ['cooking', 'food processing'], demandSignal: 'medium', description: 'Make and sell homemade pickles, papad, and other food items. SHG groups can help scale.' },
  { title: 'Data Entry / Computer Operator', titleHi: 'डाटा एंट्री / कंप्यूटर ऑपरेटर', sector: 'IT-ITeS', type: 'wage', minEducation: '10th', requiredSkills: ['computer', 'typing', 'data entry'], demandSignal: 'medium', description: 'Work at CSC centres, banks, or government offices as a computer operator.' },
  { title: 'Two Wheeler Repair Workshop', titleHi: 'दोपहिया वाहन रिपेयर वर्कशॉप', sector: 'Automotive', type: 'self-employment', minEducation: '8th', requiredSkills: ['mechanic', 'vehicle repair'], demandSignal: 'high', description: 'Open a bike/scooter repair shop. Growing demand with increasing two-wheeler ownership.' },

  // New 20
  { title: 'CSC (Common Service Centre) Operator', titleHi: 'जन सेवा केंद्र संचालक', sector: 'IT', type: 'self-employment', minEducation: '10th', requiredSkills: ['computer', 'internet'], demandSignal: 'high', description: 'Open a CSC to provide digital services like PAN, Aadhaar, and banking to villagers.' },
  { title: 'Poultry Farm', titleHi: 'मुर्गी पालन', sector: 'Agriculture', type: 'self-employment', minEducation: 'none', requiredSkills: ['farming', 'poultry'], demandSignal: 'high', description: 'Start a small broiler or layer poultry farm. Quick returns on investment.' },
  { title: 'Goat Farming', titleHi: 'बकरी पालन', sector: 'Agriculture', type: 'self-employment', minEducation: 'none', requiredSkills: ['animal husbandry'], demandSignal: 'high', description: 'Goat farming requires very low investment and provides excellent meat and milk income.' },
  { title: 'Hospital Ward Attendant', titleHi: 'अस्पताल वार्ड बॉय/आया', sector: 'Healthcare', type: 'wage', minEducation: '8th', requiredSkills: ['nursing', 'cleaning'], demandSignal: 'high', description: 'Work in nearby private hospitals or PHCs helping patients.' },
  { title: 'Security Guard', titleHi: 'सुरक्षा गार्ड', sector: 'Security', type: 'wage', minEducation: '8th', requiredSkills: ['security'], demandSignal: 'high', description: 'High demand in cities, factories, and residential societies.' },
  { title: 'Ola/Uber/Taxi Driver', titleHi: 'टैक्सी ड्राइवर', sector: 'Logistics', type: 'self-employment', minEducation: '8th', requiredSkills: ['driving'], demandSignal: 'high', description: 'Drive a taxi or commercial vehicle in nearby towns.' },
  { title: 'Delivery Partner (Amazon/Zomato)', titleHi: 'डिलीवरी बॉय', sector: 'Logistics', type: 'wage', minEducation: '8th', requiredSkills: ['driving', 'bike'], demandSignal: 'high', description: 'Work as a delivery partner for e-commerce or food delivery apps.' },
  { title: 'AC & Fridge Repair Shop', titleHi: 'एसी और फ्रिज रिपेयर', sector: 'Electronics', type: 'self-employment', minEducation: '8th', requiredSkills: ['ac repair', 'electronics'], demandSignal: 'medium', description: 'Great summer business. Needs technical training.' },
  { title: 'Welding Fabrication Shop', titleHi: 'वेल्डिंग की दुकान', sector: 'Capital Goods', type: 'self-employment', minEducation: '8th', requiredSkills: ['welding', 'fabrication'], demandSignal: 'medium', description: 'Make grills, gates, and agricultural tools for local demand.' },
  { title: 'Plumbing Services', titleHi: 'प्लंबिंग सेवाएं', sector: 'Construction', type: 'self-employment', minEducation: '5th', requiredSkills: ['plumbing'], demandSignal: 'high', description: 'Provide on-call plumbing repair services for households and new buildings.' },
  { title: 'Mushroom Cultivation', titleHi: 'मशरूम की खेती', sector: 'Agriculture', type: 'self-employment', minEducation: 'none', requiredSkills: ['farming'], demandSignal: 'medium', description: 'Can be done indoors with very little space. Sells at good profit.' },
  { title: 'Carpentry / Furniture Shop', titleHi: 'फर्नीचर की दुकान (बढ़ई)', sector: 'Furniture', type: 'self-employment', minEducation: 'none', requiredSkills: ['carpentry', 'woodwork'], demandSignal: 'medium', description: 'Make and repair beds, doors, and tables for villagers.' },
  { title: 'BPO / Call Center Executive', titleHi: 'कॉल सेंटर एग्जीक्यूटिव', sector: 'Telecom', type: 'wage', minEducation: '12th', requiredSkills: ['speaking', 'computer'], demandSignal: 'high', description: 'Work in customer support. Requires good communication in Hindi or English.' },
  { title: 'Retail Shop Assistant', titleHi: 'दुकान सहायक', sector: 'Retail', type: 'wage', minEducation: '8th', requiredSkills: ['sales', 'communication'], demandSignal: 'high', description: 'Work as a salesman at clothing, grocery, or hardware stores.' },
  { title: 'Kirana / Grocery Store', titleHi: 'किराना दुकान', sector: 'Retail', type: 'self-employment', minEducation: 'none', requiredSkills: ['sales', 'basic math'], demandSignal: 'high', description: 'Open a general store in the village. Very stable income source.' },
  { title: 'Bakery Shop', titleHi: 'बेकरी की दुकान', sector: 'Food Processing', type: 'self-employment', minEducation: '5th', requiredSkills: ['baking', 'cooking'], demandSignal: 'medium', description: 'Bake and sell biscuits, cakes, and fresh breads locally.' },
  { title: 'Housemaid / Cook', titleHi: 'घरेलू सहायिका / कुक', sector: 'Domestic Help', type: 'wage', minEducation: 'none', requiredSkills: ['cleaning', 'cooking'], demandSignal: 'high', description: 'Work in urban households providing cleaning and cooking services.' },
  { title: 'Solar Panel Maintenance', titleHi: 'सोलर पैनल रखरखाव', sector: 'Green Jobs', type: 'wage', minEducation: '10th', requiredSkills: ['solar', 'electrical'], demandSignal: 'medium', description: 'Maintain and install solar pumps and rooftop panels.' },
  { title: 'Handicraft / Embroidery Business', titleHi: 'हस्तशिल्प / कढ़ाई व्यवसाय', sector: 'Apparel', type: 'self-employment', minEducation: 'none', requiredSkills: ['embroidery', 'craft'], demandSignal: 'medium', description: 'Make and sell embroidered clothes or bamboo crafts.' },
  { title: 'Tractor Mechanic', titleHi: 'ट्रैक्टर मैकेनिक', sector: 'Automotive', type: 'self-employment', minEducation: '8th', requiredSkills: ['mechanic'], demandSignal: 'medium', description: 'Repair tractors and farm machinery in rural areas.' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Force clear everything and re-insert the full list
    await Course.deleteMany({});
    await Livelihood.deleteMany({});
    
    await Course.insertMany(courses);
    console.log(`✅ Seeded ${courses.length} courses`);

    await Livelihood.insertMany(livelihoods);
    console.log(`✅ Seeded ${livelihoods.length} livelihoods`);

    console.log('\n🎉 Database successfully seeded with 30 courses and 30 livelihoods!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
