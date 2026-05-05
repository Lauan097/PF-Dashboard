/**
 * Formata uma data ISO para o padrão "05 de mai. de 2026".
 * @param iso - String de data ISO ou objeto Date.
 * @param includeYear - Se false, omite o ano: "05 de mai.". Padrão: true.
 */
export function formatDate(iso: string | Date, includeYear = true): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;

  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleDateString("pt-BR", { month: "short" });
  // Remove o ponto final que algumas localidades adicionam ao mês
  const monthClean = month.replace(/\.$/, "");

  if (!includeYear) {
    return `${day} de ${monthClean}.`;
  }

  const year = date.getFullYear();
  return `${day} de ${monthClean}. de ${year}`;
}

/**
 * Formata uma data ISO para o padrão "05 de mai. de 2026 às 14:30".
 * @param iso - String de data ISO ou objeto Date.
 */
export function formatDateTime(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  const datePart = formatDate(date);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${datePart} às ${hours}:${minutes}`;
}

/**
 * Formata segundos para o padrão "4h 12m".
 * Valores menores que 1 minuto exibem "0m".
 * @param seconds - Tempo em segundos.
 */
export function formatTime(seconds: number): string {
  const totalMinutes = Math.floor(seconds / 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}
