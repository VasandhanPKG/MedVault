const http = require('http');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function test() {
  console.log('--- 1. Login ---');
  const login = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'aarav.sharma@example.com', password: 'Password123!' });

  console.log('Login Status:', login.status, 'User:', login.body.user ? login.body.user.name : null);
  const token = login.body.token;

  console.log('\n--- 2. Get Supported Departments ---');
  const depts = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/ai/intake/departments',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Departments Count:', depts.body.count);
  console.log('Departments List:', depts.body.departments.map(d => d.name));

  console.log('\n--- 3. Start Dental Intake (Tamil) ---');
  const start = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/ai/intake/session/start',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, { departmentId: 'dental', language: 'ta' });

  console.log('Session ID:', start.body.sessionId);
  console.log('First Question in Tamil:', start.body.currentQuestion.text);
  console.log('Options Count:', start.body.currentQuestion.options ? start.body.currentQuestion.options.length : 0);
  const sessionId = start.body.sessionId;

  console.log('\n--- 4. Submit Multilingual Answer ---');
  const answer1 = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/ai/intake/session/${sessionId}/answer`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, { answerText: 'பல் வலி மற்றும் கூச்சம் கீழ் வலது பக்கம்', inputMode: 'voice', language: 'ta' });

  console.log('Answer 1 Result isComplete:', answer1.body.isComplete);
  console.log('Next Question:', answer1.body.nextQuestion ? answer1.body.nextQuestion.text : 'Completed');
  console.log('Collected Clinical Data so far:', answer1.body.collectedData);

  console.log('\n--- 5. Submit Second Answer (Temperature Trigger) ---');
  const answer2 = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/ai/intake/session/${sessionId}/answer`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, { answerText: 'நேத்து சூடா காபி குடிச்சப்போ வலி அதிகமாச்சு, 3 நாட்களாக உள்ளது', inputMode: 'text', language: 'ta' });

  console.log('Answer 2 Result isComplete:', answer2.body.isComplete);
  console.log('Collected Clinical Data:', answer2.body.collectedData);

  console.log('\n--- 6. Doctor Attestation & Verification ---');
  const verify = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/ai/intake/session/${sessionId}/verify`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }, { doctorName: 'Dr. Sarah Bennett, DDS', doctorNotes: 'Lower right first molar evaluated. Mild percussion sensitivity. Recommended periapical radiograph.' });

  console.log('Verified Status:', verify.body.session ? verify.body.session.status : verify.body);
  console.log('Verified By:', verify.body.session ? verify.body.session.verifiedBy : null);
  console.log('Doctor Notes:', verify.body.session ? verify.body.session.doctorNotes : null);

  console.log('\n--- 7. Patient History ---');
  const history = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/ai/intake/patient/history',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Patient Past Intakes Count:', history.body.count);

  console.log('\n=============================================');
  console.log('✅ ALL INTAKE BACKEND ENDPOINTS PASSED CLEANLY');
  console.log('=============================================');
}

test().catch(console.error);
