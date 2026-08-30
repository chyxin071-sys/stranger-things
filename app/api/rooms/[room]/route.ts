type RoomMessage = {
  id: number;
  text: string;
  sentAt: number;
};

type RoomPresence = {
  clients: Map<string, number>;
};

const globalRooms = globalThis as typeof globalThis & {
  letterWallRooms?: Map<string, RoomMessage>;
  letterWallPresence?: Map<string, RoomPresence>;
};

const rooms = globalRooms.letterWallRooms ?? new Map<string, RoomMessage>();
globalRooms.letterWallRooms = rooms;
const presence = globalRooms.letterWallPresence ?? new Map<string, RoomPresence>();
globalRooms.letterWallPresence = presence;

function getPresence(room: string) {
  const key = room.toUpperCase();
  const current = presence.get(key) ?? { clients: new Map<string, number>() };
  const now = Date.now();
  for (const [clientId, lastSeen] of current.clients) {
    if (now - lastSeen > 12000) current.clients.delete(clientId);
  }
  presence.set(key, current);
  return current;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ room: string }> },
) {
  const { room } = await params;
  const key = room.toUpperCase();
  const url = new URL(request.url);
  const clientId = url.searchParams.get('client');
  const currentPresence = getPresence(key);

  if (clientId) {
    currentPresence.clients.set(clientId.slice(0, 80), Date.now());
  }

  const message = rooms.get(key) ?? null;
  return Response.json({ message, connectedCount: currentPresence.clients.size });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ room: string }> },
) {
  const { room } = await params;
  const body = await request.json().catch(() => ({}));
  const text = String(body.text ?? '')
    .replace(/[^a-zA-Z0-9!?.,'"\s-]/g, '')
    .trim()
    .slice(0, 48);

  if (!text) {
    return Response.json({ error: 'Message is empty' }, { status: 400 });
  }

  const message = {
    id: Date.now(),
    text: text.toUpperCase(),
    sentAt: Date.now(),
  };

  rooms.set(room.toUpperCase(), message);
  return Response.json({ message });
}
