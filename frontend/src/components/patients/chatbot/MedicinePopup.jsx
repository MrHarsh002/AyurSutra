// // components/patients/chatbot/MedicinePopup.jsx
// import React, { useRef } from 'react';
// import { useReactToPrint } from 'react-to-print';

// const MedicinePopup = ({ medicine, doctorInfo, language, onClose }) => {
//   const contentRef = useRef();
  
//   const getTranslation = (english, hindi, punjabi) => {
//     switch(language) {
//       case 'Hindi': return hindi;
//       case 'Punjabi': return punjabi;
//       default: return english;
//     }
//   };

//   const handlePrint = useReactToPrint({
//     contentRef,
//     documentTitle: `${medicine?.name} - Medical Information`,
//     onAfterPrint: () => console.log('Printed successfully')
//   });

//   if (!medicine) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
//         {/* Header with print button */}
//         <div className="bg-linear-to-r from-blue-600 to-teal-500 p-4 flex justify-between items-center">
//           <h2 className="text-xl font-bold text-white">
//             {getTranslation("Medicine Details", "दवा विवरण", "ਦਵਾਈ ਵੇਰਵੇ")}
//           </h2>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={handlePrint}
//               className="bg-white text-blue-600 hover:bg-blue-50 p-2 rounded-lg flex items-center gap-2"
//               title={getTranslation("Print", "प्रिंट", "ਪ੍ਰਿੰਟ")}
//             >
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
//                   d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
//               </svg>
//               <span className="hidden sm:inline">{getTranslation("Print", "प्रिंट", "ਪ੍ਰਿੰਟ")}</span>
//             </button>
//             <button
//               onClick={onClose}
//               className="text-white hover:text-blue-200 text-2xl"
//             >
//               &times;
//             </button>
//           </div>
//         </div>

//         {/* Printable Content */}
//         <div ref={contentRef} className="flex-1 overflow-y-auto p-6">
//           <div className="print:block">
//             {/* Medicine Header */}
//             <div className="flex items-center mb-6 pb-4 border-b">
//               <div className="text-5xl mr-4">{medicine.image}</div>
//               <div>
//                 <h1 className="text-3xl font-bold text-gray-800">{medicine.name}</h1>
//                 <p className="text-gray-600 text-lg">{medicine.description}</p>
//               </div>
//             </div>

//             {/* Two Column Layout */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//               {/* Left Column - Medicine Details */}
//               <div className="space-y-6">
//                 <div className="bg-blue-50 p-4 rounded-xl">
//                   <h3 className="font-bold text-gray-800 mb-3 text-lg">
//                     {getTranslation("Prescription Information", "प्रिस्क्रिप्शन जानकारी", "ਪ੍ਰੈਸਕ੍ਰਿਪਸ਼ਨ ਜਾਣਕਾਰੀ")}
//                   </h3>
                  
//                   <div className="space-y-4">
//                     <div>
//                       <h4 className="font-semibold text-gray-700 mb-1">
//                         {getTranslation("Active Ingredient:", "सक्रिय तत्व:", "ਸਰਗਰਮ ਤੱਤ:")}
//                       </h4>
//                       <p className="text-gray-800 font-medium">{medicine.activeIngredient}</p>
//                     </div>
                    
//                     <div>
//                       <h4 className="font-semibold text-gray-700 mb-1">
//                         {getTranslation("Dosage:", "खुराक:", "ਖੁਰਾਕ:")}
//                       </h4>
//                       <p className="text-gray-800 font-medium">{medicine.dosage}</p>
//                       <p className="text-sm text-gray-600 mt-1">
//                         {getTranslation("As prescribed by doctor", "डॉक्टर द्वारा निर्धारित", "ਡਾਕਟਰ ਦੁਆਰਾ ਨਿਰਧਾਰਤ")}
//                       </p>
//                     </div>
                    
//                     <div>
//                       <h4 className="font-semibold text-gray-700 mb-1">
//                         {getTranslation("Storage:", "भंडारण:", "ਸਟੋਰੇਜ:")}
//                       </h4>
//                       <p className="text-gray-800">{medicine.storage}</p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
//                   <h3 className="font-bold text-gray-800 mb-2">
//                     {getTranslation("Safety Information", "सुरक्षा जानकारी", "ਸੁਰੱਖਿਆ ਜਾਣਕਾਰੀ")}
//                   </h3>
                  
//                   <div className="space-y-3">
//                     <div>
//                       <h4 className="font-semibold text-gray-700 mb-1">
//                         {getTranslation("Precautions:", "सावधानियाँ:", "ਸਾਵਧਾਨੀਆਂ:")}
//                       </h4>
//                       <p className="text-gray-800">{medicine.precautions}</p>
//                     </div>
                    
//                     <div>
//                       <h4 className="font-semibold text-gray-700 mb-1">
//                         {getTranslation("Side Effects:", "साइड इफेक्ट्स:", "ਸਾਈਡ ਇਫੈਕਟਸ:")}
//                       </h4>
//                       <p className="text-gray-800">{medicine.sideEffects}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Right Column - Doctor Information */}
//               <div className="space-y-6">
//                 <div className="bg-linear-to-br from-teal-50 to-blue-50 p-5 rounded-xl border border-teal-100">
//                   <div className="flex items-center mb-4">
//                     <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mr-4">
//                       <span className="text-teal-600 text-xl">👨‍⚕️</span>
//                     </div>
//                     <div>
//                       <h3 className="font-bold text-gray-800 text-xl">{doctorInfo?.name}</h3>
//                       <p className="text-teal-600 font-medium">{doctorInfo?.specialization}</p>
//                     </div>
//                   </div>
                  
//                   <div className="space-y-3">
//                     <div className="flex items-center">
//                       <svg className="w-5 h-5 text-gray-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
//                       </svg>
//                       <div>
//                         <p className="text-sm text-gray-600">{getTranslation("Contact", "संपर्क", "ਸੰਪਰਕ")}</p>
//                         <p className="font-semibold text-gray-800">{doctorInfo?.contact}</p>
//                       </div>
//                     </div>
                    
//                     <div className="flex items-center">
//                       <svg className="w-5 h-5 text-gray-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2v10h8V6H6z" clipRule="evenodd" />
//                       </svg>
//                       <div>
//                         <p className="text-sm text-gray-600">{getTranslation("Consultation Fee", "परामर्श शुल्क", "ਸਲਾਹ ਸ਼ੁਲਕ")}</p>
//                         <p className="font-semibold text-gray-800">{doctorInfo?.fee}</p>
//                       </div>
//                     </div>
                    
//                     <div className="flex items-center">
//                       <svg className="w-5 h-5 text-gray-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
//                       </svg>
//                       <div>
//                         <p className="text-sm text-gray-600">{getTranslation("Availability", "उपलब्धता", "ਉਪਲਬਧਤਾ")}</p>
//                         <p className="font-semibold text-gray-800">{doctorInfo?.availability}</p>
//                       </div>
//                     </div>
//                   </div>
                  
//                   <button className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-lg transition-colors">
//                     {getTranslation("Book Appointment", "अपॉइंटमेंट बुक करें", "ਅਪਾਇੰਟਮੈਂਟ ਬੁੱਕ ਕਰੋ")}
//                   </button>
//                 </div>

//                 <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
//                   <h3 className="font-bold text-gray-800 mb-2 flex items-center">
//                     <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                     </svg>
//                     {getTranslation("Important Warning", "महत्वपूर्ण चेतावनी", "ਮਹੱਤਵਪੂਰਨ ਚੇਤਾਵਨੀ")}
//                   </h3>
//                   <p className="text-gray-700 text-sm">
//                     {getTranslation(
//                       "This information is for educational purposes only. Always consult a qualified healthcare professional before taking any medication. Do not self-medicate.",
//                       "यह जानकारी केवल शैक्षिक उद्देश्यों के लिए है। कोई भी दवा लेने से पहले हमेशा एक योग्य स्वास्थ्य देखभाल पेशेवर से परामर्श लें। स्व-दवा न करें।",
//                       "ਇਹ ਜਾਣਕਾਰੀ ਸਿਰਫ਼ ਸਿੱਖਿਆ ਦੇ ਮਕਸਦਾਂ ਲਈ ਹੈ। ਕੋਈ ਵੀ ਦਵਾਈ ਲੈਣ ਤੋਂ ਪਹਿਲਾਂ ਹਮੇਸ਼ਾਂ ਇੱਕ ਯੋਗ ਸਿਹਤ ਦੇਖਭਾਲ ਪੇਸ਼ੇਵਰ ਨਾਲ ਸਲਾਹ ਲਓ। ਆਪਣੇ ਆਪ ਦਵਾਈ ਨਾ ਲਓ।"
//                     )}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Footer with date */}
//             <div className="mt-8 pt-4 border-t text-center text-gray-500 text-sm">
//               <p>{getTranslation(
//                 "Generated by AI Medical Assistant on",
//                 "एआई मेडिकल सहायक द्वारा जनरेट किया गया",
//                 "ਏਆਈ ਮੈਡੀਕਲ ਸਹਾਇਕ ਦੁਆਰਾ ਤਿਆਰ ਕੀਤਾ ਗਿਆ"
//               )} {new Date().toLocaleDateString()}</p>
//             </div>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between">
//           <button
//             onClick={onClose}
//             className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
//           >
//             {getTranslation("Close", "बंद करें", "ਬੰਦ ਕਰੋ")}
//           </button>
//           <div className="flex gap-3">
//             <button
//               onClick={handlePrint}
//               className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
//             >
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
//                   d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
//               </svg>
//               {getTranslation("Print", "प्रिंट", "ਪ੍ਰਿੰਟ")}
//             </button>
//             <button className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
//               {getTranslation("Save Information", "जानकारी सहेजें", "ਜਾਣਕਾਰੀ ਸੇਵ ਕਰੋ")}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MedicinePopup;


// components/patients/chatbot/MedicinePopup.jsx
import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

const MedicinePopup = ({ medicine, doctorInfo, language, onClose }) => {
  const contentRef = useRef();
  
  const getTranslation = (english, hindi, punjabi) => {
    switch(language) {
      case 'Hindi': return hindi;
      case 'Punjabi': return punjabi;
      default: return english;
    }
  };

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `${medicine?.name || 'Medicine'} - Medical Information`,
    onAfterPrint: () => console.log('Printed successfully')
  });

  if (!medicine) return null;

  // Handle book appointment click
  const handleBookAppointment = () => {
    if (doctorInfo?.contact) {
      // You can implement appointment booking logic here
      alert(getTranslation(
        `Booking appointment with ${doctorInfo?.name}. Contact: ${doctorInfo?.contact}`,
        `${doctorInfo?.name} के साथ अपॉइंटमेंट बुक कर रहे हैं। संपर्क: ${doctorInfo?.contact}`,
        `${doctorInfo?.name} ਨਾਲ ਅਪਾਇੰਟਮੈਂਟ ਬੁੱਕ ਕਰ ਰਹੇ ਹਾਂ। ਸੰਪਰਕ: ${doctorInfo?.contact}`
      ));
    }
  };

  // Handle save information
  const handleSaveInfo = () => {
    const info = {
      medicine: medicine.name,
      doctor: doctorInfo?.name,
      date: new Date().toLocaleDateString(),
      details: {
        dosage: medicine.dosage,
        precautions: medicine.precautions,
        sideEffects: medicine.sideEffects
      }
    };
    
    // Convert to JSON and download
    const dataStr = JSON.stringify(info, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${medicine.name.replace(/\s+/g, '_')}_info.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    alert(getTranslation(
      "Information saved successfully!",
      "जानकारी सफलतापूर्वक सहेजी गई!",
      "ਜਾਣਕਾਰੀ ਸਫਲਤਾਪੂਰਵਕ ਸੇਵ ਕੀਤੀ ਗਈ!"
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header with print button */}
        <div className="bg-linear-to-r from-blue-600 to-teal-500 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {getTranslation("Medicine Details", "दवा विवरण", "ਦਵਾਈ ਵੇਰਵੇ")}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-white text-blue-600 hover:bg-blue-50 p-2 rounded-lg flex items-center gap-2 transition-colors"
              title={getTranslation("Print", "प्रिंट", "ਪ੍ਰਿੰਟ")}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span className="hidden sm:inline">{getTranslation("Print", "प्रिंट", "ਪ੍ਰਿੰਟ")}</span>
            </button>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 text-2xl w-8 h-8 flex items-center justify-center"
              title={getTranslation("Close", "बंद करें", "ਬੰਦ ਕਰੋ")}
            >
              &times;
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="print:block space-y-6">
            {/* Medicine Header */}
            <div className="flex items-center mb-4 pb-4 border-b">
              <div className="text-4xl md:text-5xl mr-4">{medicine.image || '💊'}</div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{medicine.name}</h1>
                <p className="text-gray-600 text-base md:text-lg mt-1">{medicine.description}</p>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Medicine Details */}
              <div className="space-y-6">
                {/* Prescription Information Card */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <h3 className="font-bold text-gray-800 mb-3 text-lg flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    {getTranslation("Prescription Information", "प्रिस्क्रिप्शन जानकारी", "ਪ੍ਰੈਸਕ੍ਰਿਪਸ਼ਨ ਜਾਣਕਾਰੀ")}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-white p-3 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-1 text-sm">
                        {getTranslation("Active Ingredient:", "सक्रिय तत्व:", "ਸਰਗਰਮ ਤੱਤ:")}
                      </h4>
                      <p className="text-gray-800 font-medium">{medicine.activeIngredient || getTranslation("Not specified", "निर्दिष्ट नहीं", "ਨਿਰਧਾਰਤ ਨਹੀਂ")}</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-1 text-sm">
                        {getTranslation("Dosage:", "खुराक:", "ਖੁਰਾਕ:")}
                      </h4>
                      <p className="text-gray-800 font-medium">{medicine.dosage || getTranslation("As prescribed by doctor", "डॉक्टर द्वारा निर्धारित", "ਡਾਕਟਰ ਦੁਆਰਾ ਨਿਰਧਾਰਤ")}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {getTranslation("Follow doctor's instructions", "डॉक्टर के निर्देशों का पालन करें", "ਡਾਕਟਰ ਦੇ ਨਿਰਦੇਸ਼ਾਂ ਦੀ ਪਾਲਣਾ ਕਰੋ")}
                      </p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-1 text-sm">
                        {getTranslation("Storage:", "भंडारण:", "ਸਟੋਰੇਜ:")}
                      </h4>
                      <p className="text-gray-800">{medicine.storage || getTranslation("Store in a cool, dry place", "ठंडी, सूखी जगह पर रखें", "ਠੰਡੀ, ਸੁੱਕੀ ਜਗ੍ਹਾ 'ਤੇ ਰੱਖੋ")}</p>
                    </div>
                  </div>
                </div>

                {/* Safety Information Card */}
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {getTranslation("Safety Information", "सुरक्षा जानकारी", "ਸੁਰੱਖਿਆ ਜਾਣਕਾਰੀ")}
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1 text-sm">
                        {getTranslation("Precautions:", "सावधानियाँ:", "ਸਾਵਧਾਨੀਆਂ:")}
                      </h4>
                      <p className="text-gray-800 text-sm">{medicine.precautions || getTranslation("Take as directed by physician", "चिकित्सक के निर्देशानुसार लें", "ਚਿਕਿਤਸਕ ਦੇ ਨਿਰਦੇਸ਼ਾਂ ਅਨੁਸਾਰ ਲਓ")}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1 text-sm">
                        {getTranslation("Side Effects:", "साइड इफेक्ट्स:", "ਸਾਈਡ ਇਫੈਕਟਸ:")}
                      </h4>
                      <p className="text-gray-800 text-sm">{medicine.sideEffects || getTranslation("Consult doctor if any adverse effects occur", "यदि कोई दुष्प्रभाव हो तो डॉक्टर से परामर्श लें", "ਜੇ ਕੋਈ ਦੁਸ਼ਪ੍ਰਭਾਵ ਹੋਵੇ ਤਾਂ ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਕਰੋ")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Doctor Information */}
              <div className="space-y-6">
                {/* Doctor Information Card */}
                <div className="bg-linear-to-br from-teal-50 to-blue-50 p-5 rounded-xl border border-teal-100">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-teal-600 text-xl">👨‍⚕️</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{doctorInfo?.name || getTranslation("Consult a Doctor", "डॉक्टर से परामर्श लें", "ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਕਰੋ")}</h3>
                      <p className="text-teal-600 font-medium text-sm">
                        {doctorInfo?.specialization || getTranslation("General Practitioner", "सामान्य चिकित्सक", "ਜਨਰਲ ਪ੍ਰੈਕਟੀਸ਼ਨਰ")}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {doctorInfo?.contact && (
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-500 mr-3 flex shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-600">{getTranslation("Contact", "संपर्क", "ਸੰਪਰਕ")}</p>
                          <p className="font-semibold text-gray-800 text-sm">{doctorInfo.contact}</p>
                        </div>
                      </div>
                    )}
                    
                    {doctorInfo?.fee && (
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-500 mr-3 flex shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2v10h8V6H6z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-600">{getTranslation("Consultation Fee", "परामर्श शुल्क", "ਸਲਾਹ ਸ਼ੁਲਕ")}</p>
                          <p className="font-semibold text-gray-800 text-sm">{doctorInfo.fee}</p>
                        </div>
                      </div>
                    )}
                    
                    {doctorInfo?.availability && (
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-500 mr-3 flex shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-600">{getTranslation("Availability", "उपलब्धता", "ਉਪਲਬਧਤਾ")}</p>
                          <p className="font-semibold text-gray-800 text-sm">{doctorInfo.availability}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={handleBookAppointment}
                    className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm md:text-base"
                  >
                    {getTranslation("Book Appointment", "अपॉइंटमेंट बुक करें", "ਅਪਾਇੰਟਮੈਂਟ ਬੁੱਕ ਕਰੋ")}
                  </button>
                </div>

                {/* Warning Card */}
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                  <h3 className="font-bold text-gray-800 mb-2 flex items-center text-sm">
                    <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {getTranslation("Important Warning", "महत्वपूर्ण चेतावनी", "ਮਹੱਤਵਪੂਰਨ ਚੇਤਾਵਨੀ")}
                  </h3>
                  <p className="text-gray-700 text-xs">
                    {getTranslation(
                      "This information is for educational purposes only. Always consult a qualified healthcare professional before taking any medication. Do not self-medicate.",
                      "यह जानकारी केवल शैक्षिक उद्देश्यों के लिए है। कोई भी दवा लेने से पहले हमेशा एक योग्य स्वास्थ्य देखभाल पेशेवर से परामर्श लें। स्व-दवा न करें।",
                      "ਇਹ ਜਾਣਕਾਰੀ ਸਿਰਫ਼ ਸਿੱਖਿਆ ਦੇ ਮਕਸਦਾਂ ਲਈ ਹੈ। ਕੋਈ ਵੀ ਦਵਾਈ ਲੈਣ ਤੋਂ ਪਹਿਲਾਂ ਹਮੇਸ਼ਾਂ ਇੱਕ ਯੋਗ ਸਿਹਤ ਦੇਖਭਾਲ ਪੇਸ਼ੇਵਰ ਨਾਲ ਸਲਾਹ ਲਓ। ਆਪਣੇ ਆਪ ਦਵਾਈ ਨਾ ਲਓ।"
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer with date */}
            <div className="mt-6 pt-4 border-t text-center text-gray-500 text-xs">
              <p>{getTranslation(
                "Generated by AI Medical Assistant on",
                "एआई मेडिकल सहायक द्वारा जनरेट किया गया",
                "ਏਆਈ ਮੈਡੀਕਲ ਸਹਾਇਕ ਦੁਆਰਾ ਤਿਆਰ ਕੀਤਾ ਗਿਆ"
              )} {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm"
          >
            {getTranslation("Close", "बंद करें", "ਬੰਦ ਕਰੋ")}
          </button>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              {getTranslation("Print", "प्रिंट", "ਪ੍ਰਿੰਟ")}
            </button>
            <button 
              onClick={handleSaveInfo}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
            >
              {getTranslation("Save Info", "जानकारी सहेजें", "ਜਾਣਕਾਰੀ ਸੇਵ ਕਰੋ")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicinePopup;