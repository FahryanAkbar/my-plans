const ROOM_PREFIX = 'project:';

export function getRoomName(projectId: string): string {
  return `${ROOM_PREFIX}${projectId}`;
}

export function isProjectRoom(roomName: string): boolean {
  return roomName.startsWith(ROOM_PREFIX);
}

export function getProjectIdFromRoom(roomName: string): string {
  return roomName.substring(ROOM_PREFIX.length);
}
