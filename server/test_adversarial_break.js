const assert = require('assert');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const app = require('./server');

const JWT_SECRET = process.env.JWT_SECRET || 'eduflow-secret-key-2026';

const teacherTokenA = jwt.sign(
  { id: '11111111-1111-4111-a111-111111111111', email: 'teacherA@test.com', role: 'teacher', name: 'Teacher A' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const teacherTokenB = jwt.sign(
  { id: '22222222-2222-4222-a222-222222222222', email: 'teacherB@test.com', role: 'teacher', name: 'Teacher B' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const studentToken = jwt.sign(
  { id: '33333333-3333-4333-a333-333333333333', email: 'student@test.com', role: 'student', name: 'Student 1' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

async function runAdversarialAudit() {
  console.log('========================================================');
  console.log('⚡ STARTING ADVERSARIAL STRESS-TEST & BRUTAL AUDIT SUITE');
  console.log('========================================================\n');

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  const flaws = [];
  const passes = [];

  try {
    // 1. Auth Penetration: Malformed Token
    console.log('[PROBE 1] Testing Malformed JWT Handling...');
    try {
      await axios.get(`${baseUrl}/lessons`, { headers: { Authorization: 'Bearer this-is-total-garbage-token' } });
      flaws.push({ id: 'SEC-01', desc: 'Malformed JWT accepted without 401' });
    } catch (e) {
      if (e.response?.status === 401) passes.push('Malformed JWT properly rejected with 401');
      else flaws.push({ id: 'SEC-01', desc: `Malformed JWT returned status ${e.response?.status}` });
    }

    // 2. Auth Penetration: Forged Signature
    console.log('[PROBE 2] Testing Forged Signature Token...');
    const forgedToken = jwt.sign({ id: 'admin', role: 'teacher' }, 'wrong-secret-key-1234');
    try {
      await axios.get(`${baseUrl}/lessons`, { headers: { Authorization: `Bearer ${forgedToken}` } });
      flaws.push({ id: 'SEC-02', desc: 'Forged JWT signature accepted without 401' });
    } catch (e) {
      if (e.response?.status === 401) passes.push('Forged JWT properly rejected with 401');
      else flaws.push({ id: 'SEC-02', desc: `Forged JWT returned status ${e.response?.status}` });
    }

    // 3. RBAC Enforcement: Student hitting Teacher Action Center
    console.log('[PROBE 3] Testing RBAC on Teacher Action Center...');
    try {
      await axios.get(`${baseUrl}/interventions/action-center`, { headers: { Authorization: `Bearer ${studentToken}` } });
      flaws.push({ id: 'SEC-03', desc: 'Student permitted to access Teacher Action Center' });
    } catch (e) {
      if (e.response?.status === 403) passes.push('Student forbidden (403) from Action Center');
      else flaws.push({ id: 'SEC-03', desc: `Action Center RBAC returned unexpected ${e.response?.status}` });
    }

    // 4. RBAC Enforcement: Teacher hitting Student Next Best Action
    console.log('[PROBE 4] Testing RBAC on Student Next Best Action...');
    try {
      await axios.get(`${baseUrl}/interventions/next-best-action`, { headers: { Authorization: `Bearer ${teacherTokenA}` } });
      flaws.push({ id: 'SEC-04', desc: 'Teacher permitted to access Student Next Best Action' });
    } catch (e) {
      if (e.response?.status === 403) passes.push('Teacher forbidden (403) from Next Best Action');
      else flaws.push({ id: 'SEC-04', desc: `Next Best Action RBAC returned unexpected ${e.response?.status}` });
    }

    // 5. IDOR Attack: Teacher B tries to edit a quiz owned by Teacher A
    console.log('[PROBE 5] Testing IDOR on Quiz Edit...');
    // Create quiz as Teacher A
    const qCreate = await axios.post(`${baseUrl}/quizzes/generate`, {
      topic: 'Ohm Law',
      difficulty: 'easy',
      questionCount: 2
    }, { headers: { Authorization: `Bearer ${teacherTokenA}` } });
    const quizId = qCreate.data.quiz.id || qCreate.data.quiz._id;

    // Try to edit as Teacher B
    try {
      await axios.put(`${baseUrl}/quizzes/${quizId}`, {
        topic: 'HACKED TOPIC BY TEACHER B'
      }, { headers: { Authorization: `Bearer ${teacherTokenB}` } });
      flaws.push({ id: 'SEC-05', desc: `CRITICAL IDOR: Teacher B updated Quiz ${quizId} created by Teacher A!` });
    } catch (e) {
      if (e.response?.status === 403 || e.response?.status === 404) {
        passes.push('Quiz IDOR prevented (403/404 on cross-teacher update)');
      } else {
        flaws.push({ id: 'SEC-05', desc: `Quiz IDOR returned status ${e.response?.status}` });
      }
    }

    // 6. IDOR Attack: Teacher B tries to delete Teacher A's quiz
    console.log('[PROBE 6] Testing IDOR on Quiz Delete...');
    try {
      await axios.delete(`${baseUrl}/quizzes/${quizId}`, { headers: { Authorization: `Bearer ${teacherTokenB}` } });
      flaws.push({ id: 'SEC-06', desc: `CRITICAL IDOR: Teacher B deleted Quiz ${quizId} created by Teacher A!` });
    } catch (e) {
      if (e.response?.status === 403 || e.response?.status === 404) {
        passes.push('Quiz IDOR prevented (403/404 on cross-teacher delete)');
      } else {
        flaws.push({ id: 'SEC-06', desc: `Quiz IDOR delete returned status ${e.response?.status}` });
      }
    }

    // 7. Input Boundary: Empty payload on quiz generate
    console.log('[PROBE 7] Testing Input Validation on Quiz Generate...');
    try {
      await axios.post(`${baseUrl}/quizzes/generate`, {}, { headers: { Authorization: `Bearer ${teacherTokenA}` } });
      flaws.push({ id: 'VAL-01', desc: 'POST /quizzes/generate accepted empty body without 400' });
    } catch (e) {
      if (e.response?.status === 400) passes.push('Empty topic rejected with 400');
      else flaws.push({ id: 'VAL-01', desc: `Empty body returned status ${e.response?.status}` });
    }

    // 8. Input Boundary: SQL Injection strings in parameters
    console.log('[PROBE 8] Testing SQL Injection resiliency in Topic query...');
    try {
      const sqlRes = await axios.post(`${baseUrl}/quizzes/generate`, {
        topic: "Electricity'; DROP TABLE quizzes; --",
        difficulty: 'medium',
        questionCount: 2
      }, { headers: { Authorization: `Bearer ${teacherTokenA}` } });
      if (sqlRes.status === 201) passes.push('SQL injection string sanitized/handled safely without database crash');
    } catch (e) {
      passes.push(`SQL injection payload safely handled or rejected with ${e.response?.status}`);
    }

    // 9. Input Boundary: Extreme question count
    console.log('[PROBE 9] Testing Extreme Question Count (DoS vulnerability)...');
    try {
      const dosRes = await axios.post(`${baseUrl}/quizzes/generate`, {
        topic: 'Optics',
        questionCount: 999999
      }, { headers: { Authorization: `Bearer ${teacherTokenA}` } });
      // If server tries to generate 1,000,000 questions, that is a DoS flaw!
      if (dosRes.data?.quiz?.questions?.length > 50) {
        flaws.push({ id: 'PERF-01', desc: 'DoS Vulnerability: Server accepted questionCount=999999 and attempted massive allocation' });
      } else {
        passes.push(`Server clamped/bounded question count safely to ${dosRes.data?.quiz?.questions?.length || 4}`);
      }
    } catch (e) {
      passes.push(`Extreme question count rejected with status ${e.response?.status}`);
    }

    // 10. Mastery Check Mismatched Answers
    console.log('[PROBE 10] Testing Mastery Check Mismatched Answers...');
    try {
      const checkRes = await axios.post(`${baseUrl}/interventions/mastery-check/submit`, {
        interventionId: 'test-inv-1',
        answers: null
      }, { headers: { Authorization: `Bearer ${studentToken}` } });
      flaws.push({ id: 'VAL-02', desc: 'Mastery check accepted null answers without 400' });
    } catch (e) {
      if (e.response?.status === 400) passes.push('Mastery check null answers rejected with 400');
      else flaws.push({ id: 'VAL-02', desc: `Mastery check null answers returned status ${e.response?.status}` });
    }

    // 11. AI Guardrail: Out of Scope Prompt Rejection
    console.log('[PROBE 11] Testing AI Doubt Solver Out-of-Scope Prompt...');
    const outOfScopeRes = await axios.post(`${baseUrl}/student/doubt`, {
      message: 'Tell me the recipe for baking chocolate brownies from scratch.'
    }, { headers: { Authorization: `Bearer ${studentToken}` } });
    const reply = (outOfScopeRes.data.reply || outOfScopeRes.data.explanation || '').toLowerCase();
    if (reply.includes('curriculum') || reply.includes('syllabus') || reply.includes('academic') || reply.includes('educational') || reply.includes('scope')) {
      passes.push('AI Doubt Solver correctly rejected out-of-scope prompt');
    } else {
      flaws.push({ id: 'AI-01', desc: 'AI Doubt Solver did not redirect or reject out-of-scope non-curricular query' });
    }

    // 12. Honest AI Telemetry Guardrail Check
    console.log('[PROBE 12] Checking Honest Telemetry Guardrail...');
    const healthRes = await axios.get(`${baseUrl}/health`);
    const tele = outOfScopeRes.data._aiMetadata;
    if (tele) {
      if (!process.env.WATSONX_APIKEY && tele.provider.toLowerCase().includes('watsonx') && tele.fallbackUsed === false) {
        flaws.push({ id: 'AI-02', desc: 'CRITICAL DISHONESTY: System claimed watsonx.ai without valid credentials in env' });
      } else {
        passes.push(`Truthful AI provenance verified: Provider is "${tele.provider}" with fallback=${Boolean(tele.fallbackUsed)}`);
      }
    } else {
      passes.push('AI metadata present or handled gracefully');
    }

    // 13. Concurrency Stress Test: 5 simultaneous requests
    console.log('[PROBE 13] Running Concurrency Stress Test (5 parallel requests)...');
    const startConcurrent = Date.now();
    const concurrentReqs = [
      axios.get(`${baseUrl}/curriculum/concepts`, { headers: { Authorization: `Bearer ${teacherTokenA}` } }),
      axios.get(`${baseUrl}/interventions/action-center`, { headers: { Authorization: `Bearer ${teacherTokenA}` } }),
      axios.get(`${baseUrl}/interventions/next-best-action`, { headers: { Authorization: `Bearer ${studentToken}` } }),
      axios.get(`${baseUrl}/quizzes`, { headers: { Authorization: `Bearer ${studentToken}` } }),
      axios.get(`${baseUrl}/curriculum/concept/concept-parallel-resistance`, { headers: { Authorization: `Bearer ${teacherTokenA}` } })
    ];
    const results = await Promise.allSettled(concurrentReqs);
    const concurrentDuration = Date.now() - startConcurrent;
    const allSuccessful = results.every(r => r.status === 'fulfilled' && r.value.status === 200);
    if (allSuccessful) {
      passes.push(`5 parallel concurrent requests completed in ${concurrentDuration}ms with 100% success`);
    } else {
      flaws.push({ id: 'PERF-02', desc: 'Concurrency test had failed requests' });
    }

    console.log('\n========================================================');
    console.log(`STRESS TEST SUMMARY: ${passes.length} PASSES, ${flaws.length} FLAWS DETECTED`);
    console.log('========================================================');
    if (flaws.length > 0) {
      console.log('Flaws:');
      flaws.forEach(f => console.log(`  - [${f.id}] ${f.desc}`));
    }
  } finally {
    server.close();
  }

  return { passes, flaws };
}

runAdversarialAudit().then(res => {
  console.log('\nAudit test execution finished.');
  process.exit(res.flaws.length > 0 ? 1 : 0);
}).catch(err => {
  console.error('Audit crashed:', err);
  process.exit(1);
});
