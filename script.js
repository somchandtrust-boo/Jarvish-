/* =========================================================
   JARVISH — AI VOICE ASSISTANT
   script.js
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
   GLOBAL STATE
   ========================================================= */

const state = {

    language:
        JARVISH_CONFIG.defaultLanguage,

    listening:false,

    speaking:false,

    recognition:null,

    speechSupported:
        "speechSynthesis" in window,

    recognitionSupported:
        "SpeechRecognition" in window ||
        "webkitSpeechRecognition" in window,

    cameraStream:null,

    cameraTrack:null,

    flashlight:false,

    compassActive:false,

    compassHandler:null,

    currentModule:null,

    weatherLoading:false,

    history:[]

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


function initializeJarvish(){

    setupClock();

    setupButtons();

    setupLanguageButtons();

    setupSpeechRecognition();

    restoreHistory();

    updateSystemStatus();

    requestLocation();

    loadWeather();

    speakWelcome();

}


/* =========================================================
   SYSTEM STATUS
   ========================================================= */

function updateSystemStatus(){

    if(el.aiCoreStatus){
        el.aiCoreStatus.textContent =
            "READY";
    }

    if(el.systemAI){
        el.systemAI.textContent =
            "READY";
    }

    if(el.systemVoice){

        el.systemVoice.textContent =
            state.speechSupported
                ? "READY"
                : "LIMITED";
    }

    if(el.micStatus){

        el.micStatus.textContent =
            state.recognitionSupported
                ? "STANDBY"
                : "UNAVAILABLE";
    }

}


/* =========================================================
   CLOCK
   ========================================================= */

function setupClock(){

    updateClock();

    setInterval(
        updateClock,
        1000
    );

}


function updateClock(){

    if(!el.currentTime){
        return;
    }

    const now =
        new Date();

    el.currentTime.textContent =
        now.toLocaleTimeString(
            [],
            {
                hour:"2-digit",
                minute:"2-digit",
                second:"2-digit"
            }
        );

}


/* =========================================================
   BUTTON SETUP
   ========================================================= */

function setupButtons(){

    if(el.micButton){

        el.micButton.addEventListener(
            "click",
            toggleListening
        );

    }


    document
        .querySelectorAll(
            ".command-button, .quick-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const command =
                        button.dataset.command;

                    if(command){
                        executeCommand(command);
                    }

                }
            );

        });


    if(el.closeModule){

        el.closeModule.addEventListener(
            "click",
            closeModule
        );

    }


    if(el.moduleOverlay){

        el.moduleOverlay.addEventListener(
            "click",
            event => {

                if(
                    event.target ===
                    el.moduleOverlay
                ){

                    closeModule();

                }

            }
        );

    }


    if(el.clearHistory){

        el.clearHistory.addEventListener(
            "click",
            clearCommandHistory
        );

    }

}


/* =========================================================
   LANGUAGE
   ========================================================= */

function setupLanguageButtons(){

    document
        .querySelectorAll(
            ".language-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const language =
                        button.dataset.language;

                    if(language){

                        state.language =
                            language;

                        document
                            .querySelectorAll(
                                ".language-button"
                            )
                            .forEach(btn =>
                                btn.classList.remove(
                                    "active"
                                )
                            );

                        button.classList.add(
                            "active"
                        );

                        showNotification(
                            getText(
                                "languageChanged"
                            )
                        );

                        speak(
                            getText(
                                "languageChanged"
                            )
                        );

                    }

                }
            );

        });

}


/* =========================================================
   SPEECH RECOGNITION
   ========================================================= */

function setupSpeechRecognition(){

    if(!state.recognitionSupported){
        return;
    }

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


    state.recognition.onstart =
        () => {

            state.listening = true;

            updateListeningUI(true);

            el.micStatus &&
                (el.micStatus.textContent =
                    "LISTENING");

            setCoreStatus(
                getText("listening")
            );

        };


    state.recognition.onresult =
        event => {

            const transcript =
                event.results[
                    event.results.length - 1
                ][0].transcript.trim();

            if(!transcript){
                return;
            }

            processVoiceCommand(
                transcript
            );

        };


    state.recognition.onerror =
        event => {

            console.warn(
                "JARVISH Voice Error:",
                event.error
            );

            state.listening = false;

            updateListeningUI(false);

            if(el.micStatus){
                el.micStatus.textContent =
                    "STANDBY";
            }

            if(
                event.error ===
                "not-allowed"
            ){

                speak(
                    getText(
                        "microphoneDenied"
                    )
                );

            }

        };


    state.recognition.onend =
        () => {

            state.listening = false;

            updateListeningUI(false);

            if(el.micStatus){
                el.micStatus.textContent =
                    "STANDBY";
            }

            setCoreStatus(
                "JARVISH READY"
            );

        };

}


/* =========================================================
   TOGGLE LISTENING
   ========================================================= */

function toggleListening(){

    if(!state.recognition){

        speak(
            getText(
                "voiceUnavailable"
            )
        );

        return;
    }


    if(state.listening){

        stopListening();

    }else{

        startListening();

    }

}


function startListening(){

    if(!state.recognition){
        return;
    }

    state.recognition.lang =
        state.language;

    try{

        state.recognition.start();

    }catch(error){

        console.warn(
            "Recognition start:",
            error
        );

    }

}


function stopListening(){

    if(!state.recognition){
        return;
    }

    try{

        state.recognition.stop();

    }catch(error){

        console.warn(
            "Recognition stop:",
            error
        );

    }

}


/* =========================================================
   LISTENING UI
   ========================================================= */

function updateListeningUI(active){

    if(el.micButton){

        el.micButton.classList.toggle(
            "active",
            active
        );

    }


    if(el.listeningIndicator){

        el.listeningIndicator.classList.toggle(
            "active",
            active
        );

    }


    if(el.aiCore){

        el.aiCore.classList.toggle(
            "listening",
            active
        );

    }

}


/* =========================================================
   VOICE COMMAND PROCESSING
   ========================================================= */

function processVoiceCommand(text){

    if(!text){
        return;
    }


    el.heardText.textContent =
        text;


    addHistory(text);


    const result =
        window.JARVISH_BRAIN
            ? window.JARVISH_BRAIN.process(text)
            : null;


    if(!result){

        executeNaturalCommand(
            normalizeCommand(text)
        );

        return;

    }


    switch(result.type){

        case "greeting":

            speak(
                getText("hello")
            );

            break;


        case "map":

            executeCommand("map");

            break;


        case "compass":

            executeCommand("compass");

            break;


        case "siren":

            executeCommand("siren");

            break;


        case "flashlight":

            executeCommand("flashlight");

            break;


        case "camera":

            executeCommand("camera");

            break;


        case "location":

            executeCommand("location");

            break;


        case "weather":

            executeCommand("weather");

            break;


        case "qr":

            executeCommand("qr");

            break;


        case "youtube":

            executeCommand("youtube");

            break;


        case "whatsapp":

            executeCommand("whatsapp");

            break;


        case "google":

            executeCommand("google");

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


        case "stop":

            stopAllModules();

            break;


        default:

            speak(
                getText("unknown")
            );

            break;

    }

}


/* =========================================================
   NATURAL COMMAND PARSER
   ========================================================= */

function executeNaturalCommand(command){

    /* MAP */

    if(
        containsAny(
            command,
            [
                "map",
                "maps",
                "naksha",
                "नक्शा",
                "मैप",
                "map kholo",
                "map open"
            ]
        )
    ){

        executeCommand("map");
        return;
    }


    /* COMPASS */

    if(
        containsAny(
            command,
            [
                "compass",
                "direction",
                "disha",
                "दिशा",
                "कम्पास"
            ]
        )
    ){

        executeCommand("compass");
        return;
    }


    /* SIREN */

    if(
        containsAny(
            command,
            [
                "siren",
                "alarm",
                "emergency siren",
                "सायरन",
                "अलार्म"
            ]
        )
    ){

        executeCommand("siren");
        return;
    }


    /* FLASHLIGHT */

    if(
        containsAny(
            command,
            [
                "flashlight",
                "torch",
                "light",
                "फ्लैशलाइट",
                "टॉर्च",
                "लाइट"
            ]
        )
    ){

        executeCommand("flashlight");
        return;
    }


    /* CAMERA */

    if(
        containsAny(
            command,
            [
                "camera",
                "कैमरा"
            ]
        )
    ){

        executeCommand("camera");
        return;
    }


    /* LOCATION */

    if(
        containsAny(
            command,
            [
                "location",
                "live location",
                "gps",
                "लोकेशन",
                "स्थान"
            ]
        )
    ){

        executeCommand("location");
        return;
    }


    /* QR */

    if(
        containsAny(
            command,
            [
                "qr",
                "qr generator",
                "क्यूआर"
            ]
        )
    ){

        executeCommand("qr");
        return;
    }


    /* WEATHER */

    if(
        containsAny(
            command,
            [
                "weather",
                "mausam",
                "मौसम",
                "temperature",
                "तापमान"
            ]
        )
    ){

        executeCommand("weather");
        return;
    }


    /* YOUTUBE */

    if(
        containsAny(
            command,
            [
                "youtube",
                "यूट्यूब"
            ]
        )
    ){

        executeCommand("youtube");
        return;
    }


    /* WHATSAPP */

    if(
        containsAny(
            command,
            [
                "whatsapp",
                "व्हाट्सएप"
            ]
        )
    ){

        executeCommand("whatsapp");
        return;
    }


    /* GOOGLE */

    if(
        containsAny(
            command,
            [
                "google",
                "गूगल",
                "search"
            ]
        )
    ){

        executeCommand("google");
        return;
    }


    /* TIME */

    if(
        containsAny(
            command,
            [
                "time",
                "samay",
                "समय",
                "kitne baje",
                "कितने बजे"
            ]
        )
    ){

        tellTime();
        return;
    }


    /* DATE */

    if(
        containsAny(
            command,
            [
                "date",
                "today",
                "aaj",
                "आज",
                "tarikh",
                "तारीख"
            ]
        )
    ){

        tellDate();
        return;
    }


    /* CLEAR HISTORY */

    if(
        containsAny(
            command,
            [
                "clear history",
                "history clear"
            ]
        )
    ){

        clearCommandHistory();
        return;
    }


    /* GREETING */

    if(
        containsAny(
            command,
            [
                "hello",
                "hi",
                "hey",
                "namaste",
                "નમસ્તે",
                "नमस्ते"
            ]
        )
    ){

        speak(
            getText("hello")
        );

        return;
    }


    /* UNKNOWN */

    speak(
        getText("unknown")
    );

}


function containsAny(text, words){

    return words.some(
        word =>
            text.includes(
                word.toLowerCase()
            )
    );

}


/* =========================================================
   COMMAND EXECUTION
   ========================================================= */

function executeCommand(command){

    switch(command){

        case "map":
            openMap();
            break;

        case "compass":
            openCompass();
            break;

        case "siren":
            openSiren();
            break;

        case "flashlight":
            toggleFlashlight();
            break;

        case "camera":
            openCamera();
            break;

        case "location":
            openLocation();
            break;

        case "qr":
            openExternal(
                JARVISH_CONFIG.links.qr,
                "QR Generator"
            );
            break;

        case "weather":
            openWeather();
            break;

        case "youtube":
            openExternal(
                JARVISH_CONFIG.links.youtube,
                "YouTube"
            );
            break;

        case "whatsapp":
            openExternal(
                JARVISH_CONFIG.links.whatsapp,
                "WhatsApp"
            );
            break;

        case "google":
            openExternal(
                JARVISH_CONFIG.links.google,
                "Google"
            );
            break;

        default:
            break;

    }

}


/* =========================================================
   INTERNAL MODULE
   ========================================================= */

function openModule(
    title,
    content
){

    if(!el.moduleOverlay){
        return;
    }

    state.currentModule =
        title;

    el.moduleTitle.textContent =
        title;

    el.moduleContent.innerHTML =
        content;

    el.moduleOverlay.classList.add(
        "open"
    );

    el.moduleOverlay.setAttribute(
        "aria-hidden",
        "false"
    );

}


function closeModule(){

    stopCamera();

    stopCompass();

    stopSiren();

    if(el.moduleOverlay){

        el.moduleOverlay.classList.remove(
            "open"
        );

        el.moduleOverlay.setAttribute(
            "aria-hidden",
            "true"
        );

    }

    state.currentModule =
        null;

}


/* =========================================================
   INTERNAL MAP
   ========================================================= */

function openMap(){

    speak(
        getText("mapOpening")
    );


    openModule(
        "LIVE MAP",
        `
        <div style="
            width:100%;
            height:100%;
            display:flex;
            flex-direction:column;
            gap:15px;
        ">

            <div style="
                display:flex;
                justify-content:space-between;
                gap:10px;
                flex-wrap:wrap;
            ">

                <button
                    id="mapLocateButton"
                    class="command-button"
                    type="button"
                >
                    📍 MY LOCATION
                </button>

                <a
                    href="https://www.openstreetmap.org/"
                    target="_blank"
                    rel="noopener"
                    class="command-button"
                    style="
                        text-decoration:none;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                    "
                >
                    OPEN FULL MAP
                </a>

            </div>

            <div
                id="jarvishMap"
                style="
                    flex:1;
                    min-height:350px;
                    border:1px solid rgba(0,234,255,.25);
                    border-radius:14px;
                    overflow:hidden;
                    background:
                        radial-gradient(
                            circle,
                            #0b3044,
                            #020711
                        );
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    text-align:center;
                    padding:25px;
                    color:#75a5b7;
                "
            >

                <div>
                    <div style="
                        font-size:50px;
                        margin-bottom:15px;
                    ">
                        🗺️
                    </div>

                    <div style="
                        color:#00eaff;
                        letter-spacing:2px;
                    ">
                        JARVISH MAP
                    </div>

                    <div style="
                        margin-top:8px;
                        font-size:11px;
                    ">
                        GPS location will appear here.
                    </div>
                </div>

            </div>

        </div>
        `
    );


    const button =
        document.getElementById(
            "mapLocateButton"
        );

    if(button){

        button.addEventListener(
            "click",
            requestLocation
        );

    }

}


/* =========================================================
   INTERNAL COMPASS
   ========================================================= */

function openCompass(){

    speak(
        getText("compassOpening")
    );


    openModule(
        "DIGITAL COMPASS",
        `
        <div style="
            width:100%;
            height:100%;
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            gap:25px;
        ">

            <div
                id="compassCircle"
                style="
                    position:relative;
                    width:min(70vw,330px);
                    aspect-ratio:1;
                    border:2px solid #00eaff;
                    border-radius:50%;
                    display:grid;
                    place-items:center;
                    background:
                        radial-gradient(
                            circle,
                            rgba(0,234,255,.12),
                            rgba(2,7,17,.95) 65%
                        );
                    box-shadow:
                        0 0 35px rgba(0,234,255,.2),
                        inset 0 0 35px rgba(0,234,255,.08);
                    transition:transform .2s linear;
                "
            >

                <div style="
                    position:absolute;
                    top:12px;
                    color:#00eaff;
                    font-size:18px;
                    font-weight:bold;
                ">
                    N
                </div>

                <div style="
                    position:absolute;
                    right:14px;
                    color:#75a5b7;
                    font-size:15px;
                ">
                    E
                </div>

                <div style="
                    position:absolute;
                    bottom:12px;
                    color:#75a5b7;
                    font-size:15px;
                ">
                    S
                </div>

                <div style="
                    position:absolute;
                    left:14px;
                    color:#75a5b7;
                    font-size:15px;
                ">
                    W
                </div>

                <div style="
                    width:0;
                    height:0;
                    border-left:10px solid transparent;
                    border-right:10px solid transparent;
                    border-bottom:75px solid #ff304f;
                    transform-origin:50% 90%;
                "></div>

            </div>


            <div
                id="headingValue"
                style="
                    font-size:32px;
                    color:#00eaff;
                    letter-spacing:3px;
                "
            >
                --°
            </div>


            <div
                id="directionValue"
                style="
                    font-size:12px;
                    color:#75a5b7;
                    letter-spacing:3px;
                "
            >
                CALIBRATING
            </div>

        </div>
        `
    );


    startCompass();

}


/* =========================================================
   COMPASS SENSOR
   ========================================================= */

function startCompass(){

    stopCompass();

    const circle =
        document.getElementById(
            "compassCircle"
        );

    const heading =
        document.getElementById(
            "headingValue"
        );

    const direction =
        document.getElementById(
            "directionValue"
        );


    if(!circle){
        return;
    }


    state.compassHandler =
        event => {

            let degrees = null;


            if(
                typeof event.webkitCompassHeading ===
                "number"
            ){

                degrees =
                    event.webkitCompassHeading;

            }else if(
                typeof event.alpha ===
                "number"
            ){

                degrees =
                    360 - event.alpha;

            }


            if(degrees === null){
                return;
            }


            degrees =
                normalizeDegree(
                    degrees
                );


            circle.style.transform =
                `rotate(${-degrees}deg)`;


            if(heading){

                heading.textContent =
                    `${Math.round(degrees)}°`;

            }


            if(direction){

                direction.textContent =
                    getDirection(
                        degrees
                    );

            }

        };


    if(
        "DeviceOrientationEvent" in window
    ){

        window.addEventListener(
            "deviceorientation",
            state.compassHandler,
            true
        );

    }

}


function stopCompass(){

    if(
        state.compassHandler &&
        "DeviceOrientationEvent" in window
    ){

        window.removeEventListener(
            "deviceorientation",
            state.compassHandler,
            true
        );

    }

    state.compassHandler =
        null;

}


function normalizeDegree(degree){

    return (
        degree + 360
    ) % 360;

}


function getDirection(degree){

    if(degree >= 337.5 || degree < 22.5){
        return "NORTH";
    }

    if(degree < 67.5){
        return "NORTH EAST";
    }

    if(degree < 112.5){
        return "EAST";
    }

    if(degree < 157.5){
        return "SOUTH EAST";
    }

    if(degree < 202.5){
        return "SOUTH";
    }

    if(degree < 247.5){
        return "SOUTH WEST";
    }

    if(degree < 292.5){
        return "WEST";
    }

    return "NORTH WEST";

}


/* =========================================================
   INTERNAL SIREN
   ========================================================= */

let sirenContext = null;
let sirenOscillator = null;
let sirenGain = null;
let sirenTimer = null;


function openSiren(){

    openModule(
        "EMERGENCY SIREN",
        `
        <div style="
            height:100%;
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            text-align:center;
            gap:25px;
        ">

            <div style="
                font-size:80px;
                animation:sirenPulse 1s infinite;
            ">
                🚨
            </div>

            <div style="
                color:#ff304f;
                font-size:20px;
                letter-spacing:4px;
            ">
                EMERGENCY SIREN
            </div>

            <div style="
                color:#75a5b7;
                font-size:11px;
                max-width:450px;
                line-height:1.7;
            ">
                Start or stop the local browser siren.
            </div>

            <button
                id="sirenToggle"
                type="button"
                style="
                    width:180px;
                    height:55px;
                    border:1px solid #ff304f;
                    border-radius:12px;
                    background:rgba(255,48,79,.08);
                    color:#ff6178;
                    cursor:pointer;
                    letter-spacing:3px;
                    font-weight:bold;
                "
            >
                START SIREN
            </button>

        </div>

        <style>
            @keyframes sirenPulse{
                50%{
                    transform:scale(1.12);
                    filter:
                        drop-shadow(
                            0 0 25px
                            rgba(255,48,79,.8)
                        );
                }
            }
        </style>
        `
    );


    const button =
        document.getElementById(
            "sirenToggle"
        );

    if(button){

        button.addEventListener(
            "click",
            toggleSiren
        );

    }

}


function toggleSiren(){

    if(sirenOscillator){

        stopSiren();

        const button =
            document.getElementById(
                "sirenToggle"
            );

        if(button){
            button.textContent =
                "START SIREN";
        }

        speak(
            getText("sirenStopped")
        );

        return;
    }


    try{

        sirenContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();


        sirenGain =
            sirenContext.createGain();

        sirenGain.gain.value =
            0.08;

        sirenGain.connect(
            sirenContext.destination
        );


        sirenOscillator =
            sirenContext.createOscillator();

        sirenOscillator.type =
            "sawtooth";

        sirenOscillator.connect(
            sirenGain
        );

        sirenOscillator.start();


        let high = false;


        sirenTimer =
            setInterval(
                () => {

                    if(!sirenOscillator){
                        return;
                    }

                    high = !high;

                    sirenOscillator.frequency
                        .setTargetAtTime(
                            high ? 1000 : 500,
                            sirenContext.currentTime,
                            .05
                        );

                },
                500
            );


        const button =
            document.getElementById(
                "sirenToggle"
            );

        if(button){
            button.textContent =
                "STOP SIREN";
        }


        speak(
            getText("sirenStarted")
        );

    }catch(error){

        console.error(
            "Siren error:",
            error
        );

        speak(
            "Siren audio could not start."
        );

    }

}


function stopSiren(){

    if(sirenTimer){

        clearInterval(
            sirenTimer
        );

        sirenTimer =
            null;

    }


    if(sirenOscillator){

        try{
            sirenOscillator.stop();
        }catch(error){}

        sirenOscillator.disconnect();

        sirenOscillator =
            null;

    }


    if(sirenGain){

        try{
            sirenGain.disconnect();
        }catch(error){}

        sirenGain =
            null;

    }


    if(sirenContext){

        try{
            sirenContext.close();
        }catch(error){}

        sirenContext =
            null;

    }

}


/* =========================================================
   FLASHLIGHT
   ========================================================= */

async function toggleFlashlight(){

    if(
        state.cameraTrack &&
        typeof state.cameraTrack.applyConstraints ===
        "function"
    ){

        try{

            state.flashlight =
                !state.flashlight;


            await state.cameraTrack.applyConstraints({

                advanced:[
                    {
                        torch:
                            state.flashlight
                    }
                ]

            });


            speak(
                state.flashlight
                    ? getText("flashlightOn")
                    : getText("flashlightOff")
            );

            return;

        }catch(error){

            console.warn(
                "Torch control failed:",
                error
            );

        }

    }


    /*
       If no active camera track exists,
       open a flashlight control panel.
    */

    openModule(
        "FLASHLIGHT",
        `
        <div style="
            height:100%;
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            text-align:center;
            gap:20px;
        ">

            <div
                id="flashIcon"
                style="
                    font-size:80px;
                    transition:.3s;
                "
            >
                🔦
            </div>

            <div
                id="flashState"
                style="
                    color:#75a5b7;
                    letter-spacing:3px;
                "
            >
                READY
            </div>

            <button
                id="flashToggle"
                type="button"
                style="
                    width:180px;
                    height:55px;
                    border:1px solid #00eaff;
                    border-radius:12px;
                    background:rgba(0,234,255,.06);
                    color:#00eaff;
                    cursor:pointer;
                    letter-spacing:3px;
                "
            >
                TURN ON
            </button>

            <div style="
                max-width:420px;
                color:#75a5b7;
                font-size:10px;
                line-height:1.6;
            ">
                Browser flashlight control depends on
                device and camera torch support.
            </div>

        </div>
        `
    );


    const button =
        document.getElementById(
            "flashToggle"
        );

    if(button){

        button.addEventListener(
            "click",
            enableFlashlightWithCamera
        );

    }

}


async function enableFlashlightWithCamera(){

    try{

        const stream =
            await navigator.mediaDevices.getUserMedia({

                video:{
                    facingMode:{
                        ideal:"environment"
                    }
                },

                audio:false

            });


        state.cameraStream =
            stream;

        state.cameraTrack =
            stream.getVideoTracks()[0];


        if(
            !state.cameraTrack ||
            !state.cameraTrack.applyConstraints
        ){

            throw new Error(
                "Torch unsupported"
            );

        }


        state.flashlight =
            !state.flashlight;


        await state.cameraTrack.applyConstraints({

            advanced:[
                {
                    torch:
                        state.flashlight
                }
            ]

        });


        const stateText =
            document.getElementById(
                "flashState"
            );

        const button =
            document.getElementById(
                "flashToggle"
            );

        const icon =
            document.getElementById(
                "flashIcon"
            );


        if(stateText){

            stateText.textContent =
                state.flashlight
                    ? "FLASHLIGHT ON"
                    : "FLASHLIGHT OFF";

        }


        if(button){

            button.textContent =
                state.flashlight
                    ? "TURN OFF"
                    : "TURN ON";

        }


        if(icon){

            icon.style.filter =
                state.flashlight
                    ? "drop-shadow(0 0 30px #fff)"
                    : "none";

        }


        speak(
            state.flashlight
                ? getText("flashlightOn")
                : getText("flashlightOff")
        );

    }catch(error){

        console.error(
            "Flashlight error:",
            error
        );

        speak(
            getText(
                "flashlightUnsupported"
            )
        );

    }

}


/* =========================================================
   CAMERA
   ========================================================= */

async function openCamera(){

    openModule(
        "HD SMART CAMERA",
        `
        <div style="
            height:100%;
            display:flex;
            flex-direction:column;
            gap:12px;
        ">

            <video
                id="jarvishCamera"
                autoplay
                playsinline
                muted
                style="
                    width:100%;
                    height:calc(100% - 65px);
                    object-fit:cover;
                    border-radius:14px;
                    background:#000;
                    border:1px solid rgba(0,234,255,.25);
                "
            ></video>

            <div style="
                display:flex;
                justify-content:center;
                gap:10px;
            ">

                <button
                    id="cameraStart"
                    class="command-button"
                    type="button"
                    style="max-width:170px;"
                >
                    START CAMERA
                </button>

                <button
                    id="cameraStop"
                    class="command-button"
                    type="button"
                    style="max-width:170px;"
                >
                    STOP
                </button>

            </div>

        </div>
        `
    );


    const start =
        document.getElementById(
            "cameraStart"
        );

    const stop =
        document.getElementById(
            "cameraStop"
        );


    if(start){

        start.addEventListener(
            "click",
            startCamera
        );

    }


    if(stop){

        stop.addEventListener(
            "click",
            stopCamera
        );

    }


    await startCamera();

}


async function startCamera(){

    try{

        stopCamera();


        const video =
            document.getElementById(
                "jarvishCamera"
            );

        if(!video){
            return;
        }


        state.cameraStream =
            await navigator.mediaDevices
                .getUserMedia({

                    video:{
                        facingMode:{
                            ideal:"environment"
                        }
                    },

                    audio:false

                });


        state.cameraTrack =
            state.cameraStream
                .getVideoTracks()[0];


        video.srcObject =
            state.cameraStream;


        speak(
            getText("cameraStarted")
        );

    }catch(error){

        console.error(
            "Camera error:",
            error
        );

        speak(
            getText("cameraDenied")
        );

    }

}


function stopCamera(){

    if(state.cameraStream){

        state.cameraStream
            .getTracks()
            .forEach(
                track =>
                    track.stop()
            );

    }

    state.cameraStream =
        null;

    state.cameraTrack =
        null;

    state.flashlight =
        false;

}


/* =========================================================
   LOCATION
   ========================================================= */

function requestLocation(){

    if(
        !navigator.geolocation
    ){

        updateLocationStatus(
            "UNAVAILABLE"
        );

        return;

    }


    updateLocationStatus(
        "SEARCHING"
    );


    navigator.geolocation.getCurrentPosition(

        position => {

            const lat =
                position.coords.latitude;

            const lon =
                position.coords.longitude;


            updateLocationStatus(
                "LOCKED"
            );


            if(el.gpsValue){

                el.gpsValue.textContent =
                    `${lat.toFixed(4)}, ${lon.toFixed(4)}`;

            }


            window.jarvishLocation = {
                latitude:lat,
                longitude:lon
            };

        },

        error => {

            console.warn(
                "GPS:",
                error
            );

            updateLocationStatus(
                "DENIED"
            );

        },

        {
            enableHighAccuracy:true,
            timeout:10000,
            maximumAge:30000
        }

    );

}


function updateLocationStatus(text){

    if(el.locationStatus){

        el.locationStatus.textContent =
            text;

    }

}


/* =========================================================
   LOCATION MODULE
   ========================================================= */

function openLocation(){

    requestLocation();


    const location =
        window.jarvishLocation;


    const latitude =
        location
            ? location.latitude.toFixed(6)
            : "--";


    const longitude =
        location
            ? location.longitude.toFixed(6)
            : "--";


    openModule(
        "LIVE LOCATION",
        `
        <div style="
            height:100%;
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            text-align:center;
            gap:18px;
        ">

            <div style="
                font-size:70px;
            ">
                📍
            </div>

            <div style="
                color:#00eaff;
                font-size:12px;
                letter-spacing:3px;
            ">
                CURRENT GPS
            </div>

            <div style="
                padding:20px;
                width:min(450px,90%);
                border:1px solid rgba(0,234,255,.2);
                border-radius:14px;
                background:rgba(0,234,255,.03);
            ">

                <div style="
                    margin:10px;
                    color:#75a5b7;
                ">
                    LATITUDE
                    <strong
                        style="
                            color:#00eaff;
                            display:block;
                            margin-top:5px;
                        "
                    >
                        ${latitude}
                    </strong>
                </div>

                <div style="
                    margin:10px;
                    color:#75a5b7;
                ">
                    LONGITUDE
                    <strong
                        style="
                            color:#00eaff;
                            display:block;
                            margin-top:5px;
                        "
                    >
                        ${longitude}
                    </strong>
                </div>

            </div>

            <button
                id="refreshLocation"
                class="command-button"
                style="max-width:220px;"
                type="button"
            >
                📍 REFRESH GPS
            </button>

        </div>
        `
    );


    const refresh =
        document.getElementById(
            "refreshLocation"
        );

    if(refresh){

        refresh.addEventListener(
            "click",
            () => {

                requestLocation();

                openLocation();

            }
        );

    }

}


/* =========================================================
   WEATHER
   ========================================================= */

async function loadWeather(){

    if(state.weatherLoading){
        return;
    }


    if(!navigator.geolocation){
        return;
    }


    state.weatherLoading =
        true;


    navigator.geolocation.getCurrentPosition(

        async position => {

            const lat =
                position.coords.latitude;

            const lon =
                position.coords.longitude;


            try{

                const url =
                    "https://api.open-meteo.com/v1/forecast" +
                    `?latitude=${lat}` +
                    `&longitude=${lon}` +
                    "&current=" +
                    [
                        "temperature_2m",
                        "relative_humidity_2m",
                        "surface_pressure",
                        "wind_speed_10m",
                        "cloud_cover"
                    ].join(",");


                const response =
                    await fetch(url);


                if(!response.ok){
                    throw new Error(
                        "Weather request failed"
                    );
                }


                const data =
                    await response.json();


                const current =
                    data.current;


                if(el.temperatureValue){

                    el.temperatureValue.textContent =
                        `${current.temperature_2m} °C`;

                }


                if(el.humidityValue){

                    el.humidityValue.textContent =
                        `${current.relative_humidity_2m} %`;

                }


                window.jarvishWeather =
                    current;


            }catch(error){

                console.warn(
                    "Weather:",
                    error
                );

            }


            state.weatherLoading =
                false;

        },

        () => {

            state.weatherLoading =
                false;

        },

        {
            enableHighAccuracy:false,
            timeout:8000,
            maximumAge:60000
        }

    );

}


/* =========================================================
   WEATHER MODULE
   ========================================================= */

async function openWeather(){

    openModule(
        "LIVE WEATHER",
        `
        <div style="
            height:100%;
            display:flex;
            align-items:center;
            justify-content:center;
            text-align:center;
        ">

            <div>
                <div style="
                    font-size:70px;
                ">
                    🌦️
                </div>

                <div style="
                    margin-top:15px;
                    color:#00eaff;
                    letter-spacing:3px;
                ">
                    WEATHER DATA
                </div>

                <div
                    id="weatherModuleData"
                    style="
                        margin-top:20px;
                        color:#75a5b7;
                        line-height:2;
                    "
                >
                    Loading current weather...
                </div>

            </div>

        </div>
        `
    );


    await loadWeather();


    const weather =
        window.jarvishWeather;


    const target =
        document.getElementById(
            "weatherModuleData"
        );


    if(
        weather &&
        target
    ){

        target.innerHTML = `

            Temperature:
            <strong style="color:#00eaff;">
                ${weather.temperature_2m} °C
            </strong>
            <br>

            Humidity:
            <strong style="color:#00eaff;">
                ${weather.relative_humidity_2m} %
            </strong>
            <br>

            Pressure:
            <strong style="color:#00eaff;">
                ${weather.surface_pressure} hPa
            </strong>
            <br>

            Wind:
            <strong style="color:#00eaff;">
                ${weather.wind_speed_10m} km/h
            </strong>
            <br>

            Cloud:
            <strong style="color:#00eaff;">
                ${weather.cloud_cover} %
            </strong>

        `;

    }else if(target){

        target.textContent =
            "Weather data unavailable.";

    }

}


/* =========================================================
   EXTERNAL LINK
   ========================================================= */

function openExternal(
    url,
    name
){

    speak(
        `${name} opening.`
    );


    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );

}


/* =========================================================
   TIME
   ========================================================= */

function tellTime(){

    const now =
        new Date();


    const time =
        now.toLocaleTimeString(
            [],
            {
                hour:"numeric",
                minute:"2-digit"
            }
        );


    let message;


    if(
        state.language ===
        "hi-IN"
    ){

        message =
            `अभी समय ${time} है।`;

    }else if(
        state.language ===
        "gu-IN"
    ){

        message =
            `હમણાં સમય ${time} છે.`;

    }else{

        message =
            `The current time is ${time}.`;

    }


    speak(message);

}


function tellDate(){

    const now =
        new Date();


    const date =
        now.toLocaleDateString(
            undefined,
            {
                weekday:"long",
                year:"numeric",
                month:"long",
                day:"numeric"
            }
        );


    let message;


    if(
        state.language ===
        "hi-IN"
    ){

        message =
            `आज ${date} है।`;

    }else if(
        state.language ===
        "gu-IN"
    ){

        message =
            `આજે ${date} છે.`;

    }else{

        message =
            `Today is ${date}.`;

    }


    speak(message);

}


/* =========================================================
   SPEECH SYNTHESIS
   ========================================================= */

function speak(text){

    if(!text){
        return;
    }


    if(el.replyText){

        el.replyText.textContent =
            text;

    }


    if(!state.speechSupported){
        return;
    }


    window.speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            text
        );


    utterance.lang =
        state.language;


    utterance.rate =
        .95;


    utterance.pitch =
        .9;


    utterance.volume =
        1;


    utterance.onstart =
        () => {

            state.speaking =
                true;

            setCoreStatus(
                "JARVISH SPEAKING"
            );

        };


    utterance.onend =
        () => {

            state.speaking =
                false;

            setCoreStatus(
                "JARVISH READY"
            );

        };


    window.speechSynthesis.speak(
        utterance
    );

}


/* =========================================================
   WELCOME
   ========================================================= */

function speakWelcome(){

    setTimeout(
        () => {

            speak(
                getText(
                    "welcome"
                )
            );

        },
        700
    );

}


/* =========================================================
   CORE STATUS
   ========================================================= */

function setCoreStatus(text){

    if(el.coreStatusText){

        el.coreStatusText.textContent =
            text;

    }

}


/* =========================================================
   NOTIFICATION
   ========================================================= */

function showNotification(text){

    if(
        !el.notification ||
        !el.notificationText
    ){
        return;
    }


    el.notificationText.textContent =
        text;


    el.notification.classList.add(
        "show"
    );


    clearTimeout(
        showNotification.timer
    );


    showNotification.timer =
        setTimeout(
            () => {

                el.notification.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =========================================================
   HISTORY
   ========================================================= */

function addHistory(command){

    state.history.unshift({

        text:command,

        time:
            new Date()
                .toLocaleTimeString(
                    [],
                    {
                        hour:"2-digit",
                        minute:"2-digit"
                    }
                )

    });


    if(
        state.history.length > 30
    ){

        state.history =
            state.history.slice(
                0,
                30
            );

    }


    saveHistory();

    renderHistory();

}


function renderHistory(){

    if(!el.historyList){
        return;
    }


    if(!state.history.length){

        el.historyList.innerHTML =
            `
            <div class="history-empty">
                No commands yet
            </div>
            `;

        return;

    }


    el.historyList.innerHTML =
        state.history
            .map(item => `
                <div class="history-entry">
                    <span>
                        ${escapeHTML(item.text)}
                    </span>

                    <small>
                        ${escapeHTML(item.time)}
                    </small>
                </div>
            `)
            .join("");

}


function saveHistory(){

    try{

        localStorage.setItem(
            "jarvish_history",
            JSON.stringify(
                state.history
            )
        );

    }catch(error){

        console.warn(
            "History save failed:",
            error
        );

    }

}


function restoreHistory(){

    try{

        const saved =
            localStorage.getItem(
                "jarvish_history"
            );


        if(saved){

            state.history =
                JSON.parse(saved);

        }

    }catch(error){

        state.history =
            [];

    }


    renderHistory();

}


function clearCommandHistory(){

    state.history =
        [];

    saveHistory();

    renderHistory();

    showNotification(
        "COMMAND HISTORY CLEARED"
    );

}


function escapeHTML(text){

    return String(text)
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
   MULTILINGUAL RESPONSES
   ========================================================= */

function getText(key){

    const text = {

        welcome:{

            "en-IN":
                "JARVISH online. I am ready for your command.",

            "hi-IN":
                "जारविश ऑनलाइन है। मैं आपके आदेश के लिए तैयार हूँ।",

            "gu-IN":
                "જારવિશ ઓનલાઈન છે. હું તમારા આદેશ માટે તૈયાર છું."

        },


        yesSir:{

            "en-IN":
                "Yes. How can I help you?",

            "hi-IN":
                "जी। मैं आपकी क्या सहायता करूँ?",

            "gu-IN":
                "જી. હું તમારી કેવી રીતે મદદ કરી શકું?"

        },


        hello:{

            "en-IN":
                "Hello. JARVISH is ready.",

            "hi-IN":
                "नमस्ते। जारविश तैयार है।",

            "gu-IN":
                "નમસ્તે. જારવિશ તૈયાર છે."

        },


        listening:{

            "en-IN":
                "Listening.",

            "hi-IN":
                "मैं सुन रहा हूँ।",

            "gu-IN":
                "હું સાંભળી રહ્યો છું."

        },


        unknown:{

            "en-IN":
                "I did not understand that command.",

            "hi-IN":
                "मैं उस आदेश को समझ नहीं पाया।",

            "gu-IN":
                "હું આ આદેશ સમજી શક્યો નથી."

        },


        languageChanged:{

            "en-IN":
                "Language changed.",

            "hi-IN":
                "भाषा बदल दी गई है।",

            "gu-IN":
                "ભાષા બદલી દેવામાં આવી છે."

        },


        microphoneDenied:{

            "en-IN":
                "Microphone permission is required.",

            "hi-IN":
                "माइक्रोफोन की अनुमति आवश्यक है।",

            "gu-IN":
                "માઇક્રોફોનની પરવાનગી જરૂરી છે."

        },


        voiceUnavailable:{

            "en-IN":
                "Voice recognition is not available in this browser.",

            "hi-IN":
                "इस ब्राउज़र में वॉइस रिकग्निशन उपलब्ध नहीं है।",

            "gu-IN":
                "આ બ્રાઉઝરમાં વૉઇસ રેકગ્નિશન ઉપલબ્ધ નથી."

        },


        mapOpening:{

            "en-IN":
                "Opening the internal map.",

            "hi-IN":
                "इंटरनल मैप खोल रहा हूँ।",

            "gu-IN":
                "ઇન્ટરનલ મેપ ખોલી રહ્યો છું."

        },


        compassOpening:{

            "en-IN":
                "Opening digital compass.",

            "hi-IN":
                "डिजिटल कंपास खोल रहा हूँ।",

            "gu-IN":
                "ડિજિટલ કંપાસ ખોલી રહ્યો છું."

        },


        sirenStarted:{

            "en-IN":
                "Emergency siren activated.",

            "hi-IN":
                "इमरजेंसी सायरन सक्रिय है।",

            "gu-IN":
                "ઇમરજન્સી સાયરન સક્રિય છે."

        },


        sirenStopped:{

            "en-IN":
                "Emergency siren stopped.",

            "hi-IN":
                "इमरजेंसी सायरन बंद कर दिया गया है।",

            "gu-IN":
                "ઇમરજન્સી સાયરન બંધ કરવામાં આવ્યું છે."

        },


        flashlightOn:{

            "en-IN":
                "Flashlight turned on.",

            "hi-IN":
                "फ्लैशलाइट चालू है।",

            "gu-IN":
                "ફ્લેશલાઇટ ચાલુ છે."

        },


        flashlightOff:{

            "en-IN":
                "Flashlight turned off.",

            "hi-IN":
                "फ्लैशलाइट बंद है।",

            "gu-IN":
                "ફ્લેશલાઇટ બંધ છે."

        },


        flashlightUnsupported:{

            "en-IN":
                "This device or browser does not support flashlight control.",

            "hi-IN":
                "इस डिवाइस या ब्राउज़र में फ्लैशलाइट कंट्रोल सपोर्ट नहीं है।",

            "gu-IN":
                "આ ડિવાઇસ અથવા બ્રાઉઝરમાં ફ્લેશલાઇટ કંટ્રોલ સપોર્ટ નથી."

        },


        cameraStarted:{

            "en-IN":
                "Camera activated.",

            "hi-IN":
                "कैमरा सक्रिय है।",

            "gu-IN":
                "કેમેરા સક્રિય છે."

        },


        cameraDenied:{

            "en-IN":
                "Camera permission is required.",

            "hi-IN":
                "कैमरा अनुमति आवश्यक है।",

            "gu-IN":
                "કેમેરાની પરવાનગી જરૂરી છે."

        }

    };


    return (
        text[key]?.[state.language] ||
        text[key]?.["en-IN"] ||
        ""
    );

}


/* =========================================================
   KEYBOARD SHORTCUT
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if(
            event.code ===
            "Space" &&
            !isTypingElement(
                event.target
            )
        ){

            event.preventDefault();

            toggleListening();

        }


        if(
            event.code ===
            "Escape"
        ){

            closeModule();

        }

    }
);


function isTypingElement(element){

    if(!element){
        return false;
    }

    const tag =
        element.tagName;

    return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT"
    );

}


/* =========================================================
   CORE CLICK
   ========================================================= */

if(el.aiCore){

    el.aiCore.addEventListener(
        "click",
        toggleListening
    );

}


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

    toggleFlashlight,

    openCamera,

    openLocation,

    openWeather,

    tellTime,

    tellDate,

    executeCommand,

    closeModule

};

/* =========================================================
   SYSTEM STATUS VOICE
   ========================================================= */

function speakSystemStatus(){

    const gps =
        el.locationStatus
            ? el.locationStatus.textContent
            : "UNKNOWN";


    const temperature =
        el.temperatureValue
            ? el.temperatureValue.textContent
            : "--";


    const humidity =
        el.humidityValue
            ? el.humidityValue.textContent
            : "--";


    let message;


    if(state.language === "hi-IN"){

        message =
            `जारविश सिस्टम ऑनलाइन है। ` +
            `जीपीएस ${gps} है। ` +
            `तापमान ${temperature} है। ` +
            `ह्यूमिडिटी ${humidity} है।`;

    }else if(state.language === "gu-IN"){

        message =
            `જારવિશ સિસ્ટમ ઓનલાઈન છે. ` +
            `GPS ${gps} છે. ` +
            `તાપમાન ${temperature} છે. ` +
            `હ્યુમિડિટી ${humidity} છે.`;

    }else{

        message =
            `JARVISH system is online. ` +
            `GPS is ${gps}. ` +
            `Temperature is ${temperature}. ` +
            `Humidity is ${humidity}.`;

    }


    speak(message);

}


/* =========================================================
   STOP ALL ACTIVE MODULES
   ========================================================= */

function stopAllModules(){

    stopSiren();

    stopCamera();

    stopCompass();

    if(
        state.listening &&
        state.recognition
    ){

        try{
            state.recognition.stop();
        }catch(error){}

    }


    if(
        window.speechSynthesis
    ){

        window.speechSynthesis.cancel();

    }


    closeModule();


    setCoreStatus(
        "JARVISH READY"
    );


    speak(
        state.language === "hi-IN"
            ? "सभी सक्रिय मॉड्यूल रोक दिए गए हैं।"
            : state.language === "gu-IN"
                ? "બધા સક્રિય મોડ્યુલ બંધ કરવામાં આવ્યા છે."
                : "All active modules have been stopped."
    );

}
/* =========================================================
   END
   ========================================================= */