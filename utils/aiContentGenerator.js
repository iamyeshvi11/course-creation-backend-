/**
 * AI-Powered Content Generation for Compliance Training
 * Supports both OpenAI and template-based generation
 */

const trainingTemplates = require('./trainingTemplates');

/**
 * Generate course content using AI or templates
 * @param {Object} options - Generation options
 * @param {string} options.topic - Course topic
 * @param {string} options.categoryCode - Training category code (POSH, HIPAA, etc.)
 * @param {string} options.riskLevel - Risk level (Low, Medium, High)
 * @param {number} options.duration - Estimated duration in minutes
 * @returns {Object} Generated course structure
 */
async function generateCourseContent(options) {
  const { topic, categoryCode, riskLevel = 'Medium', duration = 60 } = options;

  // Check if OpenAI is configured
  if (process.env.OPENAI_API_KEY && process.env.USE_AI_GENERATION === 'true') {
    try {
      return await generateWithOpenAI(options);
    } catch (error) {
      console.error('OpenAI generation failed, falling back to templates:', error.message);
      return generateFromTemplate(options);
    }
  }

  // Fallback to template-based generation
  return generateFromTemplate(options);
}

/**
 * Generate content using OpenAI API
 */
async function generateWithOpenAI(options) {
  const { topic, categoryCode, riskLevel, duration } = options;

  // Dynamically import OpenAI only if needed
  const { default: OpenAI } = await import('openai');
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const systemPrompt = `You are an expert compliance training content creator. Generate comprehensive, engaging, and accurate training content for mandatory compliance programs. Focus on real-world scenarios, practical applications, and regulatory requirements.`;

  const userPrompt = `Create a comprehensive compliance training course with the following specifications:

Topic: ${topic}
Category: ${categoryCode || 'General Compliance'}
Risk Level: ${riskLevel}
Target Duration: ${duration} minutes

Generate a course with:
1. An engaging title
2. A clear description (2-3 sentences)
3. 3-4 modules, each containing:
   - Module title
   - 3-5 content blocks (paragraphs of educational content)
   - 3-5 quiz questions with:
     * Question text
     * 4 multiple choice options
     * Correct answer index (0-3)
     * Explanation for the correct answer

Focus on:
- Regulatory compliance requirements
- Real-world scenarios and examples
- Practical application
- Current best practices
- Clear, professional language

Return ONLY valid JSON in this exact format:
{
  "title": "Course Title",
  "description": "Course description",
  "riskLevel": "${riskLevel}",
  "passThreshold": 70,
  "modules": [
    {
      "title": "Module Title",
      "contentBlocks": [
        "Paragraph 1 of educational content...",
        "Paragraph 2 of educational content...",
        "Paragraph 3 of educational content..."
      ],
      "quiz": [
        {
          "question": "Question text?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0,
          "explanation": "Explanation of correct answer"
        }
      ]
    }
  ]
}`;

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 4000,
    response_format: { type: 'json_object' }
  });

  const generatedContent = JSON.parse(response.choices[0].message.content);
  
  return {
    ...generatedContent,
    aiGenerated: true,
    generatedAt: new Date(),
    model: process.env.OPENAI_MODEL || 'gpt-4'
  };
}

/**
 * Generate content from predefined templates
 */
function generateFromTemplate(options) {
  const { topic, categoryCode, riskLevel = 'Medium' } = options;

  // Get template for specific category if available
  const template = trainingTemplates[categoryCode] || trainingTemplates.DEFAULT;

  // Customize template with topic
  const customizedTitle = template.title.replace('{topic}', topic);
  const customizedDescription = template.description.replace('{topic}', topic);

  return {
    title: customizedTitle,
    description: customizedDescription,
    riskLevel: riskLevel,
    passThreshold: 70,
    modules: template.modules.map((moduleTemplate, index) => ({
      title: moduleTemplate.title.replace('{topic}', topic),
      contentBlocks: moduleTemplate.contentBlocks.map(block => 
        block.replace('{topic}', topic)
      ),
      quiz: moduleTemplate.quiz || []
    })),
    aiGenerated: false,
    templateBased: true,
    generatedAt: new Date()
  };
}

/**
 * Generate quiz questions for a specific topic
 */
async function generateQuizQuestions(topic, count = 5) {
  if (process.env.OPENAI_API_KEY && process.env.USE_AI_GENERATION === 'true') {
    try {
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const prompt = `Generate ${count} multiple-choice quiz questions about: ${topic}

Return ONLY valid JSON array in this format:
[
  {
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Why this answer is correct"
  }
]`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0].message.content);
      return result.questions || result;
    } catch (error) {
      console.error('Failed to generate quiz questions with AI:', error.message);
    }
  }

  // Fallback to generic questions
  return [
    {
      question: `What is the main purpose of ${topic}?`,
      options: [
        'To comply with regulations',
        'To improve workplace culture',
        'To reduce legal risks',
        'All of the above'
      ],
      correctAnswer: 3,
      explanation: 'Compliance training serves multiple purposes including regulatory compliance, cultural improvement, and risk reduction.'
    }
  ];
}

/**
 * Enhance existing content with AI
 */
async function enhanceContent(content, instruction) {
  if (!process.env.OPENAI_API_KEY || process.env.USE_AI_GENERATION !== 'true') {
    return content; // Return unchanged if AI not available
  }

  try {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `${instruction}

Original content:
${content}

Enhanced content:`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Failed to enhance content:', error.message);
    return content;
  }
}

module.exports = {
  generateCourseContent,
  generateQuizQuestions,
  enhanceContent
};
