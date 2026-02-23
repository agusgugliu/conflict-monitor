const fs = require('fs');
const path = require('path');

const conflictsPath = path.join(__dirname, 'data', 'conflicts.json');
const data = JSON.parse(fs.readFileSync(conflictsPath, 'utf8'));

// Enhance World War 2 with affected countries and significant battles
const ww2Index = data.findIndex(c => c.id === 'world-war-2');
if (ww2Index > -1) {
    data[ww2Index].affected_countries = [
        'Germany', 'France', 'United Kingdom', 'Italy', 'Japan', 'Russia',
        'Poland', 'Ukraine', 'Belarus', 'Belgium', 'Netherlands', 'Norway',
        'Greece', 'China', 'Philippines', 'United States'
    ];
    data[ww2Index].battles = [
        { name: 'Battle of Stalingrad', coordinates: { lat: 48.7080, lng: 44.5133 }, year: 1942 },
        { name: 'Battle of Midway', coordinates: { lat: 28.2000, lng: -177.3500 }, year: 1942 },
        { name: 'Battle of Normandy (D-Day)', coordinates: { lat: 49.3400, lng: -0.8700 }, year: 1944 },
        { name: 'Battle of Berlin', coordinates: { lat: 52.5200, lng: 13.4050 }, year: 1945 },
        { name: 'Battle of El Alamein', coordinates: { lat: 30.8333, lng: 28.9500 }, year: 1942 },
        { name: 'Battle of Okinawa', coordinates: { lat: 26.5000, lng: 128.0000 }, year: 1945 },
        { name: 'Battle of the Bulge', coordinates: { lat: 50.3600, lng: 6.0400 }, year: 1944 }
    ];
}

// Enhance World War 1
const ww1Index = data.findIndex(c => c.id === 'world-war-1');
if (ww1Index > -1) {
    data[ww1Index].affected_countries = [
        'France', 'Germany', 'Belgium', 'United Kingdom', 'Russia',
        'Austria', 'Hungary', 'Serbia', 'Turkey', 'Italy'
    ];
    data[ww1Index].battles = [
        { name: 'Battle of the Somme', coordinates: { lat: 50.0167, lng: 2.6833 }, year: 1916 },
        { name: 'Battle of Verdun', coordinates: { lat: 49.1667, lng: 5.3833 }, year: 1916 },
        { name: 'Battle of Gallipoli', coordinates: { lat: 40.2333, lng: 26.2833 }, year: 1915 }
    ];
}

// American Civil War
const acwIndex = data.findIndex(c => c.id === 'american-civil-war');
if (acwIndex > -1) {
    data[acwIndex].affected_countries = ['United States'];
    data[acwIndex].battles = [
        { name: 'Battle of Gettysburg', coordinates: { lat: 39.8283, lng: -77.2322 }, year: 1863 },
        { name: 'Battle of Antietam', coordinates: { lat: 39.4744, lng: -77.7408 }, year: 1862 },
        { name: 'Battle of Shiloh', coordinates: { lat: 35.1516, lng: -88.3225 }, year: 1862 }
    ];
}

// Napoleonic Wars
const napIndex = data.findIndex(c => c.id === 'napoleonic-wars');
if (napIndex > -1) {
    data[napIndex].affected_countries = ['France', 'Germany', 'Spain', 'Italy', 'Austria', 'Russia', 'United Kingdom'];
    data[napIndex].battles = [
        { name: 'Battle of Austerlitz', coordinates: { lat: 49.1286, lng: 16.7619 }, year: 1805 },
        { name: 'Battle of Waterloo', coordinates: { lat: 50.6800, lng: 4.4116 }, year: 1815 },
        { name: 'Battle of Trafalgar', coordinates: { lat: 36.1833, lng: -6.0500 }, year: 1805 },
        { name: 'Battle of Borodino', coordinates: { lat: 55.5167, lng: 35.8167 }, year: 1812 }
    ];
}

// Ensure other conflicts at least have an affected_countries array as a fallback
const regionToCountries = {
    'Middle East': ['Syria', 'Iraq', 'Iran', 'Israel', 'Palestine', 'Egypt', 'Jordan', 'Lebanon', 'Saudi Arabia', 'Yemen'],
    'Europe': ['France', 'Germany', 'United Kingdom', 'Italy', 'Spain', 'Poland', 'Russia', 'Ukraine', 'Bosnia and Herzegovina', 'Serbia'],
    'Asia': ['China', 'Japan', 'South Korea', 'North Korea', 'Vietnam', 'Afghanistan', 'India', 'Pakistan', 'Bangladesh'],
    'Americas': ['United States', 'Mexico', 'Colombia', 'Venezuela', 'Argentina'],
    'Africa': ['Sudan', 'Ethiopia', 'Somalia', 'Mali', 'Nigeria', 'Democratic Republic of the Congo', 'Rwanda']
};

for (const conflict of data) {
    if (!conflict.affected_countries) {
        conflict.affected_countries = regionToCountries[conflict.region] || [];
    }
}

fs.writeFileSync(conflictsPath, JSON.stringify(data, null, 2));
console.log('Successfully enhanced conflicts with battles and affected countries.');
