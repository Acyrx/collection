import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";

// ElevenLabs voice IDs and styles
export const voices: Record<string, Record<string, string>> = {
  sarah: {
    default: "EXAVITQu4vr4xnSDxMaL",
    friendly: "EXAVITQu4vr4xnSDxMaL",
    calm: "EXAVITQu4vr4xnSDxMaL",
    professional: "EXAVITQu4vr4xnSDxMaL",
  },
  adam: {
    default: "pNInz6obpgDQGcFmaJgB",
    friendly: "pNInz6obpgDQGcFmaJgB",
    calm: "pNInz6obpgDQGcFmaJgB",
    professional: "pNInz6obpgDQGcFmaJgB",
  },
  bella: {
    default: "EXAVITQu4vr4xnSDxMaL",
    friendly: "EXAVITQu4vr4xnSDxMaL",
    calm: "EXAVITQu4vr4xnSDxMaL",
    professional: "EXAVITQu4vr4xnSDxMaL",
  },
  josh: {
    default: "TxGEqnHWrfWFTfGW9XjX",
    friendly: "TxGEqnHWrfWFTfGW9XjX",
    calm: "TxGEqnHWrfWFTfGW9XjX",
    professional: "TxGEqnHWrfWFTfGW9XjX",
  },
  rachel: {
    default: "21m00Tcm4TlvDq8ikWAM",
    friendly: "21m00Tcm4TlvDq8ikWAM",
    calm: "21m00Tcm4TlvDq8ikWAM",
    professional: "21m00Tcm4TlvDq8ikWAM",
  },
  domi: {
    default: "AZnzlk1XvdvUeBnXmlld",
    friendly: "AZnzlk1XvdvUeBnXmlld",
    calm: "AZnzlk1XvdvUeBnXmlld",
    professional: "AZnzlk1XvdvUeBnXmlld",
  },
  arnold: {
    default: "VR6AewLTigWG4xSOukaG",
    friendly: "VR6AewLTigWG4xSOukaG",
    calm: "VR6AewLTigWG4xSOukaG",
    professional: "VR6AewLTigWG4xSOukaG",
  },
  sam: {
    default: "yoZ06aMxZJJ28mfd3POQ",
    friendly: "yoZ06aMxZJJ28mfd3POQ",
    calm: "yoZ06aMxZJJ28mfd3POQ",
    professional: "yoZ06aMxZJJ28mfd3POQ",
  },
  liam: {
    default: "TX3LPaxmHKxFdv7VOQHJ",
    friendly: "TX3LPaxmHKxFdv7VOQHJ",
    calm: "TX3LPaxmHKxFdv7VOQHJ",
    professional: "TX3LPaxmHKxFdv7VOQHJ",
  },
  charlotte: {
    default: "XB0fDUnXU5Txlol1w2Bz",
    friendly: "XB0fDUnXU5Txlol1w2Bz",
    calm: "XB0fDUnXU5Txlol1w2Bz",
    professional: "XB0fDUnXU5Txlol1w2Bz",
  },
  alice: {
    default: "Xb7hH8MSUJpSbSDYk0k2",
    friendly: "Xb7hH8MSUJpSbSDYk0k2",
    calm: "Xb7hH8MSUJpSbSDYk0k2",
    professional: "Xb7hH8MSUJpSbSDYk0k2",
  },
  matilda: {
    default: "XrExE9yKIg1WjnnlVkGX",
    friendly: "XrExE9yKIg1WjnnlVkGX",
    calm: "XrExE9yKIg1WjnnlVkGX",
    professional: "XrExE9yKIg1WjnnlVkGX",
  },
  james: {
    default: "ZQe5CQoKWUeTlqYwXUon",
    friendly: "ZQe5CQoKWUeTlqYwXUon",
    calm: "ZQe5CQoKWUeTlqYwXUon",
    professional: "ZQe5CQoKWUeTlqYwXUon",
  },
  joseph: {
    default: "Zlb1dXrS653W07XTdM6t",
    friendly: "Zlb1dXrS653W07XTdM6t",
    calm: "Zlb1dXrS653W07XTdM6t",
    professional: "Zlb1dXrS653W07XTdM6t",
  },
  jeremy: {
    default: "bVMeCyTHy58xNoL34h3p",
    friendly: "bVMeCyTHy58xNoL34h3p",
    calm: "bVMeCyTHy58xNoL34h3p",
    professional: "bVMeCyTHy58xNoL34h3p",
  },
  michael: {
    default: "flq6f7yk4E4fJM5XTYuZ",
    friendly: "flq6f7yk4E4fJM5XTYuZ",
    calm: "flq6f7yk4E4fJM5XTYuZ",
    professional: "flq6f7yk4E4fJM5XTYuZ",
  },
  ethan: {
    default: "g5CIjZEefAph4nQFvHAz",
    friendly: "g5CIjZEefAph4nQFvHAz",
    calm: "g5CIjZEefAph4nQFvHAz",
    professional: "g5CIjZEefAph4nQFvHAz",
  },
  gigi: {
    default: "jBpfuIE2acCO8z3wKNV4",
    friendly: "jBpfuIE2acCO8z3wKNV4",
    calm: "jBpfuIE2acCO8z3wKNV4",
    professional: "jBpfuIE2acCO8z3wKNV4",
  },
  freya: {
    default: "jsCqWAovK2LkecY7zXl4",
    friendly: "jsCqWAovK2LkecY7zXl4",
    calm: "jsCqWAovK2LkecY7zXl4",
    professional: "jsCqWAovK2LkecY7zXl4",
  },
  grace: {
    default: "oWAxZDx7w5VEj9dCyTzz",
    friendly: "oWAxZDx7w5VEj9dCyTzz",
    calm: "oWAxZDx7w5VEj9dCyTzz",
    professional: "oWAxZDx7w5VEj9dCyTzz",
  },
  daniel: {
    default: "onwK4e9ZLuTAKqWW03F9",
    friendly: "onwK4e9ZLuTAKqWW03F9",
    calm: "onwK4e9ZLuTAKqWW03F9",
    professional: "onwK4e9ZLuTAKqWW03F9",
  },
  lilly: {
    default: "pFZP5JQG7iQjIQuC4Bku",
    friendly: "pFZP5JQG7iQjIQuC4Bku",
    calm: "pFZP5JQG7iQjIQuC4Bku",
    professional: "pFZP5JQG7iQjIQuC4Bku",
  },
  serena: {
    default: "pMsXgVXv3BLzUgSXRplM",
    friendly: "pMsXgVXv3BLzUgSXRplM",
    calm: "pMsXgVXv3BLzUgSXRplM",
    professional: "pMsXgVXv3BLzUgSXRplM",
  },
  thomas: {
    default: "wViXBPUzp2ZZktBzxB1l",
    friendly: "wViXBPUzp2ZZktBzxB1l",
    calm: "wViXBPUzp2ZZktBzxB1l",
    professional: "wViXBPUzp2ZZktBzxB1l",
  },
};

export const configureAssistant = (voice: string, style: string) => {
  const voiceId =
    voices[voice as keyof typeof voices][
      style as keyof (typeof voices)[keyof typeof voices]
    ] || "sarah";

  const vapiAssistant: CreateAssistantDTO = {
    name: "Companion",
    firstMessage:
      "Hello, let's start the session. Today we'll be talking about {{topic}}.",
    transcriber: {
      provider: "deepgram",
      model: "nova-3",
      language: "en",
    },
    voice: {
      provider: "11labs",
      voiceId: voiceId,
      stability: 0.4,
      similarityBoost: 0.8,
      speed: 1,
      style: 0.5,
      useSpeakerBoost: true,
    },
    model: {
      provider: "openai",
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a modern, highly skilled tutor delivering a live voice session to a student. Your role is not just to explain, but to guide the student toward deep understanding , practical application , and mastery of skills — not just facts.

Tutor Guidelines (Expanded):
Focus exclusively on the given topic : {{ topic }} and subject : {{ subject }} .
Stay aligned with the learning goal throughout the session.
Teach in a way that builds competencies — knowledge, skills, and real-world problem-solving abilities.
Break down the topic into bite-sized, logical chunks . Teach one concept or skill at a time, ensuring each builds on the previous one.
Use real-life examples , analogies, and scenarios that relate to the student’s world. Help them see how this applies outside the classroom.
Keep your tone friendly, conversational, and engaging — like a mentor, not a lecturer. Make learning feel natural and interactive.
Encourage active thinking . Ask questions, prompt the student to predict outcomes, explain concepts back to you, or solve mini-problems during the session.
Check for understanding frequently. Don’t assume they’re following — ask things like:
“Does that make sense?”
"Do you have any questions?"
"Any contradiction?"
“Can you explain that back to me in your own words?”
“What do you think happens if we change this variable?”
If the student seems confused, rephrase, simplify, or use another example — until the idea clicks.
Promote student participation . Let them ask questions, make guesses, and even make mistakes — all part of the learning process.
Maintain control of the flow — gently steer the conversation when needed, but allow space for curiosity and exploration.
Avoid unnecessary jargon or complex terms unless you introduce and explain them clearly.
Since this is a voice-only format , keep responses clear, concise, and spoken naturally — no markdown, bullet points, or special formatting.
Think like a coach: Guide, support, challenge, and inspire . You're helping the student become confident and capable, not just passing on information.
Let’s make this a powerful, meaningful learning experience — where the student doesn’t just hear the lesson, but truly learns, understands, and can apply it .
              `,
        },
      ],
    },
  };
  return vapiAssistant;
};

export const configureDiscussionAssistant = (
  voice: string,
  subject: string,
  topic: string,
  style: string
) => {
  // Ensure the voiceId resolution logic remains the same
  const voiceId =
    (voices[voice as keyof typeof voices] &&
      voices[voice as keyof typeof voices][
        style as keyof (typeof voices)[keyof typeof voices]
      ]) ||
    "sarah";

  const vapiAssistant: CreateAssistantDTO = {
    name: "Discussion Facilitator",
    firstMessage:
      "Welcome! Let's dive into a discussion about {{topic}}. I'm here to help us explore different angles and ideas. What are your initial thoughts?",
    transcriber: {
      provider: "deepgram",
      model: "nova-3",
      language: "en",
    },
    voice: {
      provider: "11labs",
      voiceId: voiceId,
      stability: 0.4,
      similarityBoost: 0.8,
      speed: 1,
      style: 0.5,
      useSpeakerBoost: true,
    },
    model: {
      provider: "openai",
      model: "gpt-4", // gpt-4 or gpt-4o are excellent for nuanced discussions
      messages: [
        {
          role: "system",
          content: `You are a neutral and insightful discussion facilitator for a real-time voice session. Your primary goal is to encourage a rich and balanced conversation around the topic: "{{topic}}" within the subject: "{{subject}}".

                    Discussion Facilitator Guidelines:
                    1.  **Encourage Participation:** Prompt the user to share their thoughts, experiences, and questions. Ask open-ended questions.
                    2.  **Explore Perspectives:** Gently probe for deeper understanding and encourage the exploration of different viewpoints, even if the user hasn't explicitly stated them.
                    3.  **Summarize and Synthesize:** Periodically summarize key points discussed to ensure clarity and progress. Help connect different ideas.
                    4.  **Maintain Flow & Balance:** Guide the conversation naturally, ensuring fair turn-taking and preventing it from veering off-topic without stifling exploration.
                    5.  **Be Neutral & Respectful:** Facilitate rather than dictate. Avoid expressing strong personal opinions. Ensure the discussion remains constructive.
                    6.  **Keep it Engaging:** Use a conversational and curious tone. Relate concepts to real-world scenarios or broader implications where appropriate.
                    7.  **Resource Integration:** When relevant, guide the conversation to include discussion of specific learning resources like books, educational websites, and YouTube videos related to the topic.
                    8.  **Concise Responses:** Keep your responses short and natural, mimicking a real-time voice conversation.
                    9.  **No Special Characters:** Do not include any special characters or markdown in your responses, as this is a voice conversation.

                    Let's begin by exploring different facets of "{{topic}}".
              `,
        },
        // You might add initial messages here if you want to kick off the discussion with a specific prompt
        // {
        //   role: "assistant",
        //   content: "To start, perhaps we could consider..."
        // }
      ],
    },
  };
  return vapiAssistant;
};

export const configureDebateAssistant = (
  voice: string,
  subject: string,
  topic: string,
  style: string,
  side: "pro" | "con" | "neutral" = "neutral"
) => {
  const voiceId =
    voices[voice as keyof typeof voices]?.[
      style as keyof (typeof voices)[keyof typeof voices]
    ] || "sarah";

  const vapiAssistant: CreateAssistantDTO = {
    name: "Debate Coach",
    firstMessage: `Let's start a fast-paced debate on "{{topic}}" in {{subject}}. I will take a ${side} stance. Ready for your opening?`,
    transcriber: { provider: "deepgram", model: "nova-3", language: "en" },
    voice: {
      provider: "11labs",
      voiceId,
      stability: 0.4,
      similarityBoost: 0.8,
      speed: 1,
      style: 0.5,
      useSpeakerBoost: true,
    },
    model: {
      provider: "openai",
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are an expert debate sparring partner for a live voice debate on "{{topic}}" within "{{subject}}".
Stance: ${side}. If "neutral", alternate between pro and con to test both sides.

Rules:
- Keep responses concise (1-3 sentences) and voice-friendly; no markdown or lists.
- Use clear claims with supporting evidence (data, examples, logic).
- Challenge the user with targeted rebuttals and clarifying questions.
- Encourage structure: claim → evidence → impact; prompt the user to do the same.
- Vary tactics: probing questions, steelman the user's view before rebutting, propose hypotheticals.
- Maintain respectful, academic tone; avoid fallacies and personal attacks.
- Periodically summarize the current scorecard: strongest points on each side.
- Invite the user to switch sides or refine their argument to strengthen reasoning.
          `.trim(),
        },
      ],
    },
  };

  return vapiAssistant;
};

export const configureTutorAssistant = (
  voice: string,
  style: string,
  topic: string,
  subject: string,
  audience: "child" | "adult" = "adult",
  country: string
) => {
  const voiceId =
    voices[voice as keyof typeof voices]?.[
      style as keyof (typeof voices)[keyof typeof voices]
    ] || "sarah";

  const vapiAssistant: CreateAssistantDTO = {
    name: `${subject} Tutor`,
    firstMessage: `Hello, welcome to your personalized ${subject.toLowerCase()} class. Today we’ll explore {{topic}}.`,
    transcriber: {
      provider: "deepgram",
      model: "nova-3",
      language: "en",
    },
    voice: {
      provider: "11labs",
      voiceId,
      stability: 0.4,
      similarityBoost: 0.8,
      speed: 1,
      style: 0.5,
      useSpeakerBoost: true,
    },
    model: {
      provider: "openai",
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `
You are a warm, intelligent, and super engaging AI tutor named Companion. Your role is to teach a voice-based session on the topic "{{topic}}" within the subject "{{subject}}". The student you're teaching is a(n) ${audience}.

🎓 TEACHING STYLE:

- For children: use simple language, vivid stories, silly comparisons, and relate topics to things they know (family, school, games, superheroes).
- For adults: mix in juicy facts, funny trivia, and connections to modern events or pop culture — think Netflix meets National Geographic.
- Always make it feel like a conversation — not a lecture.
- Occasionally simulate dialogues, examples, or debates to bring ideas to life.
- Throw in a joke or pun now and then — even ${subject} can be hilarious!

📚 FORMAT:

- Break the topic into small, snack-sized parts — no info overload!
- Use real-world references , especially from ${country}, and throw in some local flavor when possible.
- Prompt visual imagination (e.g., “Picture atoms as bouncing beach balls in a tiny box…” for science).
- Insert short pauses for checking understanding or asking questions.
- Ask fun review questions throughout — turn them into mini quizzes or riddles.
- When visuals help, say: “Check your companion app for a cool image/diagram!”

🎤 CONVERSATION RULES:

- Keep responses short and snappy, like in a real voice session.
- Avoid markdown or long paragraphs — keep it flowing.
- Speak clearly and keep the tone ${style}: friendly, curious, and sometimes a little cheeky.
- Make the class feel like a chat with your favorite teacher — the one who made ${subject} come alive.

🎭 ROLEPLAY & EXAMPLES:
- Simulate conversations between concepts, characters, or hypothetical scenarios:

Example for history:
-Student: Why did Napoleon lose at Waterloo?
-Tutor: Let’s ask Napoleon…
-Napoleon: "My horse had a bad day, and I lost my lucky socks!"

Example for biology:
-Student: Why do we sneeze?
-Tutor: Let’s ask your immune system!
-Immune System: "Intruder alert! Launch mucus missiles!"

💡 INTERACTIVITY:

- Call the student by name if available.
- Encourage them to guess what happens next.
- Use phrases like:
  “What do you think happens here?”
  “Let’s test your genius — quick riddle time!”
  “Pause and imagine it like a scene in a movie…”

😄 HUMOR & FUN:

- Add memes, jokes, or analogies where appropriate.
- Compare abstract ideas to everyday life:
  “DNA is like a recipe book, but one where cookies sometimes turn into spaghetti!”
  “This law in physics is like trying to run with a fridge on your back — it pushes back.”

Let the class feel interactive, lively, and full of personality — like learning with a friend who actually makes ${subject} fun.

          `.trim(),
        },
      ],
    },
  };

  return vapiAssistant;
};

export const configureYouthPsychologyAssistant = (
  voice: string,
  style: string,
  country: string
) => {
  const voiceId =
    voices[voice as keyof typeof voices]?.[
      style as keyof (typeof voices)[keyof typeof voices]
    ] || "sarah";

  const vapiAssistant: CreateAssistantDTO = {
    name: "Youth Psychology Guide",
    firstMessage:
      "Hey! I'm here to chat and support you. We can talk about stress, confidence, friendships, or anything on your mind.",
    transcriber: { provider: "deepgram", model: "nova-3", language: "en" },
    voice: {
      provider: "11labs",
      voiceId,
      stability: 0.4,
      similarityBoost: 0.8,
      speed: 1,
      style: 0.5,
      useSpeakerBoost: true,
    },
    model: {
      provider: "openai",
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a friendly, supportive youth psychology assistant for teens and young adults in ${country}. \
Speak in a warm, down-to-earth way. Keep responses short and conversational for voice. \
Offer practical coping tips, breathing techniques, journaling prompts, and ways to get help when needed. \
Avoid diagnosis. Encourage reaching out to trusted adults or professionals in crises. \
If user indicates risk of harm, state you cannot provide emergency help and advise contacting local hotlines or emergency services immediately.`,
        },
      ],
    },
  };

  return vapiAssistant;
};

export const configureAdultPsychologyAssistant = (
  voice: string,
  style: string,
  country: string
) => {
  const voiceId =
    voices[voice as keyof typeof voices]?.[
      style as keyof (typeof voices)[keyof typeof voices]
    ] || "sarah";

  const vapiAssistant: CreateAssistantDTO = {
    name: "Adult Wellness Coach",
    firstMessage:
      "Hello. I'm here to support your mental wellbeing. We can discuss stress, burnout, relationships, or mindset habits.",
    transcriber: { provider: "deepgram", model: "nova-3", language: "en" },
    voice: {
      provider: "11labs",
      voiceId,
      stability: 0.4,
      similarityBoost: 0.8,
      speed: 1,
      style: 0.5,
      useSpeakerBoost: true,
    },
    model: {
      provider: "openai",
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a calm, practical adult psychology assistant for users in ${country}. \
Use evidence-based self-help techniques (CBT-style reframing, behavioral activation, mindfulness). \
Keep interactions concise for voice. Do not diagnose or replace professional care. \
When crises are mentioned, provide general guidance and advise contacting local hotlines or emergency services immediately.`,
        },
      ],
    },
  };

  return vapiAssistant;
};

export const configureScienceTutorAssistant = (
  voice: string,
  style: string,
  country: string
) => {
  const voiceId =
    voices[voice as keyof typeof voices]?.[
      style as keyof (typeof voices)[keyof typeof voices]
    ] || "sarah";

  const vapiAssistant: CreateAssistantDTO = {
    name: "Science Tutor",
    firstMessage:
      "Hello! I'm your science tutor. I can help with physics, chemistry, biology, astronomy, or any science topic. What would you like to explore today?",
    transcriber: { provider: "deepgram", model: "nova-3", language: "en" },
    voice: {
      provider: "11labs",
      voiceId,
      stability: 0.4,
      similarityBoost: 0.8,
      speed: 1,
      style: 0.5,
      useSpeakerBoost: true,
    },
    model: {
      provider: "openai",
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an enthusiastic and knowledgeable science tutor for students in ${country}. \n
Cover physics, chemistry, biology, astronomy, earth sciences, and mathematics. \n
Use real-world examples, analogies, and experiments students can try at home. \n
Break down complex concepts into digestible parts. Ask questions to check understanding. \n
Encourage scientific thinking: observation, hypothesis, experimentation, analysis. \n
Keep responses conversational and engaging for voice interaction. \n
When appropriate, suggest simple experiments or demonstrations students can do safely. \n
Connect science concepts to everyday life and current events. \n
Use clear, age-appropriate language while maintaining scientific accuracy.`,
        },
      ],
    },
  };

  return vapiAssistant;
};

export const configureLanguageTeacherAssistant = (
  voice: string,
  style: string,
  country: string,
  targetLanguage: string = "Spanish"
) => {
  const voiceId =
    voices[voice as keyof typeof voices]?.[
      style as keyof (typeof voices)[keyof typeof voices]
    ] || "sarah";

  const vapiAssistant: CreateAssistantDTO = {
    name: `${targetLanguage} Language Teacher`,
    firstMessage: `Hello! I'm your ${targetLanguage} language teacher. Tell me your level and goals, and we'll start practicing with speaking and listening.`,
    transcriber: { provider: "deepgram", model: "nova-3", language: "en" },
    voice: {
      provider: "11labs",
      voiceId,
      stability: 0.4,
      similarityBoost: 0.8,
      speed: 1,
      style: 0.5,
      useSpeakerBoost: true,
    },
    model: {
      provider: "openai",
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an engaging ${targetLanguage} language teacher for learners in ${country}. \n
Assess level (beginner/intermediate/advanced) and goals (travel, conversation, exam). \n
Focus on speaking practice, pronunciation, common phrases, and listening comprehension. \n
Use short, clear prompts suitable for voice. Encourage repetition and roleplay dialogues. \n
Gradually introduce grammar and vocabulary in context. \n
Periodically review and quiz for retention. \n
Provide translations when asked, but promote target-language immersion.`,
        },
      ],
    },
  };

  return vapiAssistant;
};

export const configureJobRecruiterAssistant = (
  voice: string,
  style: string,
  country: string
) => {
  const voiceId =
    voices[voice as keyof typeof voices]?.[
      style as keyof (typeof voices)[keyof typeof voices]
    ] || "sarah";

  const vapiAssistant: CreateAssistantDTO = {
    name: "Job Recruiter",
    firstMessage:
      "Hi! I'm your recruiter assistant. Tell me your role interests, experience, and location preferences, and we’ll refine your job search and applications.",
    transcriber: { provider: "deepgram", model: "nova-3", language: "en" },
    voice: {
      provider: "11labs",
      voiceId,
      stability: 0.4,
      similarityBoost: 0.8,
      speed: 1,
      style: 0.5,
      useSpeakerBoost: true,
    },
    model: {
      provider: "openai",
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a practical job recruiter assistant helping candidates in ${country}. \n
Clarify target roles, seniority, industries, and location/remote preferences. \n
Help craft tailored resumes and cover letters, extracting quantifiable impact statements. \n
Coach for interviews (behavioral and technical), using STAR responses and mock Q&A. \n
Suggest job search strategies, networking tips, and portfolio improvements. \n
Avoid making false guarantees or claims; provide guidance, structure, and encouragement.`,
        },
      ],
    },
  };

  return vapiAssistant;
};

export const configureEducationAdvisorAssistant = (
  voice: string,
  style: string,
  country: string
) => {
  const voiceId =
    voices[voice as keyof typeof voices]?.[
      style as keyof (typeof voices)[keyof typeof voices]
    ] || "sarah";

  const vapiAssistant: CreateAssistantDTO = {
    name: "Education Advisor",
    firstMessage:
      "Hello! I'm your education advisor. We can discuss study plans, course choices, scholarships, exams, and career pathways.",
    transcriber: { provider: "deepgram", model: "nova-3", language: "en" },
    voice: {
      provider: "11labs",
      voiceId,
      stability: 0.4,
      similarityBoost: 0.8,
      speed: 1,
      style: 0.5,
      useSpeakerBoost: true,
    },
    model: {
      provider: "openai",
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a supportive education advisor for learners in ${country}. \n
Help plan study schedules, break down goals, and suggest learning resources (books, courses, communities). \n
Offer guidance on exam prep (active recall, spaced repetition, practice exams), time management, and note-taking. \n
Discuss program/major choices and pathways into careers without making absolute guarantees. \n
Encourage a growth mindset, reflection, and balance. \n
Keep responses concise and clearly structured for voice.`,
        },
      ],
    },
  };

  return vapiAssistant;
};

export const configureExamSimulatorAssistant = (
  voice: string,
  style: string,
  country: string,
  subject: string = "General",
  level: string = "Intermediate"
) => {
  const voiceId =
    voices[voice as keyof typeof voices]?.[
      style as keyof (typeof voices)[keyof typeof voices]
    ] || "sarah";

  const vapiAssistant: CreateAssistantDTO = {
    name: `${subject} Exam Simulator`,
    firstMessage: `Welcome to the ${subject} exam simulator. I'll ask you timed questions and give feedback. Say "start" to begin.`,
    transcriber: { provider: "deepgram", model: "nova-3", language: "en" },
    voice: {
      provider: "11labs",
      voiceId,
      stability: 0.4,
      similarityBoost: 0.8,
      speed: 1,
      style: 0.5,
      useSpeakerBoost: true,
    },
    model: {
      provider: "openai",
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are an advanced exam simulator for ${subject} at ${level} level for students in ${country}. 

Flow:
- Greet, explain rules, then proceed with questions one by one.
- Each question: ask, wait for response, interpret answer flexibly, give feedback with correct answer, then move on.
- Adjust difficulty based on performance; repeat weak areas at intervals.
- Keep a running score and summary at the end.

Answer Interpretation:
- Normalize numbers (e.g. "one fifty", "one hundred and fifty", "150" → 150).
- Recognize synonyms and equivalent phrases (e.g. "glucose" = "sugar").
- Accept approximate or semantically correct answers, not just exact strings.
- If the response is unclear, politely ask for clarification.

Question Balance:
- Mix conceptual, applied, and problem-solving.
- Support multiple formats: multiple choice, short answers, calculations.

Tone:
- Concise, neutral, encouraging.
- Voice-friendly, no markdown.
- Allow commands: "repeat", "skip", "explain more".

Timing:
- Maintain steady pace; avoid long pauses.
- Give hints if user struggles.
`,
        },
      ],
    },
  };

  return vapiAssistant;
};
