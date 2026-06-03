const fs = require('fs');
const content = fs.readFileSync('c:/Users/POSHITH/GITHUB/New folder (4)/AgriSense/frontend/src/translations/index.jsx', 'utf8');

const hiFeatures = `
      features: {
        soilTitle: 'मिट्टी विश्लेषण',
        soilDesc: 'EfficientNet-B0 ML मॉडल का उपयोग करके तस्वीरों से मिट्टी के प्रकारों को तुरंत वर्गीकृत करें।',
        soilBadge: 'AI विज़न',
        cropTitle: 'फसल सिफारिश',
        cropDesc: 'मिट्टी के प्रकार और स्थानीय वर्षा के पूर्वानुमान से मेल खाने वाली इष्टतम फसल की भविष्यवाणी करें।',
        cropBadge: 'रैंडम फॉरेस्ट',
        weatherTitle: 'मौसम रडार',
        weatherDesc: 'स्थानीय वायुमंडलीय पूर्वानुमानों की जांच करें और रीयल-टाइम फसल सलाह प्राप्त करें।',
        weatherBadge: 'रीयल-टाइम GPS',
        mandiTitle: 'सर्वश्रेष्ठ मंडी खोजक',
        mandiDesc: 'परिवहन टोल की गणना करें और उच्च-लाभ मंडी बाजार मार्गों को जियोकोड करें।',
        mandiBadge: 'रूट ऑप्टिमाइज़र',
        marketTitle: 'लाइव बाजार मूल्य',
        marketDesc: 'सक्रिय एगमार्कनेट बाजारों से सीधे वर्तमान कमोडिटी दरों की निगरानी करें।',
        marketBadge: 'लाइव स्क्रैपिंग',
        forecastTitle: 'मूल्य पूर्वानुमान',
        forecastDesc: 'प्रोफेट ML का उपयोग करके 3 साल तक के कमोडिटी बाजार मूल्य रुझानों का अनुमान लगाएं।',
        forecastBadge: 'टाइम-सीरीज AI',
        riskTitle: 'जोखिम मूल्यांकन',
        riskDesc: 'बाढ़, सूखे और पाले सहित चरम मौसम जोखिम कारकों का विश्लेषण करें।',
        riskBadge: 'जलवायु चेतावनी',
        expenseTitle: 'खर्च ट्रैकर',
        expenseDesc: 'मौसमी खर्चों को लॉग करें और अनुमानित राजस्व के विरुद्ध शुद्ध मार्जिन की गणना करें।',
        expenseBadge: 'फार्म फाइनेंस'
      },`;

const hiSoilAI = `
    soilAI: {
      title: 'AI मिट्टी विश्लेषण',
      subtitle: 'मृदा बुद्धिमत्ता',
      platform: 'विश्लेषण प्लेटफार्म',
      desc: 'अपनी मिट्टी के नमूने की एक तस्वीर अपलोड करें और हमारे EfficientNet-B0 डीप लर्निंग मॉडल को 87% सटीकता के साथ मिट्टी के प्रकार को तुरंत वर्गीकृत करने दें। इष्टतम फसल चयन के लिए कार्रवाई योग्य जानकारी प्राप्त करें।',
      aiVision: 'AI विजन तकनीक',
      modelDesc: 'डीप लर्निंग मॉडल',
      accuracy: 'सटीकता',
      types: 'प्रकार',
      instantAI: 'त्वरित AI वर्गीकरण',
      photoTipsToggle: 'तस्वीर दिशानिर्देश',
      photoTipsTitle: 'इष्टतम तस्वीर सिफारिशें',
      uploadPhoto: 'तस्वीर अपलोड करें',
      dragDrop: 'मिट्टी की तस्वीर खींचें और छोड़ें',
      releaseUpload: 'अपलोड करने के लिए छोड़ें',
      clickBrowse: 'या फ़ाइलें ब्राउज़ करने के लिए क्लिक करें',
      formatNote: 'JPG · PNG · WEBP (Max 10MB)',
      analyzing: 'EfficientNet AI के साथ विश्लेषण कर रहा है...',
      analyzeAnother: 'अन्य छवि का विश्लेषण करें',
      waitingUpload: 'अपलोड की प्रतीक्षा कर रहा है',
      waitingDesc: 'अपलोड की गई छवि निदान यहां दिखाई देंगे।',
      inferencing: 'न्यूरल नेट इन्फरेंसिंग...',
      inferencingDesc: 'फसल-तैयार रसायन चर उत्पन्न कर रहा है।',
      lowConfidence: 'कम मिलान स्कोर',
      lowConfidenceDesc: 'न्यूरल लेयर एक कम मिलान स्कोर देता है। बेहतर दिन के उजाले की स्थिति के तहत एक स्पष्ट तस्वीर को फिर से अपलोड करने पर विचार करें।',
      classificationResult: 'वर्गीकरण परिणाम',
      confidence: 'आत्मविश्वास',
      diagnosticProfile: 'निदान प्रोफ़ाइल',
      phIndex: 'pH इंडेक्स',
      npkRatios: 'NPK अनुपात',
      compatibleCrops: 'संगत किस्में',
      agronomyAdvisory: 'कृषि विज्ञान सलाहकार',
      modelMatrix: 'मॉडल संभाव्यता मैट्रिक्स',
      corePipeline: 'कोर मॉडल पाइपलाइन',
      classDatabase: 'मृदा वर्ग डेटाबेस',
      reliability: 'विश्वसनीयता सुरक्षा',
      modelValue: 'EfficientNet-B0 न्यूरल नेटवर्क',
      classValue: '7 प्रमुख स्थानीय वर्ग समूह',
      reliabilityValue: '65% कॉन्फिडेंस वार्निंग थ्रेसहोल्ड'
    },`;

let newContent = content;
// Insert features into hi.dashboard
newContent = newContent.replace(/(hi:\s*\{[\s\S]*?dashboard:\s*\{)/, '$1\n' + hiFeatures);
// Insert soilAI into hi
newContent = newContent.replace(/(hi:\s*\{)/, '$1\n' + hiSoilAI);

fs.writeFileSync('c:/Users/POSHITH/GITHUB/New folder (4)/AgriSense/frontend/src/translations/index.jsx', newContent);
console.log('Injected missing Hindi translations');
