import fs from 'fs';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
    console.log('hello')
    return new Response();
};

export async function POST({request}) {
    const imageData = await request.arrayBuffer();
    const buffer = Buffer.from(imageData);
    await fs.writeFileSync('./image.png', buffer);
        return new Response();
};