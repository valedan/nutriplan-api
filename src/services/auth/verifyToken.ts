/* eslint-disable @typescript-eslint/no-non-null-assertion */
import jwt, { JwtHeader, JwtPayload, SigningKeyCallback } from "jsonwebtoken"
import jwksClient from "jwks-rsa"

const verifyToken = async (
  bearerToken: string
): Promise<JwtPayload | undefined> => {
  const client = jwksClient({
    jwksUri: `${process.env.AUTH0_DOMAIN!}.well-known/jwks.json`,
  })

  const getJwksClientKey = (
    header: JwtHeader,
    callback: SigningKeyCallback
  ) => {
    client.getSigningKey(header.kid, (_, key) => {
      const signingKey =
        (key as jwksClient.CertSigningKey).publicKey ||
        (key as jwksClient.RsaSigningKey).rsaPublicKey
      callback(null, signingKey)
    })
  }

  return new Promise((resolve, reject) => {
    jwt.verify(
      bearerToken,
      getJwksClientKey,
      {
        audience: process.env.AUDIENCE,
        issuer: process.env.AUTH0_DOMAIN,
        algorithms: ["RS256"],
      },
      (err, decoded) => {
        if (err) reject(err)
        resolve(decoded)
      }
    )
  })
}

export default verifyToken
