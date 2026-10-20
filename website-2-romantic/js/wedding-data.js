/**
 * ==============================================================================
 * WEBSITE 2: CUTE & ROMANTIC WEDDING CONFIGURATION
 * Wedding of Kousalya & Mohan
 * ==============================================================================
 */

const WEDDING_DATA = {
  header: {
    badge: "Save the Date",
    tagline: "WE ARE GETTING MARRIED"
  },
  couple: {
    photo: "./assets/couple.jpg",
    bride: {
      name: "Kousalya",
      parents: "D/O K.Sakthivel & Devi Sakthivel"
    },
    groom: {
      name: "Mohan",
      parents: "S/O S.Thanikachalam & Selvi Thanikachalam"
    }
  },
  schedule: {
    primaryIsoDate: "2026-11-15T07:30:00+05:30",
    displayDate: "Sunday, 15th November 2026",
    events: [
      {
        id: "wedding",
        title: "WEDDING",
        date: "Sunday, 15th November 2026",
        time: "7:30 AM – 9:00 AM IST"
      },
      {
        id: "reception",
        title: "RECEPTION",
        date: "Saturday, 14th November 2026",
        time: "6:00 PM – 8:00 PM IST"
      }
    ]
  },
  location: {
    name: "Geetha Citadel Wedding & Conventions",
    address: "Iyankulam ,Paruthipattu-600071",
    googleMapsUrl: "https://share.google/IbbWh7woegGU9tjHQ",
    qrCode: "./assets/location-qr.svg"
  }
};
