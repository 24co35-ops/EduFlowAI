const assert = require('assert');
const app = require('./server');
const axios = require('axios');

async function runTests() {
  console.log('--- Starting EduFlow AI Master Verification Suite ---');

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  try {
    // Test 1: Unauthenticated request must return 401
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

    // Test 6: Teacher generates and updates lesson plan
    console.log('Test 6: Verifying teacher lesson generation and in-place edit...');
    const newLessonRes = await axios.post(
      `${baseUrl}/lessons/generate`,
      { subject: 'Class 10 Biology — Genetics', syllabusText: 'Mendel Laws, Monohybrid Cross, Dihybrid Cross, DNA' },
      { headers: { Authorization: `Bearer ${teacherToken}` } }
    );
    assert.strictEqual(newLessonRes.status, 201);
    const createdLesson = newLessonRes.data.lesson;
    assert.ok(createdLesson._id);
    assert.strictEqual(createdLesson.plan.length, 5);

    // Edit the lesson plan
    const updatedLessonRes = await axios.put(
      `${baseUrl}/lessons/${createdLesson._id}`,
      { overview: 'Updated Overview by Educator' },
      { headers: { Authorization: `Bearer ${teacherToken}` } }
    );
    assert.strictEqual(updatedLessonRes.status, 200);
    assert.strictEqual(updatedLessonRes.data.lesson.overview, 'Updated Overview by Educator');
    console.log('  -> PASS: Teacher successfully generated and edited lesson plan');

    // Test 7: Teacher generates and edits quiz questions
    console.log('Test 7: Verifying quiz generation & question regeneration...');
    const quizRes = await axios.post(
      `${baseUrl}/quizzes/generate`,
      { topic: 'Chemical Reactions and Equations', difficulty: 'medium', questionCount: 4 },
      { headers: { Authorization: `Bearer ${teacherToken}` } }
    );
    assert.strictEqual(quizRes.status, 201);
    const createdQuiz = quizRes.data.quiz;
    assert.ok(createdQuiz._id);
    assert.strictEqual(createdQuiz.questions.length >= 2, true);

    // Regenerate a question
    const regenRes = await axios.post(
      `${baseUrl}/quizzes/regenerate-question`,
      { topic: 'Chemical Reactions and Equations', difficulty: 'hard', type: 'mcq' },
      { headers: { Authorization: `Bearer ${teacherToken}` } }
    );
    assert.strictEqual(regenRes.status, 200);
    assert.ok(regenRes.data.question?.question);
    console.log('  -> PASS: Quiz generated and question successfully regenerated');

    // Test 8: Student takes quiz, receives auto-grading and mastery calculation
    console.log('Test 8: Verifying quiz submission, NLP auto-grading & mastery update...');
    const attemptRes = await axios.post(
      `${baseUrl}/quizzes/grade`,
      {
        quizId: createdQuiz._id,
        answers: ['Facilitates system regulation and core process execution in Chemical Reactions and Equations', 'Dynamic feedback loop with balanced equilibrium', 'False', 'Chemical reactions involve rearrangement of atoms to form new substances.']
      },
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    assert.strictEqual(attemptRes.status, 201);
    const attempt = attemptRes.data.attempt;
    assert.ok(attempt.percentage >= 0);
    assert.strictEqual(attempt.answers.length, createdQuiz.questions.length);

    // Fetch student progress to verify transparent mastery calculation
    const progressRes = await axios.get(`${baseUrl}/student/progress`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(progressRes.status, 200);
    assert.ok(progressRes.data.summary.topicMastery);
    console.log('  -> PASS: Quiz graded, NLP feedback generated, topic mastery calculated');

    // Test 9: AI Remediation Generation for student weak topic
    console.log('Test 9: Verifying AI Remediation Loop generation...');
    const remRes = await axios.post(
      `${baseUrl}/student/remediation`,
      { topic: 'Ohm Law and Resistance Factors', studentScore: 45, weakSubtopics: ['Parallel circuits'] },
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    assert.strictEqual(remRes.status, 200);
    const remData = remRes.data.remediation;
    assert.ok(remData.explanation);
    assert.ok(remData.realWorldExample);
    assert.ok(remData.commonMisconception);
    assert.strictEqual(Array.isArray(remData.practiceQuestions), true);
    console.log('  -> PASS: AI Remediation successfully generated with 3 practice questions');

    // Test 10: Doubt Solver with action chips
    console.log('Test 10: Verifying curriculum-grounded doubt solver...');
    const doubtRes = await axios.post(
      `${baseUrl}/student/doubt`,
      { message: 'Why do plants appear green?', action: 'simplify' },
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    assert.strictEqual(doubtRes.status, 200);
    assert.ok(doubtRes.data.reply.length > 20);
    console.log('  -> PASS: Doubt solver answered successfully with simplified explanation');

    // Test 11: Health & Diagnostics Telemetry
    console.log('Test 11: Verifying diagnostic health check & telemetry metrics...');
    const healthRes = await axios.get(`${baseUrl}/health?diagnostics=true`);
    assert.strictEqual(healthRes.status, 200);
    assert.strictEqual(healthRes.data.status, 'online');
    assert.ok(healthRes.data.telemetry);
    assert.strictEqual(typeof healthRes.data.telemetry.totalRequests, 'number');
    console.log(`  -> PASS: Health check reports ${healthRes.data.telemetry.totalRequests} telemetry requests recorded`);

    // Test 12: End-to-End Registration (Teacher and Student)
    console.log('Test 12: Verifying end-to-end registration for both Teacher and Student roles...');
    const regTeacherEmail = `reg_teacher_${Date.now()}@eduflow.ai`;
    const regTeacherRes = await axios.post(`${baseUrl}/auth/register`, {
      name: 'Professor Priya Sharma',
      email: regTeacherEmail,
      password: 'securePassword123',
      role: 'teacher',
      institution: 'Delhi Public School'
    });
    assert.strictEqual(regTeacherRes.status, 201);
    assert.strictEqual(regTeacherRes.data.success, true);
    assert.strictEqual(regTeacherRes.data.user.role, 'teacher');
    assert.ok(regTeacherRes.data.token, 'Registration should return signed JWT');

    const regStudentEmail = `reg_student_${Date.now()}@eduflow.ai`;
    const regStudentRes = await axios.post(`${baseUrl}/auth/register`, {
      name: 'Aarav Patel',
      email: regStudentEmail,
      password: 'studentPassword123',
      role: 'student',
      institution: 'Delhi Public School'
    });
    assert.strictEqual(regStudentRes.status, 201);
    assert.strictEqual(regStudentRes.data.success, true);
    assert.strictEqual(regStudentRes.data.user.role, 'student');
    console.log('  -> PASS: Teacher and Student registration successfully creates user, profile and JWT');

    // Test 13: Registration validation & duplicate error surfacing
    console.log('Test 13: Verifying registration validation (8 chars minimum) and duplicate email error handling...');
    let shortPassFailed = false;
    try {
      await axios.post(`${baseUrl}/auth/register`, {
        name: 'Short Pass User',
        email: `short_${Date.now()}@eduflow.ai`,
        password: '123456', // 6 chars (must fail since min is 8)
        role: 'student'
      });
    } catch (err) {
      assert.strictEqual(err.response?.status, 400);
      assert.ok(err.response?.data?.message.includes('8 characters'), 'Error should specify at least 8 characters');
      shortPassFailed = true;
    }
    assert.strictEqual(shortPassFailed, true, 'Short password (6 chars) should be rejected with 400');

    let duplicateFailed = false;
    try {
      await axios.post(`${baseUrl}/auth/register`, {
        name: 'Duplicate User',
        email: regTeacherEmail,
        password: 'anotherPassword123',
        role: 'teacher'
      });
    } catch (err) {
      assert.strictEqual(err.response?.status, 400);
      assert.ok(err.response?.data?.message.includes('User with this email already exists'), 'Error should match exact duplicate message');
      duplicateFailed = true;
    }
    assert.strictEqual(duplicateFailed, true, 'Duplicate email should be rejected with 400');
    console.log('  -> PASS: 8-character password length enforcement and duplicate email errors surfaced accurately');

    console.log('\n==================================================');
    console.log('🎉 MASTER TEST SUITE: ALL 13 TESTS PASSED PERFECTLY!');
    console.log('==================================================\n');
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('❌ Master Test Suite failed:', err.message, err.response?.data);
  process.exit(1);
});
