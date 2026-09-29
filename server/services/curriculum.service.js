/**
 * Curriculum Twin Service
 * Implements living, versioned Curriculum Learning Map:
 * Institution Curriculum -> Chapter -> Topic -> Subtopic -> Concept -> Competencies
 * Includes Prerequisites Graph, Misconception Taxonomy, and Grounded Source Citations.
 */

class CurriculumTwinService {
  constructor() {
    this.curriculumStore = new Map();
    this._initializeDefaultCurriculum();
  }

  _initializeDefaultCurriculum() {
    const defaultCurriculum = {
      id: 'curriculum-class10-science-v2',
      institution: 'Default Institution',
      subject: 'Class 10 Science',
      version: 'v2.1',
      publishedAt: '2026-08-15T00:00:00.000Z',
      stats: {
        chaptersCount: 5,
        topicsCount: 22,
        conceptsCount: 38,
        competenciesCount: 16
      },
      chapters: [
        {
          id: 'ch-electricity',
          chapterNumber: 12,
          title: 'Electricity',
          sourceDocument: 'NCERT Class 10 Science',
          pageRange: 'Pages 199–220',
          topics: [
            {
              id: 'top-current-potential',
              title: 'Electric Current and Potential Difference',
              concepts: [
                {
                  id: 'concept-electric-current',
                  name: 'Electric Current & Charge Flow',
                  competency: 'State and calculate rate of electric charge flow (I = Q/t)',
                  cognitiveLevel: 'Recall',
                  prerequisites: [],
                  sources: [{ doc: 'NCERT Science Ch 12', page: 200, chunkId: 'ch12_p200_c1' }],
                  misconceptions: [
                    'Assuming current is consumed or used up as it flows through a circuit',
                    'Confusing electric current (flow rate) with potential difference (driving pressure)'
                  ]
                },
                {
                  id: 'concept-potential-difference',
                  name: 'Potential Difference & Work Done',
                  competency: 'Relate work done per unit charge to voltage (V = W/Q)',
                  cognitiveLevel: 'Conceptual',
                  prerequisites: [],
                  sources: [{ doc: 'NCERT Science Ch 12', page: 202, chunkId: 'ch12_p202_c2' }],
                  misconceptions: [
                    'Believing voltage flows through the circuit rather than existing across two points'
                  ]
                }
              ]
            },
            {
              id: 'top-resistance-ohms',
              title: "Resistance and Ohm's Law",
              concepts: [
                {
                  id: 'concept-resistance-resistivity',
                  name: 'Resistance & Resistivity Factors',
                  competency: 'Analyze how conductor length, cross-sectional area, and material affect resistance',
                  cognitiveLevel: 'Conceptual',
                  prerequisites: ['concept-electric-current', 'concept-potential-difference'],
                  sources: [{ doc: 'NCERT Science Ch 12', page: 205, chunkId: 'ch12_p205_c1' }],
                  misconceptions: [
                    'Confusing resistance (R in ohms) with resistivity (rho in ohm-meters)',
                    'Assuming resistance decreases when wire length increases'
                  ]
                },
                {
                  id: 'concept-ohms-law',
                  name: "Ohm's Law (V = IR)",
                  competency: 'Apply linear relationship between voltage and current at constant temperature',
                  cognitiveLevel: 'Application',
                  prerequisites: ['concept-electric-current', 'concept-potential-difference', 'concept-resistance-resistivity'],
                  sources: [{ doc: 'NCERT Science Ch 12', page: 204, chunkId: 'ch12_p204_c3' }],
                  misconceptions: [
                    'Forgetting that Ohm’s law applies only when temperature remains constant',
                    'Algebraic inversion errors when solving for R or I'
                  ]
                },
                {
                  id: 'concept-series-resistance',
                  name: 'Series Resistor Combination',
                  competency: 'Derive and compute equivalent resistance for series circuits (Rs = R1 + R2 + ...)',
                  cognitiveLevel: 'Conceptual',
                  prerequisites: ['concept-resistance-resistivity'],
                  sources: [{ doc: 'NCERT Science Ch 12', page: 210, chunkId: 'ch12_p210_c1' }],
                  misconceptions: [
                    'Assuming current decreases after passing each successive resistor in series'
                  ]
                },
                {
                  id: 'concept-parallel-resistance',
                  name: 'Parallel Resistance',
                  competency: 'Calculate equivalent resistance in parallel (1/Rp = 1/R1 + 1/R2) and branch currents',
                  cognitiveLevel: 'Application',
                  prerequisites: ['concept-resistance-resistivity', 'concept-series-resistance'],
                  sources: [{ doc: 'NCERT Science Ch 12', page: 213, chunkId: 'ch12_p213_c2' }],
                  misconceptions: [
                    'Series/parallel branch current confusion: assuming current is equal in all parallel branches',
                    'Inverse reciprocal sum error: adding R1 + R2 directly instead of inverting reciprocal sum',
                    'Believing equivalent resistance of parallel resistors is greater than any individual branch'
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'ch-life-processes',
          chapterNumber: 6,
          title: 'Life Processes',
          sourceDocument: 'NCERT Class 10 Science',
          pageRange: 'Pages 93–112',
          topics: [
            {
              id: 'top-nutrition-photosynthesis',
              title: 'Autotrophic Nutrition & Photosynthesis',
              concepts: [
                {
                  id: 'concept-chlorophyll-light',
                  name: 'Light-Dependent Reactions & Chlorophyll',
                  competency: 'Explain absorption of light energy and conversion to chemical potential (ATP, NADPH)',
                  cognitiveLevel: 'Conceptual',
                  prerequisites: [],
                  sources: [{ doc: 'NCERT Science Ch 6', page: 96, chunkId: 'ch6_p96_c1' }],
                  misconceptions: [
                    'Believing plants absorb green light instead of reflecting it',
                    'Assuming water is the sole source of carbon in glucose'
                  ]
                },
                {
                  id: 'concept-carbon-fixation',
                  name: 'Calvin Cycle & Carbon Fixation',
                  competency: 'Trace carbon reduction from CO2 into carbohydrates during light-independent phase',
                  cognitiveLevel: 'Analysis',
                  prerequisites: ['concept-chlorophyll-light'],
                  sources: [{ doc: 'NCERT Science Ch 6', page: 97, chunkId: 'ch6_p97_c2' }],
                  misconceptions: [
                    'Assuming dark reactions can only take place at night'
                  ]
                }
              ]
            },
            {
              id: 'top-respiration',
              title: 'Cellular Respiration',
              concepts: [
                {
                  id: 'concept-aerobic-respiration',
                  name: 'Aerobic vs Anaerobic Breakdown of Glucose',
                  competency: 'Compare ATP yields and metabolic pathways in cytoplasm vs mitochondria',
                  cognitiveLevel: 'Application',
                  prerequisites: [],
                  sources: [{ doc: 'NCERT Science Ch 6', page: 101, chunkId: 'ch6_p101_c1' }],
                  misconceptions: [
                    'Equating cellular respiration with pulmonary breathing',
                    'Thinking anaerobic respiration produces more energy than aerobic respiration'
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'ch-chemical-reactions',
          chapterNumber: 1,
          title: 'Chemical Reactions and Equations',
          sourceDocument: 'NCERT Class 10 Science',
          pageRange: 'Pages 1–16',
          topics: [
            {
              id: 'top-equations-balancing',
              title: 'Chemical Equations and Balancing',
              concepts: [
                {
                  id: 'concept-conservation-mass',
                  name: 'Conservation of Mass & Stoichiometry',
                  competency: 'Balance chemical equations while preserving atomic ratios and mass conservation',
                  cognitiveLevel: 'Application',
                  prerequisites: [],
                  sources: [{ doc: 'NCERT Science Ch 1', page: 3, chunkId: 'ch1_p3_c1' }],
                  misconceptions: [
                    'Changing chemical subscripts instead of stoichiometric coefficients during balancing'
                  ]
                },
                {
                  id: 'concept-redox-reactions',
                  name: 'Oxidation-Reduction (Redox) Mechanisms',
                  competency: 'Identify oxidizing and reducing agents based on oxygen/hydrogen transfer and electrons',
                  cognitiveLevel: 'Analysis',
                  prerequisites: ['concept-conservation-mass'],
                  sources: [{ doc: 'NCERT Science Ch 1', page: 12, chunkId: 'ch1_p12_c2' }],
                  misconceptions: [
                    'Confusing the substance oxidized with the oxidizing agent'
                  ]
                }
              ]
            }
          ]
        }
      ]
    };

    this.curriculumStore.set('default', defaultCurriculum);
  }

  getCurriculumTwin(institution = 'default') {
    return this.curriculumStore.get(institution) || this.curriculumStore.get('default');
  }

  getAllConcepts(institution = 'default') {
    const twin = this.getCurriculumTwin(institution);
    const concepts = [];

    for (const ch of twin.chapters) {
      for (const t of ch.topics) {
        for (const c of t.concepts) {
          concepts.push({
            ...c,
            chapterTitle: ch.title,
            chapterNumber: ch.chapterNumber,
            topicTitle: t.title
          });
        }
      }
    }

    return concepts;
  }

  getConceptById(conceptId, institution = 'default') {
    const concepts = this.getAllConcepts(institution);
    return concepts.find(c => c.id === conceptId || c.name.toLowerCase() === String(conceptId).toLowerCase()) || null;
  }

  getPrerequisiteChain(conceptId, institution = 'default') {
    const concept = this.getConceptById(conceptId, institution);
    if (!concept || !concept.prerequisites || concept.prerequisites.length === 0) {
      return [];
    }

    const chain = [];
    for (const prereqId of concept.prerequisites) {
      const prereqConcept = this.getConceptById(prereqId, institution);
      if (prereqConcept) {
        chain.push(prereqConcept);
        const upstream = this.getPrerequisiteChain(prereqId, institution);
        chain.push(...upstream);
      }
    }

    // Deduplicate
    const unique = [];
    const seen = new Set();
    for (const item of chain) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        unique.push(item);
      }
    }
    return unique;
  }

  detectMisconception(conceptId, studentAnswer, questionText = '') {
    const concept = this.getConceptById(conceptId);
    if (!concept || !concept.misconceptions || concept.misconceptions.length === 0) {
      return null;
    }

    const ans = String(studentAnswer || '').toLowerCase();
    const q = String(questionText || '').toLowerCase();

    // Specific rules for Parallel Resistance
    if (concept.id === 'concept-parallel-resistance' || concept.name.toLowerCase().includes('parallel')) {
      if (ans.includes('same current') || ans.includes('equal current') || ans.includes('current is equal')) {
        return 'Series/parallel branch current confusion: assumed current is equal across all parallel branches';
      }
      if (ans.includes('greater') || ans.includes('increases') || ans.includes('sum of both')) {
        return 'Inverse reciprocal sum error: calculated R1 + R2 instead of 1/(1/R1 + 1/R2)';
      }
    }

    // Balancing / Conservation of Mass
    if (concept.id === 'concept-conservation-mass') {
      if (ans.includes('subscript') || ans.includes('change formula')) {
        return 'Altered chemical formula subscripts instead of balancing coefficients';
      }
    }

    // Default: return the primary known misconception for this concept if student made an error
    return concept.misconceptions[0];
  }
}

module.exports = new CurriculumTwinService();
