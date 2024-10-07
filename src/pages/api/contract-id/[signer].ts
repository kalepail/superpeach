import type { APIRoute } from "astro"
import { account } from "../../../lib/common-server";

export const GET: APIRoute = async ({ params }) => {
    const contractId = await account(import.meta.env).getContractId({ keyId: params.signer! })

    if (!contractId)
        return Response.json({ message: 'Contract not found' }, { status: 404 })

    return new Response(contractId)
}