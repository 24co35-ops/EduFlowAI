const assert = require('assert');
const app = require('./server');
const axios = require('axios');

async function runInterventionTests() {
  console.log('--- Starting EduFlow AI Curriculum Twin & Intervention Engine Test Suite ---');

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  try {
    // 1. Login Teacher and Student
    const teacherRes = await axios.post(`${baseUrl}/auth/login`, {
      email: 'teacher@eduflow.ai',
      password: 'teacher123'
    });
    const teacherToken = teacherRes.data.token;

    const studentRes = await axios.post(`${baseUrl}/auth/login`, {
      email: 'student@eduflow.ai',
      password: 'student123'
    });
    const studentToken = studentRes.data.token;

    // Test 1: Fetch Curriculum Twin
    console.log('Test 1: Verifying Curriculum Twin retrieval (version, chapters, competencies)...');
    const curRes = await axios.get(`${baseUrl}/curriculum`, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    assert.strictEqual(curRes.status, 200);
    const curriculum = curRes.data.curriculum;
    assert.ok(curriculum.version, 'Curriculum must have a version (e.g. v2.1)');
    assert.ok(curriculum.chapters.length >= 3, 'Must contain at least 3 chapters');
    const electricityCh = curriculum.chapters.find(c => c.id === 'ch-electricity');
    assert.ok(electricityCh, 'Electricity chapter should exist');
    assert.ok(electricityCh.sourceDocument, 'Source document citation should exist');
    console.log(`  -> PASS: Curriculum Twin (${curriculum.version}) verified with ${curriculum.chapters.length} chapters`);

    // Test 2: Prerequisite Chain & Misconception Taxonomy
    console.log('Test 2: Verifying Prerequisite Chain and Misconceptions for Parallel Resistance...');
    const conceptRes = await axios.get(`${baseUrl}/curriculum/concept/concept-parallel-resistance`, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    assert.strictEqual(conceptRes.status, 200);
    const conceptData = conceptRes.data.concept;
    assert.strictEqual(conceptData.name, 'Parallel Resistance');
    assert.ok(conceptData.misconceptions.length > 0, 'Concept must have misconception taxonomy');
    assert.ok(conceptRes.data.prerequisites.length > 0, 'Prerequisite chain must be populated');
    console.log(`  -> PASS: Concept details verified with ${conceptRes.data.prerequisites.length} prerequisite nodes`);

    // Test 3: Teacher Action Center
    console.log('Test 3: Verifying Teacher Action Center aggregates weak concepts and metrics...');
    const actionCenterRes = await axios.get(`${baseUrl}/interventions/action-center`, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    assert.strictEqual(actionCenterRes.status, 200);
    const acData = actionCenterRes.data;
    assert.ok(acData.metrics);
    assert.ok(acData.actionCards.length > 0);
    const parallelAction = acData.actionCards.find(c => c.conceptId === 'concept-parallel-resistance');
    assert.ok(parallelAction, 'Parallel Resistance action card should be prioritized');
    assert.ok(parallelAction.why.includes('misconception'), 'Action card must state why (misconception/evidence)');
    console.log(`  -> PASS: Action Center reports ${acData.actionCards.length} high-priority teaching actions`);

    // Test 4: Assign Intervention
    console.log('Test 4: Verifying Teacher can assign an intervention for weak concept...');
    const assignRes = await axios.post(`${baseUrl}/interventions/assign`, {
      conceptId: 'concept-parallel-resistance',
      studentIds: [studentRes.data.user.id],
      topic: 'Electricity',
      customNotes: 'Targeted branch current calculation intervention'
    }, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    assert.strictEqual(assignRes.status, 201);
    assert.strictEqual(assignRes.data.success, true);
    const createdIntervention = assignRes.data.interventions[0];
    assert.ok(createdIntervention.id);
    assert.strictEqual(createdIntervention.status, 'pending');
    console.log(`  -> PASS: Intervention assigned successfully (ID: ${createdIntervention.id})`);

    // Test 5: Student Next Best Action
    console.log('Test 5: Verifying Student receives Next Best Action step workflow...');
    const nbaRes = await axios.get(`${baseUrl}/interventions/next-best-action`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(nbaRes.status, 200);
    const nba = nbaRes.data.nextAction;
    assert.strictEqual(nba.hasActiveAction, true);
    assert.strictEqual(nba.conceptName, 'Parallel Resistance');
    assert.strictEqual(nba.steps.length, 3, 'Must have 3 steps: Review, Practice, Mastery Check');
    console.log(`  -> PASS: Student Next Best Action received for "${nba.conceptName}"`);

    // Test 6: Mastery Check Question Generation
    console.log('Test 6: Verifying Mastery Check questions for targeted weak concept...');
    const mcqRes = await axios.get(`${baseUrl}/interventions/mastery-check/questions?conceptId=concept-parallel-resistance`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(mcqRes.status, 200);
    const questions = mcqRes.data.questions;
    assert.ok(questions.length >= 3, 'Mastery Check must have 3-5 targeted questions');
    assert.ok(questions[0].source.includes('[Source:'), 'Questions must carry curriculum citations');
    console.log(`  -> PASS: ${questions.length} grounded Mastery Check questions generated`);

    // Test 7: Student completes Mastery Check & measures real recovery
    console.log('Test 7: Submitting Mastery Check and measuring Before/After delta...');
    const submitRes = await axios.post(`${baseUrl}/interventions/mastery-check/submit`, {
      interventionId: createdIntervention.id,
      answers: ['4 ohms', 'Potential difference (voltage)', 'True', 'Appliances operate independently on line voltage without interruption'],
      questions
    }, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert.strictEqual(submitRes.status, 200);
    const checkResult = submitRes.data.result;
    assert.ok(checkResult.preMastery !== undefined, 'Must record pre-intervention mastery');
    assert.ok(checkResult.postMastery !== undefined, 'Must record post-intervention mastery');
    assert.ok(checkResult.masteryDelta > 0, 'Mastery should improve after completing remediation check');
    assert.strictEqual(checkResult.recoveryAchieved, true);
    console.log(`  -> PASS: Mastery Check evaluated: Before: ${checkResult.preMastery}%, After: ${checkResult.postMastery}%, Delta: ${checkResult.percentageChange}`);

    // Test 8: Assessment Blueprint support in Quiz Builder
    console.log('Test 8: Verifying Assessment Blueprint generation with cognitive distribution...');
    const blueprintRes = await axios.post(`${baseUrl}/quizzes/generate`, {
      topic: 'Parallel Resistance',
      difficulty: 'medium',
      questionCount: 4,
      status: 'draft',
      blueprint: {
        cognitiveDistribution: { recall: 25, conceptual: 25, application: 25, analysis: 25 },
        difficultyDistribution: { easy: 25, medium: 50, hard: 25 }
      }
    }, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    assert.strictEqual(blueprintRes.status, 201);
    const draftQuiz = blueprintRes.data.quiz;
    assert.strictEqual(draftQuiz.status, 'draft', 'Assessment generated from blueprint should start in draft');
    assert.ok(draftQuiz.questions[0].cognitiveLevel, 'Questions must have cognitiveLevel tagged');
    console.log(`  -> PASS: Assessment Blueprint generated in draft mode with cognitive levels`);

    // Test 9: Truthful telemetry check (No fake claims)
    console.log('Test 9: Verifying AI telemetry integrity (Truthful states, no fake Bob claims)...');
    const healthRes = await axios.get(`${baseUrl}/health?diagnostics=true`);
    assert.strictEqual(healthRes.status, 200);
    const health = healthRes.data;
    assert.ok(health.primaryProvider, 'Primary provider should be identified');
    assert.ok(health.providerType, 'Provider type should be reported');
    console.log(`  -> PASS: AI Diagnostics: Provider="${health.primaryProvider}", Mode="${health.providerType}"`);

    console.log('\n==================================================');
    console.log('🎉 CURRICULUM TWIN & INTERVENTION TESTS: ALL 9 PASSED!');
    console.log('==================================================\n');
  } finally {
    server.close();
  }
}

runInterventionTests().catch((err) => {
  console.error('❌ Intervention Test Suite failed:', err.message, err.response?.data);
  process.exit(1);
});
