import type { APIRoute } from "astro"
import base64url from 'base64url'

export const GET: APIRoute = async ({ params }) => {
    const res = await fetch(`${import.meta.env.PUBLIC_mercuryUrl}/zephyr/execute`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.PRIVATE_mercuryJwt}`
        },
        body: JSON.stringify({
            mode: {
                Function: {
                    fname: "get_address_by_signer",
                    arguments: JSON.stringify({
                        id: [...base64url.toBuffer(params.signer!)]
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

    const address: string = res[0]?.address

    if (!address)
        throw { status: 404, message: 'Contract not found' }

    return new Response(address)
}