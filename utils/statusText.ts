const getStatusInfo = (status: string) => {
  switch(status) {
    case 'online': return { color: 'bg-emerald-500', text: 'Online' };
    case 'idle': return { color: 'bg-yellow-500', text: 'Ausente' };
    case 'dnd': return { color: 'bg-red-500', text: 'Não Pertube' };
    default: return { color: 'bg-gray-500', text: 'Offline' };
  }
};

export default getStatusInfo;