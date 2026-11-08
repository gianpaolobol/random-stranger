import { productRoutes } from './api.mjs';
import { appleReady, verifyAppleToken, revokeAppleCode } from './apple.mjs';
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
const random = () => randomBytes(32).toString('base64url');
const hash = s => createHash('sha256').update(s).digest('base64url');
const equal = (a, b) => typeof a === 'string' && typeof b === 'string' && a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const cookies = request => Object.fromEntries((request.headers.get('cookie') || '').split(';').map(s => s.trim().split('=')).filter(p => p.length === 2));
export function createApp({
  config,
  store,
  providerFetch = fetch,
  imageProvider = null,
  appleKeys = undefined
}) {
  const origin = new URL(config.origin).origin;
  if (config.webOrigin && new URL(config.webOrigin).origin !== origin) throw Error('Frontend web e API devono usare la stessa origine: configura un reverse proxy.');
  const secure = origin.startsWith('https:');
  const cookie = (name, value, maxAge) => `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;
  const ready = provider => config.enabled === true && (provider === 'google' ? Boolean(config.googleId && config.googleSecret) : provider === 'facebook' ? Boolean(config.facebookId && config.facebookSecret && /^v\d+\.\d+$/.test(config.facebookVersion || '')) : false);
  async function sessionResponse(user, native = false) {
    const token = random();
    await store.putSession(hash(token), user.id);
    return native ? Response.json({
      token
    }, {
      headers: {
        'cache-control': 'no-store'
      }
    }) : new Response(null, {
      status: 303,
      headers: {
        location: (config.webOrigin || origin) + '/?auth=success',
        'set-cookie': cookie('stranger_session', token, 604800)
      }
    });
  }
  async function jsonBody(request, maxChars = 16_384) {
    const text = await request.text();
    if (text.length > maxChars) throw new Error('payload');
    const body = JSON.parse(text);
    if (!body || Array.isArray(body) || typeof body !== 'object') throw new Error('payload');
    return body;
  }
  async function route(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === '/api/health' && request.method === 'GET') {
      try {
        await store.health();
        return Response.json({
          status: 'ok'
        });
      } catch {
        return Response.json({
          status: 'unavailable'
        }, {
          status: 503
        });
      }
    }
    if (request.method === 'OPTIONS') {
      const o = request.headers.get('origin');
      return new Response(null, {
        status: o === (config.webOrigin || origin) ? 204 : 403,
        headers: {
          'access-control-allow-origin': config.webOrigin || origin,
          'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
          'access-control-allow-headers': 'Content-Type,Authorization',
          'access-control-allow-credentials': 'true'
        }
      });
    }
    if (path === '/api/config') return Response.json({
      providers: {
        google: ready('google'),
        facebook: ready('facebook'),
        apple: appleReady(config)
      },
      restrictedBeta: config.restrictedBeta === true
    });
    if (path === '/auth/apple/challenge' && request.method === 'POST') {
      if (!appleReady(config)) return Response.json({
        error: 'Accesso Apple in preparazione.'
      }, {
        status: 503
      });
      const nonce = random();
      await store.putAttempt(hash(nonce), {
        provider: 'apple'
      });
      return Response.json({
        nonce
      });
    }
    if (path === '/auth/apple/native' && request.method === 'POST') {
      if (!appleReady(config)) return Response.json({
        error: 'Accesso Apple in preparazione.'
      }, {
        status: 503
      });
      const body = await jsonBody(request),
        attempt = typeof body.nonce === 'string' ? await store.takeAttempt(hash(body.nonce)) : null;
      if (attempt?.provider !== 'apple') return Response.json({
        error: 'Richiesta Apple scaduta. Riprova.'
      }, {
        status: 400
      });
      const claims = await verifyAppleToken(body.identityToken, {
        audience: config.appleId,
        nonce: body.nonce,
        fetchKeys: appleKeys
      });
      const existing = await store.getIdentity('apple', claims.sub),
        email = (claims.email || existing?.email || '').trim().toLowerCase();
      if (!email || config.restrictedBeta && !(config.allowedEmails || []).map(v => v.toLowerCase()).includes(email)) return Response.json({
        error: 'Questa beta è riservata alle persone invitate.'
      }, {
        status: 403
      });
      const user = await store.upsertIdentity('apple', claims.sub, email, existing?.name || '');
      return sessionResponse(user, true);
    }
    const auth = path.match(/^\/auth\/(google|facebook)\/(start|callback)$/);
    if (auth) {
      const [, provider, action] = auth;
      if (request.method !== 'GET') return new Response('Metodo non consentito', {
        status: 405
      });
      if (!ready(provider)) return Response.json({
        error: 'Accesso non ancora collegato. La modalità dimostrativa è disponibile.'
      }, {
        status: 503
      });
      const clientId = provider === 'google' ? config.googleId : config.facebookId;
      const secret = provider === 'google' ? config.googleSecret : config.facebookSecret;
      const redirectUri = (config.oauthBase || origin) + '/auth/' + provider + '/callback';
      if (action === 'start') {
        const native = url.searchParams.get('platform') === 'native';
        const challenge = url.searchParams.get('challenge');
        if (native && !/^[A-Za-z0-9_-]{43}$/.test(challenge || '')) return new Response('Challenge non valido', {
          status: 400
        });
        const state = random(),
          proof = random(),
          verifier = random();
        await store.putAttempt(hash(state), {
          provider,
          proof: hash(proof),
          verifier,
          native,
          challenge
        });
        const authorize = new URL(provider === 'google' ? 'https://accounts.google.com/o/oauth2/v2/auth' : `https://www.facebook.com/${config.facebookVersion}/dialog/oauth`);
        const params = {
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: 'code',
          state,
          scope: provider === 'google' ? 'openid email profile' : 'public_profile,email'
        };
        if (provider === 'google') Object.assign(params, {
          code_challenge: hash(verifier),
          code_challenge_method: 'S256',
          prompt: 'select_account'
        });
        authorize.search = new URLSearchParams(params).toString();
        return new Response(null, {
          status: 302,
          headers: {
            location: authorize.toString(),
            'set-cookie': cookie('stranger_oauth', proof, 600)
          }
        });
      }
      const state = url.searchParams.get('state');
      const attempt = state ? await store.takeAttempt(hash(state)) : null;
      const proof = cookies(request).stranger_oauth;
      if (!attempt || attempt.provider !== provider || !proof || !equal(attempt.proof, hash(proof))) return new Response('Richiesta scaduta o non valida. Riprova ad accedere.', {
        status: 400
      });
      if (url.searchParams.has('error') || !url.searchParams.get('code')) return new Response('Accesso annullato. Puoi tornare all’app.', {
        status: 400
      });
      const tokenUrl = provider === 'google' ? 'https://oauth2.googleapis.com/token' : `https://graph.facebook.com/${config.facebookVersion}/oauth/access_token`;
      const tokenResponse = await providerFetch(tokenUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: secret,
          redirect_uri: redirectUri,
          code: url.searchParams.get('code'),
          ...(provider === 'google' ? {
            grant_type: 'authorization_code',
            code_verifier: attempt.verifier
          } : {})
        }),
        signal: AbortSignal.timeout(10_000)
      });
      if (!tokenResponse.ok) return new Response('Il servizio di accesso non ha autorizzato la richiesta.', {
        status: 502
      });
      const tokenData = await tokenResponse.json();
      if (typeof tokenData.access_token !== 'string') return new Response('Risposta del servizio non valida', {
        status: 502
      });
      const infoUrl = provider === 'google' ? 'https://openidconnect.googleapis.com/v1/userinfo' : `https://graph.facebook.com/${config.facebookVersion}/me?fields=id,name,email`;
      const infoResponse = await providerFetch(infoUrl, {
        headers: {
          authorization: 'Bearer ' + tokenData.access_token
        },
        signal: AbortSignal.timeout(10_000)
      });
      if (!infoResponse.ok) return new Response('Impossibile verificare il profilo', {
        status: 502
      });
      const info = await infoResponse.json();
      const subject = provider === 'google' ? info.sub : info.id;
      const email = typeof info.email === 'string' ? info.email.trim().toLowerCase() : '';
      const allowed = (config.allowedEmails || []).map(s => s.trim().toLowerCase());
      if (typeof subject !== 'string' || !subject || !email || config.restrictedBeta === true && !allowed.includes(email) || provider === 'google' && info.email_verified !== true) return new Response('Questa anteprima è riservata alle persone invitate. Contatta chi organizza il test.', {
        status: 403
      });
      const user = await store.upsertIdentity(provider, subject, email, typeof info.name === 'string' ? info.name.slice(0, 100) : '');
      if (attempt.native) {
        const code = random();
        await store.putHandoff(hash(code), user.id, attempt.challenge);
        return new Response(null, {
          status: 303,
          headers: {
            location: 'randomstranger://auth?code=' + code,
            'set-cookie': cookie('stranger_oauth', '', 0)
          }
        });
      }
      return sessionResponse(user);
    }
    if (path === '/auth/native/exchange' && request.method === 'POST') {
      const body = await jsonBody(request);
      if (typeof body.code !== 'string' || typeof body.verifier !== 'string' || !/^[A-Za-z0-9_-]{43,128}$/.test(body.verifier)) return new Response('Richiesta non valida', {
        status: 400
      });
      const handoff = await store.takeHandoff(hash(body.code));
      if (!handoff || !equal(handoff.challenge, hash(body.verifier))) return new Response('Codice non valido o scaduto', {
        status: 400
      });
      return sessionResponse({
        id: handoff.user_id
      }, true);
    }
    if (path.startsWith('/api/')) {
      const bearer = request.headers.get('authorization')?.match(/^Bearer ([A-Za-z0-9_-]{43})$/)?.[1];
      const raw = bearer || cookies(request).stranger_session;
      const user = raw ? await store.getSession(hash(raw)) : null;
      if (!user) return Response.json({
        error: 'Accedi per continuare.'
      }, {
        status: 401
      });
      if (!['GET', 'HEAD'].includes(request.method) && !bearer && request.headers.get('origin') !== (config.webOrigin || origin)) return new Response('Origine non consentita', {
        status: 403
      });
      const apiResponse = await productRoutes({
        store,
        user,
        path,
        request,
        jsonBody
      });
      if (apiResponse) return apiResponse;
      if (path === '/api/logout' && request.method === 'POST') {
        await store.dropSession(hash(raw));
        return Response.json({
          ok: true
        }, {
          headers: {
            'set-cookie': cookie('stranger_session', '', 0)
          }
        });
      }
      if (path === '/api/account' && request.method === 'DELETE') {
        let appleRevocationPending = false;
        const identity = await store.identity(user.id);
        if (identity.provider === 'apple') {
          const body = await jsonBody(request),
            attempt = typeof body.nonce === 'string' ? await store.takeAttempt(hash(body.nonce)) : null;
          if (attempt?.provider !== 'apple') return Response.json({
            error: 'Ripeti l’autorizzazione Apple per eliminare l’account.'
          }, {
            status: 400
          });
          const claims = await verifyAppleToken(body.identityToken, {
            audience: config.appleId,
            nonce: body.nonce,
            fetchKeys: appleKeys
          });
          if (claims.sub !== identity.subject) return Response.json({
            error: 'Autorizza lo stesso account Apple.'
          }, {
            status: 403
          });
          try {
            await revokeAppleCode({
              config,
              code: body.authorizationCode,
              subject: identity.subject,
              nonce: body.nonce,
              providerFetch,
              fetchKeys: appleKeys
            });
          } catch {
            appleRevocationPending = true;
          }
        }
        await store.deleteAccount(user.id);
        return Response.json({
          ok: true,
          ...(appleRevocationPending ? {
            appleRevocationPending: true
          } : {})
        }, {
          headers: {
            'set-cookie': cookie('stranger_session', '', 0)
          }
        });
      }
    }
    return new Response('Non trovato', {
      status: 404
    });
  }
  return async request => {
    let response;
    try {
      response = await route(request);
    } catch (error) {
      response = Response.json({
        error: error.status ? error.message : error instanceof SyntaxError || error.message === 'payload' ? 'Richiesta non valida.' : 'Il servizio non è disponibile. Riprova più tardi.'
      }, {
        status: error.status || (error instanceof SyntaxError || error.message === 'payload' ? 400 : 500)
      });
    }
    const headers = new Headers(response.headers);
    headers.set('cache-control', 'no-store');
    headers.set('x-content-type-options', 'nosniff');
    headers.set('referrer-policy', 'no-referrer');
    const reqOrigin = request.headers.get('origin');
    if (reqOrigin === (config.webOrigin || origin)) {
      headers.set('access-control-allow-origin', config.webOrigin || origin);
      headers.set('access-control-allow-credentials', 'true');
      headers.set('vary', 'Origin');
    }
    return new Response(response.body, {
      status: response.status,
      headers
    });
  };
}
