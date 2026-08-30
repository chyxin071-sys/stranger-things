type RoomMessage = {
  id: number;
  text: string;
  sentAt: number;
};

const globalRooms = globalThis as typeof globalThis & {
  letterWallRooms?: Map<string, RoomMessage>;
};

const rooms = globalRooms.letterWallRooms ?? new Map<string, RoomMessage>();
globalRooms.letterWallRooms = rooms;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ room: string }> },
) {
  const { room } = await params;
  const message = rooms.get(room.toUpperCase()) ?? null;
  return Response.json({ message });
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
