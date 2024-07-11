import type { APIRoute } from "astro"
import { account } from "../../lib/common-server";

export const POST: APIRoute = async ({ request }) => {
    const xdr = await request.text()
    const res = await account.send(xdr)

    return Response.json(res)
}