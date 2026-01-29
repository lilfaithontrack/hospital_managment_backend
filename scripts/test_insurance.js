/**
 * Test Insurance System (using Node.js built-in fetch)
 * Run with: node scripts/test_insurance.js
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@michutech.com';
const ADMIN_PASS = 'admin123';

async function runTest() {
    try {
        console.log('=== Insurance System Test (Fetch) ===');

        // --- 1. Login ---
        console.log('\n1. Logging in...');
        let token;
        try {
            const loginRes = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASS })
            });

            if (!loginRes.ok) {
                const errText = await loginRes.text();
                throw new Error(`Login failed: ${loginRes.status} ${errText}`);
            }

            const loginData = await loginRes.json();
            // console.log('Login Response:', JSON.stringify(loginData, null, 2)); 

            // Corrected path: loginData.data.token
            token = loginData.data ? loginData.data.token : loginData.token;

            if (!token) {
                console.error('❌ Token missing in response');
                console.error(JSON.stringify(loginData, null, 2));
                return;
            }
            console.log('✅ Login successful. Token obtained.');

        } catch (err) {
            console.error('❌ Login Failed:', err.message);
            return;
        }

        const headers = {
            'Authorization': `Bearer ${token}`
        };

        // --- 2. Create Provider ---
        console.log('\n2. Creating Insurance Provider...');
        let providerId;
        const providerData = {
            name: 'Test Insurance Co ' + Date.now(),
            code: 'TEST-' + Math.floor(Math.random() * 1000),
            contact_number: '1234567890',
            email: 'test@insurance.com',
            address: '123 Test St',
            coverage_details: 'Full coverage'
        };

        try {
            const provRes = await fetch(`${API_URL}/insurance/providers`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify(providerData)
            });

            if (!provRes.ok) throw new Error(await provRes.text());

            const provJson = await provRes.json();
            providerId = provJson.data.id;
            console.log('✅ Provider Created:', provJson.data.name, '(ID:', providerId, ')');
        } catch (err) {
            console.error('❌ Create Provider Failed:', err.message);
            return;
        }

        // --- 3. Create Claim (Accountant Workflow) ---
        console.log('\n3. Creating Insurance Claim (Accountant upload)...');
        let patientId, billId;

        try {
            // Get or Create Patient
            const patientsRes = await fetch(`${API_URL}/patients?limit=1`, { headers });
            const patientsData = await patientsRes.json();

            if (patientsData.data && patientsData.data.length > 0) {
                patientId = patientsData.data[0].id;
            } else {
                console.log('⚠️ No patients found. Creating dummy patient...');
                const newPatientRes = await fetch(`${API_URL}/patients`, {
                    method: 'POST',
                    headers: { ...headers, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: 'Test Patient', age: 30, gender: 'Male', phone: '5555555555' })
                });
                const newPatientData = await newPatientRes.json();
                patientId = newPatientData.id || newPatientData.data?.id;
            }

            if (!patientId) throw new Error('Could not get patient ID');

            // Create Bill
            const billRes = await fetch(`${API_URL}/bills`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patient_id: patientId,
                    total_amount: 1500,
                    status: 'Pending'
                })
            });
            const billData = await billRes.json();
            billId = billData.id || billData.data?.id;

            // Handle if billData didn't return ID directly (some controllers return full obj)
            if (!billId && billData.bill_number) billId = billData.id;

            console.log('ℹ️ Using Patient:', patientId, 'Bill:', billId);

        } catch (err) {
            console.error('❌ Setup (Patient/Bill) Failed:', err.message);
        }

        if (patientId && billId) {
            const dummyFilePath = path.join(__dirname, 'test_doc.pdf');
            fs.writeFileSync(dummyFilePath, '%PDF-1.4\n%...'); // Minimal PDF header to be safe-ish

            const form = new FormData();
            form.append('bill_id', billId);
            form.append('patient_id', patientId);
            form.append('insurance_provider_id', providerId);
            form.append('amount', '1200');
            form.append('notes', 'Claim for recent surgery');

            const fileBuffer = fs.readFileSync(dummyFilePath);
            const blob = new Blob([fileBuffer], { type: 'application/pdf' });
            form.append('documents', blob, 'test_doc.pdf');

            try {
                const claimRes = await fetch(`${API_URL}/insurance/claims`, {
                    method: 'POST',
                    headers: headers,
                    body: form
                });

                if (!claimRes.ok) {
                    throw new Error(await claimRes.text());
                }

                const claimJson = await claimRes.json();
                const claimId = claimJson.data.id;
                console.log('✅ Claim Created:', claimJson.data.claim_number);

                // --- 4. Verify Claim in List ---
                console.log('\n4. Verifying Claim in List...');
                const listRes = await fetch(`${API_URL}/insurance/claims`, { headers });
                const listJson = await listRes.json();
                const found = listJson.data.find(c => c.id === claimId);

                if (found) {
                    console.log('✅ Claim found in list.');
                } else {
                    console.error('❌ Claim NOT found in list.');
                }

                // --- 5. Admin Approve Claim ---
                console.log('\n5. Admin Approving Claim...');
                const approveRes = await fetch(`${API_URL}/insurance/claims/${claimId}/status`, {
                    method: 'PUT',
                    headers: { ...headers, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        status: 'Approved',
                        admin_notes: 'Documents verified. Payment approved.'
                    })
                });

                if (!approveRes.ok) throw new Error(await approveRes.text());
                const approveJson = await approveRes.json();
                console.log('✅ Claim Status Updated:', approveJson.data.status);

                // --- 6. Verify Bill Payment ---
                console.log('\n6. Verifying Bill Payment...');
                const billCheckRes = await fetch(`${API_URL}/bills/${billId}`, { headers });
                const billCheck = await billCheckRes.json();
                const billObj = billCheck.data || billCheck; // Handle potential wrapper

                if (billObj.payment_status === 'Partial' || billObj.payment_status === 'Paid') {
                    console.log('✅ Bill Payment Status Updated:', billObj.payment_status);
                } else {
                    console.warn('⚠️ Bill Payment Status NOT updated:', billObj.payment_status);
                }

            } catch (err) {
                console.error('❌ Claim Flow Failed:', err.message);
            } finally {
                if (fs.existsSync(dummyFilePath)) fs.unlinkSync(dummyFilePath);
            }
        } else {
            console.error('❌ Skipping Claim Test due to missing Patient/Bill.');
        }

    } catch (error) {
        console.error('Test Script Error:', error);
    }
}

runTest();
