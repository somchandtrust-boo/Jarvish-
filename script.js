/* =========================================================
   JARVISH VOICE SYSTEM V2
   FINAL WORKING VERSION
   ========================================================= */

"use strict";


/* =========================================================
   CONFIGURATION
   ========================================================= */

const JARVISH_CONFIG = {

    name: "JARVISH",

    defaultLanguage: "en-IN",

    links: {

        qr:
            "https://somchandtrust-boo.github.io/CBRND-QR/",

        camera:
            "https://somchandtrust-boo.github.io/hd-smart-camera/",

        location:
            "https://somchandtrust-boo.github.io/CBRND-Location-Tracker/admin.html",

        youtube:
            "https://www.youtube.com/",

        whatsapp:
            "https://web.whatsapp.com/",

        google:
            "https://www.google.com/",

        instagram:
            "https://www.instagram.com/",

        facebook:
            "https://www.facebook.com/"
    }
};


/* =========================================================
   STATE
   ========================================================= */

const state = {

    language:
        JARVISH_CONFIG.defaultLanguage,

    listening: false,

    speaking: false,

    recognition: null,

    recognitionSupported:
        "SpeechRecognition" in window ||
        "webkitSpeechRecognition" in window,

    speechSupported:
        "speechSynthesis" in window,

    recognitionStarting: false,

    manualStop: false,

    cameraStream: null,

    cameraTrack: null,

    flashlight: false,

    compassActive: false,

    compassHandler: null,

    currentModule: null,

    weatherLoading: false,

    history: []
};


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const el = {

    aiCore:
        document.getElementById("aiCore"),

    micButton:
        document.getElementById("micButton"),

    heardText:
        document.getElementById("heardText"),

    replyText:
        document.getElementById("replyText"),

    coreStatusText:
        document.getElementById("coreStatusText"),

    aiCoreStatus:
        document.getElementById("aiCoreStatus"),

    systemAI:
        document.getElementById("systemAI"),

    systemVoice:
        document.getElementById("systemVoice"),

    micStatus:
        document.getElementById("micStatus"),

    locationStatus:
        document.getElementById("locationStatus"),

    temperatureValue:
        document.getElementById("temperatureValue"),

    humidityValue:
        document.getElementById("humidityValue"),

    aqiValue:
        document.getElementById("aqiValue"),

    gpsValue:
        document.getElementById("gpsValue"),

    currentTime:
        document.getElementById("currentTime"),

    historyList:
        document.getElementById("historyList"),

    clearHistory:
        document.getElementById("clearHistory"),

    moduleOverlay:
        document.getElementById("moduleOverlay"),

    moduleTitle:
        document.getElementById("moduleTitle"),

    moduleContent:
        document.getElementById("moduleContent"),

    closeModule:
        document.getElementById("closeModule"),

    notification:
        document.getElementById("notification"),

    notificationText:
        document.getElementById("notificationText"),

    listeningIndicator:
        document.getElementById("listeningIndicator")
};


/* =========================================================
   STARTUP
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeJarvish
);


function initializeJarvish() {

    setupClock();

    setupButtons();

    setupLanguageButtons();

    setupSpeechRecognition();

    restoreHistory();

    updateSystemStatus();

    requestLocation();

    loadWeather();

    setTimeout(
        speakWelcome,
        900
    );

    console.log(
        "JARVISH initialized successfully."
    );
}


/* =========================================================
   CLOCK
   ========================================================= */

function setupClock() {

    function updateClock() {

        const now =
            new Date();

        if (el.currentTime) {

            el.currentTime.textContent =
                now.toLocaleTimeString(
                    state.language,
                    {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                    }
                );
        }
    }

    updateClock();

    setInterval(
        updateClock,
        1000
    );
}


/* =========================================================
   BUTTONS
   ========================================================= */

function setupButtons() {

    if (el.micButton) {

        el.micButton.addEventListener(
            "click",
            toggleListening
        );
    }

    if (el.aiCore) {

        el.aiCore.addEventListener(
            "click",
            toggleListening
        );
    }

    if (el.closeModule) {

        el.closeModule.addEventListener(
            "click",
            closeModule
        );
    }

    if (el.moduleOverlay) {

        el.moduleOverlay.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    el.moduleOverlay
                ) {
                    closeModule();
                }
            }
        );
    }

    if (el.clearHistory) {

        el.clearHistory.addEventListener(
            "click",
            function () {

                state.history = [];

                localStorage.removeItem(
                    "jarvish_history"
                );

                renderHistory();

                speak(
                    getLanguageText(
                        "historyCleared"
                    )
                );
            }
        );
    }
}


/* =========================================================
   LANGUAGE BUTTONS
   ========================================================= */

function setupLanguageButtons() {

    const buttons =
        document.querySelectorAll(
            "[data-lang]"
        );

    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    const lang =
                        button.dataset.lang;

                    if (!lang) {
                        return;
                    }

                    state.language =
                        lang;

                    if (
                        state.recognition
                    ) {

                        state.recognition.lang =
                            state.language;
                    }

                    buttons.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );

                    button.classList.add(
                        "active"
                    );

                    const languageName =
                        getLanguageName(lang);

                    speak(
                        languageName +
                        " " +
                        getLanguageText(
                            "languageChanged"
                        )
                    );

                    updateSystemStatus();
                }
            );
        }
    );
}


function getLanguageName(lang) {

    if (lang === "hi-IN") {
        return "Hindi";
    }

    if (lang === "gu-IN") {
        return "Gujarati";
    }

    return "English";
}


/* =========================================================
   SPEECH RECOGNITION
   ========================================================= */

function setupSpeechRecognition() {

    if (!state.recognitionSupported) {

        if (el.micStatus) {
            el.micStatus.textContent =
                "VOICE UNSUPPORTED";
        }

        if (el.systemVoice) {
            el.systemVoice.textContent =
                "UNSUPPORTED";
        }

        console.warn(
            "Speech Recognition is not supported."
        );

        return;
    }

    try {

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        state.recognition =
            new SpeechRecognition();

        state.recognition.continuous =
            false;

        state.recognition.interimResults =
            false;

        state.recognition.maxAlternatives =
            1;

        state.recognition.lang =
            state.language;


        /* ================================================
           ON START
           ================================================ */

        state.recognition.onstart =
            function () {

                state.listening =
                    true;

                state.recognitionStarting =
                    false;

                state.manualStop =
                    false;

                updateListeningUI(true);

                setCoreStatus(
                    getLanguageText(
                        "listening"
                    )
                );

                console.log(
                    "JARVISH voice recognition started."
                );
            };


        /* ================================================
           ON RESULT
           ================================================ */

        state.recognition.onresult =
            function (event) {

                try {

                    let transcript = "";

                    for (
                        let i = event.resultIndex;
                        i < event.results.length;
                        i++
                    ) {

                        if (
                            event.results[i].isFinal
                        ) {

                            transcript +=
                                " " +
                                event.results[i][0].transcript;
                        }
                    }

                    transcript =
                        normalizeCommand(
                            transcript
                        );

                    if (!transcript) {
                        return;
                    }

                    console.log(
                        "Voice command:",
                        transcript
                    );

                    processVoiceCommand(
                        transcript
                    );

                } catch (error) {

                    console.error(
                        "Voice result error:",
                        error
                    );

                    showNotification(
                        "Voice processing error"
                    );
                }
            };


        /* ================================================
           ON ERROR
           ================================================ */

        state.recognition.onerror =
            function (event) {

                state.recognitionStarting =
                    false;

                state.listening =
                    false;

                updateListeningUI(false);

                console.error(
                    "Speech recognition error:",
                    event.error
                );


                switch (event.error) {

                    case "not-allowed":

                    case "service-not-allowed":

                        setCoreStatus(
                            "MICROPHONE DENIED"
                        );

                        speak(
                            getLanguageText(
                                "microphoneDenied"
                            )
                        );

                        break;


                    case "audio-capture":

                        setCoreStatus(
                            "MICROPHONE ERROR"
                        );

                        speak(
                            getLanguageText(
                                "microphoneError"
                            )
                        );

                        break;


                    case "no-speech":

                        setCoreStatus(
                            "NO SPEECH DETECTED"
                        );

                        break;


                    case "network":

                        setCoreStatus(
                            "VOICE NETWORK ERROR"
                        );

                        speak(
                            getLanguageText(
                                "networkError"
                            )
                        );

                        break;


                    case "aborted":

                        setCoreStatus(
                            "JARVISH READY"
                        );

                        break;


                    default:

                        setCoreStatus(
                            "VOICE ERROR"
                        );

                        break;
                }
            };


        /* ================================================
           ON END
           ================================================ */

        state.recognition.onend =
            function () {

                state.listening =
                    false;

                state.recognitionStarting =
                    false;

                updateListeningUI(false);

                if (
                    !state.manualStop
                ) {

                    setCoreStatus(
                        "JARVISH READY"
                    );
                }

                state.manualStop =
                    false;

                console.log(
                    "JARVISH voice recognition ended."
                );
            };


        if (el.systemVoice) {
            el.systemVoice.textContent =
                "READY";
        }

    } catch (error) {

        console.error(
            "Speech Recognition initialization failed:",
            error
        );

        state.recognition =
            null;

        if (el.systemVoice) {
            el.systemVoice.textContent =
                "ERROR";
        }
    }
}


/* =========================================================
   TOGGLE LISTENING
   ========================================================= */

function toggleListening() {

    if (!state.recognition) {

        speak(
            getLanguageText(
                "voiceUnavailable"
            )
        );

        return;
    }

    if (state.listening) {

        stopListening();

    } else {

        startListening();
    }
}


/* =========================================================
   START LISTENING
   ========================================================= */

function startListening() {

    if (!state.recognition) {
        return;
    }

    if (state.listening) {
        return;
    }

    if (state.recognitionStarting) {
        return;
    }

    state.recognitionStarting =
        true;

    state.manualStop =
        false;


    if (
        state.speaking &&
        "speechSynthesis" in window
    ) {

        speechSynthesis.cancel();

        state.speaking =
            false;
    }


    state.recognition.lang =
        state.language;


    setCoreStatus(
        getLanguageText(
            "starting"
        )
    );


    try {

        state.recognition.start();

    } catch (error) {

        state.recognitionStarting =
            false;

        console.warn(
            "Recognition start:",
            error
        );

        if (
            error.name ===
            "InvalidStateError"
        ) {

            state.listening =
                true;

            updateListeningUI(true);

        } else {

            setCoreStatus(
                "VOICE START ERROR"
            );
        }
    }
}


/* =========================================================
   STOP LISTENING
   ========================================================= */

function stopListening() {

    if (!state.recognition) {
        return;
    }

    state.manualStop =
        true;

    state.recognitionStarting =
        false;

    try {

        state.recognition.stop();

    } catch (error) {

        console.warn(
            "Recognition stop:",
            error
        );

        state.listening =
            false;

        updateListeningUI(false);
    }
}


/* =========================================================
   NORMALIZE VOICE COMMAND
   ========================================================= */

function normalizeCommand(text) {

    return String(text || "")
        .normalize("NFKC")
        .replace(
            /[!?.,;:()[\]{}"'`~@#$%^&*_+=|\\/<>-]+/g,
            " "
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim()
        .toLowerCase();
}


/* =========================================================
   PROCESS VOICE COMMAND
   ========================================================= */

async function processVoiceCommand(text) {

    const commandText =
        normalizeCommand(text);

    if (!commandText) {
        return;
    }


    /* ================================================
       DISPLAY HEARD COMMAND
       ================================================ */

    if (el.heardText) {

        el.heardText.textContent =
            text;
    }


    addHistory(text);


    /* ================================================
       STOP LISTENING AFTER RESULT
       ================================================ */

    if (
        state.recognition &&
        state.listening
    ) {

        state.manualStop =
            true;

        try {
            state.recognition.stop();
        } catch (error) {
            console.warn(error);
        }
    }


    /* ================================================
       AI BRAIN
       ================================================ */

    let brainResult =
        null;

    try {

        if (
            window.JARVISH_BRAIN &&
            typeof
                window.JARVISH_BRAIN.process ===
                "function"
        ) {

            brainResult =
                window.JARVISH_BRAIN.process(
                    commandText
                );
        }

    } catch (error) {

        console.error(
            "AI Brain error:",
            error
        );

        brainResult =
            null;
    }


    /* ================================================
       FALLBACK BRAIN
       ================================================ */

    if (
        !brainResult ||
        !brainResult.type ||
        brainResult.type === "unknown"
    ) {

        brainResult =
            fallbackCommandParser(
                commandText
            );
    }


    console.log(
        "JARVISH COMMAND:",
        brainResult
    );


    /* ================================================
       EXECUTE
       ================================================ */

    try {

        await executeBrainCommand(
            brainResult
        );

    } catch (error) {

        console.error(
            "Command execution error:",
            error
        );

        speak(
            getLanguageText(
                "commandError"
            )
        );
    }
}


/* =========================================================
   FALLBACK COMMAND PARSER
   ========================================================= */

function fallbackCommandParser(text) {

    const t =
        normalizeCommand(text);


    if (
        containsAny(
            t,
            [
                "map",
                "naksha",
                "नक्शा",
                "नक्शा खोलो",
                "નકશો"
            ]
        )
    ) {
        return { type: "map" };
    }


    if (
        containsAny(
            t,
            [
                "compass",
                "direction",
                "disha",
                "कंपास",
                "दिशा",
                "કંપાસ",
                "દિશા"
            ]
        )
    ) {
        return { type: "compass" };
    }


    if (
        containsAny(
            t,
            [
                "siren",
                "alarm",
                "सायरन",
                "अलार्म",
                "સાયરન"
            ]
        )
    ) {
        return { type: "siren" };
    }


    if (
        containsAny(
            t,
            [
                "flashlight",
                "flash light",
                "torch",
                "light",
                "टॉर्च",
                "लाइट",
                "ફ્લેશલાઇટ",
                "ટોર્ચ",
                "લાઇટ"
            ]
        )
    ) {
        return { type: "flashlight" };
    }


    if (
        containsAny(
            t,
            [
                "camera",
                "कैमरा",
                "કેમેરા"
            ]
        )
    ) {
        return { type: "camera" };
    }


    if (
        containsAny(
            t,
            [
                "location",
                "gps",
                "where am i",
                "मेरी लोकेशन",
                "लोकेशन",
                "લોકેશન"
            ]
        )
    ) {
        return { type: "location" };
    }


    if (
        containsAny(
            t,
            [
                "weather",
                "temperature",
                "mausam",
                "मौसम",
                "तापमान",
                "હવામાન",
                "તાપમાન"
            ]
        )
    ) {
        return { type: "weather" };
    }


    if (
        containsAny(
            t,
            [
                "qr",
                "qr code",
                "क्यूआर",
                "ક્યૂઆર"
            ]
        )
    ) {
        return { type: "qr" };
    }


    if (
        containsAny(
            t,
            [
                "youtube",
                "यूट्यूब",
                "યૂટ્યુબ"
            ]
        )
    ) {
        return { type: "youtube" };
    }


    if (
        containsAny(
            t,
            [
                "whatsapp",
                "व्हाट्सएप",
                "વોટ્સએપ"
            ]
        )
    ) {
        return { type: "whatsapp" };
    }


    if (
        containsAny(
            t,
            [
                "google",
                "गूगल",
                "ગૂગલ"
            ]
        )
    ) {
        return { type: "google" };
    }


    if (
        containsAny(
            t,
            [
                "instagram",
                "इंस्टाग्राम",
                "ઇન્સ્ટાગ્રામ"
            ]
        )
    ) {
        return { type: "instagram" };
    }


    if (
        containsAny(
            t,
            [
                "facebook",
                "फेसबुक",
                "ફેસબુક"
            ]
        )
    ) {
        return { type: "facebook" };
    }


    if (
        containsAny(
            t,
            [
                "time",
                "समय",
                "कितने बजे",
                "સમય",
                "કેટલા વાગ્યા"
            ]
        )
    ) {
        return { type: "time" };
    }


    if (
        containsAny(
            t,
            [
                "date",
                "today",
                "तारीख",
                "आज",
                "તારીખ",
                "આજ"
            ]
        )
    ) {
        return { type: "date" };
    }


    if (
        containsAny(
            t,
            [
                "status",
                "system status",
                "स्टेटस",
                "સિસ્ટમ સ્ટેટસ"
            ]
        )
    ) {
        return { type: "status" };
    }


    if (
        containsAny(
            t,
            [
                "clear history",
                "delete history",
                "हिस्ट्री साफ",
                "હિસ્ટ્રી સાફ"
            ]
        )
    ) {
        return {
            type: "clear-history"
        };
    }


    if (
        containsAny(
            t,
            [
                "stop",
                "stop all",
                "band karo",
                "बंद करो",
                "બંધ કરો"
            ]
        )
    ) {
        return { type: "stop" };
    }


    if (
        containsAny(
            t,
            [
                "hello",
                "hi",
                "hey",
                "namaste",
                "नमस्ते",
                "નમસ્તે"
            ]
        )
    ) {
        return { type: "greeting" };
    }


    return {
        type: "unknown",
        value: t
    };
}


/* =========================================================
   CONTAINS ANY
   ========================================================= */

function containsAny(
    text,
    words
) {

    const cleanText =
        normalizeCommand(text);

    return words.some(
        word =>
            cleanText.includes(
                normalizeCommand(word)
            )
    );
}


/* =========================================================
   EXECUTE AI COMMAND
   ========================================================= */

async function executeBrainCommand(
    result
) {

    const type =
        result &&
        result.type
            ? result.type
            : "unknown";


    switch (type) {

        case "greeting":

            speak(
                getLanguageText(
                    "hello"
                )
            );

            break;


        case "map":

            speak(
                getLanguageText(
                    "mapOpening"
                )
            );

            setTimeout(
                openMap,
                300
            );

            break;


        case "compass":

            speak(
                getLanguageText(
                    "compassOpening"
                )
            );

            setTimeout(
                openCompass,
                300
            );

            break;


        case "siren":

            speak(
                getLanguageText(
                    "sirenStarted"
                )
            );

            setTimeout(
                openSiren,
                300
            );

            break;


        case "flashlight":

            await toggleFlashlight();

            break;


        case "camera":

            speak(
                getLanguageText(
                    "cameraStarted"
                )
            );

            setTimeout(
                openCamera,
                300
            );

            break;


        case "location":

            speak(
                getLanguageText(
                    "locationOpening"
                )
            );

            setTimeout(
                openLocation,
                300
            );

            break;


        case "weather":

            speak(
                getLanguageText(
                    "weatherOpening"
                )
            );

            setTimeout(
                openWeather,
                300
            );

            break;


        case "qr":

            speak(
                getLanguageText(
                    "qrOpening"
                )
            );

            setTimeout(
                () =>
                    openExternal(
                        JARVISH_CONFIG.links.qr
                    ),
                300
            );

            break;


        case "youtube":

            speak(
                getLanguageText(
                    "youtubeOpening"
                )
            );

            setTimeout(
                () =>
                    openExternal(
                        JARVISH_CONFIG.links.youtube
                    ),
                300
            );

            break;


        case "whatsapp":

            speak(
                getLanguageText(
                    "whatsappOpening"
                )
            );

            setTimeout(
                () =>
                    openExternal(
                        JARVISH_CONFIG.links.whatsapp
                    ),
                300
            );

            break;


        case "google":

            speak(
                getLanguageText(
                    "googleOpening"
                )
            );

            setTimeout(
                () =>
                    openExternal(
                        JARVISH_CONFIG.links.google
                    ),
                300
            );

            break;


        case "instagram":

            speak(
                "Opening Instagram."
            );

            setTimeout(
                () =>
                    openExternal(
                        JARVISH_CONFIG.links.instagram
                    ),
                300
            );

            break;


        case "facebook":

            speak(
                "Opening Facebook."
            );

            setTimeout(
                () =>
                    openExternal(
                        JARVISH_CONFIG.links.facebook
                    ),
                300
            );

            break;


        case "time":

            tellTime();

            break;


        case "date":

            tellDate();

            break;


        case "status":

            speakSystemStatus();

            break;


        case "clear-history":

            clearCommandHistory();

            break;


        case "stop":

            stopAllModules();

            break;


        default:

            speak(
                getLanguageText(
                    "unknown"
                )
            );

            break;
    }
}


/* =========================================================
   MODULE OVERLAY
   ========================================================= */

function openModule(
    title,
    content
) {

    if (el.moduleTitle) {
        el.moduleTitle.textContent =
            title;
    }

    if (el.moduleContent) {
        el.moduleContent.innerHTML =
            content;
    }

    if (el.moduleOverlay) {

        el.moduleOverlay.classList.add(
            "active"
        );

        el.moduleOverlay.style.display =
            "flex";
    }

    state.currentModule =
        title;
}


function closeModule() {

    stopCompass();

    if (el.moduleOverlay) {

        el.moduleOverlay.classList.remove(
            "active"
        );

        el.moduleOverlay.style.display =
            "";
    }

    state.currentModule =
        null;
}


/* =========================================================
   MAP
   ========================================================= */

function openMap() {

    const latitude =
        window.jarvishLocation &&
        window.jarvishLocation.latitude
            ? window.jarvishLocation.latitude
            : 23.0225;

    const longitude =
        window.jarvishLocation &&
        window.jarvishLocation.longitude
            ? window.jarvishLocation.longitude
            : 72.5714;


    const mapURL =
        `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`;


    openModule(
        "JARVISH MAP",
        `
        <div class="jarvish-module map-module">

            <div class="module-big-icon">
                🗺️
            </div>

            <div class="module-main-value">
                MAP READY
            </div>

            <div class="module-info">
                Latitude: ${latitude.toFixed(6)}
                <br>
                Longitude: ${longitude.toFixed(6)}
            </div>

            <button
                class="module-action"
                onclick="window.open('${mapURL}','_blank')"
            >
                OPEN MAP
            </button>

            <button
                class="module-action"
                onclick="window.JARVISH.openLocation()"
            >
                MY LOCATION
            </button>

        </div>
        `
    );
}


/* =========================================================
   COMPASS
   ========================================================= */

function openCompass() {

    const supported =
        "DeviceOrientationEvent" in window;

    if (!supported) {

        openModule(
            "JARVISH COMPASS",
            `
            <div class="jarvish-module">
                <div class="module-big-icon">
                    🧭
                </div>

                <div class="module-main-value">
                    COMPASS UNSUPPORTED
                </div>

                <div class="module-info">
                    Your browser does not provide
                    device orientation.
                </div>
            </div>
            `
        );

        return;
    }


    openModule(
        "JARVISH COMPASS",
        `
        <div class="jarvish-module compass-module">

            <div
                id="jarvishCompass"
                style="
                    width:220px;
                    height:220px;
                    margin:20px auto;
                    border:3px solid currentColor;
                    border-radius:50%;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    position:relative;
                    font-size:26px;
                "
            >

                <span
                    style="
                        position:absolute;
                        top:10px;
                    "
                >
                    N
                </span>

                <span
                    style="
                        position:absolute;
                        right:10px;
                    "
                >
                    E
                </span>

                <span
                    style="
                        position:absolute;
                        bottom:10px;
                    "
                >
                    S
                </span>

                <span
                    style="
                        position:absolute;
                        left:10px;
                    "
                >
                    W
                </span>

                <div
                    id="jarvishHeading"
                    style="
                        font-size:32px;
                        font-weight:bold;
                    "
                >
                    0°
                </div>

            </div>

            <div
                id="jarvishDirection"
                class="module-main-value"
            >
                NORTH
            </div>

            <div class="module-info">
                Rotate your device to change direction.
            </div>

        </div>
        `
    );


    startCompass();
}


function startCompass() {

    stopCompass();

    state.compassActive =
        true;


    state.compassHandler =
        function (event) {

            let heading = 0;


            if (
                typeof event.webkitCompassHeading ===
                "number"
            ) {

                heading =
                    event.webkitCompassHeading;

            } else if (
                typeof event.alpha ===
                "number"
            ) {

                heading =
                    360 - event.alpha;
            }


            heading =
                normalizeDegree(
                    heading
                );


            const headingElement =
                document.getElementById(
                    "jarvishHeading"
                );

            const directionElement =
                document.getElementById(
                    "jarvishDirection"
                );


            if (headingElement) {

                headingElement.textContent =
                    Math.round(heading) +
                    "°";
            }


            if (directionElement) {

                directionElement.textContent =
                    getDirection(
                        heading
                    );
            }
        };


    window.addEventListener(
        "deviceorientation",
        state.compassHandler,
        true
    );
}


function stopCompass() {

    if (
        state.compassHandler
    ) {

        window.removeEventListener(
            "deviceorientation",
            state.compassHandler,
            true
        );

        state.compassHandler =
            null;
    }

    state.compassActive =
        false;
}


function normalizeDegree(
    degree
) {

    degree =
        Number(degree) || 0;

    return (
        degree + 360
    ) % 360;
}


function getDirection(
    degree
) {

    const directions = [
        "NORTH",
        "NORTH-EAST",
        "EAST",
        "SOUTH-EAST",
        "SOUTH",
        "SOUTH-WEST",
        "WEST",
        "NORTH-WEST"
    ];

    const index =
        Math.round(
            degree / 45
        ) % 8;

    return directions[index];
}


/* =========================================================
   SIREN
   ========================================================= */

let sirenContext = null;
let sirenOscillator = null;
let sirenGain = null;
let sirenTimer = null;


function openSiren() {

    if (
        sirenOscillator
    ) {

        stopSiren();

        speak(
            getLanguageText(
                "sirenStopped"
            )
        );

        return;
    }


    try {

        sirenContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();


        sirenOscillator =
            sirenContext.createOscillator();

        sirenGain =
            sirenContext.createGain();


        sirenOscillator.type =
            "sawtooth";

        sirenOscillator.frequency.value =
            700;

        sirenGain.gain.value =
            0.08;


        sirenOscillator.connect(
            sirenGain
        );

        sirenGain.connect(
            sirenContext.destination
        );


        sirenOscillator.start();


        let high = true;

        sirenTimer =
            setInterval(
                function () {

                    high = !high;

                    if (
                        sirenOscillator &&
                        sirenContext
                    ) {

                        sirenOscillator.frequency.setTargetAtTime(
                            high
                                ? 1100
                                : 650,
                            sirenContext.currentTime,
                            0.08
                        );
                    }

                },
                450
            );


        openModule(
            "JARVISH SIREN",
            `
            <div class="jarvish-module">

                <div class="module-big-icon">
                    🚨
                </div>

                <div class="module-main-value">
                    SIREN ACTIVE
                </div>

                <div class="module-info">
                    Emergency siren is running.
                </div>

                <button
                    class="module-action"
                    onclick="window.JARVISH.stopSiren()"
                >
                    STOP SIREN
                </button>

            </div>
            `
        );


    } catch (error) {

        console.error(
            "Siren error:",
            error
        );

        speak(
            "Siren could not start."
        );
    }
}


function stopSiren() {

    if (sirenTimer) {

        clearInterval(
            sirenTimer
        );

        sirenTimer =
            null;
    }


    if (sirenOscillator) {

        try {
            sirenOscillator.stop();
        } catch (error) {
            console.warn(error);
        }

        sirenOscillator.disconnect();

        sirenOscillator =
            null;
    }


    if (sirenGain) {

        sirenGain.disconnect();

        sirenGain =
            null;
    }


    if (sirenContext) {

        try {
            sirenContext.close();
        } catch (error) {
            console.warn(error);
        }

        sirenContext =
            null;
    }
}


/* =========================================================
   FLASHLIGHT
   ========================================================= */

async function toggleFlashlight() {

    if (
        state.cameraTrack
    ) {

        try {

            const capabilities =
                state.cameraTrack.getCapabilities();

            if (
                capabilities &&
                capabilities.torch
            ) {

                state.flashlight =
                    !state.flashlight;

                await state.cameraTrack.applyConstraints(
                    {
                        advanced: [
                            {
                                torch:
                                    state.flashlight
                            }
                        ]
                    }
                );


                speak(
                    state.flashlight
                        ? getLanguageText(
                            "flashlightOn"
                        )
                        : getLanguageText(
                            "flashlightOff"
                        )
                );

                return;
            }

        } catch (error) {

            console.warn(
                "Torch constraint error:",
                error
            );
        }
    }


    try {

        if (
            !state.cameraStream
        ) {

            state.cameraStream =
                await navigator.mediaDevices.getUserMedia(
                    {
                        video: {
                            facingMode:
                                {
                                    ideal:
                                        "environment"
                                }
                        },
                        audio: false
                    }
                );

            state.cameraTrack =
                state.cameraStream.getVideoTracks()[0];
        }


        const capabilities =
            state.cameraTrack &&
            state.cameraTrack.getCapabilities
                ? state.cameraTrack.getCapabilities()
                : null;


        if (
            capabilities &&
            capabilities.torch
        ) {

            state.flashlight =
                !state.flashlight;

            await state.cameraTrack.applyConstraints(
                {
                    advanced: [
                        {
                            torch:
                                state.flashlight
                        }
                    ]
                }
            );


            speak(
                state.flashlight
                    ? getLanguageText(
                        "flashlightOn"
                    )
                    : getLanguageText(
                        "flashlightOff"
                    )
            );

            return;
        }


        openModule(
            "JARVISH FLASHLIGHT",
            `
            <div class="jarvish-module">

                <div class="module-big-icon">
                    🔦
                </div>

                <div class="module-main-value">
                    TORCH CONTROL
                </div>

                <div class="module-info">
                    Your browser/device does not
                    expose hardware torch control.
                </div>

            </div>
            `
        );


        speak(
            getLanguageText(
                "flashlightUnsupported"
            )
        );


    } catch (error) {

        console.error(
            "Flashlight error:",
            error
        );

        speak(
            "Camera permission is required for flashlight."
        );
    }
}


/* =========================================================
   CAMERA
   ========================================================= */

async function openCamera() {

    try {

        stopCamera();


        const stream =
            await navigator.mediaDevices.getUserMedia(
                {
                    video: {
                        facingMode: {
                            ideal:
                                "environment"
                        }
                    },
                    audio: false
                }
            );


        state.cameraStream =
            stream;

        state.cameraTrack =
            stream.getVideoTracks()[0];


        openModule(
            "JARVISH CAMERA",
            `
            <div class="jarvish-module">

                <video
                    id="jarvishCameraVideo"
                    autoplay
                    playsinline
                    muted
                    style="
                        width:100%;
                        max-width:700px;
                        border-radius:18px;
                        background:#000;
                    "
                ></video>

                <div class="module-info">
                    Camera is active.
                </div>

                <button
                    class="module-action"
                    onclick="window.JARVISH.closeCamera()"
                >
                    CLOSE CAMERA
                </button>

            </div>
            `
        );


        const video =
            document.getElementById(
                "jarvishCameraVideo"
            );


        if (video) {
            video.srcObject =
                stream;
        }


    } catch (error) {

        console.error(
            "Camera error:",
            error
        );

        speak(
            getLanguageText(
                "cameraDenied"
            )
        );
    }
}


function stopCamera() {

    if (
        state.cameraStream
    ) {

        state.cameraStream
            .getTracks()
            .forEach(
                track =>
                    track.stop()
            );

        state.cameraStream =
            null;
    }

    state.cameraTrack =
        null;
}


/* =========================================================
   LOCATION
   ========================================================= */

function requestLocation() {

    if (
        !navigator.geolocation
    ) {

        if (el.locationStatus) {
            el.locationStatus.textContent =
                "UNAVAILABLE";
        }

        return;
    }


    navigator.geolocation.getCurrentPosition(

        function (position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            window.jarvishLocation = {

                latitude,
                longitude,

                accuracy:
                    position.coords.accuracy
            };


            if (el.locationStatus) {

                el.locationStatus.textContent =
                    "GPS READY";
            }


            if (el.gpsValue) {

                el.gpsValue.textContent =
                    latitude.toFixed(4) +
                    ", " +
                    longitude.toFixed(4);
            }

        },

        function (error) {

            console.warn(
                "Location error:",
                error
            );

            if (el.locationStatus) {

                el.locationStatus.textContent =
                    "GPS WAITING";
            }
        },

        {
            enableHighAccuracy:
                true,

            timeout:
                10000,

            maximumAge:
                30000
        }
    );
}


/* =========================================================
   OPEN LOCATION
   ========================================================= */

function openLocation() {

    requestLocation();


    setTimeout(
        function () {

            const location =
                window.jarvishLocation;


            if (!location) {

                openModule(
                    "JARVISH LOCATION",
                    `
                    <div class="jarvish-module">

                        <div class="module-big-icon">
                            📍
                        </div>

                        <div class="module-main-value">
                            GPS WAITING
                        </div>

                        <div class="module-info">
                            Please allow location permission.
                        </div>

                    </div>
                    `
                );

                return;
            }


            const latitude =
                location.latitude;

            const longitude =
                location.longitude;


            const mapURL =
                `https://www.google.com/maps?q=${latitude},${longitude}`;


            openModule(
                "JARVISH LOCATION",
                `
                <div class="jarvish-module">

                    <div class="module-big-icon">
                        📍
                    </div>

                    <div class="module-main-value">
                        GPS ACTIVE
                    </div>

                    <div class="module-info">
                        Latitude:
                        ${latitude.toFixed(6)}
                        <br>
                        Longitude:
                        ${longitude.toFixed(6)}
                        <br>
                        Accuracy:
                        ${Math.round(location.accuracy)} m
                    </div>

                    <button
                        class="module-action"
                        onclick="window.open('${mapURL}','_blank')"
                    >
                        OPEN LOCATION
                    </button>

                </div>
                `
            );

        },
        500
    );
}


/* =========================================================
   WEATHER
   ========================================================= */

async function loadWeather() {

    if (
        state.weatherLoading
    ) {
        return;
    }


    state.weatherLoading =
        true;


    try {

        let latitude =
            23.0225;

        let longitude =
            72.5714;


        if (
            window.jarvishLocation
        ) {

            latitude =
                window.jarvishLocation.latitude;

            longitude =
                window.jarvishLocation.longitude;
        }


        const url =
            "https://api.open-meteo.com/v1/forecast" +
            `?latitude=${latitude}` +
            `&longitude=${longitude}` +
            "&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,cloud_cover,precipitation,rain";


        const response =
            await fetch(url);


        if (!response.ok) {
            throw new Error(
                "Weather request failed"
            );
        }


        const data =
            await response.json();


        const current =
            data.current;


        if (el.temperatureValue) {

            el.temperatureValue.textContent =
                `${current.temperature_2m}°C`;
        }


        if (el.humidityValue) {

            el.humidityValue.textContent =
                `${current.relative_humidity_2m}%`;
        }


        if (el.aqiValue) {

            el.aqiValue.textContent =
                "--";
        }


        return current;


    } catch (error) {

        console.error(
            "Weather error:",
            error
        );

        return null;

    } finally {

        state.weatherLoading =
            false;
    }
}


/* =========================================================
   OPEN WEATHER
   ========================================================= */

async function openWeather() {

    const weather =
        await loadWeather();


    if (!weather) {

        openModule(
            "JARVISH WEATHER",
            `
            <div class="jarvish-module">

                <div class="module-big-icon">
                    🌤️
                </div>

                <div class="module-main-value">
                    WEATHER UNAVAILABLE
                </div>

                <div class="module-info">
                    Please check your internet connection.
                </div>

            </div>
            `
        );

        return;
    }


    openModule(
        "JARVISH WEATHER",
        `
        <div class="jarvish-module">

            <div class="module-big-icon">
                🌤️
            </div>

            <div class="module-main-value">
                ${weather.temperature_2m}°C
            </div>

            <div class="module-info">

                Humidity:
                ${weather.relative_humidity_2m}%

                <br>

                Pressure:
                ${weather.surface_pressure} hPa

                <br>

                Wind:
                ${weather.wind_speed_10m} km/h

                <br>

                Cloud:
                ${weather.cloud_cover}%

                <br>

                Rain:
                ${weather.rain} mm

            </div>

        </div>
        `
    );
}


/* =========================================================
   EXTERNAL LINKS
   ========================================================= */

function openExternal(
    url
) {

    if (!url) {
        return;
    }


    const opened =
        window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );


    if (!opened) {

        showNotification(
            "Popup blocked. Please allow popups."
        );
    }
}


/* =========================================================
   TIME
   ========================================================= */

function tellTime() {

    const now =
        new Date();


    const time =
        now.toLocaleTimeString(
            state.language,
            {
                hour:
                    "2-digit",

                minute:
                    "2-digit"
            }
        );


    speak(
        getLanguageText(
            "timeIs"
        ) +
        " " +
        time
    );
}


/* =========================================================
   DATE
   ========================================================= */

function tellDate() {

    const now =
        new Date();


    const date =
        now.toLocaleDateString(
            state.language,
            {
                weekday:
                    "long",

                year:
                    "numeric",

                month:
                    "long",

                day:
                    "numeric"
            }
        );


    speak(
        getLanguageText(
            "dateIs"
        ) +
        " " +
        date
    );
}


/* =========================================================
   SPEECH SYNTHESIS
   ========================================================= */

function speak(
    text
) {

    if (!text) {
        return;
    }


    if (el.replyText) {

        el.replyText.textContent =
            text;
    }


    if (
        !state.speechSupported
    ) {

        return;
    }


    try {

        speechSynthesis.cancel();


        const utterance =
            new SpeechSynthesisUtterance(
                text
            );


        utterance.lang =
            state.language;

        utterance.rate =
            0.95;

        utterance.pitch =
            0.9;

        utterance.volume =
            1;


        utterance.onstart =
            function () {

                state.speaking =
                    true;

                if (el.systemVoice) {
                    el.systemVoice.textContent =
                        "SPEAKING";
                }
            };


        utterance.onend =
            function () {

                state.speaking =
                    false;

                if (el.systemVoice) {
                    el.systemVoice.textContent =
                        "READY";
                }
            };


        utterance.onerror =
            function () {

                state.speaking =
                    false;

                if (el.systemVoice) {
                    el.systemVoice.textContent =
                        "READY";
                }
            };


        speechSynthesis.speak(
            utterance
        );

    } catch (error) {

        console.error(
            "Speech synthesis error:",
            error
        );
    }
}


/* =========================================================
   WELCOME
   ========================================================= */

function speakWelcome() {

    speak(
        getLanguageText(
            "welcome"
        )
    );
}


/* =========================================================
   LANGUAGE TEXT
   ========================================================= */

function getLanguageText(
    key
) {

    const text = {

        en: {

            welcome:
                "Hello. I am JARVISH. Voice system is ready.",

            hello:
                "Hello. How can I help you?",

            listening:
                "I am listening.",

            starting:
                "Listening.",

            unknown:
                "Sorry, I did not understand that command.",

            languageChanged:
                "language selected.",

            microphoneDenied:
                "Microphone permission was denied. Please allow microphone access.",

            microphoneError:
                "I cannot access the microphone.",

            networkError:
                "Voice recognition network service is unavailable.",

            voiceUnavailable:
                "Voice recognition is not supported in this browser.",

            commandError:
                "There was a problem executing that command.",

            mapOpening:
                "Opening map.",

            compassOpening:
                "Opening compass.",

            sirenStarted:
                "Siren activated.",

            sirenStopped:
                "Siren stopped.",

            flashlightOn:
                "Flashlight turned on.",

            flashlightOff:
                "Flashlight turned off.",

            flashlightUnsupported:
                "Hardware flashlight control is not supported on this device.",

            cameraStarted:
                "Opening camera.",

            cameraDenied:
                "Camera permission was denied or unavailable.",

            locationOpening:
                "Opening your location.",

            weatherOpening:
                "Opening weather information.",

            qrOpening:
                "Opening QR generator.",

            youtubeOpening:
                "Opening YouTube.",

            whatsappOpening:
                "Opening WhatsApp.",

            googleOpening:
                "Opening Google.",

            timeIs:
                "The current time is",

            dateIs:
                "Today's date is",

            historyCleared:
                "Command history cleared."
        },


        hi: {

            welcome:
                "नमस्ते। मैं JARVISH हूँ। वॉइस सिस्टम तैयार है।",

            hello:
                "नमस्ते। मैं आपकी कैसे मदद करूँ?",

            listening:
                "मैं सुन रहा हूँ।",

            starting:
                "सुन रहा हूँ।",

            unknown:
                "माफ़ कीजिए, मैं इस कमांड को समझ नहीं पाया।",

            languageChanged:
                "भाषा चुनी गई है।",

            microphoneDenied:
                "माइक्रोफोन की अनुमति नहीं है। कृपया माइक्रोफोन की अनुमति दें।",

            microphoneError:
                "मैं माइक्रोफोन को एक्सेस नहीं कर पा रहा हूँ।",

            networkError:
                "वॉइस रिकग्निशन नेटवर्क उपलब्ध नहीं है।",

            voiceUnavailable:
                "इस ब्राउज़र में वॉइस रिकग्निशन उपलब्ध नहीं है।",

            commandError:
                "कमांड चलाने में समस्या हुई।",

            mapOpening:
                "मैप खोल रहा हूँ।",

            compassOpening:
                "कंपास खोल रहा हूँ।",

            sirenStarted:
                "सायरन चालू कर दिया गया है।",

            sirenStopped:
                "सायरन बंद कर दिया गया है।",

            flashlightOn:
                "फ्लैशलाइट चालू कर दी गई है।",

            flashlightOff:
                "फ्लैशलाइट बंद कर दी गई है।",

            flashlightUnsupported:
                "इस डिवाइस में हार्डवेयर फ्लैशलाइट कंट्रोल उपलब्ध नहीं है।",

            cameraStarted:
                "कैमरा खोल रहा हूँ।",

            cameraDenied:
                "कैमरा की अनुमति नहीं मिली।",

            locationOpening:
                "आपकी लोकेशन खोल रहा हूँ।",

            weatherOpening:
                "मौसम की जानकारी खोल रहा हूँ।",

            qrOpening:
                "QR जनरेटर खोल रहा हूँ।",

            youtubeOpening:
                "YouTube खोल रहा हूँ।",

            whatsappOpening:
                "WhatsApp खोल रहा हूँ।",

            googleOpening:
                "Google खोल रहा हूँ।",

            timeIs:
                "अभी समय है",

            dateIs:
                "आज की तारीख है",

            historyCleared:
                "कमांड हिस्ट्री साफ कर दी गई है।"
        },


        gu: {

            welcome:
                "નમસ્તે. હું JARVISH છું. વોઇસ સિસ્ટમ તૈયાર છે.",

            hello:
                "નમસ્તે. હું તમારી કેવી રીતે મદદ કરી શકું?",

            listening:
                "હું સાંભળી રહ્યો છું.",

            starting:
                "સાંભળી રહ્યો છું.",

            unknown:
                "માફ કરશો, હું આ કમાન્ડ સમજી શક્યો નથી.",

            languageChanged:
                "ભાષા પસંદ કરવામાં આવી છે.",

            microphoneDenied:
                "માઇક્રોફોનની પરવાનગી નથી. કૃપા કરીને માઇક્રોફોનની પરવાનગી આપો.",

            microphoneError:
                "હું માઇક્રોફોન ઍક્સેસ કરી શકતો નથી.",

            networkError:
                "વોઇસ રિકગ્નિશન નેટવર્ક ઉપલબ્ધ નથી.",

            voiceUnavailable:
                "આ બ્રાઉઝરમાં વોઇસ રિકગ્નિશન ઉપલબ્ધ નથી.",

            commandError:
                "કમાન્ડ ચલાવવામાં સમસ્યા આવી.",

            mapOpening:
                "મેપ ખોલી રહ્યો છું.",

            compassOpening:
                "કંપાસ ખોલી રહ્યો છું.",

            sirenStarted:
                "સાયરન ચાલુ કરી દીધું છે.",

            sirenStopped:
                "સાયરન બંધ કરી દીધું છે.",

            flashlightOn:
                "ફ્લેશલાઇટ ચાલુ કરી દીધી છે.",

            flashlightOff:
                "ફ્લેશલાઇટ બંધ કરી દીધી છે.",

            flashlightUnsupported:
                "આ ડિવાઇસમાં હાર્ડવેર ફ્લેશલાઇટ કંટ્રોલ ઉપલબ્ધ નથી.",

            cameraStarted:
                "કેમેરા ખોલી રહ્યો છું.",

            cameraDenied:
                "કેમેરાની પરવાનગી મળી નથી.",

            locationOpening:
                "તમારી લોકેશન ખોલી રહ્યો છું.",

            weatherOpening:
                "હવામાનની માહિતી ખોલી રહ્યો છું.",

            qrOpening:
                "QR જનરેટર ખોલી રહ્યો છું.",

            youtubeOpening:
                "YouTube ખોલી રહ્યો છું.",

            whatsappOpening:
                "WhatsApp ખોલી રહ્યો છું.",

            googleOpening:
                "Google ખોલી રહ્યો છું.",

            timeIs:
                "હાલનો સમય છે",

            dateIs:
                "આજની તારીખ છે",

            historyCleared:
                "કમાન્ડ હિસ્ટ્રી સાફ કરી દીધી છે."
        }
    };


    if (
        state.language ===
        "hi-IN"
    ) {
        return text.hi[key] ||
            text.en[key];
    }


    if (
        state.language ===
        "gu-IN"
    ) {
        return text.gu[key] ||
            text.en[key];
    }


    return text.en[key];
}


/* =========================================================
   SYSTEM STATUS
   ========================================================= */

function updateSystemStatus() {

    if (el.systemAI) {

        el.systemAI.textContent =
            window.JARVISH_BRAIN
                ? "READY"
                : "FALLBACK";
    }


    if (el.systemVoice) {

        el.systemVoice.textContent =
            state.recognition
                ? "READY"
                : "UNAVAILABLE";
    }


    if (el.micStatus) {

        el.micStatus.textContent =
            state.recognition
                ? "STANDBY"
                : "UNAVAILABLE";
    }
}


function setCoreStatus(
    text
) {

    if (el.coreStatusText) {

        el.coreStatusText.textContent =
            text;
    }

    if (el.aiCoreStatus) {

        el.aiCoreStatus.textContent =
            text;
    }
}


/* =========================================================
   LISTENING UI
   ========================================================= */

function updateListeningUI(
    listening
) {

    if (el.micButton) {

        el.micButton.classList.toggle(
            "active",
            listening
        );

        el.micButton.classList.toggle(
            "listening",
            listening
        );
    }


    if (el.aiCore) {

        el.aiCore.classList.toggle(
            "listening",
            listening
        );
    }


    if (el.listeningIndicator) {

        el.listeningIndicator.classList.toggle(
            "active",
            listening
        );
    }


    if (el.micStatus) {

        el.micStatus.textContent =
            listening
                ? "LISTENING"
                : "STANDBY";
    }


    if (listening) {

        setCoreStatus(
            getLanguageText(
                "listening"
            )
        );
    }
}


/* =========================================================
   HISTORY
   ========================================================= */

function addHistory(
    text
) {

    state.history.unshift({
        text,
        time:
            new Date().toLocaleTimeString()
    });


    state.history =
        state.history.slice(
            0,
            30
        );


    localStorage.setItem(
        "jarvish_history",
        JSON.stringify(
            state.history
        )
    );


    renderHistory();
}


function restoreHistory() {

    try {

        const saved =
            localStorage.getItem(
                "jarvish_history"
            );


        if (saved) {

            state.history =
                JSON.parse(
                    saved
                );
        }

    } catch (error) {

        console.warn(
            "History restore error:",
            error
        );

        state.history =
            [];
    }


    renderHistory();
}


function renderHistory() {

    if (!el.historyList) {
        return;
    }


    if (
        state.history.length === 0
    ) {

        el.historyList.innerHTML =
            `
            <div>
                No command history
            </div>
            `;

        return;
    }


    el.historyList.innerHTML =
        state.history
            .map(
                item =>
                    `
                    <div class="history-item">

                        <div>
                            ${escapeHTML(item.text)}
                        </div>

                        <small>
                            ${escapeHTML(item.time)}
                        </small>

                    </div>
                    `
            )
            .join("");
}


function clearCommandHistory() {

    state.history =
        [];

    localStorage.removeItem(
        "jarvish_history"
    );

    renderHistory();

    speak(
        getLanguageText(
            "historyCleared"
        )
    );
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   NOTIFICATION
   ========================================================= */

function showNotification(
    message
) {

    if (!el.notification) {
        return;
    }


    if (el.notificationText) {

        el.notificationText.textContent =
            message;
    }


    el.notification.classList.add(
        "active"
    );


    setTimeout(
        function () {

            el.notification.classList.remove(
                "active"
            );

        },
        3000
    );
}


/* =========================================================
   SYSTEM STATUS VOICE
   ========================================================= */

function speakSystemStatus() {

    const brain =
        window.JARVISH_BRAIN
            ? "AI brain ready"
            : "fallback brain active";


    const voice =
        state.recognition
            ? "voice recognition ready"
            : "voice recognition unavailable";


    const gps =
        window.jarvishLocation
            ? "GPS ready"
            : "GPS waiting";


    speak(
        "System status. " +
        brain +
        ". " +
        voice +
        ". " +
        gps +
        "."
    );
}


/* =========================================================
   STOP ALL MODULES
   ========================================================= */

function stopAllModules() {

    stopSiren();

    stopCamera();

    stopCompass();

    if (
        state.recognition &&
        state.listening
    ) {

        state.manualStop =
            true;

        try {
            state.recognition.stop();
        } catch (error) {
            console.warn(error);
        }
    }


    if (
        "speechSynthesis" in window
    ) {

        speechSynthesis.cancel();
    }


    state.speaking =
        false;

    state.listening =
        false;

    closeModule();

    updateListeningUI(
        false
    );

    setCoreStatus(
        "JARVISH READY"
    );


    speak(
        getLanguageText(
            "stop"
        ) ||
        "All active modules stopped."
    );
}


/* =========================================================
   KEYBOARD CONTROL
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.code ===
            "Space" &&
            !event.repeat
        ) {

            const target =
                event.target;

            const tag =
                target &&
                target.tagName
                    ? target.tagName.toLowerCase()
                    : "";


            if (
                tag !== "input" &&
                tag !== "textarea" &&
                tag !== "button"
            ) {

                event.preventDefault();

                toggleListening();
            }
        }


        if (
            event.key ===
            "Escape"
        ) {

            closeModule();
        }
    }
);


/* =========================================================
   GLOBAL JARVISH API
   ========================================================= */

window.JARVISH = {

    speak,

    listen:
        startListening,

    stopListening,

    openMap,

    openCompass,

    openSiren,

    stopSiren,

    toggleFlashlight,

    openCamera,

    closeCamera:
        stopCamera,

    openLocation,

    openWeather,

    tellTime,

    tellDate,

    executeCommand:
        executeBrainCommand,

    processVoiceCommand,

    closeModule,

    stopAllModules
};


/* =========================================================
   FINAL READY MESSAGE
   ========================================================= */

console.log(
    "JARVISH Voice System V2 loaded successfully."
);
