import type { APIRoute } from "astro"
import base64url from 'base64url'
import { rpc, type Signer } from "../../../lib/common";
import { SorobanRpc, xdr } from "@stellar/stellar-sdk";

export const GET: APIRoute = async ({ params }) => {
    const signers: Signer[] = await fetch(`${import.meta.env.PUBLIC_mercuryUrl}/zephyr/execute`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.PRIVATE_mercuryJwt}`
        },
        body: JSON.stringify({
            mode: {
                Function: {
                    fname: "get_signers_by_address",
                    arguments: JSON.stringify({
                        address: params.contractId
                    })
                }
            }
        })
    })
        .then(async (res) => {
            if (res.ok)
                return res.json()

            throw await res.json()
        })

    for (const signer of signers) {
        if (!signer.admin) {
            try {
                await rpc.getContractData(params.contractId!, xdr.ScVal.scvBytes(signer.id as unknown as Buffer), SorobanRpc.Durability.Temporary)
            } catch {
                signer.expired = true
            }
        }

        signer.id = base64url(signer.id)
        signer.pk = base64url(signer.pk)
    }

    return Response.json(signers)
}