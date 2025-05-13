export async function send(xdr: string) {
    return fetch("/api/send", {
        method: "POST",
        body: xdr,
    }).then(async (res) => {
        if (res.ok) return res.json()
        throw await res.json();
    });
}

export async function getContractId(signer: string) {
    return fetch(`/api/contract-id/${signer}`)
        .then(async (res) => {
            if (res.ok) return res.text();
            throw await res.json();
        });
}