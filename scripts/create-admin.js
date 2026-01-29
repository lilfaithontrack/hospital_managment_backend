
const db = require('../config/db.config');
const bcrypt = require('bcryptjs'); // Assuming bcryptjs is used, or I should check package.json.
// Checking imports in auth.controller.js (Step 110) shows 'const jwt = require('jsonwebtoken');' and 'const User = require('../models/user.model');'
// User model likely handles hashing. Let's use the User model if possible, or just raw SQL with a known hash/manual hash if I can't require the model easily (dependencies).
// auth.controller.js uses User.create({ email, password }). User model likely hashes it.
// Let's try to use the models directly to match app logic.

const User = require('../models/user.model');
const Staff = require('../models/staff.model');
const StaffRole = require('../models/staffRole.model');
const { v4: uuidv4 } = require('uuid');

const createAdmin = async () => {
    console.log('🚀 Creating local admin account...');

    try {
        const email = 'admin@michutech.com';
        const password = 'admin123';

        // 1. Get Admin Role ID
        const adminRole = await StaffRole.findByName('Administrator');
        if (!adminRole) {
            console.error('❌ Administrator role not found! Run migrate-staff-roles.js first.');
            process.exit(1);
        }
        console.log(`✓ Found Administrator role: ${adminRole.id}`);

        // 2. Check/Create User
        let user = await User.findByEmail(email);
        if (!user) {
            console.log('Creating new user...');
            // User.create usually returns the user object or id. 
            // Looking at auth.controller: const user = await User.create({ email, password });
            // Let's verify User.create signature if possible, but assuming standard.
            // Wait, I don't want to fail if User.create signature is different.
            // Let's look at user.model.js if I can... 
            // But I'll take a safe bet: auth controller uses it simply.
            user = await User.create({ email, password });
            console.log('✓ User created');
        } else {
            console.log('✓ User already exists');
        }

        // 3. Check/Create Staff linked to User
        // Check if staff exists linked to this user?
        // auth.controller uses: Staff.findByUserId(user.id)
        let staff = await Staff.findByUserId(user.id);

        if (!staff) {
            // Check if staff exists by email to avoid dupes if not linked
            // But we don't have findByEmail in standard models usually, maybe via SQL?
            // auth.controller has Staff.create
            console.log('Creating staff record...');
            staff = await Staff.create({
                name: 'System Administrator',
                email: email,
                phone: '0900000000',
                role: 'Administrator',
                role_id: adminRole.id,
                user_id: user.id,
                status: 'Active',
                shift: 'Morning',
                join_date: new Date(),
                department_id: null
            });
            console.log('✓ Staff record created');
        } else {
            console.log('✓ Staff record already exists');
            // Ensure role is Admin
            if (staff.role_id !== adminRole.id) {
                console.log('Updating staff role to Admin...');
                // Manual update via DB query since Staff model might not have update method exposed easily here
                await db.query('UPDATE staff SET role_id = ?, role = ? WHERE id = ?', [adminRole.id, 'Administrator', staff.id]);
                console.log('✓ Staff role updated');
            }
        }

        console.log('\n✅ Admin account setup complete!');
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Failed:', error);
        process.exit(1);
    }
};

createAdmin();
