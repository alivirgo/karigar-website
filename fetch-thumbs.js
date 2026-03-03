const fs = require('fs');
const path = require('path');
const https = require('https');

const services = [
    "CCTV Camera", "Gardening", "General Supply", "Ceiling Services",
    "Solar System", "Security System", "Electrical Services", "Interior Design",
    "Data Networking", "IT Services", "Cleaning", "Carpenter",
    "Fire Alarm", "Paint & Polish", "Plumbing", "AC Services",
    "Civil Work Services", "PBX", "Biometric", "Glass & Aluminium",
    "PA System", "Maintenance"
];

const outDir = path.join(__dirname, 'assets');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

// Switching to dynamic placeholder images using Unsplash Source (now images.unsplash.com via source.unsplash.com is deprecated, using generic placeholder service with text)
// Since free AI generation APIs without auth are often blocked or rate-limited, we will generate highly styled professional placeholders for the remaining ones.

async function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const request = https.get(url, response => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                // handle redirect
                file.close();
                downloadImage(response.headers.location, dest).then(resolve).catch(reject);
                return;
            }
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close(resolve);
                });
            } else {
                reject(`Server responded with ${response.statusCode}: ${response.statusMessage}`);
            }
        }).on('error', err => {
            fs.unlink(dest, () => reject(err));
        });

        request.setTimeout(15000, () => {
            request.destroy();
            reject('Request timed out');
        });
    });
}

async function generateAll() {
    console.log("Starting generation of 22 thumbnails via professional placeholders...");
    for (const service of services) {
        const slug = service.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
        const dest = path.join(outDir, `${slug}-thumb.png`);

        // Skip if we already successfully generated an AI one (like CCTV, Gardening etc which we copied earlier)
        if (fs.existsSync(dest) && fs.statSync(dest).size > 100000) {
            console.log(`Skipping: ${service} (already exists and looks like a valid AI image)`);
            continue;
        }

        const encodedText = encodeURIComponent(service + " - KARIGAR Services");
        // Using a reliable placeholder service with dark premium colors
        const url = `https://ui-avatars.com/api/?name=${encodedText}&background=1D3557&color=E1A730&size=800&font-size=0.15&length=20`;

        console.log(`Downloading placeholder for: ${service}...`);
        try {
            await downloadImage(url, dest);
            console.log(`✅ Saved ${slug}-thumb.png`);
        } catch (err) {
            console.error(`❌ Failed for ${service}:`, err);
        }
    }
    console.log("Finished all images.");
}

generateAll();
