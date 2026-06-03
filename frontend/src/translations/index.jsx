import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Navigation
    nav: {
      dashboard: 'Dashboard',
      soil: 'Soil Analysis',
      crops: 'Crop Recommendation',
      weather: 'Weather',
      markets: 'Markets',
      forecast: 'Price Forecast',
      risk: 'Risk Assessment',
      expenses: 'Expenses',
      mandi: 'Best Mandi',
      logout: 'Logout',
      signIn: 'Sign In',
      register: 'Register',
      getStarted: 'Get Started Free'
    },
    // Landing Page
    landing: {
      heroTitle: 'OPTIMIZE YOUR FIELD.',
      heroSubtitle: 'MAXIMIZE YOUR HARVEST.',
      heroDesc: 'AgriSense unifies crop recommendations, real-time weather risk advisories, and mandate transport cost geocoding into an enterprise platform powered by Random Forest & EfficientNet ML models.',
      startAnalysis: 'START YOUR FREE ANALYSIS',
      signInDashboard: 'Sign In to Dashboard',
      platform: 'Platform',
      aiModels: 'AI Models',
      features: 'Features',
      workflow: 'Workflow',
      enterpriseArchitecture: 'Enterprise Architecture',
      platformTitle: 'A Unified Agriculture Intelligence Cloud',
      platformDesc: 'AgriSense connects disparate field inputs with machine learning backends to optimize the crop cycle from soil testing to final mandi sale.',
      predictiveML: 'Predictive ML Models',
      mlTitle: 'Powered by Advanced Neural & Statistical Modeling',
      mlDesc: 'AgriSense integrates state-of-the-art Python ML service nodes directly into the frontend user workflow. All prediction runs happen instantly.',
      comprehensiveToolset: 'Comprehensive Toolset',
      featuresTitle: 'Complete Feature Suite for Precision Agriculture',
      featuresDesc: 'Explore how each feature converts complex field conditions into profit-maximizing insights.',
      operationalWorkflow: 'Operational Workflow',
      workflowTitle: 'From Soil Analysis to Mandi Sale',
      workflowDesc: 'A step-by-step cycle designed to keep your agriculture pipeline completely optimized.',
      realValue: 'Real Value',
      benefitsTitle: 'Deliver Quantifiable Farming Success',
      benefitsDesc: 'Why smart farming enterprises select AgriSense to monitor and forecast their agricultural investments.',
      trustedBy: 'Trusted by agricultural analysts and farmers.',
      modelAccuracy: 'Model Accuracy'
    },
    // Dashboard
    dashboard: {
      welcome: 'Welcome',
      console: 'AgriSense intelligence console and ML dashboard.',
      platformServices: 'Platform Services',
      toolsAvailable: 'Tools Available',
      todaysInsights: "Today's Agronomy Insights",
      scrapingOnline: 'Agmarknet Scraping Online',
      gpsActive: 'Open-Meteo GPS Active',
      neuralOperational: 'Neural Model Inferences Operational',
      launchTool: 'Launch Tool'
    },
    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      submit: 'Submit',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      export: 'Export',
      import: 'Import',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
      open: 'Open',
      select: 'Select',
      clear: 'Clear',
      apply: 'Apply',
      reset: 'Reset'
    }
  },
  te: {
    // Navigation
    nav: {
      dashboard: 'డ్యాష్‌బోర్డ్',
      soil: 'నేల విశ్లేషణ',
      crops: 'పంట సిఫార్సు',
      weather: 'వాతావరణం',
      markets: 'మార్కెట్లు',
      forecast: 'ధర అంచనా',
      risk: 'రిస్క్ అసెస్‌మెంట్',
      expenses: 'ఖర్చులు',
      mandi: 'ఉత్తమ మండి',
      logout: 'లాగ్అవుట్',
      signIn: 'సైన్ ఇన్',
      register: 'నమోదు',
      getStarted: 'ఉచితంగా ప్రారంభించండి'
    },
    // Landing Page
    landing: {
      heroTitle: 'మీ పొలాన్ని ఆప్టిమైజ్ చేయండి.',
      heroSubtitle: 'మీ పంటను గరిష్ఠం చేయండి.',
      heroDesc: 'అగ్రిసెన్స్ పంట సిఫార్సులు, రియల్-టైమ్ వాతావరణ రిస్క్ సలహాలు, మరియు మండి రవాణా ఖర్చు జియోకోడింగ్‌ను రాండమ్ ఫారెస్ట్ & ఎఫిషియెంట్‌నెట్ ML మోడల్‌లతో పవర్డ్ ఎంటర్‌ప్రైజ్ ప్లాట్‌ఫారమ్‌గా ఏకీకృతం చేస్తుంది.',
      startAnalysis: 'మీ ఉచిత విశ్లేషణను ప్రారంభించండి',
      signInDashboard: 'డ్యాష్‌బోర్డ్‌లో సైన్ ఇన్ చేయండి',
      platform: 'ప్లాట్‌ఫారమ్',
      aiModels: 'AI మోడల్స్',
      features: 'ఫీచర్లు',
      workflow: 'వర్క్‌ఫ్లో',
      enterpriseArchitecture: 'ఎంటర్‌ప్రైజ్ ఆర్కిటెక్చర్',
      platformTitle: 'ఏకీకృత వ్యవసాయ ఇంటెలిజెన్స్ క్లౌడ్',
      platformDesc: 'అగ్రిసెన్స్ నేల పరీక్ష నుండి తుది మండి అమ్మకం వరకు పంట చక్రాన్ని ఆప్టిమైజ్ చేయడానికి వివిధ ఫీల్డ్ ఇన్‌పుట్‌లను మెషిన్ లెర్నింగ్ బ్యాకెండ్‌లతో కనెక్ట్ చేస్తుంది.',
      predictiveML: 'ప్రిడిక్టివ్ ML మోడల్స్',
      mlTitle: 'అడ్వాన్స్డ్ న్యూరల్ & స్టాటిస్టికల్ మోడలింగ్ ద్వారా పవర్డ్',
      mlDesc: 'అగ్రిసెన్స్ స్టేట్-ఆఫ్-ది-ఆర్ట్ పైథాన్ ML సర్వీస్ నోడ్‌లను నేరుగా ఫ్రంటెండ్ యూజర్ వర్క్‌ఫ్లోలోకి ఇంటిగ్రేట్ చేస్తుంది. అన్ని ప్రిడిక్షన్ రన్‌లు తక్షణమే జరుగుతాయి.',
      comprehensiveToolset: 'సమగ్ర టూల్‌సెట్',
      featuresTitle: 'ప్రిసిషన్ అగ్రికల్చర్ కోసం సంపూర్ణ ఫీచర్ సూట్',
      featuresDesc: 'ప్రతి ఫీచర్ క్లిష్టమైన ఫీల్డ్ పరిస్థితులను లాభదాయకంగా మారుస్తుంది.',
      operationalWorkflow: 'ఆపరేషనల్ వర్క్‌ఫ్లో',
      workflowTitle: 'నేల విశ్లేషణ నుండి మండి అమ్మకం వరకు',
      workflowDesc: 'మీ వ్యవసాయ పైప్‌లైన్‌ను పూర్తిగా ఆప్టిమైజ్ చేయడానికి రూపొందించిన దశల వారీ చక్రం.',
      realValue: 'వాస్తవ విలువ',
      benefitsTitle: 'కొలతలో వ్యవసాయ విజయాన్ని అందించండి',
      benefitsDesc: 'స్మార్ట్ ఫార్మింగ్ ఎంటర్‌ప్రైజ్‌లు అగ్రిసెన్స్‌ను ఎందుకు ఎంచుకుంటాయి.',
      trustedBy: 'వ్యవసాయ విశ్లేషకులు మరియు రైతులచే నమ్మకం.',
      modelAccuracy: 'మోడల్ ఖచ్చితత్వం'
    },
    // Dashboard
    dashboard: {
      welcome: 'స్వాగతం',
      console: 'అగ్రిసెన్స్ ఇంటెలిజెన్స్ కన్సోల్ మరియు ML డ్యాష్‌బోర్డ్.',
      platformServices: 'ప్లాట్‌ఫారమ్ సేవలు',
      toolsAvailable: 'టూల్స్ అందుబాటులో ఉన్నాయి',
      todaysInsights: 'నేటి వ్యవసాయ ఇన్సైట్స్',
      scrapingOnline: 'అగ్మార్క్‌నెట్ స్క్రాపింగ్ ఆన్‌లైన్',
      gpsActive: 'ఓపెన్-మెటియో GPS యాక్టివ్',
      neuralOperational: 'న్యూరల్ మోడల్ ఇన్ఫరెన్సెస్ ఆపరేషనల్',
      launchTool: 'టూల్ ప్రారంభించండి'
    },
    // Common
    common: {
      loading: 'లోడ్ అవుతోంది...',
      error: 'లోపం',
      success: 'విజయం',
      submit: 'సమర్పించు',
      cancel: 'రద్దు చేయండి',
      save: 'సేవ్ చేయండి',
      delete: 'తొలగించండి',
      edit: 'ఎడిట్ చేయండి',
      view: 'చూడండి',
      search: 'వెతకండి',
      filter: 'ఫిల్టర్',
      sort: 'సార్ట్',
      export: 'ఎక్స్‌పోర్ట్',
      import: 'ఇంపోర్ట్',
      back: 'వెనుకకు',
      next: 'తదుపరి',
      previous: 'మునుపటి',
      close: 'మూసివేయండి',
      open: 'తెరవండి',
      select: 'ఎంచుకోండి',
      clear: 'క్లియర్',
      apply: 'వర్తింపజేయండి',
      reset: 'రీసెట్'
    }
  },
  hi: {
    // Navigation
    nav: {
      dashboard: 'डैशबोर्ड',
      soil: 'मिट्टी विश्लेषण',
      crops: 'फसल अनुशंसा',
      weather: 'मौसम',
      markets: 'बाजार',
      forecast: 'मूल्य पूर्वानुमान',
      risk: 'जोखिम मूल्यांकन',
      expenses: 'खर्च',
      mandi: 'सर्वश्रेष्ठ मंडी',
      logout: 'लॉग आउट',
      signIn: 'साइन इन',
      register: 'पंजीकरण',
      getStarted: 'मुफ्त शुरू करें'
    },
    // Landing Page
    landing: {
      heroTitle: 'अपने खेत का अनुकूलन करें।',
      heroSubtitle: 'अपनी फसल को अधिकतम करें।',
      heroDesc: 'एग्रिसेंस फसल अनुशंसाएं, रीयल-टाइम मौसम जोखिम सलाह, और मंडी परिवहन लागत जियोकोडिंग को रैंडम फॉरेस्ट और एफिशिएंटनेट ML मॉडल द्वारा संचालित एंटरप्राइज़ प्लेटफॉर्म में एकीकृत करता है।',
      startAnalysis: 'अपना मुफ्त विश्लेषण शुरू करें',
      signInDashboard: 'डैशबोर्ड में साइन इन करें',
      platform: 'प्लेटफ़ॉर्म',
      aiModels: 'AI मॉडल',
      features: 'सुविधाएं',
      workflow: 'वर्कफ़्लो',
      enterpriseArchitecture: 'एंटरप्राइज़ आर्किटेक्चर',
      platformTitle: 'एकीकृत कृषि बुद्धिमत्ता क्लाउड',
      platformDesc: 'एग्रिसेंस मिट्टी परीक्षण से अंतिम मंडी बिक्री तक फसल चक्र को अनुकूलित करने के लिए विविध क्षेत्र इनपुट को मशीन लर्निंग बैकएंड के साथ जोड़ता है।',
      predictiveML: 'प्रेडिक्टिव ML मॉडल',
      mlTitle: 'उन्नत न्यूरल और सांख्यिकीय मॉडलिंग द्वारा संचालित',
      mlDesc: 'एग्रिसेंस स्टेट-ऑफ-द-आर्ट पायथन ML सर्विस नोड्स को सीधे फ्रंटएंड यूजर वर्कफ्लो में एकीकृत करता है। सभी प्रेडिक्शन रन तुरंत होते हैं।',
      comprehensiveToolset: 'व्यापक टूलसेट',
      featuresTitle: 'प्रिसिशन एग्रीकल्चर के लिए पूर्ण फीचर सूट',
      featuresDesc: 'देखें कि प्रत्येक फीचर जटिल क्षेत्र स्थितियों को लाभदायक में कैसे बदलता है।',
      operationalWorkflow: 'ऑपरेशनल वर्कफ़्लो',
      workflowTitle: 'मिट्टी विश्लेषण से मंडी बिक्री तक',
      workflowDesc: 'आपके कृषि पाइपलाइन को पूरी तरह से अनुकूलित रखने के लिए डिज़ाइन किया गया चरण-दर-चरण चक्र।',
      realValue: 'वास्तविक मूल्य',
      benefitsTitle: 'मात्रात्मक कृषि सफलता प्रदान करें',
      benefitsDesc: 'स्मार्ट फार्मिंग एंटरप्राइजेज एग्रिसेंस को अपने कृषि निवेश की निगरानी और पूर्वानुमान के लिए क्यों चुनते हैं।',
      trustedBy: 'कृषि विश्लेषकों और किसानों द्वारा विश्वसनीय।',
      modelAccuracy: 'मॉडल सटीकता'
    },
    // Dashboard
    dashboard: {
      welcome: 'स्वागत',
      console: 'एग्रिसेंस इंटेलिजेंस कंसोल और ML डैशबोर्ड।',
      platformServices: 'प्लेटफ़ॉर्म सेवाएं',
      toolsAvailable: 'उपकरण उपलब्ध',
      todaysInsights: 'आज की कृषि अंतर्दृष्टि',
      scrapingOnline: 'अगमार्कनेट स्क्रैपिंग ऑनलाइन',
      gpsActive: 'ओपन-मेटियो GPS सक्रिय',
      neuralOperational: 'न्यूरल मॉडल इन्फरेंस ऑपरेशनल',
      launchTool: 'टूल लॉन्च करें'
    },
    // Common
    common: {
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफलता',
      submit: 'जमा करें',
      cancel: 'रद्द करें',
      save: 'सहेजें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      view: 'देखें',
      search: 'खोजें',
      filter: 'फ़िल्टर',
      sort: 'क्रमबद्ध करें',
      export: 'निर्यात',
      import: 'आयात',
      back: 'वापस',
      next: 'अगला',
      previous: 'पिछला',
      close: 'बंद करें',
      open: 'खोलें',
      select: 'चुनें',
      clear: 'साफ़ करें',
      apply: 'लागू करें',
      reset: 'रीसेट'
    }
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('agrisense_language');
    return saved && (saved === 'en' || saved === 'te' || saved === 'hi') ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('agrisense_language', language);
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
