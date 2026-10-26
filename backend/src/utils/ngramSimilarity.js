// =====================================
// SERVER-SIDE N-GRAM & CODE SIMILARITY
// =====================================

/**
 * Normalizes text by lowercasing, removing special characters, and trimming spaces.
 */
function normalizeText(text) {
  if (!text) return "";
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Generates an N-gram Set from normalized text.
 * Uses word n-grams (default 3 words) or character n-grams for shorter texts.
 */
function createNGrams(text, n = 3) {
  const normalized = normalizeText(text);
  if (!normalized) return new Set();

  const words = normalized.split(" ").filter(Boolean);
  const ngrams = new Set();

  if (words.length >= n) {
    for (let i = 0; i <= words.length - n; i++) {
      ngrams.add(words.slice(i, i + n).join(" "));
    }
  } else if (words.length > 0) {
    // Fallback to character n-grams if word count is small
    const chars = normalized.replace(/\s+/g, "");
    const charN = Math.min(3, chars.length);
    for (let i = 0; i <= chars.length - charN; i++) {
      ngrams.add(chars.substring(i, i + charN));
    }
  }

  return ngrams;
}

/**
 * Calculates Jaccard similarity coefficient between two sets.
 * Returns similarity percentage (0 to 100).
 */
function jaccardSimilarity(setA, setB) {
  if (!setA || !setB || setA.size === 0 || setB.size === 0) return 0;

  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) {
      intersectionCount++;
    }
  }

  const unionSize = setA.size + setB.size - intersectionCount;
  if (unionSize <= 0) return 0;

  return Math.round((intersectionCount / unionSize) * 100);
}

/**
 * Computes n-gram similarity between two text snippets.
 */
function computeTextSimilarity(textA, textB, n = 3) {
  if (!textA || !textB) return 0;
  const cleanA = normalizeText(textA);
  const cleanB = normalizeText(textB);
  if (cleanA === cleanB && cleanA.length > 0) return 100;

  const ngramsA = createNGrams(cleanA, n);
  const ngramsB = createNGrams(cleanB, n);

  return jaccardSimilarity(ngramsA, ngramsB);
}

/**
 * Simplified code tokenizer for structural similarity.
 */
function normalizeCode(code) {
  if (!code) return "";
  return String(code)
    // Remove single line comments
    .replace(/\/\/.*$/gm, "")
    .replace(/#.*$/gm, "")
    // Remove multi-line comments
    .replace(/\/\*[\s\S]*?\*\//g, "")
    // Normalize quotes
    .replace(/["'`][\s\S]*?["'`]/g, ' "STR" ')
    // Normalize digits
    .replace(/\b\d+(\.\d+)?\b/g, " NUM ")
    // Normalize whitespace
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function computeCodeSimilarity(codeA, codeB) {
  const normA = normalizeCode(codeA);
  const normB = normalizeCode(codeB);
  if (!normA || !normB) return 0;
  if (normA === normB) return 100;

  // Use 2-gram and 3-gram tokens for code structures
  const tokensA = normA.split(" ").filter(Boolean);
  const tokensB = normB.split(" ").filter(Boolean);

  const ngramsA = new Set();
  const ngramsB = new Set();

  for (let i = 0; i < tokensA.length - 1; i++) {
    ngramsA.add(`${tokensA[i]} ${tokensA[i + 1]}`);
  }
  for (let i = 0; i < tokensB.length - 1; i++) {
    ngramsB.add(`${tokensB[i]} ${tokensB[i + 1]}`);
  }

  return jaccardSimilarity(ngramsA, ngramsB);
}

/**
 * Parses question answers from a submission's text content.
 */
function parseSubmissionAnswers(content) {
  if (!content) return [];
  const lines = String(content).split("\n");
  const answers = [];
  let currentAnswer = null;

  for (const line of lines) {
    if (line.startsWith("Question ") && line.includes(":")) {
      if (currentAnswer) answers.push(currentAnswer);
      currentAnswer = { header: line, text: "" };
    } else if (line.startsWith("Answer:")) {
      // answer header
    } else if (currentAnswer) {
      currentAnswer.text += (currentAnswer.text ? "\n" : "") + line;
    }
  }

  if (currentAnswer) answers.push(currentAnswer);
  return answers;
}

/**
 * Computes pairwise similarity between two submissions.
 */
function compareSubmissions(subA, subB, questions = []) {
  const answersA = parseSubmissionAnswers(subA.content);
  const answersB = parseSubmissionAnswers(subB.content);

  let totalSim = 0;
  let count = 0;
  const questionDetails = [];

  if (questions.length > 0 && (answersA.length > 0 || answersB.length > 0)) {
    const maxQ = Math.max(questions.length, answersA.length, answersB.length);
    for (let i = 0; i < maxQ; i++) {
      const q = questions[i] || {};
      const aText = (answersA[i]?.text || "").trim();
      const bText = (answersB[i]?.text || "").trim();
      const isCode = q.type === "code";

      const sim = isCode
        ? computeCodeSimilarity(aText, bText)
        : computeTextSimilarity(aText, bText, 3);

      totalSim += sim;
      count++;

      questionDetails.push({
        questionIndex: i + 1,
        questionText: q.question || `Question ${i + 1}`,
        type: q.type || "text",
        similarity: sim,
        answerA: aText,
        answerB: bText
      });
    }
  } else {
    // Fallback to full content n-gram comparison
    const sim = computeTextSimilarity(subA.content, subB.content, 3);
    totalSim = sim;
    count = 1;
  }

  const overall = count > 0 ? Math.round(totalSim / count) : 0;
  const status = overall >= 80 ? "HIGH" : overall >= 60 ? "MEDIUM" : "LOW";

  return {
    studentA: subA.studentName || "Student A",
    studentIdA: subA.studentId || "N/A",
    submissionIdA: subA._id,
    studentB: subB.studentName || "Student B",
    studentIdB: subB.studentId || "N/A",
    submissionIdB: subB._id,
    similarity: overall,
    status,
    questionDetails
  };
}

/**
 * Generates an end-to-end assignment similarity report across all submissions.
 */
function generateAssignmentReport(assignment, submissions) {
  const questions = assignment.questions || [];
  const pairs = [];

  for (let i = 0; i < submissions.length; i++) {
    for (let j = i + 1; j < submissions.length; j++) {
      const pair = compareSubmissions(submissions[i], submissions[j], questions);
      pairs.push(pair);
    }
  }

  // Sort pairs by highest similarity descending
  pairs.sort((a, b) => b.similarity - a.similarity);

  const flagged = pairs.filter((p) => p.similarity >= 60);
  const avg =
    pairs.length > 0
      ? Math.round(pairs.reduce((sum, p) => sum + p.similarity, 0) / pairs.length)
      : 0;

  return {
    assignmentId: assignment._id,
    assignmentCode: assignment.assignmentCode,
    assignmentTitle: assignment.title,
    totalSubmissions: submissions.length,
    totalComparisons: pairs.length,
    flaggedCount: flagged.length,
    averageSimilarity: avg,
    highestSimilarity: pairs.length > 0 ? pairs[0].similarity : 0,
    pairs,
    flaggedPairs: flagged,
    computedAt: new Date()
  };
}

module.exports = {
  normalizeText,
  createNGrams,
  jaccardSimilarity,
  computeTextSimilarity,
  computeCodeSimilarity,
  compareSubmissions,
  generateAssignmentReport
};
