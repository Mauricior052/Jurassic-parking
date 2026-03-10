import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_SECRET);

export const googleVerify = async (token) => {

  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_ID,  // Client ID de tu aplicación
  });
  
  const payload = ticket.getPayload();

  return payload;
}
