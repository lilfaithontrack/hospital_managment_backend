/**
 * Database Seed Script - Ethiopian Edition
 * Populates the database with comprehensive Ethiopian sample data
 */

require('dotenv').config();
const db = require('../config/db.config');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function seed() {
    console.log('🌱 Starting database seeding (Ethiopian Edition)...\n');

    try {
        const connected = await db.testConnection();
        if (!connected) {
            console.error('❌ Could not connect to database.');
            process.exit(1);
        }

        // Clear existing data (optional - uncomment to reset)
        // console.log('🗑️ Clearing existing data...');
        // await db.query('SET FOREIGN_KEY_CHECKS = 0');
        // await db.query('TRUNCATE TABLE appointments');
        // await db.query('TRUNCATE TABLE patients');
        // await db.query('TRUNCATE TABLE doctors');
        // await db.query('SET FOREIGN_KEY_CHECKS = 1');

        // 1. Create Users (Admin, Doctors, Staff)
        console.log('👤 Creating users...');
        const users = [
            { email: 'admin@michutech.com', role: 'admin', password: 'admin123' },
            { email: 'dr.abebe@michutech.com', role: 'doctor', password: 'doctor123' },
            { email: 'dr.tigist@michutech.com', role: 'doctor', password: 'doctor123' },
            { email: 'nurse.marta@michutech.com', role: 'nurse', password: 'nurse123' },
            { email: 'reception@michutech.com', role: 'receptionist', password: 'reception123' },
            { email: 'pharmacy@michutech.com', role: 'pharmacist', password: 'pharma123' },
            { email: 'lab@michutech.com', role: 'lab_technician', password: 'lab123' },
            { email: 'radiology@michutech.com', role: 'radiologist', password: 'rad123' },
            { email: 'finance@michutech.com', role: 'accountant', password: 'finance123' }
        ];

        for (const user of users) {
            // Check if user already exists
            const [[existingUser]] = await db.query('SELECT id FROM users WHERE email = ?', [user.email]);

            let userId;
            if (existingUser) {
                userId = existingUser.id;
            } else {
                userId = uuidv4();
                const hash = await bcrypt.hash(user.password, 10);
                await db.query(
                    `INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)`,
                    [userId, user.email, hash]
                );
            }

            // Check if role already exists
            const [[existingRole]] = await db.query('SELECT id FROM user_roles WHERE user_id = ? AND role = ?', [userId, user.role]);
            if (!existingRole) {
                await db.query(
                    `INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)`,
                    [uuidv4(), userId, user.role]
                );
            }
        }
        console.log(`   ✅ Created ${users.length} users with roles`);

        // 2. Create Departments
        console.log('🏢 Creating departments...');
        const departments = [
            { name: 'አጠቃላይ ህክምና (General Medicine)', description: 'የአጠቃላይ ጤና አገልግሎት' },
            { name: 'የልብ ህክምና (Cardiology)', description: 'የልብና የደም ዝውውር ስርአት ህክምና' },
            { name: 'የአጥንት ህክምና (Orthopedics)', description: 'የአጥንት፣ መገጣጠሚያና ጡንቻ ህክምና' },
            { name: 'የህጻናት ህክምና (Pediatrics)', description: 'የህጻናት ጤና አጠባበቅ' },
            { name: 'የማህጸን ህክምና (Gynecology)', description: 'የሴቶች ጤና አገልግሎት' },
            { name: 'የነርቭ ህክምና (Neurology)', description: 'የአንጎልና የነርቭ ስርአት ህክምና' },
            { name: 'የካንሰር ህክምና (Oncology)', description: 'የካንሰር ህክምና' },
            { name: 'ድንገተኛ ክፍል (Emergency)', description: 'ድንገተኛ ህክምና አገልግሎት' },
            { name: 'ራዲዮሎጂ (Radiology)', description: 'የምስል ምርመራ አገልግሎት' },
            { name: 'ላቦራቶሪ (Laboratory)', description: 'የላብራቶሪ ምርመራ አገልግሎት' },
            { name: 'የዓይን ህክምና (Ophthalmology)', description: 'የዓይን ጤና አገልግሎት' },
            { name: 'የቆዳ ህክምና (Dermatology)', description: 'የቆዳ ህክምና አገልግሎት' }
        ];

        const deptIds = {};
        for (const dept of departments) {
            const id = uuidv4();
            deptIds[dept.name.split('(')[1]?.replace(')', '') || dept.name] = id;
            await db.query(
                `INSERT INTO departments (id, name, description) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE description = VALUES(description)`,
                [id, dept.name, dept.description]
            );
        }
        console.log(`   ✅ Created ${departments.length} departments`);

        // 3. Create Doctors with Ethiopian names
        console.log('👨‍⚕️ Creating doctors...');
        const doctors = [
            { name: 'ዶ/ር አበበ ተሾመ (Dr. Abebe Teshome)', spec: 'Internal Medicine', phone: '0911234567', email: 'dr.abebe@michutech.com', fee: 500 },
            { name: 'ዶ/ር ትግስት ገብረመድህን (Dr. Tigist Gebremedhin)', spec: 'Cardiology', phone: '0922345678', email: 'dr.tigist@michutech.com', fee: 800 },
            { name: 'ዶ/ር ዮናስ በቀለ (Dr. Yonas Bekele)', spec: 'Orthopedics', phone: '0933456789', email: 'dr.yonas@hospital.com', fee: 700 },
            { name: 'ዶ/ር ሰላማዊት አለሙ (Dr. Selamawit Alemu)', spec: 'Pediatrics', phone: '0944567890', email: 'dr.selamawit@hospital.com', fee: 400 },
            { name: 'ዶ/ር ዳዊት ወልደማርያም (Dr. Dawit Woldemariam)', spec: 'Neurology', phone: '0955678901', email: 'dr.dawit@hospital.com', fee: 900 },
            { name: 'ዶ/ር ሂሩት ተስፋዬ (Dr. Hirut Tesfaye)', spec: 'Gynecology', phone: '0966789012', email: 'dr.hirut@hospital.com', fee: 600 },
            { name: 'ዶ/ር ብሩክ ታደሰ (Dr. Biruk Tadesse)', spec: 'Oncology', phone: '0977890123', email: 'dr.biruk@hospital.com', fee: 1000 },
            { name: 'ዶ/ር መሰረት ገብሬ (Dr. Meseret Gebre)', spec: 'Emergency Medicine', phone: '0988901234', email: 'dr.meseret@hospital.com', fee: 450 },
            { name: 'ዶ/ር ፋሲካ ሃይሉ (Dr. Fasika Hailu)', spec: 'Ophthalmology', phone: '0912345678', email: 'dr.fasika@hospital.com', fee: 550 },
            { name: 'ዶ/ር ናሆም ዘውዴ (Dr. Nahom Zewdie)', spec: 'Dermatology', phone: '0923456789', email: 'dr.nahom@hospital.com', fee: 500 },
            { name: 'ዶ/ር ቤዛ ካሳ (Dr. Beza Kassa)', spec: 'Radiology', phone: '0934567890', email: 'dr.beza@hospital.com', fee: 600 },
            { name: 'ዶ/ር ሳሙኤል ተክሉ (Dr. Samuel Teklu)', spec: 'General Surgery', phone: '0945678901', email: 'dr.samuel@hospital.com', fee: 800 }
        ];

        for (let i = 0; i < doctors.length; i++) {
            const doc = doctors[i];
            await db.query(
                `INSERT INTO doctors (id, doctor_id, name, specialization, phone, email, consultation_fee, status, available_days, available_time_start, available_time_end, experience_years, qualification)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Available', ?, '08:00:00', '17:00:00', ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
                [uuidv4(), `DOC-${String(i + 1).padStart(3, '0')}`, doc.name, doc.spec, doc.phone, doc.email, doc.fee,
                JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),
                Math.floor(Math.random() * 15) + 5, 'MD, Specialist']
            );
        }
        console.log(`   ✅ Created ${doctors.length} doctors`);

        // 4. Create Staff with Ethiopian names
        console.log('👥 Creating staff...');
        const staff = [
            { name: 'ማርታ ገብሩ (Marta Gebru)', role: 'Nurse', phone: '0911111111', email: 'nurse.marta@michutech.com', shift: 'Morning' },
            { name: 'አበባ ተክሌ (Abeba Tekle)', role: 'Nurse', phone: '0922222222', email: 'abeba.nurse@hospital.com', shift: 'Afternoon' },
            { name: 'ሰለሞን ኃይሌ (Solomon Haile)', role: 'Nurse', phone: '0933333333', email: 'solomon.nurse@hospital.com', shift: 'Night' },
            { name: 'ፍቅርተ አበራ (Fikerte Abera)', role: 'Receptionist', phone: '0944444444', email: 'reception@michutech.com', shift: 'Morning' },
            { name: 'ተስፋዬ በየነ (Tesfaye Beyene)', role: 'Lab Technician', phone: '0955555555', email: 'lab@michutech.com', shift: 'Morning' },
            { name: 'ሄለን መንግስቱ (Helen Mengistu)', role: 'Lab Technician', phone: '0966666666', email: 'helen.lab@hospital.com', shift: 'Afternoon' },
            { name: 'ዳንኤል ወርቁ (Daniel Worku)', role: 'Radiologist', phone: '0977777777', email: 'radiology@michutech.com', shift: 'Morning' },
            { name: 'ልዕልቲ አስፋው (Lilit Asfaw)', role: 'Pharmacist', phone: '0988888888', email: 'pharmacy@michutech.com', shift: 'Morning' },
            { name: 'ክብሮም ገብረ (Kibrom Gebre)', role: 'Pharmacist', phone: '0999999999', email: 'kibrom.pharma@hospital.com', shift: 'Afternoon' },
            { name: 'አስቴር ታደሰ (Aster Tadesse)', role: 'Accountant', phone: '0912121212', email: 'finance@michutech.com', shift: 'Morning' },
            { name: 'ጌታቸው ሃብተ (Getachew Habte)', role: 'Admin', phone: '0923232323', email: 'admin.getachew@hospital.com', shift: 'Morning' },
            { name: 'ትዕግስት በላይ (Tigist Belay)', role: 'Nurse', phone: '0934343434', email: 'tigist.nurse@hospital.com', shift: 'Morning' },
            { name: 'ረደት ፈንታ (Redet Fenta)', role: 'Nurse', phone: '0945454545', email: 'redet.nurse@hospital.com', shift: 'Night' },
            { name: 'መኮነን ታሪኩ (Mekonnen Tariku)', role: 'Security', phone: '0956565656', email: 'security@hospital.com', shift: 'Rotating' },
            { name: 'ዘነበ ሞላ (Zenebe Molla)', role: 'Housekeeping', phone: '0967676767', email: 'housekeeping@hospital.com', shift: 'Morning' }
        ];

        for (let i = 0; i < staff.length; i++) {
            const s = staff[i];
            await db.query(
                `INSERT INTO staff (id, staff_id, name, role, phone, email, shift, status, join_date, salary)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Active', CURDATE(), ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
                [uuidv4(), `STF-${String(i + 1).padStart(3, '0')}`, s.name, s.role, s.phone, s.email, s.shift,
                Math.floor(Math.random() * 10000) + 5000]
            );
        }
        console.log(`   ✅ Created ${staff.length} staff members`);

        // 5. Create Patients with Ethiopian names
        console.log('🤒 Creating patients...');
        const patients = [
            { name: 'አበበ ከበደ (Abebe Kebede)', age: 45, gender: 'Male', phone: '0911234567', blood: 'O+', address: 'ቦሌ, አዲስ አበባ' },
            { name: 'ፋጡማ አህመድ (Fatuma Ahmed)', age: 32, gender: 'Female', phone: '0922345678', blood: 'A+', address: 'ወሎ ሰፈር, አዲስ አበባ' },
            { name: 'ታደሰ ኃይሌ (Tadesse Haile)', age: 58, gender: 'Male', phone: '0933456789', blood: 'B+', address: 'ፒያሳ, አዲስ አበባ' },
            { name: 'ሳራ ተስፋዬ (Sara Tesfaye)', age: 25, gender: 'Female', phone: '0944567890', blood: 'AB+', address: 'ልደታ, አዲስ አበባ' },
            { name: 'ዳዊት ሙላቱ (Dawit Mulatu)', age: 67, gender: 'Male', phone: '0955678901', blood: 'O-', address: 'መገናኛ, አዲስ አበባ' },
            { name: 'ትዕግስት በላይነህ (Tigist Belayneh)', age: 29, gender: 'Female', phone: '0966789012', blood: 'A-', address: 'ካዛንቺስ, አዲስ አበባ' },
            { name: 'ዮናስ ገብሬ (Yonas Gebre)', age: 41, gender: 'Male', phone: '0977890123', blood: 'B-', address: 'ጎተራ, አዲስ አበባ' },
            { name: 'መሠረት አለሙ (Meseret Alemu)', age: 35, gender: 'Female', phone: '0988901234', blood: 'AB-', address: '22 ማዞሪያ, አዲስ አበባ' },
            { name: 'ብርሃኑ ወልዴ (Birhanu Wolde)', age: 52, gender: 'Male', phone: '0912345678', blood: 'O+', address: 'ገርጂ, አዲስ አበባ' },
            { name: 'አስቴር መኮነን (Aster Mekonnen)', age: 38, gender: 'Female', phone: '0923456789', blood: 'A+', address: 'ሳሪስ, አዲስ አበባ' },
            { name: 'ግርማ ታደሰ (Girma Tadesse)', age: 64, gender: 'Male', phone: '0934567890', blood: 'B+', address: 'ቡልብላ, አዲስ አበባ' },
            { name: 'ጽጌረዳ ገብሩ (Tsigireda Gebru)', age: 27, gender: 'Female', phone: '0945678901', blood: 'O+', address: 'ቂርቆስ, አዲስ አበባ' },
            { name: 'ሰለሞን ኃይለማርያም (Solomon Hailemariam)', age: 49, gender: 'Male', phone: '0956789012', blood: 'A+', address: 'አየር ጤና, አዲስ አበባ' },
            { name: 'ብሩክታዊት ካሳ (Biruktawit Kassa)', age: 31, gender: 'Female', phone: '0967890123', blood: 'B-', address: 'አዳማ' },
            { name: 'ተስፋዬ ደስታ (Tesfaye Desta)', age: 56, gender: 'Male', phone: '0978901234', blood: 'AB+', address: 'ባህር ዳር' },
            { name: 'ሌሊሳ ግርማ (Lelisa Girma)', age: 24, gender: 'Male', phone: '0989012345', blood: 'O+', address: 'ኦሮሚያ' },
            { name: 'ቤዛ ወርቁ (Beza Worku)', age: 42, gender: 'Female', phone: '0912345679', blood: 'A-', address: 'ደሴ' },
            { name: 'ዘመነ ተክለ (Zemene Tekle)', age: 33, gender: 'Male', phone: '0923456780', blood: 'B+', address: 'ጎንደር' },
            { name: 'አልማዝ ተስፋ (Almaz Tesfa)', age: 28, gender: 'Female', phone: '0934567891', blood: 'O-', address: 'ሃዋሳ' },
            { name: 'ካሳ ብርሃኔ (Kassa Birhane)', age: 71, gender: 'Male', phone: '0945678902', blood: 'AB-', address: 'ጅማ' }
        ];

        const patientIds = [];
        for (let i = 0; i < patients.length; i++) {
            const p = patients[i];
            const patientId = uuidv4();
            patientIds.push(patientId);
            await db.query(
                `INSERT INTO patients (id, patient_id, name, age, gender, phone, blood_group, address, status, emergency_contact_name, emergency_contact_phone)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
                [patientId, `PAT-${String(i + 1).padStart(3, '0')}`, p.name, p.age, p.gender, p.phone, p.blood, p.address,
                    'Family Member', `091${String(Math.floor(Math.random() * 10000000)).padStart(7, '0')}`]
            );
        }
        console.log(`   ✅ Created ${patients.length} patients`);

        // 6. Create Wards
        console.log('🛏️ Creating wards...');
        const wards = [
            { name: 'አጠቃላይ ክፍል ሀ (General Ward A)', type: 'General', floor: 1, beds: 20 },
            { name: 'አጠቃላይ ክፍል ለ (General Ward B)', type: 'General', floor: 1, beds: 20 },
            { name: 'ICU (ጽኑ ህክምና ክፍል)', type: 'ICU', floor: 2, beds: 10 },
            { name: 'የህፃናት ክፍል (Pediatric Ward)', type: 'Pediatric', floor: 2, beds: 15 },
            { name: 'የወሊድ ክፍል (Maternity Ward)', type: 'Maternity', floor: 3, beds: 15 },
            { name: 'የቀዶ ጥገና ክፍል (Surgical Ward)', type: 'Surgical', floor: 3, beds: 20 },
            { name: 'ድንገተኛ ክፍል (Emergency Ward)', type: 'Emergency', floor: 1, beds: 10 },
            { name: 'VIP ክፍል (VIP Ward)', type: 'General', floor: 4, beds: 8 }
        ];

        const wardIds = {};
        for (const ward of wards) {
            const id = uuidv4();
            wardIds[ward.name] = id;
            await db.query(
                `INSERT INTO wards (id, name, type, floor, total_beds, available_beds, nurse_station)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
                [id, ward.name, ward.type, ward.floor, ward.beds, ward.beds, `NS-${ward.floor}`]
            );
        }
        console.log(`   ✅ Created ${wards.length} wards`);

        // 7. Create Beds
        console.log('🛏️ Creating beds...');
        let bedCount = 0;
        for (const ward of wards) {
            for (let i = 1; i <= ward.beds; i++) {
                await db.query(
                    `INSERT INTO beds (id, bed_number, ward_id, bed_type, daily_rate, status)
           VALUES (?, ?, ?, ?, ?, 'Available')
           ON DUPLICATE KEY UPDATE bed_number = VALUES(bed_number)`,
                    [uuidv4(), `${ward.name.substring(0, 3).toUpperCase()}-${String(i).padStart(3, '0')}`,
                    wardIds[ward.name], ward.type === 'ICU' ? 'ICU' : 'Standard',
                    ward.type === 'General' ? 500 : (ward.type === 'ICU' ? 3000 : 1000)]
                );
                bedCount++;
            }
        }
        console.log(`   ✅ Created ${bedCount} beds`);

        // 8. Blood Inventory
        console.log('🩸 Creating blood inventory...');
        const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        const components = ['Whole Blood', 'Packed RBC', 'Platelets', 'Fresh Frozen Plasma', 'Cryoprecipitate'];

        for (const bg of bloodGroups) {
            for (const comp of components) {
                await db.query(
                    `INSERT INTO blood_inventory (id, blood_group, component, units_available, min_stock_level)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE units_available = VALUES(units_available)`,
                    [uuidv4(), bg, comp, Math.floor(Math.random() * 30) + 10, 5]
                );
            }
        }
        console.log(`   ✅ Created blood inventory for all blood groups`);

        // 9. Blood Donations
        console.log('🩸 Creating blood donations...');
        const donorNames = ['ዘመነ ካሳ', 'ትዝታ ወልዴ', 'ፍቃዱ ለማ', 'ምህረት አበበ', 'ሳሙኤል ገብሬ', 'ልዕልቲ ታደሰ'];
        for (let i = 0; i < 15; i++) {
            const bg = bloodGroups[Math.floor(Math.random() * bloodGroups.length)];
            await db.query(
                `INSERT INTO blood_donations (id, donation_id, donor_name, donor_phone, blood_group, donation_date, units_donated, hemoglobin_level, screening_status, expiry_date, status)
         VALUES (?, ?, ?, ?, ?, DATE_SUB(CURDATE(), INTERVAL ? DAY), 1, ?, 'Passed', DATE_ADD(CURDATE(), INTERVAL ? DAY), 'Available')
         ON DUPLICATE KEY UPDATE donor_name = VALUES(donor_name)`,
                [uuidv4(), `DON-${String(i + 1).padStart(3, '0')}`, donorNames[i % donorNames.length],
                `091${String(Math.floor(Math.random() * 10000000)).padStart(7, '0')}`,
                    bg, Math.floor(Math.random() * 30), 12 + Math.random() * 4, 35 - Math.floor(Math.random() * 20)]
            );
        }
        console.log(`   ✅ Created 15 blood donations`);

        // 10. Pharmacy Categories
        console.log('💊 Creating pharmacy categories...');
        const categories = [
            'Antibiotics (አንቲባዮቲክስ)',
            'Painkillers (የህመም ማስታገሻ)',
            'Vitamins (ቪታሚኖች)',
            'Cardiac Drugs (የልብ መድሃኒቶች)',
            'Diabetes Medication (የስኳር መድሃኒቶች)',
            'Respiratory (የመተንፈሻ)',
            'Gastrointestinal (የሆድ መድሃኒቶች)',
            'Dermatology (የቆዳ መድሃኒቶች)',
            'Eye Drops (የዓይን ጠብታ)',
            'First Aid (የመጀመሪያ እርዳታ)'
        ];

        const categoryIds = {};
        for (const cat of categories) {
            const id = uuidv4();
            categoryIds[cat] = id;
            await db.query(
                `INSERT INTO pharmacy_categories (id, name) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
                [id, cat]
            );
        }
        console.log(`   ✅ Created ${categories.length} pharmacy categories`);

        // 11. Pharmacy Items
        console.log('💊 Creating pharmacy items...');
        const pharmacyItems = [
            { code: 'AMX500', name: 'Amoxicillin 500mg', generic: 'Amoxicillin', cat: 'Antibiotics (አንቲባዮቲክስ)', form: 'Capsule', price: 15, stock: 500 },
            { code: 'AZT250', name: 'Azithromycin 250mg', generic: 'Azithromycin', cat: 'Antibiotics (አንቲባዮቲክስ)', form: 'Tablet', price: 25, stock: 300 },
            { code: 'CIP500', name: 'Ciprofloxacin 500mg', generic: 'Ciprofloxacin', cat: 'Antibiotics (አንቲባዮቲክስ)', form: 'Tablet', price: 20, stock: 400 },
            { code: 'PAR500', name: 'Paracetamol 500mg', generic: 'Acetaminophen', cat: 'Painkillers (የህመም ማስታገሻ)', form: 'Tablet', price: 5, stock: 1000 },
            { code: 'IBU400', name: 'Ibuprofen 400mg', generic: 'Ibuprofen', cat: 'Painkillers (የህመም ማስታገሻ)', form: 'Tablet', price: 8, stock: 800 },
            { code: 'DIC50', name: 'Diclofenac 50mg', generic: 'Diclofenac', cat: 'Painkillers (የህመም ማስታገሻ)', form: 'Tablet', price: 10, stock: 600 },
            { code: 'VITC', name: 'Vitamin C 500mg', generic: 'Ascorbic Acid', cat: 'Vitamins (ቪታሚኖች)', form: 'Tablet', price: 12, stock: 500 },
            { code: 'VITB', name: 'Vitamin B Complex', generic: 'B Vitamins', cat: 'Vitamins (ቪታሚኖች)', form: 'Tablet', price: 15, stock: 400 },
            { code: 'MET500', name: 'Metformin 500mg', generic: 'Metformin', cat: 'Diabetes Medication (የስኳር መድሃኒቶች)', form: 'Tablet', price: 18, stock: 600 },
            { code: 'GLI5', name: 'Glibenclamide 5mg', generic: 'Glibenclamide', cat: 'Diabetes Medication (የስኳር መድሃኒቶች)', form: 'Tablet', price: 20, stock: 400 },
            { code: 'AML5', name: 'Amlodipine 5mg', generic: 'Amlodipine', cat: 'Cardiac Drugs (የልብ መድሃኒቶች)', form: 'Tablet', price: 22, stock: 500 },
            { code: 'ATE50', name: 'Atenolol 50mg', generic: 'Atenolol', cat: 'Cardiac Drugs (የልብ መድሃኒቶች)', form: 'Tablet', price: 18, stock: 400 },
            { code: 'SAL100', name: 'Salbutamol Inhaler', generic: 'Salbutamol', cat: 'Respiratory (የመተንፈሻ)', form: 'Inhaler', price: 150, stock: 100 },
            { code: 'OMP20', name: 'Omeprazole 20mg', generic: 'Omeprazole', cat: 'Gastrointestinal (የሆድ መድሃኒቶች)', form: 'Capsule', price: 25, stock: 400 },
            { code: 'LOR10', name: 'Loratadine 10mg', generic: 'Loratadine', cat: 'Dermatology (የቆዳ መድሃኒቶች)', form: 'Tablet', price: 15, stock: 300 }
        ];

        for (const item of pharmacyItems) {
            await db.query(
                `INSERT INTO pharmacy_items (id, item_code, name, generic_name, category_id, dosage_form, selling_price, stock_quantity, min_stock_level, expiry_date, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 50, DATE_ADD(CURDATE(), INTERVAL ? DAY), TRUE)
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
                [uuidv4(), item.code, item.name, item.generic, categoryIds[item.cat], item.form, item.price, item.stock,
                Math.floor(Math.random() * 365) + 180]
            );
        }
        console.log(`   ✅ Created ${pharmacyItems.length} pharmacy items`);

        // 12. Lab Test Catalog
        console.log('🔬 Creating lab test catalog...');
        const labTests = [
            { code: 'CBC', name: 'Complete Blood Count (ሙሉ የደም ምርመራ)', type: 'Hematology', price: 200, time: '2 hours' },
            { code: 'LFT', name: 'Liver Function Test (የጉበት ምርመራ)', type: 'Biochemistry', price: 400, time: '4 hours' },
            { code: 'RFT', name: 'Renal Function Test (የኩላሊት ምርመራ)', type: 'Biochemistry', price: 350, time: '4 hours' },
            { code: 'FBS', name: 'Fasting Blood Sugar (የስኳር ምርመራ)', type: 'Biochemistry', price: 80, time: '1 hour' },
            { code: 'RBS', name: 'Random Blood Sugar', type: 'Biochemistry', price: 80, time: '30 min' },
            { code: 'LP', name: 'Lipid Profile (የስብ ምርመራ)', type: 'Biochemistry', price: 500, time: '4 hours' },
            { code: 'TFT', name: 'Thyroid Function Test (የታይሮይድ ምርመራ)', type: 'Endocrinology', price: 600, time: '24 hours' },
            { code: 'UA', name: 'Urinalysis (የሽንት ምርመራ)', type: 'Urinalysis', price: 100, time: '1 hour' },
            { code: 'HIV', name: 'HIV Test (የኤችአይቪ ምርመራ)', type: 'Serology', price: 150, time: '30 min' },
            { code: 'HBS', name: 'Hepatitis B Surface Antigen', type: 'Serology', price: 200, time: '1 hour' },
            { code: 'WIDAL', name: 'Widal Test (የታይፎይድ ምርመራ)', type: 'Serology', price: 150, time: '1 hour' },
            { code: 'STOOL', name: 'Stool Examination (የሰገራ ምርመራ)', type: 'Parasitology', price: 80, time: '1 hour' },
            { code: 'BLOOD-GRP', name: 'Blood Group & Rh (የደም አይነት)', type: 'Blood Bank', price: 100, time: '30 min' },
            { code: 'PT-INR', name: 'Prothrombin Time/INR', type: 'Coagulation', price: 250, time: '2 hours' },
            { code: 'ESR', name: 'Erythrocyte Sedimentation Rate', type: 'Hematology', price: 80, time: '1 hour' }
        ];

        for (const test of labTests) {
            await db.query(
                `INSERT INTO lab_test_catalog (id, test_code, test_name, test_type, price, turnaround_time, is_active)
         VALUES (?, ?, ?, ?, ?, ?, TRUE)
         ON DUPLICATE KEY UPDATE test_name = VALUES(test_name)`,
                [uuidv4(), test.code, test.name, test.type, test.price, test.time]
            );
        }
        console.log(`   ✅ Created ${labTests.length} lab test types`);

        // 13. Billing Items
        console.log('💰 Creating billing items...');
        const billingItems = [
            { code: 'CONS-GEN', name: 'General Consultation (አጠቃላይ ምክር)', cat: 'Consultation', price: 300 },
            { code: 'CONS-SPEC', name: 'Specialist Consultation (ስፔሻሊስት ምክር)', cat: 'Consultation', price: 600 },
            { code: 'CONS-EMG', name: 'Emergency Consultation (ድንገተኛ ምክር)', cat: 'Consultation', price: 500 },
            { code: 'ADM-GEN', name: 'General Ward Admission/day (አጠቃላይ እንክብካቤ)', cat: 'Admission', price: 1500 },
            { code: 'ADM-SEMI', name: 'Semi-Private Room/day', cat: 'Admission', price: 2500 },
            { code: 'ADM-VIP', name: 'VIP Room/day', cat: 'Admission', price: 5000 },
            { code: 'ADM-ICU', name: 'ICU Admission/day (ጽኑ ማከሚያ)', cat: 'Admission', price: 8000 },
            { code: 'SUR-MIN', name: 'Minor Surgery (ቀላል ቀዶ ጥገና)', cat: 'Surgery', price: 5000 },
            { code: 'SUR-INT', name: 'Intermediate Surgery', cat: 'Surgery', price: 15000 },
            { code: 'SUR-MAJ', name: 'Major Surgery (ዋና ቀዶ ጥገና)', cat: 'Surgery', price: 50000 },
            { code: 'XRAY', name: 'X-Ray (ራጂ)', cat: 'Radiology', price: 300 },
            { code: 'ULTRA', name: 'Ultrasound (አልትራሳውንድ)', cat: 'Radiology', price: 500 },
            { code: 'CT', name: 'CT Scan', cat: 'Radiology', price: 3000 },
            { code: 'MRI', name: 'MRI Scan', cat: 'Radiology', price: 6000 },
            { code: 'ECG', name: 'ECG (ኤሌክትሮካርዲዮግራም)', cat: 'Cardiology', price: 250 },
            { code: 'ECHO', name: 'Echocardiogram', cat: 'Cardiology', price: 1500 },
            { code: 'AMB', name: 'Ambulance Service (አምቡላንስ)', cat: 'Transport', price: 2000 },
            { code: 'REG', name: 'Registration Fee (ምዝገባ)', cat: 'Administrative', price: 100 },
            { code: 'MED-FILE', name: 'Medical File (የህክምና ማህደር)', cat: 'Administrative', price: 50 }
        ];

        for (const item of billingItems) {
            await db.query(
                `INSERT INTO billing_items (id, item_code, name, category, unit_price, is_active)
         VALUES (?, ?, ?, ?, ?, TRUE)
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
                [uuidv4(), item.code, item.name, item.cat, item.price]
            );
        }
        console.log(`   ✅ Created ${billingItems.length} billing items`);

        // 14. Radiology Equipment
        console.log('📡 Creating radiology equipment...');
        const equipment = [
            { name: 'X-Ray Machine A (ራጂ ማሽን)', type: 'X-Ray', location: 'Radiology Room 1' },
            { name: 'X-Ray Machine B', type: 'X-Ray', location: 'Emergency' },
            { name: 'CT Scanner (ሲቲ ስካን)', type: 'CT Scan', location: 'Radiology Room 2' },
            { name: 'MRI Machine (ኤምአርአይ)', type: 'MRI', location: 'Radiology Room 3' },
            { name: 'Ultrasound 1 (አልትራሳውንድ)', type: 'Ultrasound', location: 'Radiology Room 4' },
            { name: 'Ultrasound 2 (Portable)', type: 'Ultrasound', location: 'OPD' },
            { name: 'Ultrasound 3 (OB/GYN)', type: 'Ultrasound', location: 'Gynecology' },
            { name: 'Mammography Unit', type: 'Mammography', location: 'Radiology Room 5' }
        ];

        for (const eq of equipment) {
            await db.query(
                `INSERT INTO radiology_equipment (id, name, type, location, status)
         VALUES (?, ?, ?, ?, 'Operational')
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
                [uuidv4(), eq.name, eq.type, eq.location]
            );
        }
        console.log(`   ✅ Created ${equipment.length} radiology equipment`);

        // 15. Operating Rooms
        console.log('🏥 Creating operating rooms...');
        const opRooms = [
            { number: 'OR-1', name: 'Operating Room 1 - General Surgery' },
            { number: 'OR-2', name: 'Operating Room 2 - Orthopedics' },
            { number: 'OR-3', name: 'Operating Room 3 - Cardiac Surgery' },
            { number: 'OR-4', name: 'Operating Room 4 - OB/GYN' },
            { number: 'OR-5', name: 'Operating Room 5 - Emergency' }
        ];

        for (const room of opRooms) {
            await db.query(
                `INSERT INTO operating_rooms (id, room_number, name, status)
         VALUES (?, ?, ?, 'Available')
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
                [uuidv4(), room.number, room.name]
            );
        }
        console.log(`   ✅ Created ${opRooms.length} operating rooms`);

        // 16. ICU Beds
        console.log('🛏️ Creating ICU beds...');
        for (let i = 1; i <= 10; i++) {
            await db.query(
                `INSERT INTO icu_beds (id, bed_number, status, equipment)
         VALUES (?, ?, 'Available', ?)
         ON DUPLICATE KEY UPDATE bed_number = VALUES(bed_number)`,
                [uuidv4(), `ICU-${String(i).padStart(2, '0')}`,
                JSON.stringify(['Ventilator', 'Cardiac Monitor', 'Infusion Pump', 'Suction Machine'])]
            );
        }
        console.log('   ✅ Created 10 ICU beds');

        // 17. Create Sample Appointments
        console.log('📅 Creating sample appointments...');
        const [doctorsList] = await db.query('SELECT id FROM doctors LIMIT 10');
        const [patientsList] = await db.query('SELECT id FROM patients LIMIT 20');

        if (doctorsList.length > 0 && patientsList.length > 0) {
            const appointmentTypes = ['New Consultation', 'Follow Up', 'Routine Checkup'];
            const statuses = ['Scheduled', 'Confirmed', 'Completed'];

            for (let i = 0; i < 20; i++) {
                const daysOffset = Math.floor(Math.random() * 14) - 7;
                const hour = 8 + Math.floor(Math.random() * 8);
                const patientId = patientsList[i % patientsList.length].id;
                const doctorId = doctorsList[i % doctorsList.length].id;

                try {
                    await db.query(
                        `INSERT INTO appointments (id, appointment_id, patient_id, doctor_id, appointment_date, appointment_time, type, status, reason)
                         VALUES (?, ?, ?, ?, DATE_ADD(CURDATE(), INTERVAL ? DAY), ?, ?, ?, ?)
                         ON DUPLICATE KEY UPDATE appointment_id = VALUES(appointment_id)`,
                        [uuidv4(), `APT-${String(i + 1).padStart(3, '0')}`,
                            patientId, doctorId, daysOffset,
                        `${String(hour).padStart(2, '0')}:${Math.random() > 0.5 ? '00' : '30'}:00`,
                        appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)],
                        statuses[Math.floor(Math.random() * statuses.length)],
                            'General checkup and consultation']
                    );
                } catch (e) {
                    // Skip if already exists
                }
            }
            console.log('   ✅ Created 20 sample appointments');
        } else {
            console.log('   ⚠️ Skipped appointments (no doctors/patients found)');
        }

        console.log('\n✅ Database seeding completed successfully!');
        console.log('\n📋 Summary:');
        console.log('   - 9 users with roles (admin, doctors, nurses, staff)');
        console.log('   - 12 departments with Amharic names');
        console.log('   - 12 doctors with Ethiopian names');
        console.log('   - 15 staff members');
        console.log('   - 20 patients with Ethiopian names');
        console.log('   - 8 wards with 118 beds');
        console.log('   - Blood inventory for all blood groups');
        console.log('   - 15 blood donations');
        console.log('   - 10 pharmacy categories');
        console.log('   - 15 pharmacy items');
        console.log('   - 15 lab test types');
        console.log('   - 19 billing items');
        console.log('   - 8 radiology equipment');
        console.log('   - 5 operating rooms');
        console.log('   - 10 ICU beds');
        console.log('   - 20 sample appointments');
        console.log('\n🔐 Login Credentials:');
        console.log('   Admin: admin@michutech.com / admin123');
        console.log('   Doctor: dr.abebe@michutech.com / doctor123');
        console.log('   Nurse: nurse.marta@michutech.com / nurse123');
        console.log('   Reception: reception@michutech.com / reception123');

    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }

    process.exit(0);
}

seed();
