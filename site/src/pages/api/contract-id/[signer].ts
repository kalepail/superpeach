import type { APIRoute } from "astro"
import { account } from "../../../lib/common-server";

export const GET: APIRoute = async ({ params }) => {
    await account.setMercuryJwt()

    const contractId = await account.getContractId(params.signer!)

    if (!contractId)
        throw { status: 404, message: 'Contract not found' }

    return new Response(contractId)
}