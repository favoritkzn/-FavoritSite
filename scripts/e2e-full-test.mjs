#!/usr/bin/env node
/**
 * E2E smoke test — admin-only seed, full setup via admin, then coach + parent flows.
 * Run: node scripts/e2e-full-test.mjs
 */

const API = process.env.API_URL
  ? `${process.env.API_URL.replace(/\/$/, '')}/api/v1`
  : 'http://localhost:4000/api/v1';
const WEB = process.env.WEB_URL || 'http://localhost:3000';

const PASS = 'Favorit2026!';
const ADMIN_EMAIL = 'admin@favorit-kzn.ru';

const errors = [];
const passed = [];
const ctx = {};

function ok(name) {
  passed.push(name);
  console.log(`  ✓ ${name}`);
}

function fail(name, detail) {
  errors.push({ name, detail });
  console.log(`  ✗ ${name}: ${detail}`);
}

async function json(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function login(email) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASS }),
  });
  const body = await json(res);
  if (!res.ok || !body?.data?.accessToken) {
    throw new Error(body?.error?.message ?? `login failed ${res.status}`);
  }
  return body.data.accessToken;
}

async function api(method, path, token, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await json(res);
  return { res, data };
}

async function testPublic() {
  console.log('\n=== PUBLIC ===');

  const endpoints = [
    ['GET /coaches/public', '/coaches/public'],
    ['GET /subscriptions/plans', '/subscriptions/plans'],
    ['GET /cms/settings/home', '/cms/settings/home'],
    ['GET /cms/settings/about', '/cms/settings/about'],
    ['GET /cms/settings/academy', '/cms/settings/academy'],
  ];

  for (const [name, path] of endpoints) {
    const { res, data } = await api('GET', path);
    if (res.ok && data?.success !== false) ok(name);
    else fail(name, data?.error?.message ?? `status ${res.status}`);
  }

  for (const p of ['/', '/about', '/coaches', '/pricing', '/contacts', '/login']) {
    const res = await fetch(`${WEB}${p}`);
    if (res.ok) ok(`WEB ${p}`);
    else fail(`WEB ${p}`, `status ${res.status}`);
  }

  const trialSuffix = Date.now();
  const { res: trialRes, data: trialData } = await api('POST', '/trial', null, {
    childName: `Ребёнок ${trialSuffix}`,
    parentName: 'Тест Родитель',
    phone: `+7999${String(trialSuffix).slice(-7)}`,
    notes: 'E2E пробное занятие',
  });
  if (trialRes.ok && trialData?.data?.id) {
    ok('POST /trial (пробное занятие)');
    ctx.trialId = trialData.data.id;
  } else {
    fail('POST /trial (пробное занятие)', trialData?.error?.message ?? trialRes.status);
  }
}

async function setupViaAdmin(token) {
  console.log('\n=== ADMIN SETUP ===');
  const suffix = Date.now();

  const { res: dashRes, data: dash } = await api('GET', '/dashboard', token);
  if (dashRes.ok && dash?.data) ok('GET /dashboard');
  else fail('GET /dashboard', dash?.error?.message ?? dashRes.status);

  if (ctx.trialId) {
    const { res: trialListRes, data: trialList } = await api('GET', '/trial', token);
    const found = trialList?.data?.some((t) => t.id === ctx.trialId);
    if (trialListRes.ok && found) ok('GET /trial (admin видит пробную заявку)');
    else fail('GET /trial (admin видит пробную заявку)', trialList?.error?.message ?? trialListRes.status);
  }

  const { res: groupRes, data: groupData } = await api('POST', '/groups', token, {
    name: `U10 Тест ${suffix}`,
    ageCategory: 'U10',
    maxCapacity: 20,
  });
  if (groupRes.ok && groupData?.data?.id) ok('POST /groups');
  else fail('POST /groups', groupData?.error?.message ?? groupRes.status);
  ctx.groupId = groupData?.data?.id;

  ctx.coachEmail = `coach.${suffix}@test.ru`;
  const { res: coachRes, data: coachData } = await api('POST', '/coaches/with-user', token, {
    email: ctx.coachEmail,
    password: PASS,
    firstName: 'Иван',
    lastName: 'Тренеров',
    isPublic: true,
    groupIds: ctx.groupId ? [ctx.groupId] : [],
  });
  if (coachRes.ok && coachData?.data?.id) ok('POST /coaches/with-user');
  else fail('POST /coaches/with-user', coachData?.error?.message ?? coachRes.status);
  ctx.coachId = coachData?.data?.id;

  ctx.parentEmail = `parent.${suffix}@test.ru`;
  const regRes = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: ctx.parentEmail,
      password: PASS,
      firstName: 'Мария',
      lastName: 'Родителева',
      phone: '+79001234567',
      childFirstName: 'Пётр',
      childLastName: `Ученик${suffix}`,
      childBirthDate: '2015-06-01',
      childGender: 'MALE',
    }),
  });
  const regBody = await json(regRes);
  if (regRes.ok && regBody?.data?.pending) ok('POST /auth/register (parent+child)');
  else fail('POST /auth/register', regBody?.error?.message ?? regRes.status);

  const blockedLogin = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ctx.parentEmail, password: PASS }),
  });
  if (!blockedLogin.ok) ok('Login blocked before approval');
  else fail('Login blocked before approval', 'should fail');

  const { res: pendingRes, data: pendingData } = await api('GET', '/users/registrations/pending', token);
  const pendingUser = pendingData?.data?.find((u) => u.email === ctx.parentEmail);
  if (pendingRes.ok && pendingUser?.id) ok('GET /users/registrations/pending');
  else fail('GET /users/registrations/pending', pendingRes.status);

  if (pendingUser?.id) {
    const { res: approveRes } = await api('POST', `/users/registrations/${pendingUser.id}/approve`, token);
    if (approveRes.ok) ok('POST /users/registrations/:id/approve');
    else fail('POST /users/registrations/:id/approve', approveRes.status);
    ctx.childId = pendingUser.parent?.children?.[0]?.child?.id;
  }

  if (ctx.groupId && ctx.childId) {
    const { res: linkRes } = await api('POST', `/groups/${ctx.groupId}/children`, token, {
      childId: ctx.childId,
    });
    if (linkRes.ok) ok('POST /groups/:id/children (registered child)');
    else fail('POST /groups/:id/children', linkRes.status);
  }

  const start = new Date();
  start.setHours(start.getHours() + 1);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 90);

  const { res: sessRes, data: sessData } = await api('POST', '/schedule', token, {
    groupId: ctx.groupId,
    coachId: ctx.coachId,
    venue: 'Поле тест',
    startTime: start.toISOString(),
    endTime: end.toISOString(),
  });
  if (sessRes.ok && sessData?.data?.id) ok('POST /schedule');
  else fail('POST /schedule', sessData?.error?.message ?? sessRes.status);
  ctx.sessionId = sessData?.data?.id;

  const { res: planRes, data: planData } = await api('GET', '/subscriptions/plans');
  ctx.planId = planData?.data?.[0]?.id;
  if (planRes.ok && ctx.planId) ok('GET /subscriptions/plans (seed)');
  else fail('GET /subscriptions/plans', planRes.status);

  if (ctx.childId && ctx.planId) {
    const { res: assignRes } = await api('POST', '/subscriptions/assign', token, {
      childId: ctx.childId,
      planId: ctx.planId,
    });
    if (assignRes.ok) ok('POST /subscriptions/assign');
    else fail('POST /subscriptions/assign', assignRes.status);
  }

  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  );
  const form = new FormData();
  form.append('file', new Blob([png], { type: 'image/png' }), 'test.png');
  const uploadRes = await fetch(`${API}/uploads`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const uploadBody = await json(uploadRes);
  if (uploadRes.ok && uploadBody?.data?.url) ok('POST /uploads');
  else fail('POST /uploads', uploadBody?.error?.message ?? uploadRes.status);
}

async function testCoach() {
  console.log('\n=== COACH ===');
  if (!ctx.coachEmail) {
    fail('Coach flow', 'no coach email from setup');
    return;
  }

  const token = await login(ctx.coachEmail);
  ok(`Login coach (${ctx.coachEmail})`);

  const { res: dashRes, data: dash } = await api('GET', '/dashboard', token);
  if (dashRes.ok && dash?.data?.groups) ok(`GET /dashboard (${dash.data.groups.length} groups)`);
  else fail('GET /dashboard', dash?.error?.message ?? dashRes.status);

  const { res: schedRes, data: sched } = await api('GET', '/schedule/my', token);
  if (schedRes.ok && Array.isArray(sched?.data)) ok(`GET /schedule/my (${sched.data.length})`);
  else fail('GET /schedule/my', sched?.error?.message ?? schedRes.status);

  const sessionId = ctx.sessionId ?? sched?.data?.[0]?.id;
  if (sessionId) {
    const { res: attRes, data: att } = await api('GET', `/attendance/sessions/${sessionId}`, token);
    if (attRes.ok && Array.isArray(att?.data)) ok(`GET /attendance/sessions/${sessionId}`);
    else fail('GET /attendance/sessions', att?.error?.message ?? attRes.status);

    const childId = att?.data?.[0]?.child?.id ?? ctx.childId;
    if (childId) {
      const { res: markRes } = await api('POST', `/attendance/sessions/${sessionId}/bulk`, token, {
        entries: [{ childId, status: 'PRESENT' }],
      });
      if (markRes.ok) ok('POST /attendance/sessions/:id/bulk');
      else fail('POST /attendance/bulk', markRes.status);
    }
  }

  const { res: matchRes, data: matchData } = await api('POST', '/matches', token, {
    title: 'Матч vs Тест',
    opponent: 'ФК Тест',
    playedAt: new Date().toISOString(),
    groupName: 'U10',
    homeScore: 2,
    awayScore: 1,
  });
  if (matchRes.ok && matchData?.data?.id) ok('POST /matches');
  else fail('POST /matches', matchData?.error?.message ?? matchRes.status);

  if (matchData?.data?.id && ctx.childId) {
    const { res: goalRes } = await api('POST', `/matches/${matchData.data.id}/events`, token, {
      childId: ctx.childId,
      type: 'GOAL',
    });
    if (goalRes.ok) ok('POST /matches/:id/events (goal)');
    else fail('POST /matches/:id/events', goalRes.status);
  }
}

async function testParent() {
  console.log('\n=== PARENT ===');
  if (!ctx.parentEmail) {
    fail('Parent flow', 'no parent email from setup');
    return;
  }

  const token = await login(ctx.parentEmail);
  ok(`Login parent (${ctx.parentEmail})`);

  const { res: dashRes, data: dash } = await api('GET', '/dashboard', token);
  if (dashRes.ok && dash?.data?.children?.length) ok(`GET /dashboard (${dash.data.children.length} children)`);
  else fail('GET /dashboard', dash?.error?.message ?? dashRes.status);

  const childId = dash?.data?.children?.[0]?.id ?? ctx.childId;

  const { res: payRes, data: payData } = await api('POST', '/payments/subscription', token, {
    childId,
    planId: ctx.planId,
    amount: 6000,
    description: 'Оплата абонемента (перевод на карту)',
  });
  if (payRes.ok && payData?.data?.id) ok('POST /payments/subscription');
  else fail('POST /payments/subscription', payData?.error?.message ?? payRes.status);

  const flows = [
    [`GET /schedule/my`, '/schedule/my'],
    [`GET /subscriptions/children/${childId}`, `/subscriptions/children/${childId}`],
    [`GET /attendance/children/${childId}/history`, `/attendance/children/${childId}/history`],
  ];

  for (const [name, path] of flows) {
    const { res, data } = await api('GET', path, token);
    if (res.ok) ok(name);
    else fail(name, data?.error?.message ?? res.status);
  }
}

async function testAdminConfirmPayment() {
  console.log('\n=== ADMIN PAYMENT ===');
  const token = await login(ADMIN_EMAIL);
  const { res, data } = await api('GET', '/payments', token);
  const pending = data?.data?.find((p) => p.status === 'PENDING');
  if (res.ok && pending?.id) {
    const { res: confirmRes } = await api('POST', `/payments/${pending.id}/confirm`, token);
    if (confirmRes.ok) ok('POST /payments/:id/confirm');
    else fail('POST /payments/:id/confirm', confirmRes.status);
  } else if (res.ok) {
    ok('No pending payments to confirm');
  } else {
    fail('GET /payments', res.status);
  }
}

async function main() {
  console.log(`API: ${API}`);
  console.log(`WEB: ${WEB}`);

  try {
    await testPublic();
  } catch (e) {
    fail('PUBLIC block', String(e));
  }

  try {
    const adminToken = await login(ADMIN_EMAIL);
    ok(`Login admin (${ADMIN_EMAIL})`);
    await setupViaAdmin(adminToken);
  } catch (e) {
    fail('ADMIN setup', String(e));
  }

  try {
    await testCoach();
  } catch (e) {
    fail('COACH block', String(e));
  }

  try {
    await testParent();
  } catch (e) {
    fail('PARENT block', String(e));
  }

  try {
    await testAdminConfirmPayment();
  } catch (e) {
    fail('ADMIN PAYMENT block', String(e));
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Passed: ${passed.length}`);
  console.log(`Failed: ${errors.length}`);
  if (errors.length) {
    console.log('\nFailures:');
    for (const e of errors) console.log(`  - ${e.name}: ${e.detail}`);
    process.exit(1);
  }
  console.log('\nAll tests passed!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
