// =====================================
// VERITEXT SIMILARITY ANALYSIS
// =====================================
//
// Supports:
//
// TEXT QUESTIONS
//      -> N-gram + Jaccard
//
// CODE QUESTIONS
//      -> Tokenizer-based comparison
//      -> Keywords
//      -> Identifiers / variable names
//      -> Operators
//      -> Literals
//      -> Comments
//      -> Token sequence
//      -> Formatting normalized
//
// Supported languages:
//
// Python
// Java
// C++
// C
// JavaScript
// =====================================



// =====================================
// SUPPORTED LANGUAGES
// =====================================

const SUPPORTED_CODE_LANGUAGES = [

    "python",
    "java",
    "cpp",
    "c",
    "javascript"

];



// =====================================
// TEXT NORMALIZATION
// =====================================

function normalizeText(text) {

    if (!text) {

        return "";

    }


    return String(text)

        .toLowerCase()

        .replace(/[^\w\s]/g, "")

        .replace(/\s+/g, " ")

        .trim();

}



// =====================================
// CREATE N-GRAMS
// =====================================

function createNGrams(
    text,
    n = 3
) {

    const normalizedText =
        normalizeText(text);


    if (
        normalizedText === ""
    ) {

        return new Set();

    }


    const words =
        normalizedText.split(" ");


    const nGrams =
        new Set();


    // =================================
    // FEWER THAN N WORDS
    // =================================

    if (
        words.length < n
    ) {

        nGrams.add(
            normalizedText
        );


        return nGrams;

    }


    // =================================
    // CREATE N-GRAMS
    // =================================

    for (
        let i = 0;
        i <= words.length - n;
        i++
    ) {

        const gram =
            words
                .slice(
                    i,
                    i + n
                )
                .join(" ");


        nGrams.add(
            gram
        );

    }


    return nGrams;

}



// =====================================
// JACCARD SIMILARITY
// =====================================

function jaccardSimilarity(
    setA,
    setB
) {

    if (
        !setA ||
        !setB
    ) {

        return 0;

    }


    if (
        setA.size === 0 &&
        setB.size === 0
    ) {

        return 0;

    }


    let intersection = 0;


    setA.forEach(
        function (item) {

            if (
                setB.has(item)
            ) {

                intersection++;

            }

        }
    );


    const union =
        new Set([
            ...setA,
            ...setB
        ]);


    if (
        union.size === 0
    ) {

        return 0;

    }


    return (
        intersection /
        union.size
    );

}



// =====================================
// CODE NORMALIZATION
// =====================================

function normalizeCode(
    code
) {

    if (!code) {

        return "";

    }


    return String(code)

        // Normalize line endings

        .replace(/\r\n/g, "\n")

        .replace(/\r/g, "\n")

        // Normalize tabs

        .replace(/\t/g, "    ")

        // Remove trailing spaces

        .split("\n")

        .map(
            function (line) {

                return line.trim();

            }
        )

        .join("\n")

        // Normalize multiple spaces

        .replace(/[ ]+/g, " ")

        .trim();

}



// =====================================
// REMOVE COMMENTS
// =====================================

function removeComments(
    code,
    language
) {

    let text =
        String(code || "");


    // =================================
    // PYTHON
    // =================================

    if (
        language === "python"
    ) {

        text =
            text.replace(
                /#[^\n]*/g,
                ""
            );

    }


    // =================================
    // JAVA / C / C++ / JAVASCRIPT
    // =================================

    else {

        // Block comments

        text =
            text.replace(
                /\/\*[\s\S]*?\*\//g,
                ""
            );


        // Single-line comments

        text =
            text.replace(
                /\/\/[^\n]*/g,
                ""
            );

    }


    return text;

}



// =====================================
// EXTRACT COMMENTS
// =====================================

function extractComments(
    code,
    language
) {

    const comments = [];


    const text =
        String(code || "");


    // =================================
    // PYTHON COMMENTS
    // =================================

    if (
        language === "python"
    ) {

        const matches =
            text.match(
                /#[^\n]*/g
            );


        if (matches) {

            matches.forEach(
                function (comment) {

                    const cleaned =
                        comment
                            .replace(
                                /^#/,
                                ""
                            )
                            .trim()
                            .toLowerCase();


                    if (cleaned) {

                        comments.push(
                            cleaned
                        );

                    }

                }
            );

        }

    }


    // =================================
    // JAVA / C / C++ / JAVASCRIPT
    // =================================

    else {

        const blockComments =
            text.match(
                /\/\*[\s\S]*?\*\//g
            );


        if (blockComments) {

            blockComments.forEach(
                function (comment) {

                    const cleaned =
                        comment
                            .replace(
                                /^\/\*/,
                                ""
                            )
                            .replace(
                                /\*\/$/,
                                ""
                            )
                            .trim()
                            .toLowerCase();


                    if (cleaned) {

                        comments.push(
                            cleaned
                        );

                    }

                }
            );

        }


        const lineComments =
            text.match(
                /\/\/[^\n]*/g
            );


        if (lineComments) {

            lineComments.forEach(
                function (comment) {

                    const cleaned =
                        comment
                            .replace(
                                /^\/\//,
                                ""
                            )
                            .trim()
                            .toLowerCase();


                    if (cleaned) {

                        comments.push(
                            cleaned
                        );

                    }

                }
            );

        }

    }


    return comments;

}



// =====================================
// LANGUAGE KEYWORDS
// =====================================

const CODE_KEYWORDS = {

    python: new Set([

        "and",
        "as",
        "assert",
        "async",
        "await",
        "break",
        "case",
        "class",
        "continue",
        "def",
        "del",
        "elif",
        "else",
        "except",
        "finally",
        "for",
        "from",
        "global",
        "if",
        "import",
        "in",
        "is",
        "lambda",
        "match",
        "nonlocal",
        "not",
        "or",
        "pass",
        "raise",
        "return",
        "try",
        "while",
        "with",
        "yield",
        "True",
        "False",
        "None"

    ]),


    java: new Set([

        "abstract",
        "assert",
        "boolean",
        "break",
        "byte",
        "case",
        "catch",
        "char",
        "class",
        "const",
        "continue",
        "default",
        "do",
        "double",
        "else",
        "enum",
        "extends",
        "final",
        "finally",
        "float",
        "for",
        "if",
        "implements",
        "import",
        "instanceof",
        "int",
        "interface",
        "long",
        "native",
        "new",
        "package",
        "private",
        "protected",
        "public",
        "return",
        "short",
        "static",
        "strictfp",
        "super",
        "switch",
        "synchronized",
        "this",
        "throw",
        "throws",
        "transient",
        "try",
        "void",
        "volatile",
        "while",
        "true",
        "false",
        "null"

    ]),


    cpp: new Set([

        "alignas",
        "alignof",
        "auto",
        "bool",
        "break",
        "case",
        "catch",
        "char",
        "class",
        "const",
        "constexpr",
        "continue",
        "default",
        "delete",
        "do",
        "double",
        "else",
        "enum",
        "explicit",
        "export",
        "extern",
        "false",
        "float",
        "for",
        "friend",
        "if",
        "inline",
        "int",
        "long",
        "namespace",
        "new",
        "noexcept",
        "nullptr",
        "operator",
        "private",
        "protected",
        "public",
        "return",
        "short",
        "signed",
        "sizeof",
        "static",
        "struct",
        "switch",
        "template",
        "this",
        "throw",
        "true",
        "try",
        "typedef",
        "typename",
        "union",
        "unsigned",
        "using",
        "virtual",
        "void",
        "volatile",
        "while"

    ]),


    c: new Set([

        "auto",
        "break",
        "case",
        "char",
        "const",
        "continue",
        "default",
        "do",
        "double",
        "else",
        "enum",
        "extern",
        "float",
        "for",
        "goto",
        "if",
        "inline",
        "int",
        "long",
        "register",
        "restrict",
        "return",
        "short",
        "signed",
        "sizeof",
        "static",
        "struct",
        "switch",
        "typedef",
        "union",
        "unsigned",
        "void",
        "volatile",
        "while"

    ]),


    javascript: new Set([

        "as",
        "async",
        "await",
        "break",
        "case",
        "catch",
        "class",
        "const",
        "continue",
        "debugger",
        "default",
        "delete",
        "do",
        "else",
        "export",
        "extends",
        "false",
        "finally",
        "for",
        "from",
        "function",
        "get",
        "if",
        "import",
        "in",
        "instanceof",
        "let",
        "new",
        "null",
        "of",
        "return",
        "set",
        "static",
        "super",
        "switch",
        "this",
        "throw",
        "true",
        "try",
        "typeof",
        "var",
        "void",
        "while",
        "with",
        "yield"

    ])

};



// =====================================
// TOKENIZE CODE
// =====================================

function tokenizeCode(
    code,
    language
) {

    const normalizedLanguage =
        String(
            language || ""
        )
        .toLowerCase();


    const cleanedCode =
        removeComments(
            code,
            normalizedLanguage
        );


    if (
        cleanedCode.trim() === ""
    ) {

        return [];

    }


    // =================================
    // TOKEN PATTERN
    // =================================

    const tokenPattern =
        /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|(?:\d+(?:\.\d+)?)|(?:[A-Za-z_$][A-Za-z0-9_$]*)|(?:===|!==|==|!=|<=|>=|\+\+|--|&&|\|\||\+=|-=|\*=|\/=|%=|=>|<<|>>|::|->|\*\*|\/\/|&&=|\|\|=|\?\?)|[+\-*\/%=<>!&|^~?:;,.\[\]{}()]/g;


    const rawTokens =
        cleanedCode.match(
            tokenPattern
        ) || [];


    const keywords =
        CODE_KEYWORDS[
            normalizedLanguage
        ] || new Set();


    const tokens = [];


    rawTokens.forEach(
        function (token) {

            const lowerToken =
                token.toLowerCase();


            // =================================
            // KEYWORD
            // =================================

            if (
                keywords.has(token) ||
                keywords.has(lowerToken)
            ) {

                tokens.push({

                    value:
                        lowerToken,

                    type:
                        "keyword"

                });


                return;

            }


            // =================================
            // IDENTIFIER
            // =================================

            if (
                /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(
                    token
                )
            ) {

                tokens.push({

                    value:
                        lowerToken,

                    type:
                        "identifier"

                });


                return;

            }


            // =================================
            // NUMBER
            // =================================

            if (
                /^\d+(?:\.\d+)?$/.test(
                    token
                )
            ) {

                tokens.push({

                    value:
                        token,

                    type:
                        "number"

                });


                return;

            }


            // =================================
            // STRING
            // =================================

            if (
                token.startsWith("\"") ||
                token.startsWith("'") ||
                token.startsWith("`")
            ) {

                tokens.push({

                    value:
                        "STRING_LITERAL",

                    type:
                        "string"

                });


                return;

            }


            // =================================
            // OPERATOR / SYMBOL
            // =================================

            tokens.push({

                value:
                    token,

                type:
                    "operator"

            });

        }
    );


    return tokens;

}



// =====================================
// GET TOKEN VALUES
// =====================================

function getTokenValues(
    tokens
) {

    return tokens.map(
        function (token) {

            return (
                token.type +
                ":" +
                token.value
            );

        }
    );

}



// =====================================
// TOKEN TYPE SET
// =====================================

function createTokenTypeSet(
    tokens
) {

    const set =
        new Set();


    tokens.forEach(
        function (token) {

            set.add(
                token.type +
                ":" +
                token.value
            );

        }
    );


    return set;

}



// =====================================
// TOKEN SEQUENCE N-GRAMS
// =====================================

function createTokenNGrams(
    tokens,
    n = 4
) {

    const grams =
        new Set();


    if (
        !tokens ||
        tokens.length === 0
    ) {

        return grams;

    }


    if (
        tokens.length < n
    ) {

        grams.add(
            getTokenValues(
                tokens
            ).join("|")
        );


        return grams;

    }


    const values =
        getTokenValues(
            tokens
        );


    for (
        let i = 0;
        i <= values.length - n;
        i++
    ) {

        grams.add(
            values
                .slice(
                    i,
                    i + n
                )
                .join("|")
        );

    }


    return grams;

}



// =====================================
// EXTRACT TOKEN TYPES
// =====================================

function getTokensByType(
    tokens,
    type
) {

    return tokens
        .filter(
            function (token) {

                return (
                    token.type ===
                    type
                );

            }
        )
        .map(
            function (token) {

                return (
                    token.value
                );

            }
        );

}



// =====================================
// CREATE STRING SET
// =====================================

function arrayToSet(
    array
) {

    return new Set(
        array
    );

}



// =====================================
// CALCULATE CODE SIMILARITY
// =====================================

function calculateCodeSimilarity(
    codeA,
    codeB,
    language
) {

    const tokensA =
        tokenizeCode(
            codeA,
            language
        );


    const tokensB =
        tokenizeCode(
            codeB,
            language
        );


    // =================================
    // EMPTY CODE
    // =================================

    if (
        tokensA.length === 0 ||
        tokensB.length === 0
    ) {

        return {

            similarity:
                0,

            percentage:
                0,

            tokenSimilarity:
                0,

            sequenceSimilarity:
                0,

            keywordSimilarity:
                0,

            identifierSimilarity:
                0,

            operatorSimilarity:
                0,

            literalSimilarity:
                0,

            commentSimilarity:
                0

        };

    }



    // =================================
    // ALL TOKEN SIMILARITY
    // =================================

    const tokenSetA =
        createTokenTypeSet(
            tokensA
        );


    const tokenSetB =
        createTokenTypeSet(
            tokensB
        );


    const tokenSimilarity =
        jaccardSimilarity(
            tokenSetA,
            tokenSetB
        );



    // =================================
    // TOKEN SEQUENCE SIMILARITY
    // =================================

    const sequenceA =
        createTokenNGrams(
            tokensA,
            4
        );


    const sequenceB =
        createTokenNGrams(
            tokensB,
            4
        );


    const sequenceSimilarity =
        jaccardSimilarity(
            sequenceA,
            sequenceB
        );



    // =================================
    // KEYWORD SIMILARITY
    // =================================

    const keywordsA =
        arrayToSet(
            getTokensByType(
                tokensA,
                "keyword"
            )
        );


    const keywordsB =
        arrayToSet(
            getTokensByType(
                tokensB,
                "keyword"
            )
        );


    const keywordSimilarity =
        jaccardSimilarity(
            keywordsA,
            keywordsB
        );



    // =================================
    // IDENTIFIER SIMILARITY
    // =================================

    const identifiersA =
        arrayToSet(
            getTokensByType(
                tokensA,
                "identifier"
            )
        );


    const identifiersB =
        arrayToSet(
            getTokensByType(
                tokensB,
                "identifier"
            )
        );


    const identifierSimilarity =
        jaccardSimilarity(
            identifiersA,
            identifiersB
        );



    // =================================
    // OPERATOR SIMILARITY
    // =================================

    const operatorsA =
        arrayToSet(
            getTokensByType(
                tokensA,
                "operator"
            )
        );


    const operatorsB =
        arrayToSet(
            getTokensByType(
                tokensB,
                "operator"
            )
        );


    const operatorSimilarity =
        jaccardSimilarity(
            operatorsA,
            operatorsB
        );



    // =================================
    // LITERAL SIMILARITY
    // =================================

    const literalsA =
        arrayToSet(

            [
                ...getTokensByType(
                    tokensA,
                    "number"
                ),

                ...getTokensByType(
                    tokensA,
                    "string"
                )

            ]

        );


    const literalsB =
        arrayToSet(

            [
                ...getTokensByType(
                    tokensB,
                    "number"
                ),

                ...getTokensByType(
                    tokensB,
                    "string"
                )

            ]

        );


    const literalSimilarity =
        jaccardSimilarity(
            literalsA,
            literalsB
        );



    // =================================
    // COMMENT SIMILARITY
    // =================================

    const commentsA =
        extractComments(
            codeA,
            language
        );


    const commentsB =
        extractComments(
            codeB,
            language
        );


    const commentSimilarity =
        jaccardSimilarity(

            new Set(
                commentsA
            ),

            new Set(
                commentsB
            )

        );



    // =================================
    // FINAL WEIGHTED SCORE
    // =================================
    //
    // Sequence = strongest signal
    // Tokens = strong signal
    // Keywords = structure
    // Identifiers = names
    // Operators = logic
    // Literals = values
    // Comments = small contribution
    //
    // =================================

    const similarity =

        (
            sequenceSimilarity * 0.35
        ) +

        (
            tokenSimilarity * 0.20
        ) +

        (
            keywordSimilarity * 0.15
        ) +

        (
            identifierSimilarity * 0.10
        ) +

        (
            operatorSimilarity * 0.10
        ) +

        (
            literalSimilarity * 0.05
        ) +

        (
            commentSimilarity * 0.05
        );



    return {

        similarity:
            similarity,

        percentage:
            Math.round(
                similarity * 100
            ),

        tokenSimilarity:
            tokenSimilarity,

        sequenceSimilarity:
            sequenceSimilarity,

        keywordSimilarity:
            keywordSimilarity,

        identifierSimilarity:
            identifierSimilarity,

        operatorSimilarity:
            operatorSimilarity,

        literalSimilarity:
            literalSimilarity,

        commentSimilarity:
            commentSimilarity,

        tokenCountA:
            tokensA.length,

        tokenCountB:
            tokensB.length

    };

}



// =====================================
// GET SUBMISSION ANSWERS
// =====================================

function getSubmissionAnswers(
    submission
) {

    // =================================
    // NEW MULTI-QUESTION FORMAT
    // =================================

    if (
        Array.isArray(
            submission.answers
        )
    ) {

        return submission.answers.map(
            function (
                item,
                index
            ) {

                return {

                    questionNumber:
                        item.questionNumber ??
                        index + 1,

                    questionId:
                        item.questionId ??
                        index + 1,

                    question:
                        item.question ||
                        "",

                    answer:
                        item.answer ||
                        "",

                    type:
                        item.type === "code"
                            ? "code"
                            : "text",

                    language:
                        item.language ||
                        null

                };

            }
        );

    }



    // =================================
    // OLD SINGLE QUESTION FORMAT
    // =================================

    if (
        typeof submission.answer ===
        "string"
    ) {

        return [

            {

                questionNumber:
                    1,

                questionId:
                    1,

                question:
                    "",

                answer:
                    submission.answer,

                type:
                    "text",

                language:
                    null

            }

        ];

    }


    return [];

}



// =====================================
// FIND ANSWER FOR QUESTION
// =====================================

function findQuestionAnswer(
    answers,
    questionNumber
) {

    return answers.find(
        function (item) {

            return (
                Number(
                    item.questionNumber
                ) ===
                Number(
                    questionNumber
                )
            );

        }
    );

}



// =====================================
// COMPARE TEXT QUESTION
// =====================================

function compareTextQuestion(
    answerA,
    answerB,
    questionNumber
) {

    const nGramsA =
        createNGrams(
            answerA,
            3
        );


    const nGramsB =
        createNGrams(
            answerB,
            3
        );


    const similarity =
        jaccardSimilarity(
            nGramsA,
            nGramsB
        );


    return {

        questionNumber:
            questionNumber,

        type:
            "text",

        language:
            null,

        similarity:
            similarity,

        percentage:
            Math.round(
                similarity * 100
            )

    };

}



// =====================================
// COMPARE CODE QUESTION
// =====================================

function compareCodeQuestion(
    answerA,
    answerB,
    language,
    questionNumber
) {

    const result =
        calculateCodeSimilarity(
            answerA,
            answerB,
            language
        );


    return {

        questionNumber:
            questionNumber,

        type:
            "code",

        language:
            language,

        similarity:
            result.similarity,

        percentage:
            result.percentage,

        tokenSimilarity:
            result.tokenSimilarity,

        sequenceSimilarity:
            result.sequenceSimilarity,

        keywordSimilarity:
            result.keywordSimilarity,

        identifierSimilarity:
            result.identifierSimilarity,

        operatorSimilarity:
            result.operatorSimilarity,

        literalSimilarity:
            result.literalSimilarity,

        commentSimilarity:
            result.commentSimilarity,

        tokenCountA:
            result.tokenCountA,

        tokenCountB:
            result.tokenCountB

    };

}



// =====================================
// COMPARE TWO QUESTIONS
// =====================================

function compareQuestionAnswers(
    answerA,
    answerB,
    questionNumber
) {

    const typeA =
        answerA
            ? answerA.type
            : "text";


    const typeB =
        answerB
            ? answerB.type
            : "text";



    // =================================
    // MISSING ANSWER
    // =================================

    if (
        !answerA ||
        !answerB
    ) {

        return {

            questionNumber:
                questionNumber,

            type:
                typeA,

            language:
                answerA
                    ? answerA.language
                    : null,

            similarity:
                0,

            percentage:
                0

        };

    }



    // =================================
    // DIFFERENT QUESTION TYPES
    // =================================

    if (
        typeA !==
        typeB
    ) {

        return {

            questionNumber:
                questionNumber,

            type:
                typeA,

            language:
                answerA.language ||
                null,

            similarity:
                0,

            percentage:
                0,

            note:
                "Question types do not match."

        };

    }



    // =================================
    // CODE
    // =================================

    if (
        typeA === "code"
    ) {

        const languageA =
            String(
                answerA.language ||
                ""
            ).toLowerCase();


        const languageB =
            String(
                answerB.language ||
                ""
            ).toLowerCase();



        // Different languages

        if (
            languageA !==
            languageB
        ) {

            return {

                questionNumber:
                    questionNumber,

                type:
                    "code",

                language:
                    languageA,

                similarity:
                    0,

                percentage:
                    0,

                note:
                    "Programming languages do not match."

            };

        }



        return compareCodeQuestion(

            answerA.answer,

            answerB.answer,

            languageA,

            questionNumber

        );

    }



    // =================================
    // TEXT
    // =================================

    return compareTextQuestion(

        answerA.answer,

        answerB.answer,

        questionNumber

    );

}



// =====================================
// COMPARE TWO SUBMISSIONS
// =====================================

function compareSubmissions(
    submissionA,
    submissionB
) {

    const answersA =
        getSubmissionAnswers(
            submissionA
        );


    const answersB =
        getSubmissionAnswers(
            submissionB
        );


    const questionResults =
        [];



    // =================================
    // GET QUESTION NUMBERS
    // =================================

    const questionNumbers =
        new Set();



    answersA.forEach(
        function (answer) {

            questionNumbers.add(
                Number(
                    answer.questionNumber
                )
            );

        }
    );


    answersB.forEach(
        function (answer) {

            questionNumbers.add(
                Number(
                    answer.questionNumber
                )
            );

        }
    );



    // =================================
    // SORT QUESTIONS
    // =================================

    const sortedQuestionNumbers =
        Array.from(
            questionNumbers
        ).sort(
            function (a, b) {

                return a - b;

            }
        );



    // =================================
    // COMPARE SAME QUESTION
    // =================================

    sortedQuestionNumbers.forEach(
        function (questionNumber) {

            const answerA =
                findQuestionAnswer(
                    answersA,
                    questionNumber
                );


            const answerB =
                findQuestionAnswer(
                    answersB,
                    questionNumber
                );


            const result =
                compareQuestionAnswers(

                    answerA,

                    answerB,

                    questionNumber

                );


            questionResults.push(
                result
            );

        }
    );



    // =================================
    // CALCULATE OVERALL SIMILARITY
    // =================================

    let totalSimilarity =
        0;


    if (
        questionResults.length > 0
    ) {

        questionResults.forEach(
            function (result) {

                totalSimilarity +=
                    result.similarity;

            }
        );


        totalSimilarity =
            totalSimilarity /
            questionResults.length;

    }



    // =================================
    // HIGHEST QUESTION
    // =================================

    let highestQuestion =
        null;


    if (
        questionResults.length > 0
    ) {

        highestQuestion =
            questionResults.reduce(
                function (
                    highest,
                    current
                ) {

                    if (
                        current.similarity >
                        highest.similarity
                    ) {

                        return current;

                    }


                    return highest;

                }
            );

    }



    // =================================
    // CODE QUESTION RESULTS
    // =================================

    const codeResults =
        questionResults.filter(
            function (result) {

                return (
                    result.type ===
                    "code"
                );

            }
        );



    // =================================
    // TEXT QUESTION RESULTS
    // =================================

    const textResults =
        questionResults.filter(
            function (result) {

                return (
                    result.type ===
                    "text"
                );

            }
        );



    // =================================
    // RETURN RESULT
    // =================================

    return {

        studentA:
            submissionA.studentName,

        studentB:
            submissionB.studentName,


        studentIdA:
            submissionA.studentId,

        studentIdB:
            submissionB.studentId,



        // =================================
        // OVERALL
        // =================================

        similarity:
            totalSimilarity,

        percentage:
            Math.round(
                totalSimilarity * 100
            ),



        // =================================
        // QUESTION RESULTS
        // =================================

        questionResults:
            questionResults,



        // =================================
        // HIGHEST QUESTION
        // =================================

        highestQuestion:
            highestQuestion,



        // =================================
        // SEPARATE RESULTS
        // =================================

        codeResults:
            codeResults,

        textResults:
            textResults

    };

}



// =====================================
// COMPARE ALL SUBMISSIONS
// =====================================

function compareAllSubmissions(
    submissions
) {

    const results =
        [];


    // =================================
    // SAFETY CHECK
    // =================================

    if (
        !Array.isArray(
            submissions
        )
    ) {

        return results;

    }



    // =================================
    // COMPARE EVERY STUDENT PAIR
    // =================================

    for (
        let i = 0;
        i < submissions.length;
        i++
    ) {

        for (
            let j = i + 1;
            j < submissions.length;
            j++
        ) {

            const result =
                compareSubmissions(

                    submissions[i],

                    submissions[j]

                );


            results.push(
                result
            );

        }

    }



    // =================================
    // HIGHEST SIMILARITY FIRST
    // =================================

    results.sort(
        function (a, b) {

            return (
                b.similarity -
                a.similarity
            );

        }
    );


    return results;

}