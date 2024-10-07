import type { APIRoute } from "astro"
import { account } from "../../../lib/common-server";

export const GET: APIRoute = async ({ params }) => {
    const signers = await account.getSigners(params.contractId!)
    
    return Response.json(signers)
}