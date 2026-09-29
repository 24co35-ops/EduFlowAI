const curriculumService = require('../services/curriculum.service');

exports.getCurriculum = async (req, res) => {
  try {
    const institution = req.user?.institution || 'default';
    const twin = curriculumService.getCurriculumTwin(institution);
    res.json({ success: true, curriculum: twin });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getConcepts = async (req, res) => {
  try {
    const institution = req.user?.institution || 'default';
    const concepts = curriculumService.getAllConcepts(institution);
    res.json({ success: true, concepts, total: concepts.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getConceptById = async (req, res) => {
  try {
    const { id } = req.params;
    const institution = req.user?.institution || 'default';
    const concept = curriculumService.getConceptById(id, institution);
    if (!concept) {
      return res.status(404).json({ success: false, message: 'Concept not found in curriculum twin.' });
    }
    const prerequisites = curriculumService.getPrerequisiteChain(id, institution);
    res.json({
      success: true,
      concept,
      prerequisites
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
