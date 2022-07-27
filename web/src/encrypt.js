const EthCrypto = require('eth-crypto');
const ethers = require('ethers');

function removePrefixFromPublicKey(pubKey) {
    if(pubKey.substr(0,4).includes("0x04")
    || pubKey.substr(0,4).includes("0x03")
    || pubKey.substr(0,4).includes("0x02")) {
        pubKey = pubKey.slice(4);
    }

    return pubKey;
}

(async () => {
    
    const alice = new ethers.Wallet("0xbce495bdb43821a78da058bacffb55192bb763ac5567e0ef8aa289d16b4bcd15");
    const alicePk = alice.privateKey;
    const alicePb = removePrefixFromPublicKey(alice.publicKey);
    
    const bob = ethers.Wallet.createRandom();
    const bobPk = bob.privateKey;
    const bobPb = removePrefixFromPublicKey(bob.publicKey);

    const secretMessage = 'My name is Satoshi Buterin';

    const signature = EthCrypto.sign(
        alicePk,
        EthCrypto.hash.keccak256(secretMessage)
    );
    
    const payload = {
        message: secretMessage,
        signature
    };
    
    const encrypted = await EthCrypto.encryptWithPublicKey(
        bobPb, // by encryping with bobs publicKey, only bob can decrypt the payload with his privateKey
        JSON.stringify(payload) // we have to stringify the payload before we can encrypt it
    );
    /*  { iv: 'c66fbc24cc7ef520a7...',
      ephemPublicKey: '048e34ce5cca0b69d4e1f5...',
      ciphertext: '27b91fe986e3ab030...',
      mac: 'dd7b78c16e462c42876745c7...'
        }
    */

    console.log(encrypted);
    //return;
    
    
    // we convert the object into a smaller string-representation
    const encryptedString = EthCrypto.cipher.stringify(encrypted);
    console.log("encryptedString", encryptedString);
    // > '812ee676cf06ba72316862fd3dabe7e403c7395bda62243b7b0eea5eb..'
    
    // now we send the encrypted string to bob over the internet.. *bieb, bieb, blob*
    
    // we parse the string into the object again
    const encryptedObject = EthCrypto.cipher.parse(encryptedString);
    
    const decrypted = await EthCrypto.decryptWithPrivateKey(
        bobPk,
        encryptedObject
    );
    const decryptedPayload = JSON.parse(decrypted);
    
    // check signature
    const senderAddress = EthCrypto.recover(
        decryptedPayload.signature,
        EthCrypto.hash.keccak256(decryptedPayload.message)
    );
    
    console.log(
        'Got message from ' +
        senderAddress +
        ': ' +
        decryptedPayload.message
    );
    // > 'Got message from 0x19C24B2d99FB91C5...: "My name is Satoshi Buterin" Buterin'
    
})()
