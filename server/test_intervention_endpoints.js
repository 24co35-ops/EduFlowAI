const assert = require('assert');
const app = require('./server');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'eduflow-secret-key-2026';

const teacherToken = jwt.sign(
  { id: 'teacher-test-1', email: 'teacher@test.com', role: 'teacher', name: 'Test Teacher' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const studentToken = jwt.sign(
  { id: 'student-test-1', email: 'student@test.com', role: 'student', name: 'Test Student' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

async function runTests() {
  console.log('--- Testing Curriculum & Intervention Endpoints ---');

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  try {
    // 1. Get Curriculum Twin
    console.log('Test 1: GET /api/curriculum...');
    const curRes = await axios.get(`${baseUrl}/curriculum`, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    assert.strictEqual(curRes.status, 200);
    assert.strictEqual(curRes.data.success, true);
    console.log('  -> PASS: Curriculum graph returned with concepts count:', curRes.data.curriculum?.concepts?.length);

    // 2. Get Concepts
    console.log('Test 2: GET /api/curriculum/concepts...');
    const conRes = await axios.get(`${baseUrl}/curriculum/concepts`, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    assert.strictEqual(conRes.status, 200);
    assert.strictEqual(conRes.data.success, true);
    console.log('  -> PASS: Concepts count:', conRes.data.concepts?.length);

    // 3. Get Concept by ID
    console.log('Test 3: GET /api/curriculum/concept/:id...');
    const singleConRes = await axios.get(`${baseUrl}/curriculum/concept/concept-parallel-resistance`, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    assert.strictEqual(singleConRes.status, 200);
    assert.ok(singleConRes.data.concept);
    console.log('  -> PASS: Concept found:', singleConRes.data.concept.name);

    // 4. Action Center Data (Teacher)
    console.log('Test 4: GET /api/interventions/action-center...');
    const acRes = await axios.get(`${baseUrl}/interventions/action-center`, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    assert.strictEqual(acRes.status, 200);
    assert.ok(acRes.data.metrics);
    console.log('  -> PASS: Action cards count:', acRes.data.actionCards?.length);

    // 5. Assign Intervention (Teacher)
    console.log('Test 5: POST /api/interventions/assign...');
    const assignRes = await axios.post(`${baseUrl}/interventions/assign`, {
      conceptId: 'concept-parallel-resistance',
      studentIds: ['student-test-1'],
      topic: 'Parallel Resistance',
      customNotes: 'Review reciprocal formula'
    }, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    assert.strictEqual(assignRes.status, 201);
    assert.strictEqual(assignRes.data.success, true);
    const assignedInterventionId = assignRes.data.interventions[0]?.id;
    console.log('  -> PASS: Intervention assigned, ID:', assignedInterventionId);

    // 6. Student Next Best Action
    console.log('Test 6: GET /api/interventions/next-best-action...');
    const nbaRes = await axios.get(`${baseUrl}/interventions/next-best-action`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(nbaRes.status, 200);
    assert.ok(nbaRes.data.nextAction);
    console.log('  -> PASS: Next best action concept:', nbaRes.data.nextAction.conceptName || nbaRes.data.nextAction.concept);

    // 7. Get Mastery Check Questions
    console.log('Test 7: GET /api/interventions/mastery-check/questions...');
    const mcqRes = await axios.get(`${baseUrl}/interventions/mastery-check/questions?conceptId=concept-parallel-resistance`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(mcqRes.status, 200);
    assert.ok(Array.isArray(mcqRes.data.questions));
    console.log('  -> PASS: Questions returned count:', mcqRes.data.questions.length);

    // 8. Submit Mastery Check
    console.log('Test 8: POST /api/interventions/mastery-check/submit...');
    const submitRes = await axios.post(`${baseUrl}/interventions/mastery-check/submit`, {
      interventionId: assignedInterventionId,
      answers: ['4 ohms', 'Potential difference (voltage)', 'True', 'Full line voltage and independent switching'],
      questions: mcqRes.data.questions
    }, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(submitRes.status, 200);
    assert.ok(submitRes.data.result);
    console.log('  -> PASS: Post-check score:', submitRes.data.result.postMastery, '% | Delta:', submitRes.data.result.masteryDelta);

    // 9. Student My Interventions
    console.log('Test 9: GET /api/interventions/my...');
    const myRes = await axios.get(`${baseUrl}/interventions/my`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(myRes.status, 200);
    assert.ok(Array.isArray(myRes.data.interventions));
    console.log('  -> PASS: My interventions count:', myRes.data.interventions.length);

    console.log('\n==================================================');
    console.log('🎉 ALL 9 CURRICULUM & INTERVENTION TESTS PASSED!');
    console.log('==================================================\n');
  } finally {
    server.close();
  }
}

runTests().then(() => process.exit(0)).catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
