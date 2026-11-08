export async function productRoutes({
  store,
  user,
  path,
  request,
  jsonBody
}) {
  const id = user.id,
    method = request.method;
  if (user.status === 'excluded' && !['/api/session', '/api/account', '/api/export', '/api/reports', '/api/logout', '/api/profile', '/api/appointments'].includes(path) && !path.endsWith('/appeal')) return Response.json({
    error: 'Account escluso. Puoi contestare le penalità o eliminare i dati residui.'
  }, {
    status: 403
  });
  if (path === '/api/session' && method === 'GET') return Response.json({
    user
  });
  if (path === '/api/account' && method === 'GET') return Response.json(await store.account(id));
  if (path === '/api/export' && method === 'GET') return Response.json({
    profile: await store.getProfile(id),
    account: await store.account(id),
    appointments: await store.listAppointments(id),
    reports: await store.reports(id),
    contentReports: await store.contentReports(id)
  });
  if (path === '/api/profile' && method === 'GET') return Response.json({
    profile: await store.getProfile(id),
    moderation: await store.profileReview(id)
  });
  if (path === '/api/profile' && method === 'PUT') {
    const profile = await store.saveProfile(id, await jsonBody(request));
    const appointment = profile.availability.length ? await store.findMatch(id) : null;
    return Response.json({
      profile,
      appointment,
      moderation: await store.profileReview(id)
    });
  }
  if (path === '/api/appointments' && method === 'GET') return Response.json({
    appointments: (await store.listAppointments(id)).map(a => user.status === 'excluded' ? {
      ...a,
      partner: {
        alias: a.partner.alias
      }
    } : a)
  });
  if (path === '/api/match' && method === 'POST') return Response.json({
    appointment: await store.findMatch(id)
  });
  if (path === '/api/reports' && method === 'GET') return Response.json({
    reports: await store.reports(id)
  });
  const location = path.match(/^\/api\/appointments\/([a-zA-Z0-9-]+)\/location$/);
  if (location) {
    const aid = location[1];
    if (method === 'GET') return Response.json({
      position: await store.partnerPosition(id, aid)
    });
    if (method === 'PUT') return Response.json(await store.sharePosition(id, aid, await jsonBody(request)));
    if (method === 'DELETE') return Response.json(await store.revokePosition(id, aid));
  }
  const m = path.match(/^\/api\/appointments\/([a-zA-Z0-9-]+)\/(confirm|decline|cancel|checkin|decision|absence|appeal|block|content)$/);
  if (m && method === 'POST') {
    const [, aid, action] = m;
    await store.getAppointment(id, aid);
    if (['confirm', 'decline', 'cancel'].includes(action)) return Response.json({
      appointment: await store[action](id, aid)
    });
    const body = await jsonBody(request);
    if (action === 'checkin') return Response.json({
      appointment: await store.checkin(id, aid, body)
    });
    if (action === 'decision') return Response.json({
      appointment: await store.decision(id, aid, body.accept)
    });
    if (action === 'absence') return Response.json(await store.reportAbsence(id, aid, body.reason));
    if (action === 'content') return Response.json(await store.reportContent(id, aid, body.reason));
    if (action === 'appeal') return Response.json(await store.appeal(id, aid, body.reason));
    if (action === 'block') {
      await store.blockAppointment(id, aid);
      return Response.json({
        ok: true
      });
    }
  }
  return null;
}
