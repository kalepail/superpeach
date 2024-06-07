export async function GET() {
    return new Response(import.meta.env.PRIVATE_secret || 'Hello World')
}