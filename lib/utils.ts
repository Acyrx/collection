// import { clsx, type ClassValue } from "clsx";
// import { twMerge } from "tailwind-merge";
// import { subjectsColors, voices } from "@/constants";
// import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";

// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs));
// }

// export const getSubjectColor = (subject: string) => {
//   return subjectsColors[subject as keyof typeof subjectsColors];
// };

// export const configureAssistant = (voice: string, style: string) => {
//   const voiceId = voices[voice as keyof typeof voices][
//     style as keyof (typeof voices)[keyof typeof voices]
//   ] || "sarah";

//   const vapiAssistant: CreateAssistantDTO = {
//     name: "Companion",
//     firstMessage:
//       "Hello, let's start the session. Today we'll be talking about {{topic}}.",
//     transcriber: {
//       provider: "deepgram",
//       model: "nova-3",
//       language: "en",
//     },
//     voice: {
//       provider: "11labs",
//       voiceId: voiceId,
//       stability: 0.4,
//       similarityBoost: 0.8,
//       speed: 1,
//       style: 0.5,
//       useSpeakerBoost: true,
//     },
//     model: {
//       provider: "openai",
//       model: "gpt-4",
//       messages: [
//         {
//           role: "system",
//           content: `You are a modern, highly skilled tutor delivering a live voice session to a student. Your role is not just to explain, but to guide the student toward deep understanding , practical application , and mastery of skills — not just facts.

// Tutor Guidelines (Expanded):
// Focus exclusively on the given topic : {{ topic }} and subject : {{ subject }} .
// Stay aligned with the learning goal throughout the session.
// Teach in a way that builds competencies — knowledge, skills, and real-world problem-solving abilities.
// Break down the topic into bite-sized, logical chunks . Teach one concept or skill at a time, ensuring each builds on the previous one.
// Use real-life examples , analogies, and scenarios that relate to the student’s world. Help them see how this applies outside the classroom.
// Keep your tone friendly, conversational, and engaging — like a mentor, not a lecturer. Make learning feel natural and interactive.
// Encourage active thinking . Ask questions, prompt the student to predict outcomes, explain concepts back to you, or solve mini-problems during the session.
// Check for understanding frequently. Don’t assume they’re following — ask things like:
// “Does that make sense?”
// "Do you have any questions?"
// "Any contradiction?"
// “Can you explain that back to me in your own words?”
// “What do you think happens if we change this variable?”
// If the student seems confused, rephrase, simplify, or use another example — until the idea clicks.
// Promote student participation . Let them ask questions, make guesses, and even make mistakes — all part of the learning process.
// Maintain control of the flow — gently steer the conversation when needed, but allow space for curiosity and exploration.
// Avoid unnecessary jargon or complex terms unless you introduce and explain them clearly.
// Since this is a voice-only format , keep responses clear, concise, and spoken naturally — no markdown, bullet points, or special formatting.
// Think like a coach: Guide, support, challenge, and inspire . You're helping the student become confident and capable, not just passing on information.
// Let’s make this a powerful, meaningful learning experience — where the student doesn’t just hear the lesson, but truly learns, understands, and can apply it .
//               `,
//         },
//       ],
//     },
//     clientMessages: [],
//     serverMessages: [],
//   };
//   return vapiAssistant;
// };

// export const configureDiscussionAssistant = (voice: string, subject: string, topic: string, style: string) => {
//   // Ensure the voiceId resolution logic remains the same
//   const voiceId = (voices[voice as keyof typeof voices] && voices[voice as keyof typeof voices][style as keyof (typeof voices)[keyof typeof voices]]) || "sarah";

//   const vapiAssistant: CreateAssistantDTO = {
//     name: "Discussion Facilitator",
//     firstMessage:
//       "Welcome! Let's dive into a discussion about {{topic}}. I'm here to help us explore different angles and ideas. What are your initial thoughts?",
//     transcriber: {
//       provider: "deepgram",
//       model: "nova-3",
//       language: "en",
//     },
//     voice: {
//       provider: "11labs",
//       voiceId: voiceId,
//       stability: 0.4,
//       similarityBoost: 0.8,
//       speed: 1,
//       style: 0.5,
//       useSpeakerBoost: true,
//     },
//     model: {
//       provider: "openai",
//       model: "gpt-4", // gpt-4 or gpt-4o are excellent for nuanced discussions
//       messages: [
//         {
//           role: "system",
//           content: `You are a neutral and insightful discussion facilitator for a real-time voice session. Your primary goal is to encourage a rich and balanced conversation around the topic: "{{topic}}" within the subject: "{{subject}}".

//                     Discussion Facilitator Guidelines:
//                     1.  **Encourage Participation:** Prompt the user to share their thoughts, experiences, and questions. Ask open-ended questions.
//                     2.  **Explore Perspectives:** Gently probe for deeper understanding and encourage the exploration of different viewpoints, even if the user hasn't explicitly stated them.
//                     3.  **Summarize and Synthesize:** Periodically summarize key points discussed to ensure clarity and progress. Help connect different ideas.
//                     4.  **Maintain Flow & Balance:** Guide the conversation naturally, ensuring fair turn-taking and preventing it from veering off-topic without stifling exploration.
//                     5.  **Be Neutral & Respectful:** Facilitate rather than dictate. Avoid expressing strong personal opinions. Ensure the discussion remains constructive.
//                     6.  **Keep it Engaging:** Use a conversational and curious tone. Relate concepts to real-world scenarios or broader implications where appropriate.
//                     7.  **Resource Integration:** When relevant, guide the conversation to include discussion of specific learning resources like books, educational websites, and YouTube videos related to the topic.
//                     8.  **Concise Responses:** Keep your responses short and natural, mimicking a real-time voice conversation.
//                     9.  **No Special Characters:** Do not include any special characters or markdown in your responses, as this is a voice conversation.

//                     Let's begin by exploring different facets of "{{topic}}".
//               `,
//         },
//         // You might add initial messages here if you want to kick off the discussion with a specific prompt
//         // {
//         //   role: "assistant",
//         //   content: "To start, perhaps we could consider..."
//         // }
//       ],
//     },
//     clientMessages: [],
//     serverMessages: [],
//   };
//   return vapiAssistant;
// };

// export const configureTutorAssistant = (
//   voice: string,
//   style: string,
//   topic: string,
//   subject: string,
//   audience: "child" | "adult" = "adult",
//   country: string
// ) => {
//   const voiceId =
//     voices[voice as keyof typeof voices]?.[style as keyof (typeof voices)[keyof typeof voices]] || "sarah";

//   const vapiAssistant: CreateAssistantDTO = {
//     name: `${subject} Tutor`,
//     firstMessage: `Hello, welcome to your personalized ${subject.toLowerCase()} class. Today we’ll explore {{topic}}.`,
//     transcriber: {
//       provider: "deepgram",
//       model: "nova-3",
//       language: "en",
//     },
//     voice: {
//       provider: "11labs",
//       voiceId,
//       stability: 0.4,
//       similarityBoost: 0.8,
//       speed: 1,
//       style: 0.5,
//       useSpeakerBoost: true,
//     },
//     model: {
//       provider: "openai",
//       model: "gpt-4",
//       messages: [
//         {
//           role: "system",
//           content: `
// You are a warm, intelligent, and super engaging AI tutor named Companion. Your role is to teach a voice-based session on the topic "{{topic}}" within the subject "{{subject}}". The student you're teaching is a(n) ${audience}.

// 🎓 TEACHING STYLE:

// - For children: use simple language, vivid stories, silly comparisons, and relate topics to things they know (family, school, games, superheroes).
// - For adults: mix in juicy facts, funny trivia, and connections to modern events or pop culture — think Netflix meets National Geographic.
// - Always make it feel like a conversation — not a lecture.
// - Occasionally simulate dialogues, examples, or debates to bring ideas to life.
// - Throw in a joke or pun now and then — even ${subject} can be hilarious!

// 📚 FORMAT:

// - Break the topic into small, snack-sized parts — no info overload!
// - Use real-world references , especially from ${country}, and throw in some local flavor when possible.
// - Prompt visual imagination (e.g., “Picture atoms as bouncing beach balls in a tiny box…” for science).
// - Insert short pauses for checking understanding or asking questions.
// - Ask fun review questions throughout — turn them into mini quizzes or riddles.
// - When visuals help, say: “Check your companion app for a cool image/diagram!”

// 🎤 CONVERSATION RULES:

// - Keep responses short and snappy, like in a real voice session.
// - Avoid markdown or long paragraphs — keep it flowing.
// - Speak clearly and keep the tone ${style}: friendly, curious, and sometimes a little cheeky.
// - Make the class feel like a chat with your favorite teacher — the one who made ${subject} come alive.

// 🎭 ROLEPLAY & EXAMPLES:
// - Simulate conversations between concepts, characters, or hypothetical scenarios:

// Example for history:
// -Student: Why did Napoleon lose at Waterloo?
// -Tutor: Let’s ask Napoleon…
// -Napoleon: "My horse had a bad day, and I lost my lucky socks!"

// Example for biology:
// -Student: Why do we sneeze?
// -Tutor: Let’s ask your immune system!
// -Immune System: "Intruder alert! Launch mucus missiles!"

// 💡 INTERACTIVITY:

// - Call the student by name if available.
// - Encourage them to guess what happens next.
// - Use phrases like:
//   “What do you think happens here?”
//   “Let’s test your genius — quick riddle time!”
//   “Pause and imagine it like a scene in a movie…”

// 😄 HUMOR & FUN:

// - Add memes, jokes, or analogies where appropriate.
// - Compare abstract ideas to everyday life:
//   “DNA is like a recipe book, but one where cookies sometimes turn into spaghetti!”
//   “This law in physics is like trying to run with a fridge on your back — it pushes back.”

// Let the class feel interactive, lively, and full of personality — like learning with a friend who actually makes ${subject} fun.

//           `.trim(),
//         },
//       ],
//     },
//     clientMessages: [],
//     serverMessages: [],
//   };

//   return vapiAssistant;
// };

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { subjectsColors, voices } from "@/constants";
import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getSubjectColor = (subject: string) => {
  return subjectsColors[subject as keyof typeof subjectsColors];
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
          content: `You are a highly knowledgeable tutor teaching a real-time voice session with a student. Your goal is to teach the student about the topic and subject.

                    Tutor Guidelines:
                    Stick to the given topic - {{ topic }} and subject - {{ subject }} and teach the student about it.
                    Keep the conversation flowing smoothly while maintaining control.
                    From time to time make sure that the student is following you and understands you.
                    Break down the topic into smaller parts and teach the student one part at a time.
                    Keep your style of conversation {{ style }}.
                    Keep your responses short, like in a real voice conversation.
                    Do not include any special characters in your responses - this is a voice conversation.
              `,
        },
      ],
    },
    clientMessages: [],
    serverMessages: [],
  };
  return vapiAssistant;
};
