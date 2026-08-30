const cloudbase = require('@cloudbase/node-sdk');
const app = cloudbase.init({
  env: cloudbase.SYMBOL_CURRENT_ENV || process.env.TCB_ENV || process.env.SCB_ENV || 'cloud1-8grodf5s3006f004',
});
const rooms = app.database().collection('letter_wall_rooms');
const statsDocId = 'STATS';

const emptyRoom = () => ({
  clients: {},
  message: null,
  updatedAt: Date.now(),
});

async function readRoom(room) {
  const result = await rooms.doc(room).get();
  const data = result && result.data;
  if (Array.isArray(data)) return data[0] || null;
  return data || null;
}

async function writeRoom(room, data) {
  const { _id, _openid, ...roomData } = data || {};
  const next = {
    ...roomData,
    updatedAt: Date.now(),
  };
  await rooms.doc(room).set(next);
  return next;
}

async function readStats() {
  const current = await readRoom(statsDocId);
  return current || {
    totals: { visits: 0, receivers: 0, connects: 0, sends: 0 },
    days: {},
    rooms: {},
    recent: [],
    updatedAt: Date.now(),
  };
}

async function writeStats(stats) {
  return writeRoom(statsDocId, stats);
}

function todayKey() {
  return new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function increment(target, key) {
  target[key] = Number(target[key] || 0) + 1;
}

exports.main = async (event) => {
  const action = event && event.action;
  const room = String((event && event.room) || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);

  if (action === 'stats') {
    return { ok: true, stats: await readStats() };
  }

  if (action === 'track') {
    const type = String((event && event.type) || 'visit').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
    const trackedRoom = room || 'NO_ROOM';
    const clientId = String((event && event.clientId) || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
    const text = String((event && event.text) || '').trim().toUpperCase().slice(0, 80);
    const now = Date.now();
    const day = todayKey();
    const stats = await readStats();
    const totals = { ...(stats.totals || {}) };
    const days = { ...(stats.days || {}) };
    const roomsStats = { ...(stats.rooms || {}) };
    const dayStats = { ...(days[day] || {}) };
    const roomStats = {
      ...(roomsStats[trackedRoom] || {}),
      room: trackedRoom,
      firstSeen: roomsStats[trackedRoom]?.firstSeen || now,
      lastSeen: now,
    };
    const clients = { ...(roomStats.clients || {}) };

    increment(totals, type);
    increment(dayStats, type);
    increment(roomStats, type);

    if (type === 'receiver') increment(totals, 'receivers');
    if (type === 'send') {
      increment(totals, 'sends');
      roomStats.lastMessage = text;
    }
    if (type === 'connect') increment(totals, 'connects');
    if (type === 'visit') increment(totals, 'visits');

    if (clientId) {
      clients[clientId] = {
        firstSeen: clients[clientId]?.firstSeen || now,
        lastSeen: now,
      };
      roomStats.clients = clients;
      roomStats.clientCount = Object.keys(clients).length;
    }

    days[day] = dayStats;
    roomsStats[trackedRoom] = roomStats;
    const recent = [
      { type, room: trackedRoom, text, at: now },
      ...((stats.recent || []).filter(Boolean)),
    ].slice(0, 80);

    return {
      ok: true,
      stats: await writeStats({
        ...stats,
        totals,
        days,
        rooms: roomsStats,
        recent,
      }),
    };
  }

  if (!room) return { ok: false, error: 'NO_ROOM' };

  if (action === 'get') {
    return { ok: true, room: (await readRoom(room)) || emptyRoom() };
  }

  if (action === 'ensure') {
    const current = await readRoom(room);
    if (current) return { ok: true, room: current };
    return { ok: true, room: await writeRoom(room, emptyRoom()) };
  }

  if (action === 'touch') {
    const clientId = String((event && event.clientId) || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
    if (!clientId) return { ok: false, error: 'NO_CLIENT' };
    const current = (await readRoom(room)) || emptyRoom();
    const clients = {
      ...(current.clients || {}),
      [clientId]: Date.now(),
    };
    return { ok: true, room: await writeRoom(room, { ...current, clients }) };
  }

  if (action === 'send') {
    const incoming = event && event.message;
    const text = String((incoming && incoming.text) || '').trim().toUpperCase().slice(0, 80);
    if (!text) return { ok: false, error: 'NO_MESSAGE' };
    const current = (await readRoom(room)) || emptyRoom();
    const message = {
      id: Number((incoming && incoming.id) || Date.now()),
      text,
      sentAt: Date.now(),
    };
    return { ok: true, room: await writeRoom(room, { ...current, message }) };
  }

  return { ok: false, error: 'BAD_ACTION' };
};
