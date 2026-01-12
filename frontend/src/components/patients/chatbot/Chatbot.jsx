// components/chatbot/ChatBot.jsx
import React, { useState, useRef, useEffect } from 'react';
import MedicinePopup from '../../../components/patients/chatbot/MedicinePopup';

const ChatBot = ({ onClose, initialLanguage = 'English' }) => {
  function getGreeting(lang) {
    switch(lang) {
      case 'Hindi': return "नमस्ते! मैं आपकी AI मेडिकल सहायक हूं। आप किस लक्षण के बारे में पूछना चाहते हैं?";
      case 'Punjabi': return "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡੀ AI ਮੈਡੀਕਲ ਸਹਾਇਕ ਹਾਂ। ਤੁਸੀਂ ਕਿਸ ਲੱਛਣ ਬਾਰੇ ਪੁੱਛਣਾ ਚਾਹੁੰਦੇ ਹੋ?";
      default: return "Hello! I'm your AI Medical Assistant. What symptoms would you like to ask about?";
    }
  }

  const [messages, setMessages] = useState(() => [
    {
      id: 1,
      text: getGreeting(initialLanguage),
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMedicinePopup, setShowMedicinePopup] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [language, setLanguage] = useState(initialLanguage);
  const [voiceAssistant, setVoiceAssistant] = useState(false);
  const messagesEndRef = useRef(null);
   
  const scrollRef = useRef(null);
  const scrollIntervalRef = useRef(null);

  const startScroll = () => {
    const container = scrollRef.current;
    if (!container) return;

    let scrollAmount = container.scrollLeft;

    scrollIntervalRef.current = setInterval(() => {
      scrollAmount += 1;

      if (scrollAmount >= container.scrollWidth - container.clientWidth) {
        scrollAmount = 0;
      }

      container.scrollTo({
        left: scrollAmount,
        behavior: "smooth",
      });
    }, 40);
  };

  const stopScroll = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  useEffect(() => {
    startScroll();
    return () => stopScroll();
  }, []);

  // Doctor data
  const doctors = {
    fever: { 
      name: getTranslation("Dr. Rajesh Sharma", "डॉ. राजेश शर्मा", "ਡਾ. ਰਾਜੇਸ਼ ਸ਼ਰਮਾ"), 
      specialization: getTranslation("General Physician", "सामान्य चिकित्सक", "ਜਨਰਲ ਫਿਜੀਸ਼ੀਅਨ"),
      contact: "9876543210",
      fee: getTranslation("₹500", "₹500", "₹500"),
      availability: getTranslation("Mon-Fri 9AM-6PM", "सोम-शुक्र 9AM-6PM", "ਸੋਮ-ਸ਼ੁੱਕਰ 9AM-6PM")
    },
    vomiting: { 
      name: getTranslation("Dr. Priya Singh", "डॉ. प्रिया सिंह", "ਡਾ. ਪ੍ਰਿਯਾ ਸਿੰਘ"), 
      specialization: getTranslation("Gastroenterologist", "गैस्ट्रोएंटेरोलॉजिस्ट", "ਗੈਸਟ੍ਰੋਐਂਟਰੋਲੋਜਿਸਟ"),
      contact: "9876543211",
      fee: getTranslation("₹800", "₹800", "₹800"),
      availability: getTranslation("Mon-Sat 10AM-7PM", "सोम-शनि 10AM-7PM", "ਸੋਮ-ਸ਼ਨੀ 10AM-7PM")
    },
    headache: { 
      name: getTranslation("Dr. Amit Kumar", "डॉ. अमित कुमार", "ਡਾ. ਅਮਿਤ ਕੁਮਾਰ"), 
      specialization: getTranslation("Neurologist", "न्यूरोलॉजिस्ट", "ਨਿuroਲੋਜਿਸਟ"),
      contact: "9876543212",
      fee: getTranslation("₹1000", "₹1000", "₹1000"),
      availability: getTranslation("Tue-Sat 11AM-8PM", "मंगल-शनि 11AM-8PM", "ਮੰਗਲ-ਸ਼ਨੀ 11AM-8PM")
    },
    cough: { 
      name: getTranslation("Dr. Sunita Reddy", "डॉ. सुनीता रेड्डी", "ਡਾ. ਸੁਨੀਤਾ ਰੈੱਡੀ"), 
      specialization: getTranslation("Pulmonologist", "पल्मोनोलॉजिस्ट", "ਪਲਮੋਨੋਲੋਜਿਸਟ"),
      contact: "9876543213",
      fee: getTranslation("₹700", "₹700", "₹700"),
      availability: getTranslation("Wed-Sun 9AM-5PM", "बुध-रवि 9AM-5PM", "ਬੁੱਧ-ਐਤ 9AM-5PM")
    },
    allergy: { 
      name: getTranslation("Dr. Anjali Verma", "डॉ. अंजलि वर्मा", "ਡਾ. ਅੰਜਲੀ ਵਰਮਾ"), 
      specialization: getTranslation("Allergist", "एलर्जिस्ट", "ਐਲਰਜਿਸਟ"),
      contact: "9876543214",
      fee: getTranslation("₹600", "₹600", "₹600"),
      availability: getTranslation("Mon-Fri 10AM-6PM", "सोम-शुक्र 10AM-6PM", "ਸੋਮ-ਸ਼ੁੱਕਰ 10AM-6PM")
    },
    default: { 
      name: getTranslation("Dr. Arvind Patel", "डॉ. अरविंद पटेल", "ਡਾ. ਅਰਵਿੰਦ ਪਟੇਲ"), 
      specialization: getTranslation("General Practitioner", "सामान्य चिकित्सक", "ਜਨਰਲ ਪ੍ਰੈਕਟੀਸ਼ਨਰ"),
      contact: "9876543215",
      fee: getTranslation("₹400", "₹400", "₹400"),
      availability: getTranslation("All days 8AM-9PM", "सभी दिन 8AM-9PM", "ਸਾਰੇ ਦਿਨ 8AM-9PM")
    }
  };

  // Medicine data
  const medicineData = {
    fever: [
      { 
        id: 1, 
        name: "Paracetamol", 
        image: "💊", 
        description: getTranslation("For fever and pain relief", "बुखार और दर्द से राहत के लिए", "ਬੁਖਾਰ ਅਤੇ ਦਰਦ ਦੀ ਰਾਹਤ ਲਈ"),
        dosage: getTranslation("500mg every 6 hours", "500mg हर 6 घंटे में", "500mg ਹਰ 6 ਘੰਟਿਆਂ ਬਾਅਦ"),
        activeIngredient: getTranslation("Acetaminophen", "एसिटामिनोफेन", "ਐਸੇਟਾਮਿਨੋਫੇਨ"),
        precautions: getTranslation("Do not exceed 4g per day", "प्रति दिन 4g से अधिक न लें", "ਪ੍ਰਤੀ ਦਿਨ 4g ਤੋਂ ਵੱਧ ਨਾ ਲਓ"),
        sideEffects: getTranslation("Liver damage in overdose", "ओवरडोज में लिवर क्षति", "ਓਵਰਡੋਜ਼ ਵਿੱਚ ਲੀਵਰ ਨੁਕਸਾਨ"),
        storage: getTranslation("Store at room temperature", "कमरे के तापमान पर रखें", "ਕਮਰੇ ਦੇ ਤਾਪਮਾਨ 'ਤੇ ਰੱਖੋ"),
        relatedSymptom: "fever" 
      },
      { 
        id: 2, 
        name: "Ibuprofen", 
        image: "🟡", 
        description: getTranslation("Anti-inflammatory for fever", "बुखार के लिए सूजनरोधी", "ਬੁਖਾਰ ਲਈ ਸੋਜ਼ਨ ਰੋਧਕ"),
        dosage: getTranslation("400mg every 8 hours", "400mg हर 8 घंटे में", "400mg ਹਰ 8 ਘੰਟਿਆਂ ਬਾਅਦ"),
        activeIngredient: "Ibuprofen",
        precautions: getTranslation("Take with food", "भोजन के साथ लें", "ਖਾਣੇ ਨਾਲ ਲਓ"),
        sideEffects: getTranslation("Stomach upset, dizziness", "पेट खराब, चक्कर आना", "ਪੇਟ ਖਰਾਬ, ਚੱਕਰ ਆਉਣਾ"),
        storage: getTranslation("Protect from light", "रोशनी से बचाएं", "ਰੋਸ਼ਨੀ ਤੋਂ ਬਚਾਓ"),
        relatedSymptom: "fever" 
      }
    ],
    vomiting: [
      { 
        id: 3, 
        name: "Ondansetron", 
        image: "💊", 
        description: getTranslation("Anti-nausea medication", "मतली रोधी दवा", "ਮਤਲੀ ਰੋਧਕ ਦਵਾਈ"),
        dosage: getTranslation("4-8mg as needed", "आवश्यकता के अनुसार 4-8mg", "ਲੋੜ ਅਨੁਸਾਰ 4-8mg"),
        activeIngredient: "Ondansetron",
        precautions: getTranslation("May cause constipation", "कब्ज पैदा कर सकता है", "ਕਬਜ਼ ਪੈਦਾ ਕਰ ਸਕਦਾ ਹੈ"),
        sideEffects: getTranslation("Headache, fatigue", "सिरदर्द, थकान", "ਸਿਰਦਰਦ, ਥਕਾਵਟ"),
        storage: getTranslation("Store below 30°C", "30°C से नीचे रखें", "30°C ਤੋਂ ਹੇਠਾਂ ਰੱਖੋ"),
        relatedSymptom: "vomiting" 
      }
    ],
    headache: [
      { 
        id: 4, 
        name: "Sumatriptan", 
        image: "💊", 
        description: getTranslation("For migraine relief", "माइग्रेन से राहत के लिए", "ਮਾਈਗ੍ਰੇਨ ਤੋਂ ਰਾਹਤ ਲਈ"),
        dosage: getTranslation("50-100mg as needed", "आवश्यकता के अनुसार 50-100mg", "ਲੋੜ ਅਨੁਸਾਰ 50-100mg"),
        activeIngredient: "Sumatriptan",
        precautions: getTranslation("Not for daily use", "दैनिक उपयोग के लिए नहीं", "ਰੋਜ਼ਾਨਾ ਵਰਤੋਂ ਲਈ ਨਹੀਂ"),
        sideEffects: getTranslation("Chest tightness, dizziness", "सीने में जकड़न, चक्कर आना", "ਛਾਤੀ ਵਿੱਚ ਜਕੜਨ, ਚੱਕਰ ਆਉਣਾ"),
        storage: getTranslation("Keep in original packaging", "मूल पैकेजिंग में रखें", "ਅਸਲੀ ਪੈਕੇਜਿੰਗ ਵਿੱਚ ਰੱਖੋ"),
        relatedSymptom: "headache" 
      }
    ],
    cough: [
      { 
        id: 5, 
        name: "Dextromethorphan", 
        image: "🟤", 
        description: getTranslation("Cough suppressant", "खांसी दबाने वाला", "ਖਾਂਸੀ ਦਬਾਉਣ ਵਾਲਾ"),
        dosage: getTranslation("10-20mg every 4-6 hours", "हर 4-6 घंटे में 10-20mg", "ਹਰ 4-6 ਘੰਟਿਆਂ ਬਾਅਦ 10-20mg"),
        activeIngredient: "Dextromethorphan",
        precautions: getTranslation("Avoid with MAO inhibitors", "MAO अवरोधकों के साथ न लें", "MAO ਇਨਹਿਬੀਟਰਾਂ ਨਾਲ ਨਾ ਲਓ"),
        sideEffects: getTranslation("Drowsiness, nausea", "नींद आना, मतली", "ਨੀਂਦ ਆਉਣੀ, ਮਤਲੀ"),
        storage: getTranslation("Keep away from children", "बच्चों से दूर रखें", "ਬੱਚਿਆਂ ਤੋਂ ਦੂਰ ਰੱਖੋ"),
        relatedSymptom: "cough" 
      }
    ]
  };

  // Helper function for translations
  function getTranslation(english, hindi, punjabi) {
    switch(language) {
      case 'Hindi': return hindi;
      case 'Punjabi': return punjabi;
      default: return english;
    }
  }

  // getGreeting moved earlier to avoid usage before declaration

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleMedicineClick = (medicine) => {
    setSelectedMedicine(medicine);
    const symptom = medicine.relatedSymptom || 'default';
    setDoctorInfo(doctors[symptom]);
    setShowMedicinePopup(true);
    
    // Voice announcement if enabled
    if (voiceAssistant) {
      const utterance = new SpeechSynthesisUtterance(
        `${medicine.name}. ${medicine.description}. Dosage: ${medicine.dosage}`
      );
      utterance.lang = language === 'Hindi' ? 'hi-IN' : language === 'Punjabi' ? 'pa-IN' : 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  // AI Response Generator
  const getAIResponse = (userMessage) => {
    setIsTyping(true);
    
    setTimeout(() => {
      let response = '';
      let medicines = [];
      let doctorType = 'default';
      
      // AI logic to analyze symptoms
      const messageLower = userMessage.toLowerCase();
      
      if (messageLower.includes('fever') || messageLower.includes('temperature')) {
        response = getTranslation(
          "For fever, I recommend rest, hydration, and fever-reducing medication. Here are some options:",
          "बुखार के लिए, मैं आराम, हाइड्रेशन और बुखार कम करने की दवा की सलाह देता हूं। यहां कुछ विकल्प हैं:",
          "ਬੁਖਾਰ ਲਈ, ਮੈਂ ਆਰਾਮ, ਹਾਈਡ੍ਰੇਸ਼ਨ ਅਤੇ ਬੁਖਾਰ ਘਟਾਉਣ ਵਾਲੀ ਦਵਾਈ ਦੀ ਸਿਫਾਰਸ਼ ਕਰਦਾ ਹਾਂ। ਇੱਥੇ ਕੁਝ ਵਿਕਲਪ ਹਨ:"
        );
        medicines = medicineData.fever;
        doctorType = 'fever';
      }
      else if (messageLower.includes('vomit') || messageLower.includes('nausea')) {
        response = getTranslation(
          "For vomiting/nausea, stay hydrated with small sips of water. Avoid solid foods initially. These medicines may help:",
          "उल्टी/मतली के लिए, पानी की छोटी घूंट से हाइड्रेटेड रहें। शुरुआत में ठोस खाद्य पदार्थों से बचें। ये दवाएं मदद कर सकती हैं:",
          "ਉਲਟੀ/ਮਤਲੀ ਲਈ, ਪਾਣੀ ਦੀਆਂ ਛੋਟੀਆਂ ਘੁੱਟਾਂ ਨਾਲ ਹਾਈਡ੍ਰੇਟਿਡ ਰਹੋ। ਸ਼ੁਰੂਆਤ ਵਿੱਚ ਠੋਸ ਖਾਣੇ ਤੋਂ ਬਚੋ। ਇਹ ਦਵਾਈਆਂ ਮਦਦ ਕਰ ਸਕਦੀਆਂ ਹਨ:"
        );
        medicines = medicineData.vomiting;
        doctorType = 'vomiting';
      }
      else if (messageLower.includes('headache') || messageLower.includes('migraine')) {
        response = getTranslation(
          "For headaches, rest in a quiet, dark room. Hydration and appropriate medication can help. Consider these options:",
          "सिरदर्द के लिए, एक शांत, अंधेरे कमरे में आराम करें। हाइड्रेशन और उपयुक्त दवा मदद कर सकती है। इन विकल्पों पर विचार करें:",
          "ਸਿਰਦਰਦ ਲਈ, ਇੱਕ ਸ਼ਾਂਤ, ਹਨੇਰੇ ਕਮਰੇ ਵਿੱਚ ਆਰਾਮ ਕਰੋ। ਹਾਈਡ੍ਰੇਸ਼ਨ ਅਤੇ ਉਚਿਤ ਦਵਾਈ ਮਦਦ ਕਰ ਸਕਦੀ ਹੈ। ਇਨ੍ਹਾਂ ਵਿਕਲਪਾਂ 'ਤੇ ਵਿਚਾਰ ਕਰੋ:"
        );
        medicines = medicineData.headache;
        doctorType = 'headache';
      }
      else if (messageLower.includes('cough') || messageLower.includes('cold')) {
        response = getTranslation(
          "For cough, stay hydrated and use cough drops if needed. These medications may provide relief:",
          "खांसी के लिए, हाइड्रेटेड रहें और आवश्यकता होने पर खांसी की गोलियां लें। ये दवाएं राहत प्रदान कर सकती हैं:",
          "ਖਾਂਸੀ ਲਈ, ਹਾਈਡ੍ਰੇਟਿਡ ਰਹੋ ਅਤੇ ਜੇ ਲੋੜ ਹੋਵੇ ਤਾਂ ਖਾਂਸੀ ਦੀਆਂ ਗੋਲੀਆਂ ਵਰਤੋਂ। ਇਹ ਦਵਾਈਆਂ ਰਾਹਤ ਦੇ ਸਕਦੀਆਂ ਹਨ:"
        );
        medicines = medicineData.cough;
        doctorType = 'cough';
      }
      else {
        response = getTranslation(
          "I understand you have health concerns. For specific symptoms like fever, vomiting, headache, or cough, I can provide more targeted information. Please describe your symptoms in detail.",
          "मैं समझता हूं कि आपको स्वास्थ्य संबंधी चिंताएं हैं। बुखार, उल्टी, सिरदर्द, या खांसी जैसे विशिष्ट लक्षणों के लिए, मैं अधिक लक्षित जानकारी प्रदान कर सकता हूं। कृपया अपने लक्षणों का विस्तार से वर्णन करें।",
          "ਮੈਂ ਸਮਝਦਾ ਹਾਂ ਕਿ ਤੁਹਾਨੂੰ ਸਿਹਤ ਸੰਬੰਧੀ ਚਿੰਤਾਵਾਂ ਹਨ। ਬੁਖਾਰ, ਉਲਟੀ, ਸਿਰਦਰਦ, ਜਾਂ ਖਾਂਸੀ ਵਰਗੇ ਖਾਸ ਲੱਛਣਾਂ ਲਈ, ਮੈਂ ਹੋਰ ਨਿਸ਼ਾਨਾ ਬੰਦ ਜਾਣਕਾਰੀ ਦੇ ਸਕਦਾ ਹਾਂ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਲੱਛਣਾਂ ਦਾ ਵਿਸਤਾਰ ਨਾਲ ਵਰਣਨ ਕਰੋ।"
        );
      }

      const botResponse = {
        id: messages.length + 2,
        text: response,
        sender: 'bot',
        medicines: medicines,
        doctorType: doctorType,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      
      setMessages(prev => [...prev, botResponse]);
      
      // Voice response if enabled
      if (voiceAssistant && medicines.length > 0) {
        const voiceMsg = new SpeechSynthesisUtterance(
          language === 'English' ? 
            `I found ${medicines.length} medicines for you. ${response}` :
            language === 'Hindi' ?
              `मैंने आपके लिए ${medicines.length} दवाएं ढूंढी हैं।` :
              `ਮੈਂ ਤੁਹਾਡੇ ਲਈ ${medicines.length} ਦਵਾਈਆਂ ਲੱਭੀਆਂ ਹਨ।`
        );
        voiceMsg.lang = language === 'Hindi' ? 'hi-IN' : language === 'Punjabi' ? 'pa-IN' : 'en-US';
        speechSynthesis.speak(voiceMsg);
      }
      
      setIsTyping(false);
    }, 800);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    setMessages([...messages, userMessage]);
    setInput('');

    // Get AI response
    getAIResponse(input);
  };

  const quickQuestions = getTranslation(
    ["Fever with headache", "Nausea and vomiting", "Persistent cough", "Migraine pain", "High temperature"],
    ["बुखार के साथ सिरदर्द", "मतली और उल्टी", "लगातार खांसी", "माइग्रेन दर्द", "तेज बुखार"],
    ["ਬੁਖਾਰ ਦੇ ਨਾਲ ਸਿਰਦਰਦ", "ਮਤਲੀ ਅਤੇ ਉਲਟੀ", "ਲਗਾਤਾਰ ਖਾਂਸੀ", "ਮਾਈਗ੍ਰੇਨ ਦਰਦ", "ਤੇਜ਼ ਬੁਖਾਰ"]
  );

  const renderMedicineCards = (medicines) => {
    return (
      <div className="mt-3">
        <p className="text-xs text-gray-600 mb-2">
          {getTranslation(
            "Click on a medicine for details:",
            "विवरण के लिए दवा पर क्लिक करें:",
            "ਵੇਰਵਿਆਂ ਲਈ ਦਵਾਈ 'ਤੇ ਕਲਿੱਕ ਕਰੋ:"
          )}
        </p>
        <div className="flex overflow-x-auto gap-3 pb-2 -mx-2 px-2 scrollbar-hide">
          {medicines.map(medicine => (
            <div 
              key={medicine.id}
              onClick={() => handleMedicineClick(medicine)}
              className=" shrink-0 w-48 bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-blue-400 hover:scale-[1.02]"
            >
              <div className="flex items-start mb-2">
                <div className="text-3xl mr-3">{medicine.image}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-sm">{medicine.name}</h4>
                  <p className="text-xs text-gray-600 line-clamp-2">{medicine.description}</p>
                </div>
              </div>
              <div className="text-xs text-blue-600 font-medium flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                {getTranslation("View details", "विवरण देखें", "ਵੇਰਵੇ ਦੇਖੋ")}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col  h-full bg-linear-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-teal-500 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-white font-bold text-lg">
              {getTranslation("Medical Assistant", "चिकित्सा सहायक", "ਮੈਡੀਕਲ ਸਹਾਇਕ")}
            </h3>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Voice Toggle */}
          <button
            onClick={() => setVoiceAssistant(!voiceAssistant)}
            className={`p-2 rounded-full ${voiceAssistant ? 'bg-white text-blue-600' : 'bg-blue-700 text-white'}`}
            title={getTranslation("Voice Assistant", "वॉयस असिस्टेंट", "ਵੌਇਸ ਅਸਿਸਟੈਂਟ")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white bg-opacity-20 border text-gray-600 border-white border-opacity-30 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
          >
            <option value="English">English</option>
            <option value="Hindi">हिंदी</option>
            <option value="Punjabi">ਪੰਜਾਬੀ</option>
          </select>
          
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div key={message.id} className={`mb-6 ${message.sender === 'user' ? 'text-right' : ''}`}>
            <div className={`inline-block max-w-[90%] ${message.sender === 'user' ? 'text-left' : ''}`}>
              <div className={`inline-flex items-start max-w-full ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={` shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.sender === 'user' ? 'ml-2 bg-blue-100' : 'mr-2 bg-teal-100'}`}>
                  {message.sender === 'user' ? (
                    <span className="text-blue-600 text-sm">👤</span>
                  ) : (
                    <span className="text-teal-600 text-sm">🤖</span>
                  )}
                </div>
                
                <div>
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-sm ${
                      message.sender === 'user'
                        ? 'bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    {message.sender === 'bot' && message.medicines && renderMedicineCards(message.medicines)}
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 flex items-center ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <span className="mr-2">{message.timestamp}</span>
                    <span>•</span>
                    <span className="ml-2">
                      {message.sender === 'user' 
                        ? getTranslation("You", "आप", "ਤੁਸੀਂ")
                        : getTranslation("Assistant", "सहायक", "ਸਹਾਇਕ")
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Enhanced Typing Indicator */}
        {isTyping && (
          <div className="flex items-center mb-6">
            <div className=" shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-2 bg-teal-100">
              <span className="text-teal-600 text-sm">🤖</span>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-teal-500 rounded-full"
                    style={{
                      animation: `bounce 1.4s infinite ${i * 0.2}s`
                    }}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {getTranslation("AI is thinking...", "एआई सोच रहा है...", "ਏਆਈ ਸੋਚ ਰਿਹਾ ਹੈ...")}
              </p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

     {/* Quick Questions */}
    <div className="px-4 pt-3 border-t border-gray-200 bg-gray-50">
      <p className="text-xs text-gray-600 mb-2 font-medium">
        {getTranslation("Common symptoms:", "सामान्य लक्षण:", "ਆਮ ਲੱਛਣ:")}
      </p>

      <div
        ref={scrollRef}
        onMouseEnter={stopScroll}
        onMouseLeave={startScroll}
        className="flex overflow-x-auto gap-2 mb-3 pb-2 scrollbar-hide scroll-smooth"
      >
        {quickQuestions.map((question, index) => (
          <button
            key={index}
            onClick={() => {
              setInput(question);
              setTimeout(() => {
                handleSend({ preventDefault: () => {} });
              }, 500);
            }}
            className="shrink-0 cursor-pointer text-xs bg-white border border-blue-100 text-blue-700 px-3 py-2 rounded-full hover:bg-blue-50 transition-colors whitespace-nowrap shadow-sm hover:shadow"
          >
            {question}
          </button>
        ))}
      </div>
    </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSend}>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={getTranslation(
                "Describe your symptoms (fever, headache, etc.)...",
                "अपने लक्षणों का वर्णन करें (बुखार, सिरदर्द, आदि)...",
                "ਆਪਣੇ ਲੱਛਣਾਂ ਦਾ ਵਰਣਨ ਕਰੋ (ਬੁਖਾਰ, ਸਿਰਦਰਦ, ਆਦਿ)..."
              )}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-linear-to-r from-blue-600 to-teal-500 text-white p-3 rounded-full hover:from-blue-700 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">
            {getTranslation(
              "AI-powered responses • Instant medicine suggestions • Doctor referrals",
              "एआई-संचालित प्रतिक्रियाएं • तत्काल दवा सुझाव • डॉक्टर रेफरल",
              "ਏਆਈ-ਸੰਚਾਲਿਤ ਜਵਾਬ • ਤੁਰੰਤ ਦਵਾਈ ਸੁਝਾਅ • ਡਾਕਟਰ ਰੈਫਰਲ"
            )}
          </div>
        </form>
      </div>

      {/* Medicine Popup Modal */}
      {showMedicinePopup && (
        <MedicinePopup
          medicine={selectedMedicine}
          doctorInfo={doctorInfo}
          language={language}
          onClose={() => setShowMedicinePopup(false)}
        />
      )}

      {/* Add CSS for animations */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ChatBot;