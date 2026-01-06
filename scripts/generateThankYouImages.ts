import * as fal from "@fal-ai/serverless-client";
import fs from 'fs';
import path from 'path';
import https from 'https';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Configure Fal.ai client
fal.config({
    credentials: process.env.FAL_KEY
});

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ImagePrompt {
    filename: string;
    prompt: string;
    title: string;
    description: string;
}

const imagePrompts: ImagePrompt[] = [
    {
        filename: "coastal-paradise.jpg",
        prompt: "Stunning aerial view of Costa del Sol coastline at golden hour, luxury white villas on hillside overlooking crystal turquoise Mediterranean sea, modern architecture with infinity pools, palm trees swaying, pristine sandy beaches, yacht in the distance, professional real estate photography, ultra realistic, 8K resolution, warm golden lighting, vibrant colors",
        title: "Coastal Paradise",
        description: "Where luxury meets the Mediterranean"
    },
    {
        filename: "marbella-lifestyle.jpg",
        prompt: "Elegant beachfront promenade in Marbella Puerto Banus, palm-lined marble walkway, luxury superyachts moored in marina, upscale waterfront restaurants with outdoor terraces, people enjoying sunset drinks, golden hour lighting, professional lifestyle photography, vibrant atmosphere, 8K resolution, warm tones",
        title: "Marbella Lifestyle",
        description: "Sophistication at every turn"
    },
    {
        filename: "dream-villas.jpg",
        prompt: "Ultra-modern luxury villa with massive infinity pool overlooking Costa del Sol, contemporary white architecture with floor-to-ceiling glass windows, minimalist design, manicured tropical gardens, outdoor lounge furniture, sunset reflecting on water, professional architectural photography, ultra HD, dramatic lighting, cinematic composition",
        title: "Dream Villas",
        description: "Your perfect home awaits"
    },
    {
        filename: "authentic-charm.jpg",
        prompt: "Picturesque traditional white village pueblo blanco on Andalusian hillside, whitewashed buildings with terracotta roofs, narrow cobblestone streets winding upward, colorful flower-filled balconies with bougainvillea, dramatic mountain backdrop, bright blue Mediterranean sky, professional travel photography, vivid colors, golden afternoon light, 8K",
        title: "Authentic Charm",
        description: "Rich culture and heritage"
    },
    {
        filename: "world-class-golf.jpg",
        prompt: "Pristine championship golf course on Costa del Sol, rolling emerald green fairways perfectly manicured, strategic sand bunkers, tall palm trees lining the course, Sierra Blanca mountains in background, glimpse of Mediterranean sea, morning golden light, professional golf course photography, ultra HD, vibrant greens, serene atmosphere",
        title: "World-Class Golf",
        description: "Championship courses at your doorstep"
    },
    {
        filename: "beach-club-living.jpg",
        prompt: "Exclusive luxury beach club on Costa del Sol golden sand beach, crystal turquoise water gently lapping shore, elegant white sun loungers with plush cushions, natural woven umbrellas, beautiful people relaxing in designer swimwear, tropical cocktails, sunset golden hour, professional lifestyle photography, warm luxurious tones, sophisticated atmosphere, 8K",
        title: "Beach Club Living",
        description: "Endless summer days"
    }
];

async function downloadImage(url: string, filepath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download image: ${response.statusCode}`));
                return;
            }

            const fileStream = fs.createWriteStream(filepath);
            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`✅ Downloaded: ${filepath}`);
                resolve();
            });

            fileStream.on('error', (err) => {
                fs.unlink(filepath, () => { });
                reject(err);
            });
        }).on('error', reject);
    });
}

async function generateImages() {
    console.log('🎨 Starting Costa del Sol image generation...\n');

    // Create output directory
    const outputDir = path.join(process.cwd(), 'public', 'images', 'thank-you');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`📁 Created directory: ${outputDir}\n`);
    }

    // Generate metadata file
    const metadata = [];

    for (let i = 0; i < imagePrompts.length; i++) {
        const { filename, prompt, title, description } = imagePrompts[i];

        console.log(`🖼️  Generating ${i + 1}/${imagePrompts.length}: ${title}`);
        console.log(`   Prompt: ${prompt.substring(0, 100)}...`);

        try {
            const result = await fal.subscribe("fal-ai/flux/schnell", {
                input: {
                    prompt: prompt,
                    image_size: "landscape_16_9",
                    num_inference_steps: 4,
                    num_images: 1,
                    enable_safety_checker: true
                },
                logs: true,
                onQueueUpdate: (update) => {
                    if (update.status === "IN_PROGRESS") {
                        console.log(`   Progress: ${update.logs?.map(log => log.message).join(' ')}`);
                    }
                }
            });

            if ((result as any).images && (result as any).images[0]) {
                const imageUrl = (result as any).images[0].url;
                const filepath = path.join(outputDir, filename);

                // Download image
                await downloadImage(imageUrl, filepath);

                // Add to metadata
                metadata.push({
                    url: `/images/thank-you/${filename}`,
                    title,
                    description,
                    alt: `${title} - Costa del Sol luxury real estate`
                });

                console.log(`✅ Success: ${title}\n`);
            } else {
                console.error(`❌ Failed: ${title} - No image returned\n`);
            }

            // Rate limiting: wait 2 seconds between requests
            if (i < imagePrompts.length - 1) {
                console.log('   Waiting 2 seconds before next generation...\n');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

        } catch (error) {
            console.error(`❌ Error generating ${title}:`, error);
            console.log('   Continuing with next image...\n');
        }
    }

    // Save metadata
    const metadataPath = path.join(outputDir, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`\n📝 Saved metadata to: ${metadataPath}`);

    console.log('\n🎉 Image generation complete!');
    console.log(`📊 Generated ${metadata.length}/${imagePrompts.length} images successfully`);
}

// Run the script
generateImages().catch(console.error);
