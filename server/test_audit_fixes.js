const assert = require('assert');
const app = require('./server');
const axios = require('axios');

async function runTests() {
  console.log('--- Starting EduFlow AI Security & RBAC Verification ---');

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  try {
    // Test 1: Unauthenticated request must return 401 (Not demo-teacher)
    console.log('Test 1: Verifying unauthenticated request returns 401...');
    let t1Failed = false;
    try {
      await axios.get(`${baseUrl}/lessons`);
    } catch (err) {
      assert.strictEqual(err.response?.status, 401, 'Expected 401 Unauthorized');
      assert.strictEqual(err.response?.data?.success, false);
      t1Failed = true;
    }
    assert.strictEqual(t1Failed, true, 'Unauthenticated request should have failed with 401');
    console.log('  -> PASS: 401 received on unauthenticated GET /api/lessons');

    // Test 2: Login as teacher
    console.log('Test 2: Logging in as teacher...');
    const teacherLoginRes = await axios.post(`${baseUrl}/auth/login`, {
      email: 'teacher@eduflow.ai',
      password: 'teacher123'
    });
    assert.strictEqual(teacherLoginRes.status, 200);
    assert.strictEqual(teacherLoginRes.data.success, true);
    const teacherToken = teacherLoginRes.data.token;
    assert.ok(teacherToken, 'Teacher token should be returned');
    assert.strictEqual(teacherLoginRes.data.user.role, 'teacher');
    console.log('  -> PASS: Teacher login successful with signed JWT');

    // Test 3: Login as student
    console.log('Test 3: Logging in as student...');
    const studentLoginRes = await axios.post(`${baseUrl}/auth/login`, {
      email: 'student@eduflow.ai',
      password: 'student123'
    });
    assert.strictEqual(studentLoginRes.status, 200);
    assert.strictEqual(studentLoginRes.data.success, true);
    const studentToken = studentLoginRes.data.token;
    assert.ok(studentToken, 'Student token should be returned');
    assert.strictEqual(studentLoginRes.data.user.role, 'student');
    console.log('  -> PASS: Student login successful with signed JWT');

    // Test 4: Student accessing teacher-only endpoint (/student/analytics)
    console.log('Test 4: Verifying student is denied (403) from teacher analytics...');
    let t4Failed = false;
    try {
      await axios.get(`${baseUrl}/student/analytics`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
    } catch (err) {
      assert.strictEqual(err.response?.status, 403, 'Expected 403 Forbidden for student on analytics');
      t4Failed = true;
    }
    assert.strictEqual(t4Failed, true, 'Student accessing teacher analytics should receive 403');
    console.log('  -> PASS: 403 Forbidden enforced on student accessing teacher analytics');

    // Test 5: Teacher accessing student-only endpoint (/student/progress)
    console.log('Test 5: Verifying teacher is denied (403) from student progress...');
    let t5Failed = false;
    try {
      await axios.get(`${baseUrl}/student/progress`, {
        headers: { Authorization: `Bearer ${teacherToken}` }
      });
    } catch (err) {
      assert.strictEqual(err.response?.status, 403, 'Expected 403 Forbidden for teacher on student progress');
      t5Failed = true;
    }
    assert.strictEqual(t5Failed, true, 'Teacher accessing student progress should receive 403');
    console.log('  -> PASS: 403 Forbidden enforced on teacher accessing student progress');

    // Test 6: Teacher can access teacher endpoints
    console.log('Test 6: Verifying teacher can access teacher endpoints...');
    const teacherLessonsRes = await axios.get(`${baseUrl}/lessons`, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    assert.strictEqual(teacherLessonsRes.status, 200);
    assert.ok(Array.isArray(teacherLessonsRes.data.lessons));
    console.log('  -> PASS: Teacher successfully accessed GET /api/lessons');

    // Test 7: Student can access student progress & flashcards
    console.log('Test 7: Verifying student can access student progress...');
    const studentProgRes = await axios.get(`${baseUrl}/student/progress`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(studentProgRes.status, 200);
    assert.ok(studentProgRes.data.summary);
    console.log('  -> PASS: Student successfully accessed GET /api/student/progress');

    // Test 8: Health endpoint reports correct status
    console.log('Test 8: Verifying health endpoint...');
    const healthRes = await axios.get(`${baseUrl}/health`);
    assert.strictEqual(healthRes.status, 200);
    assert.strictEqual(healthRes.data.status, 'online');
    assert.strictEqual(typeof healthRes.data.databaseConnected, 'boolean');
    console.log('  -> PASS: Health check reports databaseConnected and AI status correctly');

    // Test 9: Password validation rejects short passwords (< 8 chars)
    console.log('Test 9: Verifying registration password length check (< 8 chars)...');
    let t9Failed = false;
    try {
      await axios.post(`${baseUrl}/auth/register`, {
        name: 'Short Pass',
        email: 'shortpass@example.com',
        password: 'short'
      });
    } catch (err) {
      assert.strictEqual(err.response?.status, 400);
      assert.ok(err.response?.data?.message?.includes('8 characters'));
      t9Failed = true;
    }
    assert.strictEqual(t9Failed, true, 'Short password should be rejected with 400');
    console.log('  -> PASS: Passwords under 8 characters properly rejected');

    // Test 10: Teacher lesson ownership check
    console.log('Test 10: Verifying lesson plan ownership check on translation...');
    // Register Teacher 2
    const teacher2Res = await axios.post(`${baseUrl}/auth/register`, {
      name: 'Teacher Two',
      email: 'teacher2@example.com',
      password: 'password123',
      role: 'teacher'
    });
    const teacher2Token = teacher2Res.data.token;

    // Teacher 1 creates a lesson
    const newLessonRes = await axios.post(
      `${baseUrl}/lessons/generate`,
      { subject: 'Chemistry Unit 1', syllabusText: 'Atoms, Molecules, Chemical Reactions' },
      { headers: { Authorization: `Bearer ${teacherToken}` } }
    );
    const lessonId = newLessonRes.data.lesson._id;

    // Teacher 2 attempts to translate Teacher 1's lesson -> Expect 403
    let t10Failed = false;
    try {
      await axios.post(
        `${baseUrl}/lessons/translate`,
        { lessonId, targetLang: 'hi' },
        { headers: { Authorization: `Bearer ${teacher2Token}` } }
      );
    } catch (err) {
      assert.strictEqual(err.response?.status, 403, 'Expected 403 Forbidden on translating unowned lesson');
      t10Failed = true;
    }
    assert.strictEqual(t10Failed, true, 'Teacher 2 should not be able to translate Teacher 1 lesson');
    console.log('  -> PASS: 403 Forbidden prevents non-owner teacher from modifying another teacher lesson');

    // Test 11: Flashcard deck isolation between students
    console.log('Test 11: Verifying student flashcard isolation...');
    // Register Student 2
    const student2Res = await axios.post(`${baseUrl}/auth/register`, {
      name: 'Student Two',
      email: 'student2@example.com',
      password: 'password123',
      role: 'student'
    });
    const student2Token = student2Res.data.token;

    // Student 1 generates flashcards
    await axios.post(
      `${baseUrl}/student/flashcards/generate`,
      { title: 'Student 1 Exclusive Deck', text: 'Photosynthesis occurs in chloroplasts.' },
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );

    // Student 2 fetches flashcards -> must NOT contain Student 1 Exclusive Deck
    const student2Decks = await axios.get(`${baseUrl}/student/flashcards`, {
      headers: { Authorization: `Bearer ${student2Token}` }
    });
    const foundOtherDeck = student2Decks.data.decks.some(d => d.title === 'Student 1 Exclusive Deck');
    assert.strictEqual(foundOtherDeck, false, 'Student 2 should not see Student 1 flashcards');
    console.log('  -> PASS: Flashcard decks strictly isolated per student');

    console.log('\n==================================================');
    console.log('🎉 ALL SECURITY, AUTHENTICATION & RBAC TESTS PASSED!');
    console.log('==================================================\n');
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err.message, err.response?.data);
  process.exit(1);
});
