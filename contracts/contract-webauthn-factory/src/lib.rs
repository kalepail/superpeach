#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, symbol_short, vec, Address, Bytes, BytesN, Env, Symbol,
};

#[contract]
pub struct Contract;

#[contracterror]
#[derive(Copy, Clone, Eq, PartialEq, Debug)]
pub enum Error {
    NotInited = 1,
    AlreadyInited = 2,
    AlreadyMapped = 3,
    NotFound = 4,
    NotPermitted = 5,
}

const STORAGE_KEY_WASM_HASH: Symbol = symbol_short!("hash");

#[contractimpl]
impl Contract {
    pub fn extend_ttl(env: &Env) {
        let max_ttl = env.storage().max_ttl();
        let contract_address = env.current_contract_address();

        env.storage().instance().extend_ttl(max_ttl, max_ttl);
        env.deployer()
            .extend_ttl(contract_address.clone(), max_ttl, max_ttl);
        env.deployer()
            .extend_ttl_for_code(contract_address.clone(), max_ttl, max_ttl);
        env.deployer()
            .extend_ttl_for_contract_instance(contract_address.clone(), max_ttl, max_ttl);
    }
    pub fn init(env: Env, wasm_hash: BytesN<32>) -> Result<(), Error> {
        if env.storage().instance().has(&STORAGE_KEY_WASM_HASH) {
            return Err(Error::AlreadyInited);
        }

        env.storage()
            .instance()
            .set(&STORAGE_KEY_WASM_HASH, &wasm_hash);

        Self::extend_ttl(&env);

        Ok(())
    }
    pub fn deploy(env: Env, salt: Bytes, pk: BytesN<65>) -> Result<Address, Error> {
        let wasm_hash = env
            .storage()
            .instance()
            .get::<Symbol, BytesN<32>>(&STORAGE_KEY_WASM_HASH)
            .ok_or(Error::NotInited)?;

        let address = env
            .deployer()
            .with_current_contract(env.crypto().sha256(&salt))
            .deploy(wasm_hash);
        let () = env.invoke_contract(
            &address,
            &symbol_short!("init"),
            vec![
                &env,
                salt.to_val(),
                pk.to_val(),
                env.current_contract_address().to_val(),
            ],
        );

        Self::__add_sig(&env, &salt, &address)?;

        Self::extend_ttl(&env);

        Ok(address)
    }

    pub fn add_sig(env: Env, salt: Bytes, contract: Address) -> Result<(), Error> {
        contract.require_auth();

        let _ = Self::__add_sig(&env, &salt, &contract);

        Self::extend_ttl(&env);

        Ok(())
    }

    pub fn rm_sig(env: Env, salt: Bytes, contract: Address) -> Result<(), Error> {
        contract.require_auth();

        if env
            .storage()
            .persistent()
            .get::<Bytes, Address>(&salt)
            .ok_or(Error::NotFound)?
            != contract
        {
            return Err(Error::NotPermitted);
        }

        env.storage().persistent().remove(&salt);

        Self::extend_ttl(&env);

        Ok(())
    }

    // This function allows reverse lookups. So given any passkey id you can find it's related contract address
    // Especially useful after a resudo function call where you cannot rely on the initial passkey's id to derive the initial smart wallet's contract address
    #[allow(non_snake_case)]
    fn __add_sig(env: &Env, salt: &Bytes, contract: &Address) -> Result<(), Error> {
        // NOTE this requires that each passkey can only be added to one smart wallet
        // Could switch to a Vec to allow multiple contract mappings from the same passkey
        if env.storage().persistent().has(salt) {
            return Err(Error::AlreadyMapped);
        }

        let max_ttl = env.storage().max_ttl();
        
        env.storage().persistent().set(salt, contract);
        env.storage()
            .persistent()
            .extend_ttl(salt, max_ttl, max_ttl);

        Ok(())
    }
}
