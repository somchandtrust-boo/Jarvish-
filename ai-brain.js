/* =========================================================
   JARVISH AI BRAIN
   Natural Language Command Engine
   ========================================================= */

"use strict";


const JARVISH_BRAIN = {

    version: "1.0",

    name: "JARVISH",

    process(input) {

        const text =
            this.clean(input);

        if (!text) {
            return {
                type: "unknown",
                value: ""
            };
        }


        /* ===============================
           GREETINGS
           =============================== */

        if (
            this.has(text, [
                "hello",
                "hi jarvish",
                "hey jarvish",
                "namaste",
                "नमस्ते",
                "નમસ્તે"
            ])
        ) {

            return {
                type: "greeting"
            };

        }


        /* ===============================
           MAP
           =============================== */

        if (
            this.has(text, [
                "map kholo",
                "map open",
                "open map",
                "show map",
                "map dikhao",
                "map दिखाओ",
                "नक्शा खोलो",
                "નકશો ખોલો"
            ])
        ) {

            return {
                type: "map"
            };

        }


        /* ===============================
           COMPASS
           =============================== */

        if (
            this.has(text, [
                "compass kholo",
                "open compass",
                "show compass",
                "direction batao",
                "direction dikhao",
                "कंपास खोलो",
                "दिशा बताओ",
                "કંપાસ ખોલો",
                "દિશા બતાવો"
            ])
        ) {

            return {
                type: "compass"
            };

        }


        /* ===============================
           SIREN
           =============================== */

        if (
            this.has(text, [
                "siren kholo",
                "siren chalu",
                "siren start",
                "start siren",
                "open siren",
                "alarm chalu",
                "सायरन खोलो",
                "सायरन चालू",
                "સાયરન ચાલુ"
            ])
        ) {

            return {
                type: "siren"
            };

        }


        /* ===============================
           FLASHLIGHT
           =============================== */

        if (
            this.has(text, [
                "flashlight kholo",
                "flashlight chalu",
                "torch chalu",
                "torch on",
                "light chalu",
                "light on",
                "turn on flashlight",
                "टॉर्च चालू",
                "लाइट चालू",
                "ફ્લેશલાઇટ ચાલુ",
                "ટોર્ચ ચાલુ"
            ])
        ) {

            return {
                type: "flashlight"
            };

        }


        /* ===============================
           CAMERA
           =============================== */

        if (
            this.has(text, [
                "camera kholo",
                "camera open",
                "open camera",
                "camera chalu",
                "कैमरा खोलो",
                "कैमरा चालू",
                "કેમેરા ખોલો",
                "કેમેરા ચાલુ"
            ])
        ) {

            return {
                type: "camera"
            };

        }


        /* ===============================
           LOCATION
           =============================== */

        if (
            this.has(text, [
                "location kholo",
                "location dikhao",
                "live location",
                "my location",
                "where am i",
                "gps location",
                "लोकेशन दिखाओ",
                "मेरी लोकेशन",
                "લોકેશન બતાવો",
                "મારી લોકેશન"
            ])
        ) {

            return {
                type: "location"
            };

        }


        /* ===============================
           WEATHER
           =============================== */

        if (
            this.has(text, [
                "weather batao",
                "weather dikhao",
                "mausam batao",
                "mausam dikhao",
                "temperature batao",
                "current weather",
                "show weather",
                "मौसम बताओ",
                "मौसम दिखाओ",
                "तापमान बताओ",
                "હવામાન બતાવો"
            ])
        ) {

            return {
                type: "weather"
            };

        }


        /* ===============================
           QR
           =============================== */

        if (
            this.has(text, [
                "qr kholo",
                "qr generator kholo",
                "qr open",
                "open qr",
                "क्यूआर खोलो",
                "ક્યૂઆર ખોલો"
            ])
        ) {

            return {
                type: "qr"
            };

        }


        /* ===============================
           YOUTUBE
           =============================== */

        if (
            this.has(text, [
                "youtube kholo",
                "youtube open",
                "open youtube",
                "यूट्यूब खोलो",
                "યૂટ્યુબ ખોલો"
            ])
        ) {

            return {
                type: "youtube"
            };

        }


        /* ===============================
           WHATSAPP
           =============================== */

        if (
            this.has(text, [
                "whatsapp kholo",
                "whatsapp open",
                "open whatsapp",
                "व्हाट्सएप खोलो",
                "વોટ્સએપ ખોલો"
            ])
        ) {

            return {
                type: "whatsapp"
            };

        }


        /* ===============================
           GOOGLE
           =============================== */

        if (
            this.has(text, [
                "google kholo",
                "google open",
                "open google",
                "गूगल खोलो",
                "ગૂગલ ખોલો"
            ])
        ) {

            return {
                type: "google"
            };

        }


        /* ===============================
           TIME
           =============================== */

        if (
            this.has(text, [
                "time batao",
                "time kya hai",
                "kitne baje",
                "current time",
                "what time is it",
                "समय बताओ",
                "कितने बजे",
                "સમય બતાવો"
            ])
        ) {

            return {
                type: "time"
            };

        }


        /* ===============================
           DATE
           =============================== */

        if (
            this.has(text, [
                "date batao",
                "aaj ki date",
                "today date",
                "today",
                "what is today's date",
                "आज की तारीख",
                "आज तारीख",
                "આજની તારીખ"
            ])
        ) {

            return {
                type: "date"
            };

        }


        /* ===============================
           STATUS
           =============================== */

        if (
            this.has(text, [
                "system status",
                "system check",
                "status batao",
                "system ka status",
                "system status batao",
                "सिस्टम स्टेटस",
                "સિસ્ટમ સ્ટેટસ"
            ])
        ) {

            return {
                type: "status"
            };

        }


        /* ===============================
           STOP
           =============================== */

        if (
            this.has(text, [
                "stop",
                "band karo",
                "close",
                "exit",
                "रोक दो",
                "बंद करो",
                "બંધ કરો"
            ])
        ) {

            return {
                type: "stop"
            };

        }


        return {
            type: "unknown",
            value: text
        };

    },


    clean(text) {

        return String(text)
            .toLowerCase()
            .replace(
                /[^\p{L}\p{N}\s]/gu,
                " "
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim();

    },


    has(text, words) {

        return words.some(
            word =>
                text.includes(
                    word.toLowerCase()
                )
        );

    }

};


/* =========================================================
   GLOBAL ACCESS
   ========================================================= */

window.JARVISH_BRAIN =
    JARVISH_BRAIN;