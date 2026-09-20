/**
 * messages.hi.js — All Hindi bot sentences in ONE file
 * Teammates can edit wording here without touching logic.
 * 
 * Each key matches a conversation state.
 * Each entry has:
 *   - question: the main question for that state
 *   - ack: acknowledgement templates (array) — bot picks one before asking next question
 */

const messages = {
  // -- Welcome & Consent --
  welcome: {
    question: 'Namaste! Main aapka sahayak hoon. Main aapko aapke liye sahi training aur kaam ke vikalp dhundne mein madad karunga. Kya aap mujhse baat karna chahenge?',
  },

  consent: {
    question: 'Shuru karne se pehle, kya aap mujhe apni jaankari dene ke liye taiyaar hain? Aapki jaankari surakshit rahegi. Haan ya nahi boliye.',
    denied: 'Koi baat nahi. Jab bhi aap taiyaar hon, wapas aa sakte hain. Dhanyavaad!',
  },

  // -- Profile Questions --
  askLocation: {
    question: 'Aap kahan rehte hain? Apna gaon ya sheher, district aur state bataiye.',
    ack: [
      'Achha, aap {district} se hain.',
      'Theek hai, {district} mein rehte hain aap.',
    ],
  },

  askAge: {
    question: 'Aapki umr kitni hai? Ya aap apni umr ka andaaza bata sakte hain.',
    ack: [
      'Achha, {ageRange} saal.',
      'Theek hai.',
    ],
  },

  askEducation: {
    question: 'Aapne kitni padhai ki hai? Jaise 5th pass, 8th pass, 10th, 12th, ya kuch aur?',
    ack: [
      'Achha, aap {education} pass hain.',
      'Samajh gaya, {education} tak padhai ki hai.',
    ],
  },

  askCurrentWork: {
    question: 'Aap aajkal kya kaam karte hain? Agar kuch nahi karte toh woh bhi bata dijiye.',
    ack: [
      'Achha, {currentWork} ka kaam karte hain aap.',
      'Samajh gaya, aap {currentWork} mein hain.',
    ],
  },

  askSkills: {
    question: 'Aapko kya kya kaam aata hai? Jaise silai, kheti, computer, cooking, ya kuch aur?',
    ack: [
      'Bahut achha! {skills} aata hai aapko.',
      'Achha, yeh toh achhi skills hain.',
    ],
  },

  askInterest: {
    question: 'Aapko kaunsa kaam karna achha lagta hai? Ya kaunsa naya kaam seekhna chahte hain?',
    ack: [
      'Achha, aapko {interests} mein interest hai.',
      'Samajh gaya, {interests} pasand hai aapko.',
    ],
  },

  askWorkPreference: {
    question: 'Aap kya chahte hain — apna khud ka kaam karna (self-employment), ya kisi ke yahan naukri karna (wage employment), ya dono chalega?',
    ack: [
      'Theek hai, aap {workPreference} chahte hain.',
    ],
  },

  askMobilityConstraints: {
    question: 'Kya aap kaam ke liye gaon se bahar jaane ko taiyaar hain? Kitni door tak ja sakte hain? Aur kya koi aisi cheez hai jo kaam karne mein mushkil banati hai?',
    ack: [
      'Samajh gaya.',
      'Theek hai, note kar liya.',
    ],
  },

  askLocalOpportunities: {
    question: 'Aapke gaon ya aas-paas mein kaunsa kaam achha chalta hai? Kya aapne koi naya kaam dekha hai jo log kar rahe hain?',
    ack: [
      'Achha, yeh jaankari bahut kaam ki hai.',
      'Samajh gaya, {localOpportunities} chal raha hai wahan.',
    ],
  },

  // -- Confirm Profile --
  confirmProfile: {
    question: 'Main aapki baatein samajh gaya hoon. {profileSummary}. Kya yeh sahi hai? Agar kuch galat hai toh bataiye.',
    correct: 'Bahut achha! Ab main aapke liye sahi training aur kaam ke vikalp dhundhta hoon.',
    incorrect: 'Koi baat nahi, bataiye kya galat hai, main theek kar lunga.',
  },

  // -- Recommendations --
  recommend: {
    intro: 'Aapke liye {courseCount} training aur {livelihoodCount} kaam ke vikalp mile hain.',
    courseItem: '{rank}. {title} (NSQF Level {nsqfLevel}). {reason}',
    livelihoodItem: '{rank}. {title}. {reason}',
    disclaimer: 'Yeh sirf sujhav hain. Training centre se seat ki jaankari aur officer se eligibility zaroor confirm karein. Kisi bhi cheez ki guarantee nahi di ja sakti.',
    noResults: 'Abhi aapke profile ke hisaab se koi exact match nahi mila. Aap apne district ke officer se baat karein, woh aapki madad kar sakte hain.',
  },

  // -- Follow-up --
  followup: {
    question: 'Kya aap kuch aur jaanna chahte hain? Ya koi aur vikalp dekhne hain? "Aur dikhao" ya "bas" bol sakte hain.',
  },

  // -- End --
  end: {
    message: 'Dhanyavaad! Aapki baat khatam hui. Agar aapko dubara madad chahiye toh wapas aa sakte hain. Shubhkamnayein!',
  },

  // -- Error / fallback --
  error: {
    notUnderstood: 'Maaf kijiye, main samajh nahi paaya. Kya aap dobara bol sakte hain?',
    tooManyRetries: 'Lagta hai connection mein dikkat hai. Kripya thodi der baad dobara koshish karein.',
    maxTurns: 'Bahut baatein ho gayi! Aapka conversation yahan khatam hota hai. Agar aur madad chahiye toh naya conversation shuru karein.',
  },
};

module.exports = messages;
