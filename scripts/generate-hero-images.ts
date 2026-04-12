import * as fal from "@fal-ai/serverless-client";
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables from .env file
dotenv.config();

// Configure Fal.ai
fal.config({
    credentials: process.env.FAL_KEY || process.env.VITE_FAL_KEY
});

const heroImagePrompts = [
    {
        name: "financial-freedom",
        prompt: "Photorealistic professional financial advisor consulting with a happy couple in a modern office, warm lighting, clean desk with laptop showing growth charts, confident body language, professional attire, ultra detailed, 8K quality, cinematic composition"
    },
    {
        name: "retirement-lifestyle",
        prompt: "Happy retired couple enjoying a beautiful sunset on their patio, comfortable upscale home, relaxed and content, warm golden hour lighting, professional lifestyle photography, ultra high quality, cinematic"
    },
    {
        name: "wealth-growth",
        prompt: "Abstract visualization of wealth growth, ascending gold and navy blue bars and curves, modern minimalist design, professional financial imagery, clean composition, premium quality, elegant"
    },
    {
        name: "family-legacy",
        prompt: "Multi-generational family portrait in an upscale home setting, grandparents with children and grandchildren, warm natural lighting, genuine happiness, professional family photography, ultra high quality"
    },
    {
        name: "professional-meeting",
        prompt: "Professional financial advisor presenting strategies on a large screen to clients in a modern conference room, clean corporate environment, bright natural lighting, professional photography, premium quality"
    },
    {
        name: "secure-future",
        prompt: "Confident professional standing in front of a modern glass office building, sunrise in background, symbolizing new beginnings and financial security, professional portrait photography, 8K quality, cinematic lighting"
    },
    {
        name: "tax-free-retirement",
        prompt: "Beautiful modern home office with financial documents and laptop showing retirement projections, cup of coffee, morning light through windows, organized and professional, ultra detailed, premium quality"
    },
    {
        name: "asset-protection",
        prompt: "Strong safe vault door slightly open revealing golden light inside, symbolizing wealth protection, dramatic lighting, professional product photography, ultra high quality, sophisticated atmosphere"
    },
    {
        name: "independent-advisor",
        prompt: "Professional financial advisor shaking hands with satisfied client, modern office setting, warm natural lighting, trust and confidence, professional corporate photography, cinematic composition, 8K quality"
    },
    {
        name: "education-workshop",
        prompt: "Financial education workshop with diverse attendees in a modern venue, presenter at whiteboard with financial charts, engaged audience, bright professional lighting, high-end corporate event photography"
    }
];

async function generateHeroImages() {
    console.log("🎨 Generating Everence Wealth hero images...\n");

    const generatedImages: { name: string; url: string }[] = [];

    for (const { name, prompt } of heroImagePrompts) {
        console.log(`Generating: ${name}...`);

        try {
            const result: any = await fal.subscribe("fal-ai/flux-pro/v1.1", {
                input: {
                    prompt: prompt,
                    image_size: {
                        width: 1024,
                        height: 768
                    },
                    num_inference_steps: 28,
                    guidance_scale: 3.5,
                    num_images: 1,
                    enable_safety_checker: false
                },
                logs: true,
            });

            const imageUrl = result.data.images[0].url;
            generatedImages.push({ name, url: imageUrl });

            console.log(`✅ Generated: ${name}`);
            console.log(`   URL: ${imageUrl}\n`);

            // Small delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
            console.error(`❌ Error generating ${name}:`, error);
        }
    }

    // Output all URLs for easy copying
    console.log("\n📋 All Generated Image URLs:\n");
    generatedImages.forEach(({ name, url }) => {
        console.log(`${name}:`);
        console.log(`${url}\n`);
    });

    // Save to JSON file for reference
    fs.writeFileSync(
        'hero-images.json',
        JSON.stringify(generatedImages, null, 2)
    );

    console.log("✅ Saved URLs to hero-images.json");

    return generatedImages;
}

// Run generation
generateHeroImages()
    .then(() => console.log("\n🎉 All hero images generated successfully!"))
    .catch(error => console.error("Error:", error));
