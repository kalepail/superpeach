import type { APIRoute } from "astro"
import { PasskeyBase } from 'passkey-kit'

const account = new PasskeyBase({
    launchtubeUrl: import.meta.env.PUBLIC_launchtubeUrl,
    launchtubeJwt: import.meta.env.PRIVATE_launchtubeJwt,
});

export const POST: APIRoute = async ({ request }) => {
    const xdr = await request.text()
    const res = await account.send(xdr)

    return Response.json(res)
}