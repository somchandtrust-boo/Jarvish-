/* =========================================================
   JARVISH AI BRAIN V2
   Natural Language Command Engine
   English + Hindi + Hinglish + Gujarati
   ========================================================= */

"use strict";

(function () {

    const JARVISH_BRAIN = {

        version: "2.0",
        name: "JARVISH",

        /* =====================================================
           MAIN PROCESSOR
           ===================================================== */

        process(input) {

            const text = this.clean(input);

            if (!text) {
                return {
                    type: "unknown",
                    value: ""
                };
            }

            /* =================================================
               GREETING
               ================================================= */

            if (this.has(text, [
                "hello",
                "hi",
                "hey",
                "hello jarvish",
                "hi jarvish",
                "hey jarvish",
                "namaste",
                "नमस्ते",
                "नमस्कार",
                "હેલો",
                "નમસ્તે"
            ])) {
                return {
                    type: "greeting",
                    value: text
                };
            }

            /* =================================================
               MAP
               ================================================= */

            if (this.has(text, [
                "map",
                "open map",
                "map open",
                "map kholo",
                "map khol",
                "map dikhao",
                "map dikha",
                "show map",
                "show me map",
                "please open map",
                "open the map",
                "naksha",
                "naksha kholo",
                "नक्शा",
                "नक्शा खोलो",
                "नक्शा दिखाओ",
                "मैप खोलो",
                "मैप दिखाओ",
                "નકશો",
                "નકશો ખોલો",
                "નકશો બતાવો"
            ])) {
                return { type: "map", value: text };
            }

            /* =================================================
               COMPASS
               ================================================= */

            if (this.has(text, [
                "compass",
                "open compass",
                "compass open",
                "compass kholo",
                "compass khol",
                "show compass",
                "direction",
                "direction batao",
                "direction dikhao",
                "which direction",
                "tell direction",
                "disha",
                "disha batao",
                "disha dikhao",
                "कंपास",
                "कंपास खोलो",
                "कंपास दिखाओ",
                "दिशा",
                "दिशा बताओ",
                "दिशा दिखाओ",
                "કંપાસ",
                "કંપાસ ખોલો",
                "કંપાસ બતાવો",
                "દિશા",
                "દિશા બતાવો"
            ])) {
                return { type: "compass", value: text };
            }

            /* =================================================
               SIREN
               ================================================= */

            if (this.has(text, [
                "siren",
                "open siren",
                "siren open",
                "siren kholo",
                "siren khol",
                "start siren",
                "siren start",
                "siren chalu",
                "siren on",
                "turn on siren",
                "alarm",
                "alarm chalu",
                "alarm on",
                "emergency siren",
                "सायरन",
                "सायरन खोलो",
                "सायरन चालू",
                "अलार्म",
                "अलार्म चालू",
                "સાયરન",
                "સાયરન ખોલો",
                "સાયરન ચાલુ",
                "એલાર્મ",
                "એલાર્મ ચાલુ"
            ])) {
                return { type: "siren", value: text };
            }

            /* =================================================
               FLASHLIGHT
               ================================================= */

            if (this.has(text, [
                "flashlight",
                "flash light",
                "open flashlight",
                "flashlight open",
                "flashlight kholo",
                "flashlight chalu",
                "flashlight on",
                "turn on flashlight",
                "torch",
                "torch on",
                "torch chalu",
                "torch kholo",
                "light",
                "light on",
                "light chalu",
                "light kholo",
                "mobile torch",
                "फोन की टॉर्च",
                "टॉर्च",
                "टॉर्च चालू",
                "टॉर्च खोलो",
                "लाइट",
                "लाइट चालू",
                "फ्लैशलाइट",
                "फ्लैशलाइट चालू",
                "ફ્લેશલાઇટ",
                "ફ્લેશલાઇટ ચાલુ",
                "ટોર્ચ",
                "ટોર્ચ ચાલુ",
                "લાઇટ",
                "લાઇટ ચાલુ"
            ])) {
                return { type: "flashlight", value: text };
            }

            /* =================================================
               CAMERA
               ================================================= */

            if (this.has(text, [
                "camera",
                "open camera",
                "camera open",
                "camera kholo",
                "camera khol",
                "camera chalu",
                "start camera",
                "show camera",
                "कैमरा",
                "कैमरा खोलो",
                "कैमरा चालू",
                "कैमरा दिखाओ",
                "કેમેરા",
                "કેમેરા ખોલો",
                "કેમેરા ચાલુ",
                "કેમેરા બતાવો"
            ])) {
                return { type: "camera", value: text };
            }

            /* =================================================
               LOCATION / GPS
               ================================================= */

            if (this.has(text, [
                "location",
                "open location",
                "location open",
                "location kholo",
                "location khol",
                "location dikhao",
                "show location",
                "show my location",
                "my location",
                "live location",
                "gps",
                "gps location",
                "where am i",
                "where i am",
                "mera location",
                "meri location",
                "लोकेशन",
                "लोकेशन खोलो",
                "लोकेशन दिखाओ",
                "मेरी लोकेशन",
                "मेरा लोकेशन",
                "जीपीएस",
                "मैं कहाँ हूँ",
                "લોકેશન",
                "લોકેશન ખોલો",
                "લોકેશન બતાવો",
                "મારી લોકેશન",
                "મારું લોકેશન",
                "જીપીએસ"
            ])) {
                return { type: "location", value: text };
            }

            /* =================================================
               WEATHER
               ================================================= */

            if (this.has(text, [
                "weather",
                "open weather",
                "weather open",
                "weather kholo",
                "weather khol",
                "weather batao",
                "weather dikhao",
                "show weather",
                "show me weather",
                "current weather",
                "what is weather",
                "what is the weather",
                "temperature",
                "temperature batao",
                "temperature dikhao",
                "current temperature",
                "mausam",
                "mausam batao",
                "mausam dikhao",
                "मौसम",
                "मौसम बताओ",
                "मौसम दिखाओ",
                "तापमान",
                "तापमान बताओ",
                "तापमान दिखाओ",
                "હવામાન",
                "હવામાન બતાવો",
                "હવામાન બતાવ",
                "તાપમાન",
                "તાપમાન બતાવો"
            ])) {
                return { type: "weather", value: text };
            }

            /* =================================================
               QR
               ================================================= */

            if (this.has(text, [
                "qr",
                "qr code",
                "qr generator",
                "open qr",
                "qr open",
                "qr kholo",
                "qr generator kholo",
                "qr code kholo",
                "show qr",
                "क्यूआर",
                "क्यू आर",
                "क्यूआर कोड",
                "क्यूआर खोलो",
                "क्यूआर जनरेटर",
                "ક્યૂઆર",
                "ક્યૂ આર",
                "ક્યૂઆર કોડ",
                "ક્યૂઆર ખોલો",
                "ક્યૂઆર જનરેટર"
            ])) {
                return { type: "qr", value: text };
            }

            /* =================================================
               YOUTUBE
               ================================================= */

            if (this.has(text, [
                "youtube",
                "open youtube",
                "youtube open",
                "youtube kholo",
                "youtube khol",
                "show youtube",
                "यूट्यूब",
                "यूट्यूब खोलो",
                "यूट्यूब चालू",
                "યૂટ્યુબ",
                "યૂટ્યુબ ખોલો",
                "યૂટ્યુબ ચાલુ"
            ])) {
                return { type: "youtube", value: text };
            }

            /* =================================================
               WHATSAPP
               ================================================= */

            if (this.has(text, [
                "whatsapp",
                "open whatsapp",
                "whatsapp open",
                "whatsapp kholo",
                "whatsapp khol",
                "show whatsapp",
                "व्हाट्सएप",
                "व्हाट्सएप खोलो",
                "વોટ્સએપ",
                "વોટ્સએપ ખોલો"
            ])) {
                return { type: "whatsapp", value: text };
            }

            /* =================================================
               GOOGLE
               ================================================= */

            if (this.has(text, [
                "google",
                "open google",
                "google open",
                "google kholo",
                "google khol",
                "search google",
                "गूगल",
                "गूगल खोलो",
                "गूगल चालू",
                "ગૂગલ",
                "ગૂગલ ખોલો",
                "ગૂગલ ચાલુ"
            ])) {
                return { type: "google", value: text };
            }

            /* =================================================
               INSTAGRAM
               ================================================= */

            if (this.has(text, [
                "instagram",
                "open instagram",
                "instagram open",
                "instagram kholo",
                "instagram khol",
                "इंस्टाग्राम",
                "इंस्टाग्राम खोलो",
                "ઇન્સ્ટાગ્રામ",
                "ઇન્સ્ટાગ્રામ ખોલો"
            ])) {
                return { type: "instagram", value: text };
            }

            /* =================================================
               FACEBOOK
               ================================================= */

            if (this.has(text, [
                "facebook",
                "open facebook",
                "facebook open",
                "facebook kholo",
                "facebook khol",
                "फेसबुक",
                "फेसबुक खोलो",
                "ફેસબુક",
                "ફેસબુક ખોલો"
            ])) {
                return { type: "facebook", value: text };
            }

            /* =================================================
               TIME
               ================================================= */

            if (this.has(text, [
                "time",
                "tell time",
                "time batao",
                "time dikhao",
                "what time is it",
                "current time",
                "kitne baje",
                "kitna baje",
                "samay batao",
                "समय",
                "समय बताओ",
                "कितने बजे",
                "अभी कितने बजे",
                "સમય",
                "સમય બતાવો",
                "કેટલા વાગ્યા"
            ])) {
                return { type: "time", value: text };
            }

            /* =================================================
               DATE
               ================================================= */

            if (this.has(text, [
                "date",
                "tell date",
                "date batao",
                "date dikhao",
                "today date",
                "today's date",
                "what is today's date",
                "aaj ki date",
                "aaj ki tarikh",
                "आज की तारीख",
                "आज तारीख",
                "आज की डेट",
                "आज",
                "આજની તારીખ",
                "આજની ડેટ"
            ])) {
                return { type: "date", value: text };
            }

            /* =================================================
               STATUS
               ================================================= */

            if (this.has(text, [
                "status",
                "system status",
                "system check",
                "system ka status",
                "system status batao",
                "status batao",
                "check system",
                "how is system",
                "system kaisa hai",
                "सिस्टम स्टेटस",
                "सिस्टम का स्टेटस",
                "स्टेटस बताओ",
                "સિસ્ટમ સ્ટેટસ",
                "સિસ્ટમનું સ્ટેટસ",
                "સ્ટેટસ બતાવો"
            ])) {
                return { type: "status", value: text };
            }

            /* =================================================
               CLEAR HISTORY
               ================================================= */

            if (this.has(text, [
                "clear history",
                "delete history",
                "remove history",
                "history clear",
                "history delete",
                "हिस्ट्री साफ",
                "इतिहास साफ",
                "હિસ્ટ્રી સાફ",
                "ઇતિહાસ સાફ"
            ])) {
                return { type: "clear-history", value: text };
            }

            /* =================================================
               STOP
               ================================================= */

            if (this.has(text, [
                "stop everything",
                "stop all",
                "stop jarvish",
                "stop",
                "band karo",
                "sab band karo",
                "sab kuch band karo",
                "close everything",
                "close all",
                "exit",
                "रोक दो",
                "सब बंद करो",
                "सब कुछ बंद करो",
                "बंद करो",
                "एग्जिट",
                "બંધ કરો",
                "બધું બંધ કરો",
                "બધું રોકો"
            ])) {
                return { type: "stop", value: text };
            }

            return {
                type: "unknown",
                value: text
            };
        },


        /* =====================================================
           CLEAN TEXT
           ===================================================== */

        clean(text) {

            return String(text || "")
                .toLowerCase()
                .normalize("NFKC")
                .replace(/[!?.,;:()[\]{}"'`~@#$%^&*_+=|\\/<>-]+/g, " ")
                .replace(/\s+/g, " ")
                .trim();
        },


        /* =====================================================
           MATCH WORD / PHRASE
           ===================================================== */

        has(text, words) {

            const cleanText = this.clean(text);

            return words.some(word => {

                const cleanWord = this.clean(word);

                if (!cleanWord) {
                    return false;
                }

                return cleanText.includes(cleanWord);
            });
        }
    };


    /* =========================================================
       GLOBAL ACCESS
       ========================================================= */

    window.JARVISH_BRAIN = JARVISH_BRAIN;

    console.log(
        "JARVISH AI Brain V2 loaded successfully."
    );

})();
