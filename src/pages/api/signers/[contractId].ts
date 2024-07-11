import type { APIRoute } from "astro"
import { account } from "../../../lib/common-server";

export const GET: APIRoute = async ({ params }) => {
    await account.setMercuryJwt()

    const signers = await account.getSigners(params.contractId!)

    return Response.json(signers)
}